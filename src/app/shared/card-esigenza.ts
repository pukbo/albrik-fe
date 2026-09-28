import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Card "Hai un'esigenza diversa?" in fondo agli elenchi dei servizi: stessa forma delle card
 * dei servizi, con bordo tratteggiato ("per tutto il resto"), e link al modulo preventivo.
 */
@Component({
  selector: 'app-card-esigenza',
  imports: [RouterLink],
  host: { class: 'block h-full' },
  template: `
    <div class="premi group relative flex h-full flex-col rounded-2xl border-2 border-dashed border-slate-300 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md sm:p-6">
      <div class="flex items-center gap-4 sm:block">
        <span class="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200 sm:mb-4" aria-hidden="true">
          <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <!-- fumetto con punto di domanda -->
            <path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3.5 21l1.4-4.8A8.5 8.5 0 1 1 21 12z" />
            <path d="M9.8 9.6a2.3 2.3 0 1 1 3.2 2.1c-.6.3-1 .8-1 1.4v.4M12 16.4h.01" />
          </svg>
        </span>
        <h3 class="text-lg leading-snug font-bold text-slate-900">
          <a routerLink="/contatti" class="after:absolute after:inset-0">Hai un'esigenza diversa?</a>
        </h3>
      </div>
      <p class="mt-3 flex-1 text-slate-600 sm:mt-2">
        Manutenzione, riparazioni o un impianto su misura: raccontaci cosa ti serve.
      </p>
      <p class="mt-4 font-semibold text-orange-700 group-hover:underline" aria-hidden="true">Chiedi un preventivo →</p>
    </div>
  `,
})
export class CardEsigenza {}
