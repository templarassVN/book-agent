import { Injectable, signal } from '@angular/core';
import Anthropic from '@anthropic-ai/sdk';
import { environment } from '../../environments/environment';
import { IMessageResponse, IRecommendation, IRecommendationSource, IQuestion, IQuestionSource } from '../models/model';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;                        // raw accumulated text (used while streaming)
  textContent?: string;                   // parsed: prose/markdown only (set after streaming)
  recommendations?: IRecommendation[] | null;  // parsed: book suggestion list
  question?: IQuestion | null;            // parsed: clarifying question with choices
  answered?: boolean;                     // true once user selected an answer or skipped
  isStreaming?: boolean;
}

const SYSTEM_PROMPT = `You are a book worm. People come to you to find the book of their interest. Your response is in markdown so it can be displayed to the user.

When you need to ask a clarifying question before making recommendations (e.g. preferred genre, mood, author preference), output it as a structured JSON block so the UI can render it as interactive buttons.
The question block must be within 2 lines of \`\`\`. Data must be: { type: 'question', value: ${IQuestionSource} }
Provide 4–6 concise answer choices. Only ask ONE question per response.

When recommending books, include a structured suggestion block.
The suggestion block must be within 2 lines of \`\`\`. Data must be: { type: 'suggestion', value: [ ${IRecommendationSource} ] }

You may include both prose (markdown) and one structured block in a single response.
Never include more than one structured block per response.`;

interface ParsedContent {
  text: string;
  recommendations: IRecommendation[] | null;
  question: IQuestion | null;
}

/** Split a raw assistant response into prose text, recommendations, and/or a question. */
function parseContent(raw: string): ParsedContent {
  const fence = /```(?:json)?\s*\n?([\s\S]*?)\n?```/g;
  let recommendations: IRecommendation[] | null = null;
  let question: IQuestion | null = null;
  let text = raw;

  let match: RegExpExecArray | null;
  while ((match = fence.exec(raw)) !== null) {
    try {
      const parsed: IMessageResponse<unknown> = JSON.parse(match[1].trim());

      if (parsed?.type === 'suggestion' && Array.isArray((parsed as IMessageResponse<IRecommendation[]>).value)) {
        recommendations = (parsed as IMessageResponse<IRecommendation[]>).value;
        text = text.replace(match[0], '').trim();
        break;
      }

      if (parsed?.type === 'question') {
        const val = (parsed as IMessageResponse<IQuestion>).value;
        if (typeof val?.question === 'string' && Array.isArray(val?.answers)) {
          question = val;
          text = text.replace(match[0], '').trim();
          break;
        }
      }
    } catch {
      // Not a structured block — leave it in the prose text
    }
  }

  return { text, recommendations, question };
}

@Injectable({ providedIn: 'root' })
export class ClaudeService {
  private readonly client = new Anthropic({
    apiKey: environment.anthropicApiKey,
    dangerouslyAllowBrowser: true,
  });

  readonly messages = signal<ChatMessage[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  async sendMessage(userText: string): Promise<void> {
    const trimmed = userText.trim();
    if (!trimmed || this.isLoading()) return;

    this.error.set(null);

    this.messages.update((msgs) => [
      ...msgs,
      { role: 'user', content: trimmed },
    ]);

    this.messages.update((msgs) => [
      ...msgs,
      { role: 'assistant', content: '', isStreaming: true },
    ]);

    this.isLoading.set(true);

    try {
      const apiMessages: Anthropic.MessageParam[] = this.messages()
        .filter((m) => !(m.role === 'assistant' && m.isStreaming && m.content === ''))
        .map((m) => ({ role: m.role, content: m.content }));

      const stream = this.client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: apiMessages,
      });

      stream.on('text', (delta) => {
        this.messages.update((msgs) => {
          const last = msgs[msgs.length - 1];
          return [
            ...msgs.slice(0, -1),
            { ...last, content: last.content + delta },
          ];
        });
      });

      await stream.finalMessage();

      this.messages.update((msgs) => {
        const last = msgs[msgs.length - 1];
        const { text, recommendations, question } = parseContent(last.content);
        return [
          ...msgs.slice(0, -1),
          { ...last, isStreaming: false, textContent: text, recommendations, question, answered: false },
        ];
      });
    } catch (err) {
      this.messages.update((msgs) => msgs.slice(0, -1));

      if (err instanceof Anthropic.AuthenticationError) {
        this.error.set('Invalid API key. Please check your environment configuration.');
      } else if (err instanceof Anthropic.RateLimitError) {
        this.error.set('Rate limit reached. Please wait a moment and try again.');
      } else if (err instanceof Anthropic.APIError) {
        this.error.set(`API error (${err.status}): ${err.message}`);
      } else {
        this.error.set('An unexpected error occurred. Please try again.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  /** Mark the assistant message at a given index as answered so the question UI is dismissed. */
  markAnswered(index: number): void {
    this.messages.update((msgs) => {
      const updated = [...msgs];
      updated[index] = { ...updated[index], answered: true };
      return updated;
    });
  }

  clearMessages(): void {
    this.messages.set([]);
    this.error.set(null);
  }
}
