import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIE, CategoriaProdotto, Prodotto } from '../../core/prodotti-api';
import { Servizio } from '../../core/servizi-api';
import { Seo } from '../../core/seo';
import { ANNI_ESPERIENZA, SITE } from '../../core/site.config';
import { catalogoJsonLd } from '../../core/structured-data';
import { CtaContatti } from '../../shared/cta-contatti';
import { IntestazionePagina } from '../../shared/intestazione-pagina';
import { ProdottoCard } from '../../shared/prodotto-card';

/** Elenco dei modelli di una categoria del catalogo (es. /caldaie). */
@Component({
  selector: 'app-catalogo',
  imports: [RouterLink, ProdottoCard, CtaContatti, IntestazionePagina],
  template: `
    <app-intestazione-pagina
      [etichetta]="'Catalogo · ' + anni + ' anni di esperienza'"
      [titolo]="info().titolo + ': i modelli che installiamo'"
      [sottotitolo]="'Confronta efficienza, tecnologia smart, silenziosità e prezzo: scegli il modello e ti prepariamo un preventivo per l\\'installazione a ' + site.zonaServita + '.'"
    >
      <nav briciole aria-label="Percorso" class="mb-6 text-sm text-blue-200">
        <ol class="flex flex-wrap gap-1">
          <li><a routerLink="/" class="hover:text-white hover:underline">Home</a> /</li>
          <li aria-current="page" class="text-white">{{ info().plurale }}</li>
        </ol>
      </nav>
    </app-intestazione-pagina>

    <section class="mx-auto max-w-6xl px-4 py-12 md:py-16" [attr.aria-label]="'Modelli di ' + info().plurale.toLowerCase()">
      <div class="mb-10 grid gap-4 rounded-2xl bg-slate-100 p-6 text-slate-700 md:grid-cols-3">
        <p><span class="font-bold text-slate-900">Livello (LV)</span>: la media di efficienza, tecnologia smart e silenziosità.</p>
        <p><span class="font-bold text-slate-900">Barre da 1 a 5</span>: più sono piene, meglio è.</p>
        <p><span class="font-bold text-slate-900">€ … €€€€€</span>: la fascia di prezzo, dalla più economica alla premium.</p>
      </div>

      <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        @for (p of prodotti(); track p.slug) {
          <li class="rivela"><app-prodotto-card [prodotto]="p" /></li>
        } @empty {
          <li class="text-slate-600 sm:col-span-2 lg:col-span-3">
            Il catalogo è in aggiornamento: contattaci e ti consigliamo noi il modello più adatto.
          </li>
        }
      </ul>

      <p class="mt-10 text-slate-600">
        Hai già acquistato {{ info().conArticolo }}? Nessun problema: pensiamo noi all'installazione.
        @if (servizio(); as s) {
          <a [routerLink]="['/servizi', s.slug]" class="font-semibold text-blue-800 underline">Scopri il servizio di {{ s.titolo.toLowerCase() }}</a>.
        }
      </p>
    </section>
    <app-cta-contatti [servizioSlug]="servizio()?.slug" />
  `,
})
export default class Catalogo {
  /** Dalla route (data.categoria). */
  readonly categoria = input.required<CategoriaProdotto>();
  /** Dai resolver della route. */
  readonly prodotti = input<Prodotto[]>([]);
  readonly servizi = input<Servizio[]>([]);

  protected readonly site = SITE;
  protected readonly anni = ANNI_ESPERIENZA;
  protected readonly info = computed(() => CATEGORIE[this.categoria()]);
  /** Servizio collegato a questa categoria (es. Installazione caldaie), per il modulo di contatto. */
  protected readonly servizio = computed(() => this.servizi().find((s) => s.categoriaProdotti === this.categoria()));

  constructor() {
    const seo = inject(Seo);
    effect(() => {
      const info = this.info();
      const percorso = '/' + info.percorso;
      const titolo = `${info.titolo} a ${SITE.indirizzo.citta}: Modelli e Prezzi | ${SITE.nome}`;
      seo.aggiorna({
        title: titolo,
        description: `${info.titolo}: confronta i modelli che installiamo a ${SITE.zonaServita} per efficienza, smart, silenziosità e prezzo. Preventivo gratuito.`,
        path: percorso,
        jsonLd: catalogoJsonLd(this.prodotti(), titolo, percorso),
      });
    });
  }
}
