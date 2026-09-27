import { Component, input } from '@angular/core';
import { Faq } from '../core/servizi-api';

/**
 * Domande frequenti a fisarmonica con <details>: si aprono anche senza JavaScript e le risposte
 * sono comunque nell'HTML per Google. L'apertura morbida è in styles.css (details.faq).
 */
@Component({
  selector: 'app-elenco-faq',
  template: `
    <div class="space-y-3">
      @for (f of faq(); track $index; let primo = $first) {
        <details class="faq group rounded-2xl border border-slate-200 bg-white shadow-sm open:shadow-md" [open]="primo && apriPrima()">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-slate-900">
            {{ f.domanda }}
            <span class="segno inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-800 transition-transform group-open:rotate-45" aria-hidden="true">
              <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
            </span>
          </summary>
          <p class="px-5 pb-5 leading-relaxed text-slate-700">{{ f.risposta }}</p>
        </details>
      }
    </div>
  `,
  styles: `
    /* niente triangolino nativo del <summary> (Safari lo mostra anche con list-style: none) */
    .faq summary::-webkit-details-marker {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .segno {
        transition: none;
      }
    }
  `,
})
export class ElencoFaq {
  readonly faq = input.required<Faq[]>();
  /** Se true la prima domanda è già aperta. */
  readonly apriPrima = input(false);
}
