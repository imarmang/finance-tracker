import { Injectable, signal } from '@angular/core';

export interface TipContent {
  title: string;
  lines: string[];
}

export interface TipState extends TipContent {
  x: number;
  y: number;
}

/** Hover tooltip shared by the charts. The shell renders it once. */
@Injectable({ providedIn: 'root' })
export class TooltipService {
  readonly tip = signal<TipState | null>(null);

  show(content: TipContent, event: MouseEvent): void {
    const x = Math.min(Math.max(event.clientX, 120), window.innerWidth - 120);
    this.tip.set({ ...content, x, y: event.clientY });
  }

  hide(): void {
    this.tip.set(null);
  }
}

export interface ToastState {
  message: string;
  actionLabel?: string;
  action?: () => void;
}

/** Short confirmation message with an optional Undo action. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toast = signal<ToastState | null>(null);
  private timer?: ReturnType<typeof setTimeout>;

  show(message: string, actionLabel?: string, action?: () => void): void {
    this.toast.set({ message, actionLabel, action });
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.hide(), 6000);
  }

  run(): void {
    const current = this.toast();
    this.hide();
    current?.action?.();
  }

  hide(): void {
    clearTimeout(this.timer);
    this.toast.set(null);
  }
}
