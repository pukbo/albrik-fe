import { Component } from '@angular/core';

interface Passo {
  titolo: string;
  testo: string;
  /** Vantaggio del passo in due parole (etichetta arancione). */
  etichetta: string;
  /** Tracciato dell'icona (viewBox 24x24, solo contorno). */
  icona: string;
}

/**
 * I quattro passi del lavoro con Albrik, in home e nelle pagine dei servizi.
 * Card con icona, numero in filigrana ed etichetta, collegate da una linea tratteggiata
 * (orizzontale da tablet in su, verticale su telefono).
 */
@Component({
  selector: 'app-come-lavoriamo',
  template: `
    <section class="relative overflow-hidden bg-gradient-to-b from-white to-slate-50" aria-labelledby="titolo-come">
      <div class="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div class="text-center sm:text-left md:flex md:items-end md:justify-between md:gap-10">
          <div>
            <p class="font-semibold tracking-wide text-orange-700 uppercase">Semplice e trasparente</p>
            <h2 id="titolo-come" class="mt-2 text-3xl font-bold text-blue-950 md:text-4xl">Come lavoriamo</h2>
            <span class="mx-auto mt-4 block h-1 w-12 rounded-full bg-orange-500 sm:mx-0" aria-hidden="true"></span>
          </div>
          <p class="mx-auto mt-4 max-w-md text-slate-600 sm:mx-0 md:mt-0 md:text-right">
            Quattro passi chiari, dal primo contatto alla certificazione: sai sempre cosa succede e quanto costa.
          </p>
        </div>

        <!-- percorso a tappe: cerchi numerati uniti da una linea, sotto (o accanto) la card di ogni passo -->
        <ol class="relative mt-10 grid gap-6 md:mt-14 md:grid-cols-4">
          <span class="linea" aria-hidden="true"></span>

          @for (p of passi; track p.titolo; let i = $index) {
            <li class="rivela relative flex gap-4 md:flex-col md:items-center md:gap-5" [style.animation-delay]="i * 80 + 'ms'">
              <span class="tappa font-display relative z-10 inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-orange-700 text-lg font-bold text-white shadow-md shadow-orange-700/30 ring-4 ring-white" aria-hidden="true">
                {{ i + 1 }}
              </span>

              <div class="card group relative flex h-full w-full min-w-0 flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">Passo {{ i + 1 }} di {{ passi.length }}</p>
                  <span class="icona inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-md shadow-orange-600/25" aria-hidden="true">
                    <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path [attr.d]="p.icona" />
                    </svg>
                  </span>
                </div>
                <h3 class="mt-3 text-lg font-bold text-slate-900">{{ p.titolo }}</h3>
                <p class="mt-1.5 flex-1 leading-relaxed text-slate-600">{{ p.testo }}</p>
                <p class="mt-4 inline-flex self-start rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">
                  {{ p.etichetta }}
                </p>
              </div>
            </li>
          }
        </ol>
      </div>
    </section>
  `,
  styles: `
    /*
     * Linea che unisce i cerchi delle tappe (cerchi da 2.75rem, centro a 1.375rem).
     * Telefono: verticale a sinistra. Da tablet in su: orizzontale, dal centro del primo cerchio
     * al centro dell'ultimo (colonne uguali con spazio di 1.5rem).
     */
    .linea {
      position: absolute;
      top: 1.375rem;
      bottom: 1.375rem;
      left: calc(1.375rem - 1px);
      border-left: 2px dashed #fdba74;
    }

    @media (min-width: 768px) {
      .linea {
        top: calc(1.375rem - 1px);
        bottom: auto;
        left: calc((100% - 4.5rem) / 8);
        right: calc((100% - 4.5rem) / 8);
        border-left: 0;
        border-top: 2px dashed #fdba74;
      }
    }

    .card {
      transition:
        transform 0.25s ease,
        box-shadow 0.25s ease;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 18px 36px -18px rgb(15 23 42 / 0.25);
    }

    .icona {
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .card:hover .icona {
      transform: rotate(-6deg) scale(1.06);
    }

    .tappa {
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    li:hover .tappa {
      transform: scale(1.12);
    }

    @media (prefers-reduced-motion: reduce) {
      .card,
      .card:hover,
      .icona,
      .card:hover .icona,
      .tappa,
      li:hover .tappa {
        transition: none;
        transform: none;
      }
    }
  `,
})
export class ComeLavoriamo {
  protected readonly passi: Passo[] = [
    {
      titolo: 'Ci contatti',
      testo: 'Compila il modulo online o chiamaci: ti rispondiamo in giornata.',
      etichetta: 'In giornata',
      icona: 'M21 12a8.5 8.5 0 0 1-12.4 7.6L3.5 21l1.4-4.8A8.5 8.5 0 1 1 21 12zM8.5 12h.01M12 12h.01M15.5 12h.01',
    },
    {
      titolo: 'Sopralluogo gratuito',
      testo: 'Veniamo a vedere l’impianto e ascoltiamo cosa ti serve.',
      etichetta: 'Gratuito',
      icona: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
    },
    {
      titolo: 'Preventivo chiaro',
      testo: 'Ricevi il preventivo via email e puoi accettarlo online in un clic.',
      etichetta: 'Accetti online',
      icona: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h4',
    },
    {
      titolo: 'Lavori e certificazione',
      testo: 'Installiamo a regola d’arte e ti consegniamo la documentazione.',
      etichetta: 'Certificato',
      icona: 'M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3zM9 12l2 2 4-4',
    },
  ];
}
