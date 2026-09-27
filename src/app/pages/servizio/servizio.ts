import { Component, computed, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { fotoServizio } from '../../core/immagini';
import { CATEGORIE, ProdottiApi } from '../../core/prodotti-api';
import { Servizio } from '../../core/servizi-api';
import { Seo } from '../../core/seo';
import { servizioJsonLd } from '../../core/structured-data';
import { ANNI_ESPERIENZA, SITE } from '../../core/site.config';
import { CtaContatti } from '../../shared/cta-contatti';
import { IntestazionePagina } from '../../shared/intestazione-pagina';
import { ProdottoCard } from '../../shared/prodotto-card';
import { ServizioIcona } from '../../shared/servizio-icona';
import NotFound from '../not-found/not-found';

@Component({
  selector: 'app-servizio',
  imports: [RouterLink, ServizioIcona, CtaContatti, NotFound, IntestazionePagina, ProdottoCard],
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

        <!-- servizio con catalogo (es. installazione caldaie): anteprima dei modelli -->
        @if (catalogo(); as cat) {
          @if (prodotti.value().length > 0) {
            <section class="bg-slate-50 py-12 md:py-16" aria-labelledby="titolo-modelli">
              <div class="mx-auto max-w-6xl px-4">
                <div class="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p class="font-semibold tracking-wide text-orange-700 uppercase">Catalogo</p>
                    <h2 id="titolo-modelli" class="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">Scegli il modello</h2>
                  </div>
                  <a [routerLink]="'/' + cat.percorso" class="font-semibold text-blue-800 hover:underline">
                    Tutte le {{ cat.plurale.toLowerCase() }} →
                  </a>
                </div>
                <ul class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  @for (p of anteprima(); track p.slug) {
                    <li class="rivela"><app-prodotto-card [prodotto]="p" /></li>
                  }
                </ul>
              </div>
            </section>
          }
        }
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

  private readonly prodottiApi = inject(ProdottiApi);
  protected readonly catalogo = computed(() => {
    const categoria = this.servizio()?.categoriaProdotti;
    return categoria ? CATEGORIE[categoria] : null;
  });
  /** Modelli del catalogo collegato (se c'è); caricati anche nel rendering sul server. */
  protected readonly prodotti = rxResource({
    params: () => this.servizio()?.categoriaProdotti ?? undefined,
    stream: ({ params }) => this.prodottiApi.elenco(params).pipe(catchError(() => of([]))),
    defaultValue: [],
  });
  protected readonly anteprima = computed(() => this.prodotti.value().slice(0, 3));

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
