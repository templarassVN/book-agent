import { Injectable, signal } from '@angular/core';
import Anthropic from '@anthropic-ai/sdk';
import { environment } from '../../environments/environment';
import { IMessageResponse, IRecommendation, IRecommendationSource } from '../models/model';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;           // raw accumulated text (used while streaming)
  textContent?: string;      // parsed: prose/markdown only (set after streaming)
  recommendations?: IRecommendation[] | null;  // parsed: extracted book list
  isStreaming?: boolean;
}

const SYSTEM_PROMPT = `You are a book worm. People come to you to find the book of their intestst. you response is in markdown type so I can display it to people.
* if they want to find books, you need to specify what their type, and make a list of recommendation in fixed data type in json stringify so I can parse it.
.Data must be { type: 'suggestion', value: [ ${IRecommendationSource} ] } `;

/** Extract a suggestion JSON block from a raw response string.
 *  Returns the cleaned prose text and the parsed recommendations (or null). */
function parseContent(raw: string): { text: string; recommendations: IRecommendation[] | null } {
  // Match fenced code blocks: ```[json]?\n...\n```
  const fence = /```(?:json)?\s*\n?([\s\S]*?)\n?```/g;
  let recommendations: IRecommendation[] | null = null;
  let text = raw;

  let match: RegExpExecArray | null;
  while ((match = fence.exec(raw)) !== null) {
    try {
      const parsed: IMessageResponse<IRecommendation[]> = JSON.parse(match[1].trim());
      if (parsed?.type === 'suggestion' && Array.isArray(parsed?.value)) {
        recommendations = parsed.value;
        // Remove this code block from the prose text
        text = text.replace(match[0], '').trim();
        break;
      }
    } catch {
      // Not a suggestion block — leave it in the text
    }
  }

  return { text, recommendations };
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
    console.log(environment.anthropicApiKey);
    const trimmed = userText.trim();
    if (!trimmed || this.isLoading()) return;

    this.error.set(null);

    // Append user turn
    this.messages.update((msgs) => [
      ...msgs,
      { role: 'user', content: trimmed },
    ]);

    // Append empty streaming placeholder for the assistant
    this.messages.update((msgs) => [
      ...msgs,
      { role: 'assistant', content: '', isStreaming: true },
    ]);

    this.isLoading.set(true);

    try {
      // Build history for the API (exclude the empty streaming placeholder)
      const apiMessages: Anthropic.MessageParam[] = this.messages()
        .filter((m) => !(m.role === 'assistant' && m.isStreaming && m.content === ''))
        .map((m) => ({ role: m.role, content: m.content }));

      const stream = this.client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: apiMessages,
      });

      // Accumulate streamed text deltas into `content`
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

      // Streaming done — parse and split the full response
      this.messages.update((msgs) => {
        const last = msgs[msgs.length - 1];
        const { text, recommendations } = parseContent(last.content);
        return [
          ...msgs.slice(0, -1),
          { ...last, isStreaming: false, textContent: text, recommendations },
        ];
      });
    } catch (err) {
      // Drop the empty streaming placeholder on failure
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

  clearMessages(): void {
    this.messages.set([]);
    this.error.set(null);
  }
}
