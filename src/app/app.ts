import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

interface Conversation {
  id: number;
  title: string;
  description: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',

})
export class App {
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
    if (this.message().trim()) {
      this.message.set('');
    }
  }

  handleInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
