import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { IQuestion } from '../models/model';

@Component({
  selector: 'app-chat-question',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="mb-2 flex flex-wrap items-center gap-2 px-1">
      <!-- Question label -->
      <span class="text-xs text-gray-500 shrink-0">{{ question().question }}</span>

      <!-- Answer chips -->
      @for (answer of question().answers; track answer) {
        <button
          type="button"
          class="px-3 py-1 rounded-full text-xs border transition-all
                 focus:outline-none focus:ring-2 focus:ring-gray-400
                 {{ selected() === answer
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500 hover:bg-gray-50' }}"
          [disabled]="answered()"
          (click)="selectAnswer(answer)"
        >
          {{ answer }}
        </button>
      }

      <!-- Skip -->
      @if (!answered()) {
        <button
          type="button"
          class="text-xs text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:underline"
          (click)="skip()"
        >
          Skip
        </button>
      }
    </div>
  `,
  host: { class: 'block' },
})
export class ChatQuestionComponent {
  readonly question = input.required<IQuestion>();
  readonly answered = input.required<boolean>();

  readonly answerSelected = output<string>();
  readonly skipped = output<void>();

  readonly selected = signal<string | null>(null);

  selectAnswer(answer: string): void {
    this.selected.set(answer);
    this.answerSelected.emit(answer);
  }

  skip(): void {
    this.skipped.emit();
  }
}
