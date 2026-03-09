import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  ElementRef,
} from '@angular/core';
import { LoginFormComponent } from '../login-form/login-form.component';
import { RegisterFormComponent } from '../register-form/register-form.component';

@Component({
  selector: 'app-auth-panel',
  templateUrl: './auth-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoginFormComponent, RegisterFormComponent],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class AuthPanelComponent {
  private readonly elementRef = inject(ElementRef);

  readonly loginOpen = signal(false);
  readonly authTab = signal<'login' | 'register'>('login');

  toggle(event: Event): void {
    event.stopPropagation();
    this.loginOpen.update((v) => !v);
  }

  setTab(tab: 'login' | 'register'): void {
    this.authTab.set(tab);
  }

  close(): void {
    this.loginOpen.set(false);
  }

  onLoginSubmitted(): void {
    this.loginOpen.set(false);
  }

  onRegisterSubmitted(): void {
    this.loginOpen.set(false);
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.loginOpen.set(false);
    }
  }
}
