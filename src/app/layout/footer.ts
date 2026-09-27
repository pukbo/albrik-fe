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
          <p class="mt-2 text-sm">
            <a [href]="telefonoLink" class="underline-offset-2 hover:text-white hover:underline">{{ site.telefono }}</a><br />
            <a [href]="'mailto:' + site.email" class="underline-offset-2 hover:text-white hover:underline">{{ site.email }}</a>
          </p>
        </address>

        <nav aria-label="Link utili">
          <p class="font-semibold text-white">Link utili</p>
          <ul class="mt-2 space-y-1 text-sm">
            <li><a routerLink="/servizi" class="hover:text-white hover:underline">I nostri servizi</a></li>
            <li><a routerLink="/caldaie" class="hover:text-white hover:underline">Catalogo caldaie</a></li>
            <li><a routerLink="/condizionatori" class="hover:text-white hover:underline">Catalogo condizionatori</a></li>
            <li><a routerLink="/contatti" class="hover:text-white hover:underline">Richiedi un preventivo</a></li>
            <li><a routerLink="/privacy" class="hover:text-white hover:underline">Privacy</a></li>
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
}
