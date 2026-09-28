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
      <div class="relative mx-auto max-w-6xl px-5 pt-8 pb-10 sm:px-4 md:py-16">
        <ng-content select="[briciole]" />
        @if (etichetta()) {
          <!-- etichetta a "pillola", come nell'apertura della home -->
          <p class="inline-flex max-w-full items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-orange-200 ring-1 ring-white/15">
            <span class="size-2 shrink-0 rounded-full bg-orange-400" aria-hidden="true"></span>
            <span class="truncate">{{ etichetta() }}</span>
          </p>
        }
        <h1 class="mt-4 max-w-3xl text-[2rem] leading-[1.12] font-bold tracking-tight md:text-5xl md:leading-tight">{{ titolo() }}</h1>
        @if (sottotitolo()) {
          <p class="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-blue-100 md:text-lg">{{ sottotitolo() }}</p>
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
