import { Location, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, effect, inject, input, linkedSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FILTRI_VUOTI, Filtri, applicaFiltri, filtriDaQuery, queryDaFiltri } from '../../core/filtri-catalogo';
import { CATEGORIE, CategoriaProdotto, Prodotto } from '../../core/prodotti-api';
import { Servizio } from '../../core/servizi-api';
import { Seo } from '../../core/seo';
import { ANNI_ESPERIENZA, SITE } from '../../core/site.config';
import { catalogoJsonLd } from '../../core/structured-data';
import { CtaContatti } from '../../shared/cta-contatti';
import { FiltriCatalogo } from '../../shared/filtri-catalogo';
import { IntestazionePagina } from '../../shared/intestazione-pagina';
import { ProdottoCard } from '../../shared/prodotto-card';

/** Elenco dei modelli di una categoria del catalogo (es. /caldaie). */
@Component({
  selector: 'app-catalogo',
  imports: [RouterLink, ProdottoCard, CtaContatti, IntestazionePagina, FiltriCatalogo],
  template: `
    <app-intestazione-pagina
      [etichetta]="'Catalogo · ' + anni + ' anni di esperienza'"
      [titolo]="info().titolo + ': i modelli che installiamo'"
      [sottotitolo]="'Confronta efficienza, tecnologia smart, silenziosità e prezzo: scegli il modello e ti prepariamo un preventivo per l\\'installazione a ' + site.zonaServita + '.'"
    >
      <nav briciole aria-label="Percorso" class="mb-6 text-sm text-blue-200">
        <ol class="flex flex-wrap items-center gap-1">
          <li><a routerLink="/" class="inline-block py-1.5 hover:text-white hover:underline">Home</a> /</li>
          <li><a routerLink="/catalogo" class="inline-block py-1.5 hover:text-white hover:underline">Catalogo</a> /</li>
          <li aria-current="page" class="text-white">{{ info().plurale }}</li>
        </ol>
      </nav>
    </app-intestazione-pagina>

    <section class="mx-auto max-w-6xl px-4 py-10 md:py-16" [attr.aria-label]="'Modelli di ' + info().plurale.toLowerCase()">
      <!-- come leggere le schede: ogni spiegazione con un esempio visivo accanto -->
      <div class="mb-8 rounded-2xl bg-slate-100 p-5 md:mb-10 md:p-6">
        <p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">Come leggere le schede</p>
        <ul class="mt-3 grid gap-3 md:grid-cols-3 md:gap-6">
          <li class="flex items-center gap-3">
            <span class="livello-esempio inline-flex w-16 shrink-0 items-baseline justify-center gap-1 rounded-lg py-1 font-mono font-bold text-white" aria-hidden="true">
              <span class="text-[0.6rem] tracking-widest text-orange-100">LV</span><span>4</span>
            </span>
            <span class="text-sm text-slate-700"><span class="font-bold text-slate-900">Livello</span>: media di efficienza, smart e silenziosità</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="flex w-16 shrink-0 gap-0.5 rounded-lg bg-blue-950 p-1.5" aria-hidden="true">
              @for (n of [1, 2, 3, 4, 5]; track n) {
                <span class="h-1.5 flex-1 rounded-[2px]" [class]="n <= 4 ? 'bg-orange-500' : 'bg-white/15'"></span>
              }
            </span>
            <span class="text-sm text-slate-700"><span class="font-bold text-slate-900">Barre da 1 a 5</span>: più sono piene, meglio è</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="w-16 shrink-0 rounded-lg bg-blue-950 py-1 text-center font-mono text-sm font-bold tracking-wider" aria-hidden="true">
              <span class="text-orange-300">€€</span><span class="text-white/25">€€€</span>
            </span>
            <span class="text-sm text-slate-700"><span class="font-bold text-slate-900">Prezzo</span>: da € (economica) a €€€€€ (premium)</span>
          </li>
        </ul>
      </div>

      <!-- filtri: solo se ci sono abbastanza modelli da doverli cercare -->
      @if (prodotti().length > 2) {
        <app-filtri-catalogo class="mb-6 block" [prodotti]="prodotti()" [risultati]="visibili().length" [(filtri)]="filtri" />
      }

      <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        @for (p of visibili(); track p.slug) {
          <li class="rivela"><app-prodotto-card [prodotto]="p" /></li>
        } @empty {
          <li class="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center text-slate-600 sm:col-span-2 lg:col-span-3">
            @if (prodotti().length) {
              <p class="font-semibold text-slate-900">Nessun modello corrisponde ai filtri</p>
              <p class="mt-1">Prova a toglierne qualcuno, oppure contattaci: ti consigliamo noi il modello più adatto.</p>
              <button type="button" (click)="filtri.set(filtriVuoti)" class="mt-4 font-semibold text-blue-800 underline">Azzera i filtri</button>
            } @else {
              Il catalogo è in aggiornamento: contattaci e ti consigliamo noi il modello più adatto.
            }
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
  styles: `
    /* stesso badge del livello delle card */
    .livello-esempio {
      background: linear-gradient(135deg, #c2410c, #f97316);
    }
  `,
})
export default class Catalogo {
  /** Dalla route (data.categoria). */
  readonly categoria = input.required<CategoriaProdotto>();
  /** Dai resolver della route. */
  readonly prodotti = input<Prodotto[]>([]);
  readonly servizi = input<Servizio[]>([]);

  /** Filtri dall'indirizzo della pagina (query string), es. /caldaie?marca=termika&ordina=livello. */
  readonly q = input<string>();
  readonly marca = input<string>();
  readonly potenza = input<string>();
  readonly classe = input<string>();
  readonly prezzo = input<string>();
  readonly smart = input<string>();
  readonly ordina = input<string>();

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  protected readonly filtriVuoti = FILTRI_VUOTI;
  /** Stato dei filtri: parte dall'indirizzo, poi lo modifica la barra dei filtri. */
  protected readonly filtri = linkedSignal<Filtri>(() =>
    filtriDaQuery({
      q: this.q(),
      marca: this.marca(),
      potenza: this.potenza(),
      classe: this.classe(),
      prezzo: this.prezzo(),
      smart: this.smart(),
      ordina: this.ordina(),
    }),
  );
  protected readonly visibili = computed(() => applicaFiltri(this.prodotti(), this.filtri()));

  protected readonly site = SITE;
  protected readonly anni = ANNI_ESPERIENZA;
  protected readonly info = computed(() => CATEGORIE[this.categoria()]);
  /** Servizio collegato a questa categoria (es. Installazione caldaie), per il modulo di contatto. */
  protected readonly servizio = computed(() => this.servizi().find((s) => s.categoriaProdotti === this.categoria()));

  constructor() {
    // i filtri finiscono nell'indirizzo senza una nuova navigazione (che riporterebbe la pagina in cima);
    // il canonical resta /caldaie: per Google le pagine filtrate non sono pagine a sé
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      effect(() => {
        const albero = this.router.createUrlTree([], { relativeTo: this.route, queryParams: queryDaFiltri(this.filtri()) });
        const url = this.router.serializeUrl(albero);
        if (url !== this.location.path()) {
          this.location.replaceState(url);
        }
      });
    }

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
