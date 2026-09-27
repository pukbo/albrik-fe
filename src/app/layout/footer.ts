import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE, TELEFONO_LINK } from '../core/site.config';
import { Logo } from '../shared/logo';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Logo],
  template: `
    <footer class="bg-blue-950 text-blue-100">
      <div class="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <app-logo [dimensione]="40" [scuro]="true" />
          <p class="mt-4 text-sm">{{ site.descrizione }}</p>
        </div>

        <address class="not-italic">
          <p class="font-semibold text-white">Contatti</p>
          <p class="mt-2 text-sm">
            {{ site.indirizzo.via }}<br />
            {{ site.indirizzo.cap }} {{ site.indirizzo.citta }} ({{ site.indirizzo.provincia }})
          </p>
          <ul class="mt-2 text-sm">
            <li>
              <a [href]="telefonoLink" class="-mx-2 flex min-h-11 items-center gap-2.5 rounded-lg px-2 hover:bg-white/5 hover:text-white">
                <svg class="size-4 shrink-0 text-orange-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                </svg>
                {{ site.telefono }}
              </a>
            </li>
            <li>
              <a [href]="'mailto:' + site.email" class="-mx-2 flex min-h-11 items-center gap-2.5 rounded-lg px-2 break-all hover:bg-white/5 hover:text-white">
                <svg class="size-4 shrink-0 text-orange-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
                </svg>
                {{ site.email }}
              </a>
            </li>
          </ul>
        </address>

        <nav aria-label="Link utili">
          <p class="font-semibold text-white">Link utili</p>
          <!-- su telefono due colonne di link alti 44px (comodi da toccare), su desktop una colonna compatta -->
          <ul class="mt-2 grid grid-cols-2 gap-x-4 text-sm md:grid-cols-1">
            @for (l of link; track l.path) {
              <li>
                <a [routerLink]="l.path" class="flex min-h-11 items-center hover:text-white hover:underline md:min-h-8">{{ l.etichetta }}</a>
              </li>
            }
          </ul>
        </nav>
      </div>
      <p class="border-t border-blue-900 py-4 text-center text-xs text-blue-200">
        © {{ anno }} {{ site.nome }} – Impiantistica a {{ site.indirizzo.citta }}
      </p>
    </footer>
  `,
})
export class Footer {
  protected readonly site = SITE;
  protected readonly telefonoLink = TELEFONO_LINK;
  protected readonly anno = new Date().getFullYear();
  protected readonly link = [
    { path: '/servizi', etichetta: 'I nostri servizi' },
    { path: '/catalogo', etichetta: 'Catalogo' },
    { path: '/caldaie', etichetta: 'Caldaie' },
    { path: '/condizionatori', etichetta: 'Condizionatori' },
    { path: '/contatti', etichetta: 'Preventivo gratuito' },
    { path: '/privacy', etichetta: 'Privacy' },
  ];
}
