import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { fotoProdotto } from '../../core/immagini';
import { CATEGORIE, Prodotto } from '../../core/prodotti-api';
import { Servizio } from '../../core/servizi-api';
import { Seo } from '../../core/seo';
import { SITE } from '../../core/site.config';
import { prodottoJsonLd } from '../../core/structured-data';
import { CtaContatti } from '../../shared/cta-contatti';
import { IntestazionePagina } from '../../shared/intestazione-pagina';
import { SchedaTecnica } from '../../shared/scheda-tecnica';
import NotFound from '../not-found/not-found';

/** Pagina di un modello del catalogo (es. /caldaie/slug) con la scheda tecnica. */
@Component({
  selector: 'app-prodotto',
  imports: [RouterLink, SchedaTecnica, CtaContatti, IntestazionePagina, NotFound],
  template: `
    @if (prodotto(); as p) {
      <article>
        <app-intestazione-pagina [etichetta]="p.marca" [titolo]="p.nome" [sottotitolo]="p.sommario">
          <nav briciole aria-label="Percorso" class="mb-6 text-sm text-blue-200">
            <ol class="flex flex-wrap gap-1">
              <li><a routerLink="/" class="hover:text-white hover:underline">Home</a> /</li>
              <li><a routerLink="/catalogo" class="hover:text-white hover:underline">Catalogo</a> /</li>
              <li><a [routerLink]="'/' + info().percorso" class="hover:text-white hover:underline">{{ info().plurale }}</a> /</li>
              <li aria-current="page" class="text-white">{{ p.nome }}</li>
            </ol>
          </nav>
        </app-intestazione-pagina>

        <div class="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:py-16 lg:grid-cols-5">
          <div class="lg:col-span-3">
            @if (foto(); as f) {
              <img [src]="f.src" [srcset]="f.srcset" sizes="(min-width: 1024px) 560px, 100vw"
                [width]="f.larghezza" [height]="f.altezza" fetchpriority="high" decoding="async" [alt]="p.nome"
                class="mb-10 aspect-square w-full max-w-md rounded-2xl border border-slate-200 bg-white object-contain p-6" />
            }
            <h2 class="text-2xl font-bold text-slate-900">Perché scegliere {{ p.nome }}</h2>
            <p class="mt-4 text-lg leading-relaxed whitespace-pre-line text-slate-700">{{ p.descrizione }}</p>

            <div class="mt-8 rounded-2xl bg-slate-100 p-6 text-slate-700">
              <h2 class="text-lg font-bold text-slate-900">Installazione a {{ site.zonaServita }}</h2>
              <p class="mt-2">{{ info().installazione }}</p>
            </div>

            <a [routerLink]="'/' + info().percorso" class="mt-8 inline-block font-semibold text-blue-800 hover:underline">
              ← Confronta con gli altri modelli
            </a>
          </div>

          <aside class="entra lg:col-span-2" aria-label="Scheda tecnica">
            <div class="lg:sticky lg:top-24">
              <app-scheda-tecnica [prodotto]="p" />
              <a routerLink="/contatti" [queryParams]="parametriPreventivo()"
                class="pulsante mt-4 block rounded-lg bg-orange-700 px-6 py-3 text-center font-semibold text-white hover:bg-orange-800">
                Preventivo per questo modello <span class="freccia" aria-hidden="true">→</span>
              </a>
            </div>
          </aside>
        </div>
      </article>
      <app-cta-contatti [servizioSlug]="servizio()?.slug" [prodottoSlug]="p.slug" />
    } @else {
      <app-not-found />
    }
  `,
})
export default class ProdottoPagina {
  /** Dai resolver della route: null se lo slug non esiste. */
  readonly prodotto = input<Prodotto | null>(null);
  readonly servizi = input<Servizio[]>([]);

  protected readonly site = SITE;
  protected readonly foto = computed(() => fotoProdotto(this.prodotto()?.immagine));
  protected readonly info = computed(() => CATEGORIE[this.prodotto()?.categoria ?? 'CALDAIA']);
  protected readonly servizio = computed(() =>
    this.servizi().find((s) => s.categoriaProdotti === this.prodotto()?.categoria),
  );
  protected readonly parametriPreventivo = computed(() => ({
    ...(this.servizio() && { servizio: this.servizio()!.slug }),
    prodotto: this.prodotto()?.slug,
  }));

  constructor() {
    const seo = inject(Seo);
    effect(() => {
      const p = this.prodotto();
      if (p) {
        seo.aggiorna({
          title: p.metaTitle,
          description: p.metaDescription,
          path: p.percorso,
          immagine: p.immagine ?? undefined,
          jsonLd: prodottoJsonLd(p),
        });
      }
    });
  }
}
