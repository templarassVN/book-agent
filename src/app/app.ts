import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { AuthPanelComponent } from './auth-panel/auth-panel.component';
import { FeatureCardComponent } from './feature-card/feature-card.component';
import { ClaudeService } from './services/claude.service';
import { MarkdownComponent } from 'ngx-markdown';
import { BookRecommendationListComponent } from './book-recommendation-list/book-recommendation-list.component';

interface Conversation {
  id: number;
  title: string;
  description: string;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  bgClass: string;
  imgSrc: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AuthPanelComponent, FeatureCardComponent, MarkdownComponent, BookRecommendationListComponent],
  host: { class: 'flex h-screen bg-white overflow-hidden' },
})
export class App {
  readonly claude = inject(ClaudeService);

  readonly activeNav = signal('Conversations');
  readonly message = signal('');
  readonly openMenuId = signal<number | null>(null);

  readonly navItems = ['Conversations', 'My documents', 'Legal library', 'Live consultants'] as const;

  readonly conversations = signal<Conversation[]>([
    {
      id: 1,
      title: 'Polish working visa aplication',
      description: 'Applying to working visa creating the survey, tips on avoiding errors.',
    },
    {
      id: 2,
      title: 'Service agreements routine',
      description: 'Processing multiple service agreements. the survey, tips on avoiding errors.',
    },
    {
      id: 3,
      title: 'Mortgage agreement',
      description: 'Searching for controversy paragraphs.',
    },
  ]);

  readonly features: Feature[] = [
    {
      id: 'chat',
      title: 'Start with a conversation',
      description:
        'Ask any legal question, ask to create a document for you, or upload your own document, to work with it and find paragraphs to pay attention to or adjust',
      bgClass: 'bg-blue-100',
      imgSrc: 'assets/chatbot.png',
    },
    {
      id: 'docs',
      title: 'Store documents',
      description:
        'With all adjustments, and organize them for further work. At any stage of working with your document you can click "Save to My Documents, and proceed later.',
      bgClass: 'bg-amber-100',
      imgSrc: 'assets/distributed.png',
    },
    {
      id: 'library',
      title: 'Explore the legal library',
      description:
        'In the process of a conversation, Legal Bot will give you links to a vast library of cases, laws and law enforcement practice. Bookmark it, or explore manually.',
      bgClass: 'bg-violet-100',
      imgSrc: 'assets/folder.png',
    },
    {
      id: 'pros',
      title: 'Retreive insightful information',
      description:
        'Our service provides powerful AI, based on vast books, document. If you want to verify your contract, doutbful if your description fully express your thought , this tool is to clarify anything you may need',
      bgClass: 'bg-green-100',
      imgSrc: 'assets/information-management.png',
    },
  ];

  setActiveNav(item: string): void {
    this.activeNav.set(item);
  }

  toggleMenu(id: number, event: Event): void {
    event.stopPropagation();
    this.openMenuId.update((current) => (current === id ? null : id));
  }

  closeMenus(): void {
    this.openMenuId.set(null);
  }

  onMessageInput(event: Event): void {
    this.message.set((event.target as HTMLInputElement).value);
  }

  sendMessage(): void {
    const text = this.message().trim();
    if (!text || this.claude.isLoading()) return;
    this.message.set('');
    this.claude.sendMessage(text);
  }

  handleInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
