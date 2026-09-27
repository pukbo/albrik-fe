import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { fotoServizio } from '../../core/immagini';
import { Servizio } from '../../core/servizi-api';
import { Seo } from '../../core/seo';
import { servizioJsonLd } from '../../core/structured-data';
import { ANNI_ESPERIENZA, SITE } from '../../core/site.config';
import { CtaContatti } from '../../shared/cta-contatti';
import { IntestazionePagina } from '../../shared/intestazione-pagina';
import { ServizioIcona } from '../../shared/servizio-icona';
import NotFound from '../not-found/not-found';

@Component({
  selector: 'app-servizio',
  imports: [RouterLink, ServizioIcona, CtaContatti, NotFound, IntestazionePagina],
  template: `
    @if (servizio(); as s) {
      <article>
        <app-intestazione-pagina
          [etichetta]="'Servizio a ' + zona + ' · ' + anni + ' anni di esperienza'"
          [titolo]="s.titolo"
          [sottotitolo]="s.sommario"
        >
          <nav briciole aria-label="Percorso" class="mb-6 text-sm text-blue-200">
            <ol class="flex flex-wrap gap-1">
              <li><a routerLink="/" class="hover:text-white hover:underline">Home</a> /</li>
              <li><a routerLink="/servizi" class="hover:text-white hover:underline">Servizi</a> /</li>
              <li aria-current="page" class="text-white">{{ s.titolo }}</li>
            </ol>
          </nav>
        </app-intestazione-pagina>

        <div class="mx-auto max-w-4xl px-4 py-12 md:py-16">
          @if (foto(); as f) {
            <!-- immagine principale: caricata subito (niente lazy) perché è nella prima schermata -->
            <img [src]="f.src" [srcset]="f.srcset" sizes="(min-width: 896px) 864px, 100vw"
              [width]="f.larghezza" [height]="f.altezza" fetchpriority="high" decoding="async" [alt]="s.titolo"
              class="mb-10 aspect-video w-full rounded-2xl object-cover shadow-sm" />
          } @else {
            <app-servizio-icona [slug]="s.slug" class="mb-8 size-16 rounded-2xl bg-blue-50 p-3.5 text-blue-800" />
          }
          <p class="text-lg leading-relaxed whitespace-pre-line text-slate-700">{{ s.descrizione }}</p>
        </div>
      </article>
      <app-cta-contatti [servizioSlug]="s.slug" />
    } @else {
      <app-not-found />
    }
  `,
})
export default class ServizioPagina {
  /** Dal resolver della route: null se lo slug non esiste. */
  readonly servizio = input<Servizio | null>(null);

  protected readonly foto = computed(() => fotoServizio(this.servizio()?.immagine));
  protected readonly zona = SITE.indirizzo.citta;
  protected readonly anni = ANNI_ESPERIENZA;

  constructor() {
    const seo = inject(Seo);
    effect(() => {
      const s = this.servizio();
      if (s) {
        seo.aggiorna({
          title: s.metaTitle,
          description: s.metaDescription,
          path: `/servizi/${s.slug}`,
          immagine: s.immagine ?? undefined,
          jsonLd: servizioJsonLd(s),
        });
      }
    });
  }
}
