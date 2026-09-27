import { Component, input } from '@angular/core';

/**
 * Logo Albrik: simbolo "goccia e fiamma" (acqua e calore) + scritta in Outfit.
 * La scritta è testo HTML (non un'immagine): nitida a ogni dimensione e leggibile dai motori di ricerca.
 * Colori del marchio: vedi CLAUDE.md, sezione "Identità visiva".
 */
@Component({
  selector: 'app-logo',
  host: { class: 'inline-flex items-center gap-2' },
  template: `
    <svg viewBox="0 0 64 64" [attr.width]="dimensione()" [attr.height]="dimensione()" aria-hidden="true" class="shrink-0">
      <path d="M32 5 C32 5 12 27 12 40 A20 20 0 0 0 52 40 C52 27 32 5 32 5 Z" [attr.fill]="scuro() ? '#3b82f6' : '#1e40af'" />
      <path d="M32 24 C34 30 42 33 42 42 A10 10 0 0 1 22 42 C22 37 25 34 27 32 C27 36 29 38 31 38 C29 33 30 28 32 24 Z"
        [attr.fill]="scuro() ? '#fb923c' : '#f97316'" />
    </svg>
    <span class="flex flex-col leading-none">
      <span class="font-display font-bold tracking-tight" [class]="scuro() ? 'text-white' : 'text-blue-950'"
        [style.font-size.px]="dimensione() * 0.72">Albrik</span>
      @if (tagline()) {
        <span class="font-display mt-1 font-medium tracking-[0.18em] uppercase" [class]="scuro() ? 'text-blue-200' : 'text-slate-600'"
          [style.font-size.px]="Math.max(10, dimensione() * 0.24)">Impianti · Caserta</span>
      }
    </span>
  `,
})
export class Logo {
  /** Altezza del simbolo in pixel; la scritta si adatta. */
  readonly dimensione = input(36);
  /** Versione per sfondi scuri (colori schiariti e scritta bianca). */
  readonly scuro = input(false);
  readonly tagline = input(true);

  protected readonly Math = Math;
}
