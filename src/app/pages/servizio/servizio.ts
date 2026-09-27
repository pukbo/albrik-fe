import { Component, computed, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { fotoServizio } from '../../core/immagini';
import { CATEGORIE, ProdottiApi } from '../../core/prodotti-api';
import { Servizio } from '../../core/servizi-api';
import { Seo } from '../../core/seo';
import { paginaServizioJsonLd } from '../../core/structured-data';
import { ANNI_ESPERIENZA, SITE, TELEFONO_LINK } from '../../core/site.config';
import { ComeLavoriamo } from '../../shared/come-lavoriamo';
import { CAROSELLO, ELEMENTO_CAROSELLO } from '../../shared/carosello';
import { CtaContatti } from '../../shared/cta-contatti';
import { ElencoFaq } from '../../shared/elenco-faq';
import { IntestazionePagina } from '../../shared/intestazione-pagina';
import { ProdottoCard } from '../../shared/prodotto-card';
import { ServizioIcona } from '../../shared/servizio-icona';
import NotFound from '../not-found/not-found';

/**
 * Pagina di un servizio: testata con punti chiave e pulsanti, descrizione e "cosa comprende",
 * modelli del catalogo collegato, come lavoriamo, domande frequenti (anche in JSON-LD FAQPage).
 * Le sezioni senza contenuti non vengono mostrate.
 */
@Component({
  selector: 'app-servizio',
  imports: [RouterLink, ServizioIcona, CtaContatti, NotFound, IntestazionePagina, ProdottoCard, ComeLavoriamo, ElencoFaq],
  template: `
    @if (servizio(); as s) {
      <article>
        <app-intestazione-pagina
          [etichetta]="'Servizio a ' + zona + ' · ' + anni + ' anni di esperienza'"
          [titolo]="s.titolo"
          [sottotitolo]="s.sommario"
        >
          <nav briciole aria-label="Percorso" class="mb-6 text-sm text-blue-200">
            <ol class="flex flex-wrap items-center gap-1">
              <li><a routerLink="/" class="inline-block py-1.5 hover:text-white hover:underline">Home</a> /</li>
              <li><a routerLink="/servizi" class="inline-block py-1.5 hover:text-white hover:underline">Servizi</a> /</li>
              <li aria-current="page" class="text-white">{{ s.titolo }}</li>
            </ol>
          </nav>

          @if (s.puntiChiave.length) {
            <ul class="mt-6 flex flex-wrap gap-2" aria-label="Punti chiave">
              @for (punto of s.puntiChiave; track punto) {
                <li class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white ring-1 ring-white/15">
                  <svg class="size-4 text-orange-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
                  {{ punto }}
                </li>
              }
            </ul>
          }
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <a routerLink="/contatti" [queryParams]="{ servizio: s.slug }"
              class="pulsante rounded-lg bg-orange-700 px-6 py-3 text-center font-semibold text-white hover:bg-orange-800">
              Richiedi un preventivo gratuito <span class="freccia" aria-hidden="true">→</span>
            </a>
            <a [href]="telefonoLink" class="pulsante rounded-lg border border-white/40 px-6 py-3 text-center font-semibold text-white hover:bg-white/10">
              Chiama {{ telefono }}
            </a>
          </div>
        </app-intestazione-pagina>

        <div class="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:py-16 lg:grid-cols-5">
          <div class="lg:col-span-3">
            @if (foto(); as f) {
              <!-- immagine principale: caricata subito (niente lazy) perché è nella prima schermata -->
              <img [src]="f.src" [srcset]="f.srcset" sizes="(min-width: 1024px) 680px, 100vw"
                [width]="f.larghezza" [height]="f.altezza" fetchpriority="high" decoding="async" [alt]="s.titolo"
                class="mb-10 aspect-video w-full rounded-2xl object-cover shadow-sm" />
            } @else {
              <!-- senza foto: icona solo da tablet in su (sul telefono sarebbe spazio vuoto) -->
              <div class="hidden sm:block">
                <app-servizio-icona [slug]="s.slug" class="mb-8 size-16 rounded-2xl bg-blue-50 p-3.5 text-blue-800" />
              </div>
            }
            <h2 class="text-2xl font-bold text-slate-900 md:text-3xl">Il servizio</h2>
            <p class="mt-4 text-lg leading-relaxed whitespace-pre-line text-slate-700">{{ s.descrizione }}</p>
          </div>

          @if (s.incluso.length) {
            <aside class="lg:col-span-2" aria-labelledby="titolo-incluso">
              <div class="entra rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
                <h2 id="titolo-incluso" class="text-xl font-bold text-slate-900">Cosa comprende</h2>
                <ul class="mt-4 space-y-3">
                  @for (voce of s.incluso; track voce) {
                    <li class="flex gap-3 text-slate-700">
                      <span class="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800" aria-hidden="true">
                        <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                          stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10" /></svg>
                      </span>
                      {{ voce }}
                    </li>
                  }
                </ul>
                <a routerLink="/contatti" [queryParams]="{ servizio: s.slug }"
                  class="pulsante mt-6 block rounded-lg bg-blue-900 px-5 py-3 text-center font-semibold text-white hover:bg-blue-800">
                  Chiedi un sopralluogo gratuito
                </a>
              </div>
            </aside>
          }
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
                    Vedi tutto il catalogo →
                  </a>
                </div>
                <p class="mt-3 text-sm text-slate-500 sm:hidden" aria-hidden="true">Scorri per vedere gli altri modelli →</p>
                <ul [class]="carosello">
                  @for (p of anteprima(); track p.slug) {
                    <li [class]="elementoCarosello"><app-prodotto-card [prodotto]="p" /></li>
                  }
                </ul>
              </div>
            </section>
          }
        }

        <app-come-lavoriamo />

        @if (s.faq.length) {
          <section class="bg-slate-50 py-12 md:py-16" aria-labelledby="titolo-faq">
            <div class="mx-auto max-w-3xl px-4">
              <p class="font-semibold tracking-wide text-orange-700 uppercase">Domande frequenti</p>
              <h2 id="titolo-faq" class="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">Hai dei dubbi? Ecco le risposte</h2>
              <app-elenco-faq class="mt-8 block" [faq]="s.faq" [apriPrima]="true" />
              <p class="mt-8 text-slate-600">
                Non trovi la risposta?
                <a routerLink="/contatti" [queryParams]="{ servizio: s.slug }" class="font-semibold text-blue-800 underline">Scrivici</a>
                oppure chiama il <a [href]="telefonoLink" class="font-semibold text-blue-800 underline">{{ telefono }}</a>.
              </p>
            </div>
          </section>
        }
      </article>
      <app-cta-contatti class="mt-12 block" [servizioSlug]="s.slug" />
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
  protected readonly telefono = SITE.telefono;
  protected readonly telefonoLink = TELEFONO_LINK;
  protected readonly carosello = CAROSELLO;
  protected readonly elementoCarosello = ELEMENTO_CAROSELLO;

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
          jsonLd: paginaServizioJsonLd(s),
        });
      }
    });
  }
}
