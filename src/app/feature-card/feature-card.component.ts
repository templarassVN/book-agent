import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

@Component({
  selector: 'app-feature-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      [class]="'rounded-3xl p-5 flex gap-4 items-center h-full ' + bgClass()"
      [attr.aria-labelledby]="labelId()"
    >
      <div class="shrink-0 w-24 h-24" aria-hidden="true">
        <img class="w-full h-full object-contain" [src]="imgSrc()" alt="" />
      </div>
      <div>
        <h2 [id]="labelId()" class="font-bold text-sm text-gray-900 leading-snug mb-1.5">
          {{ title() }}
        </h2>
        <p class="text-xs text-gray-700 leading-relaxed">{{ description() }}</p>
      </div>
    </article>
  `,
})
export class FeatureCardComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly bgClass = input.required<string>();
  readonly imgSrc = input.required<string>();

  readonly labelId = computed(
    () => 'feature-' + this.title().toLowerCase().replace(/\s+/g, '-')
  );
}
