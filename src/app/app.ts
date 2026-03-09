import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

interface Conversation {
  id: number;
  title: string;
  description: string;
}

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  host: { class: 'flex h-screen bg-white overflow-hidden' },
})
export class App {
  private readonly fb = inject(FormBuilder);

  readonly activeNav = signal('Conversations');
  readonly message = signal('');
  readonly openMenuId = signal<number | null>(null);
  readonly loginOpen = signal(false);
  readonly authTab = signal<'login' | 'register'>('login');

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

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly registerForm = this.fb.group(
    {
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator }
  );

  setActiveNav(item: string): void {
    this.activeNav.set(item);
  }

  toggleMenu(id: number, event: Event): void {
    event.stopPropagation();
    this.loginOpen.set(false);
    this.openMenuId.update((current) => (current === id ? null : id));
  }

  toggleLogin(event: Event): void {
    event.stopPropagation();
    this.openMenuId.set(null);
    this.loginOpen.update((v) => !v);
  }

  setAuthTab(tab: 'login' | 'register'): void {
    this.authTab.set(tab);
  }

  closeAllOverlays(): void {
    this.openMenuId.set(null);
    this.loginOpen.set(false);
  }

  submitLogin(): void {
    if (this.loginForm.valid) {
      this.loginOpen.set(false);
      this.loginForm.reset();
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  submitRegister(): void {
    if (this.registerForm.valid) {
      this.loginOpen.set(false);
      this.registerForm.reset();
    } else {
      this.registerForm.markAllAsTouched();
    }
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
