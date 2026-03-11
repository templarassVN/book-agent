import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { IRecommendation } from '../models/model';
import { TiltDirective } from '../tilt/tilt.directive';

@Component({
  selector: 'app-book-recommendation-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TiltDirective],
  template: `
    <ul class="mt-4 grid grid-cols-2 gap-3" aria-label="Book recommendations">
      @for (book of recommendations(); track book.name) {
        <li
          class="group flex flex-col justify-between gap-3 border border-gray-200 rounded-2xl p-4
                 hover:border-gray-300 hover:shadow-md transition-all bg-white"
          appTilt [maxTilt]="8"
        >
          <!-- Title + link -->
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-semibold text-sm text-gray-900 leading-snug">{{ book.name }}</h3>
            @if (book.link) {
              <a
                [href]="book.link"
                target="_blank"
                rel="noopener noreferrer"
                class="shrink-0 text-gray-400 hover:text-gray-700 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
                [attr.aria-label]="'Open ' + book.name"
              >
                <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3"
                        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 2h5v5M14 2 8 8"
                        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            }
          </div>

          <!-- Genre tag -->
          <span class="self-start inline-block text-xs px-2.5 py-0.5 rounded-full
                       bg-gray-100 text-gray-600 font-medium">
            {{ book.gerne }}
          </span>
        </li>
      }
    </ul>
  `,
  host: { class: 'block' },
})
export class BookRecommendationListComponent {
  readonly recommendations = input.required<IRecommendation[]>();
}
