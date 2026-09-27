import { Component, input } from '@angular/core';

/**
 * Intestazione delle pagine interne, coordinata con l'apertura della home:
 * fascia blu notte, etichetta arancione, titolo in Outfit. Il contenuto proiettato
 * va sotto il sottotitolo (es. briciole di pane o pulsanti).
 */
@Component({
  selector: 'app-intestazione-pagina',
  template: `
    <header class="relative overflow-hidden bg-gradient-to-br from-blue-950 to-blue-900 text-white">
      <!-- goccia del marchio in filigrana -->
      <svg viewBox="0 0 64 64" class="pointer-events-none absolute -right-8 -bottom-16 size-72 opacity-[0.07]" aria-hidden="true">
        <path d="M32 5 C32 5 12 27 12 40 A20 20 0 0 0 52 40 C52 27 32 5 32 5 Z" fill="#ffffff" />
      </svg>
      <div class="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
        <ng-content select="[briciole]" />
        @if (etichetta()) {
          <p class="font-semibold tracking-wide text-orange-300 uppercase">{{ etichetta() }}</p>
        }
        <h1 class="mt-2 max-w-3xl text-3xl leading-tight font-bold md:text-5xl">{{ titolo() }}</h1>
        @if (sottotitolo()) {
          <p class="mt-4 max-w-2xl text-lg text-blue-100">{{ sottotitolo() }}</p>
        }
        <ng-content />
      </div>
    </header>
  `,
})
export class IntestazionePagina {
  readonly etichetta = input<string>();
  readonly titolo = input.required<string>();
  readonly sottotitolo = input<string>();
}
