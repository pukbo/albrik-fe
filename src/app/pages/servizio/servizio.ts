import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Servizio } from '../../core/servizi-api';
import { Seo } from '../../core/seo';
import { servizioJsonLd } from '../../core/structured-data';
import { CtaContatti } from '../../shared/cta-contatti';
import { ServizioIcona } from '../../shared/servizio-icona';
import NotFound from '../not-found/not-found';

@Component({
  selector: 'app-servizio',
  imports: [RouterLink, ServizioIcona, CtaContatti, NotFound],
  template: `
    @if (servizio(); as s) {
      <article>
        <header class="bg-slate-50">
          <div class="mx-auto max-w-4xl px-4 py-12 md:py-16">
            <nav aria-label="Percorso" class="text-sm text-slate-600">
              <ol class="flex flex-wrap gap-1">
                <li><a routerLink="/" class="hover:underline">Home</a> /</li>
                <li><a routerLink="/servizi" class="hover:underline">Servizi</a> /</li>
                <li aria-current="page" class="text-slate-900">{{ s.titolo }}</li>
              </ol>
            </nav>
            <div class="mt-6 flex items-start gap-4">
              <app-servizio-icona [slug]="s.slug" class="size-14 shrink-0 rounded-xl bg-blue-100 p-3 text-blue-800" />
              <div>
                <h1 class="text-3xl font-extrabold text-slate-900 md:text-4xl">{{ s.titolo }}</h1>
                <p class="mt-2 text-lg text-slate-600">{{ s.sommario }}</p>
              </div>
            </div>
          </div>
        </header>
        <div class="mx-auto max-w-4xl px-4 py-12">
          <p class="text-lg leading-relaxed whitespace-pre-line text-slate-700">{{ s.descrizione }}</p>
        </div>
      </article>
      <app-cta-contatti />
    } @else {
      <app-not-found />
    }
  `,
})
export default class ServizioPagina {
  /** Dal resolver della route: null se lo slug non esiste. */
  readonly servizio = input<Servizio | null>(null);

  constructor() {
    const seo = inject(Seo);
    effect(() => {
      const s = this.servizio();
      if (s) {
        seo.aggiorna({
          title: s.metaTitle,
          description: s.metaDescription,
          path: `/servizi/${s.slug}`,
          jsonLd: servizioJsonLd(s),
        });
      }
    });
  }
}
