import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class LoginFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly submitted = output<void>();
  readonly switchToRegister = output<void>();

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  get email() {
    return this.form.get('email')!;
  }

  get password() {
    return this.form.get('password')!;
  }

  submit(): void {
    if (this.form.valid) {
      this.form.reset();
      this.submitted.emit();
    } else {
      this.form.markAllAsTouched();
    }
  }
}
