import { Component, ElementRef, computed, inject, model, signal, viewChild } from '@angular/core';
import { ORDINAMENTI, Ordinamento } from '../core/filtri-catalogo';

/**
 * Tendina "Ordina" del catalogo. Non è un <select> nativo: la tendina del browser allinea le voci
 * al rientro lasciato per la scritta "Ordina:" e non si può stilizzare. Segue lo schema ARIA
 * "listbox a comparsa": frecce, Home/Fine, Invio/Spazio per scegliere, Esc per chiudere.
 */
@Component({
  selector: 'app-menu-ordina',
  host: {
    class: 'relative block',
    '(document:click)': 'fuori($event)',
  },
  template: `
    <span id="etichetta-ordina" class="sr-only">Ordina per</span>
    <button #pulsante type="button" aria-haspopup="listbox" aria-controls="elenco-ordina" [attr.aria-expanded]="aperto()"
      aria-labelledby="etichetta-ordina valore-ordina" (click)="alterna()" (keydown)="tastoPulsante($event)"
      class="premi flex w-full items-center gap-1.5 rounded-xl border bg-white py-3 pr-3.5 pl-4 text-left shadow-sm focus:ring-2 focus:ring-blue-200 focus:outline-none"
      [class]="aperto() ? 'border-blue-700' : 'border-slate-300 hover:bg-slate-50'">
      <span class="text-sm text-slate-500" aria-hidden="true">Ordina:</span>
      <span id="valore-ordina" class="mr-auto font-semibold whitespace-nowrap text-slate-800">{{ etichetta() }}</span>
      <svg class="freccia-giu size-4 shrink-0 text-slate-500" [class.girata]="aperto()" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    @if (aperto()) {
      <ul #elenco id="elenco-ordina" role="listbox" tabindex="-1" aria-labelledby="etichetta-ordina"
        [attr.aria-activedescendant]="'ordina-' + attiva()" (keydown)="tastoElenco($event)" (blur)="perdeFuoco($event)"
        class="elenco absolute right-0 z-40 mt-2 w-full min-w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg focus:outline-none">
        @for (o of ordinamenti; track o.valore; let i = $index) {
          <li [id]="'ordina-' + i" role="option" [attr.aria-selected]="o.valore === valore()"
            (mousedown)="$event.preventDefault()" (click)="scegli(i)" (mousemove)="attiva.set(i)"
            class="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[0.9375rem]"
            [class]="(i === attiva() ? 'bg-blue-50 ' : '') + (o.valore === valore() ? 'font-semibold text-blue-900' : 'text-slate-700')">
            {{ o.etichetta }}
            @if (o.valore === valore()) {
              <svg class="size-4 shrink-0 text-blue-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
            }
          </li>
        }
      </ul>
    }
  `,
  styles: `
    .freccia-giu {
      transition: transform 0.2s ease;
    }
    .freccia-giu.girata {
      transform: rotate(180deg);
    }
    .elenco {
      animation: comparsa 0.15s ease-out;
      transform-origin: top right;
    }
    @keyframes comparsa {
      from {
        opacity: 0;
        transform: translateY(-4px) scale(0.98);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .freccia-giu {
        transition: none;
      }
      .elenco {
        animation: none;
      }
    }
  `,
})
export class MenuOrdina {
  readonly valore = model.required<Ordinamento>();

  protected readonly ordinamenti = ORDINAMENTI;
  protected readonly aperto = signal(false);
  /** Voce evidenziata da tastiera o mouse (indice in ORDINAMENTI). */
  protected readonly attiva = signal(0);
  protected readonly etichetta = computed(() => ORDINAMENTI.find((o) => o.valore === this.valore())?.etichetta ?? '');

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly pulsante = viewChild.required<ElementRef<HTMLButtonElement>>('pulsante');
  private readonly elenco = viewChild<ElementRef<HTMLUListElement>>('elenco');

  protected alterna(): void {
    if (this.aperto()) {
      this.chiudi(true);
    } else {
      this.apri(this.indiceScelto());
    }
  }

  protected tastoPulsante(e: KeyboardEvent): void {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.apri(this.indiceScelto());
    }
  }

  protected tastoElenco(e: KeyboardEvent): void {
    const ultimo = ORDINAMENTI.length - 1;
    const sposta: Record<string, () => number> = {
      ArrowDown: () => Math.min(this.attiva() + 1, ultimo),
      ArrowUp: () => Math.max(this.attiva() - 1, 0),
      Home: () => 0,
      End: () => ultimo,
    };
    if (sposta[e.key]) {
      e.preventDefault();
      this.attiva.set(sposta[e.key]());
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.scegli(this.attiva());
    } else if (e.key === 'Escape') {
      // non deve chiudere anche il pannello dei filtri
      e.stopPropagation();
      this.chiudi(true);
    } else if (e.key === 'Tab') {
      this.chiudi(false);
    }
  }

  protected scegli(i: number): void {
    this.valore.set(ORDINAMENTI[i].valore);
    this.chiudi(true);
  }

  protected chiudi(rimettiFuoco: boolean): void {
    if (!this.aperto()) return;
    this.aperto.set(false);
    if (rimettiFuoco) this.pulsante().nativeElement.focus();
  }

  /** Il fuoco esce dal componente: chiudi. Se va sul pulsante ci pensa il suo clic. */
  protected perdeFuoco(e: FocusEvent): void {
    if (!this.host.nativeElement.contains(e.relatedTarget as Node | null)) this.chiudi(false);
  }

  protected fuori(e: MouseEvent): void {
    if (!this.host.nativeElement.contains(e.target as Node)) this.chiudi(false);
  }

  private apri(indice: number): void {
    this.attiva.set(indice);
    this.aperto.set(true);
    // l'elenco esiste solo dopo il rendering
    setTimeout(() => this.elenco()?.nativeElement.focus());
  }

  private indiceScelto(): number {
    return Math.max(0, ORDINAMENTI.findIndex((o) => o.valore === this.valore()));
  }
}
