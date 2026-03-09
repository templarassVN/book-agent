import { Directive, signal, computed, inject, ElementRef, input } from '@angular/core';

@Directive({
  selector: '[appTilt]',
  host: {
    '[style.transform]': 'transform()',
    '[style.box-shadow]': 'shadow()',
    '[style.will-change]': '"transform"',
    '[style.transition]': 'transition()',
    '(mouseenter)': 'onEnter()',
    '(mouseleave)': 'onLeave()',
    '(mousemove)': 'onMove($event)',
  },
})
export class TiltDirective {
  private readonly el = inject(ElementRef<HTMLElement>);

  /** Maximum tilt angle in degrees (default 14°). */
  readonly maxTilt = input<number>(14);

  /** Scale factor on hover (default 1.06). */
  readonly hoverScale = input<number>(1.06);

  private readonly hovered = signal(false);
  private readonly tiltX = signal(0);
  private readonly tiltY = signal(0);

  readonly transform = computed(() => {
    const s = this.hovered() ? this.hoverScale() : 1;
    return `perspective(700px) rotateX(${this.tiltX()}deg) rotateY(${this.tiltY()}deg) scale(${s})`;
  });

  /** Shadow shifts opposite the tilt direction to reinforce depth. */
  readonly shadow = computed(() => {
    if (!this.hovered()) return '0 4px 14px rgba(0,0,0,0.06)';
    const sx = this.tiltY() * 1.2;
    const sy = -this.tiltX() * 1.2;
    return `${sx}px ${sy}px 36px rgba(0,0,0,0.16)`;
  });

  /** Fast on enter, slow ease-back on leave. */
  readonly transition = computed(() =>
    this.hovered()
      ? 'transform 0.1s ease-out, box-shadow 0.1s ease-out'
      : 'transform 0.55s ease-out, box-shadow 0.55s ease-out'
  );

  onEnter(): void {
    this.hovered.set(true);
  }

  onLeave(): void {
    this.hovered.set(false);
    this.tiltX.set(0);
    this.tiltY.set(0);
  }

  onMove(event: MouseEvent): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    this.tiltY.set(((event.clientX - cx) / (rect.width / 2)) * this.maxTilt());
    this.tiltX.set(-((event.clientY - cy) / (rect.height / 2)) * this.maxTilt());
  }
}
