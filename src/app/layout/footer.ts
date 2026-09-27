import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE, TELEFONO_LINK } from '../core/site.config';
import { Logo } from '../shared/logo';

/**
 * Piè di pagina. Su telefono: logo centrato, contatti in un riquadro a righe toccabili,
 * link come "pillole" su due colonne. Da tablet in su: tre colonne.
 */
@Component({
  selector: 'app-footer',
  imports: [RouterLink, Logo],
  template: `
    <footer class="relative overflow-hidden bg-blue-950 text-blue-100">
      <!-- goccia del marchio in filigrana -->
      <svg viewBox="0 0 64 64" class="pointer-events-none absolute -top-10 -right-16 size-64 opacity-[0.04]" aria-hidden="true">
        <path d="M32 5 C32 5 12 27 12 40 A20 20 0 0 0 52 40 C52 27 32 5 32 5 Z" fill="#ffffff" />
      </svg>

      <div class="relative mx-auto grid max-w-6xl gap-10 px-4 pt-12 pb-8 md:grid-cols-3 md:gap-8 md:py-14">
        <!-- Marchio -->
        <div class="flex flex-col items-center text-center md:items-start md:text-left">
          <app-logo [dimensione]="44" [scuro]="true" />
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-blue-200">{{ site.descrizione }}</p>
          <p class="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-orange-200">
            <span class="size-1.5 rounded-full bg-orange-400" aria-hidden="true"></span>
            Nel settore dal {{ site.attivitaDal }}
          </p>
        </div>

        <!-- Contatti: righe toccabili -->
        <address class="not-italic">
          <p class="titolo">Contatti</p>
          <ul class="mt-3 divide-y divide-white/10 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
            <li>
              <a [href]="telefonoLink" class="riga">
                <span class="icona" aria-hidden="true">
                  <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                  </svg>
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-xs text-blue-300">Telefono</span>
                  <span class="block font-semibold text-white">{{ site.telefono }}</span>
                </span>
                <span class="text-blue-300" aria-hidden="true">→</span>
              </a>
            </li>
            <li>
              <a [href]="'mailto:' + site.email" class="riga">
                <span class="icona" aria-hidden="true">
                  <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
                  </svg>
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-xs text-blue-300">Email</span>
                  <span class="block font-semibold break-all text-white">{{ site.email }}</span>
                </span>
                <span class="text-blue-300" aria-hidden="true">→</span>
              </a>
            </li>
            <li>
              <a [href]="mappa" target="_blank" rel="noopener" class="riga">
                <span class="icona" aria-hidden="true">
                  <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" />
                  </svg>
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-xs text-blue-300">Sede<span class="sr-only"> (apre Google Maps in una nuova scheda)</span></span>
                  <span class="block font-semibold text-white">
                    {{ site.indirizzo.via }}, {{ site.indirizzo.cap }} {{ site.indirizzo.citta }} ({{ site.indirizzo.provincia }})
                  </span>
                </span>
                <span class="text-blue-300" aria-hidden="true">↗</span>
              </a>
            </li>
          </ul>
        </address>

        <!-- Link: pillole su telefono, elenco da tablet in su -->
        <nav aria-label="Link utili">
          <p class="titolo">Link utili</p>
          <ul class="mt-3 grid grid-cols-2 gap-2 md:grid-cols-1 md:gap-0">
            @for (l of link; track l.path) {
              <li>
                <a [routerLink]="l.path"
                  class="premi flex min-h-11 items-center justify-center rounded-xl bg-white/5 px-3 text-center text-sm font-medium text-blue-100 ring-1 ring-white/10 hover:bg-white/10 hover:text-white md:min-h-9 md:justify-start md:rounded-lg md:bg-transparent md:px-0 md:text-left md:ring-0 md:hover:bg-transparent md:hover:underline">
                  {{ l.etichetta }}
                </a>
              </li>
            }
          </ul>
        </nav>
      </div>

      <div class="relative border-t border-white/10">
        <p class="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-blue-300 md:text-left">
          © {{ anno }} {{ site.nome }} · Impiantistica a {{ site.zonaServita }}
        </p>
      </div>
    </footer>
  `,
  styles: `
    .titolo {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #fdba74;
      text-align: center;
    }

    .riga {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      min-height: 3.5rem;
      padding: 0.75rem 1rem;
      transition: background-color 0.15s ease;
    }

    .riga:hover,
    .riga:active {
      background: rgb(255 255 255 / 0.06);
    }

    .icona {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 9999px;
      background: rgb(249 115 22 / 0.15);
      color: #fdba74;
    }

    @media (min-width: 768px) {
      .titolo {
        text-align: left;
      }
    }
  `,
})
export class Footer {
  protected readonly site = SITE;
  protected readonly telefonoLink = TELEFONO_LINK;
  protected readonly anno = new Date().getFullYear();
  /** Ricerca dell'indirizzo su Google Maps (si apre nell'app Mappe sul telefono). */
  protected readonly mappa =
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(`${SITE.nome}, ${SITE.indirizzo.via}, ${SITE.indirizzo.cap} ${SITE.indirizzo.citta}`);
  protected readonly link = [
    { path: '/servizi', etichetta: 'I nostri servizi' },
    { path: '/catalogo', etichetta: 'Catalogo' },
    { path: '/caldaie', etichetta: 'Caldaie' },
    { path: '/condizionatori', etichetta: 'Condizionatori' },
    { path: '/contatti', etichetta: 'Preventivo gratuito' },
    { path: '/privacy', etichetta: 'Privacy' },
  ];
}
