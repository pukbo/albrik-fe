import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIE, CategoriaProdotto, Prodotto } from '../../core/prodotti-api';
import { Seo } from '../../core/seo';
import { ANNI_ESPERIENZA, SITE } from '../../core/site.config';
import { CAROSELLO, ELEMENTO_CAROSELLO } from '../../shared/carosello';
import { CtaContatti } from '../../shared/cta-contatti';
import { IntestazionePagina } from '../../shared/intestazione-pagina';
import { ProdottoCard } from '../../shared/prodotto-card';
import { ServizioIcona } from '../../shared/servizio-icona';

/** Numero di modelli in evidenza per categoria. */
const IN_EVIDENZA = 3;

/** Pagina /catalogo: tutte le categorie, ognuna con alcuni modelli in evidenza e il link al suo catalogo. */
@Component({
  selector: 'app-catalogo-completo',
  imports: [RouterLink, ProdottoCard, CtaContatti, IntestazionePagina, ServizioIcona],
  template: `
    <app-intestazione-pagina
      [etichetta]="'Catalogo · ' + anni + ' anni di esperienza'"
      titolo="Scegli il modello da installare"
      [sottotitolo]="'Caldaie e condizionatori selezionati da Albrik e confrontati su efficienza, tecnologia smart, silenziosità e prezzo. Installazione a ' + site.zonaServita + '.'"
    >
      <nav briciole aria-label="Percorso" class="mb-6 text-sm text-blue-200">
        <ol class="flex flex-wrap items-center gap-1">
          <li><a routerLink="/" class="inline-block py-1.5 hover:text-white hover:underline">Home</a> /</li>
          <li aria-current="page" class="text-white">Catalogo</li>
        </ol>
      </nav>
      <!-- salto rapido alle categorie -->
      <ul class="mt-8 flex flex-wrap gap-3">
        @for (s of sezioni(); track s.categoria) {
          <li>
            <a routerLink="/catalogo" [fragment]="s.info.percorso" class="pulsante inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-semibold hover:bg-white/20">
              <app-servizio-icona [slug]="s.info.percorso" class="size-5 text-orange-300" />
              {{ s.info.plurale }}
              <span class="rounded-full bg-white/15 px-2 text-xs">{{ s.prodotti.length }}</span>
            </a>
          </li>
        }
      </ul>
    </app-intestazione-pagina>

    @for (s of sezioni(); track s.categoria; let pari = $even) {
      <section [id]="s.info.percorso" class="scroll-mt-20 py-12 md:py-16" [class.bg-slate-50]="!pari"
        [attr.aria-labelledby]="'titolo-' + s.info.percorso">
        <div class="mx-auto max-w-6xl px-4">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div class="flex items-center gap-4">
              <app-servizio-icona [slug]="s.info.percorso" class="size-12 rounded-xl bg-blue-50 p-2.5 text-blue-800" />
              <div>
                <h2 [id]="'titolo-' + s.info.percorso" class="text-2xl font-bold text-slate-900 md:text-3xl">{{ s.info.titolo }}</h2>
                <p class="text-slate-600">{{ s.info.descrizioneBreve }}</p>
              </div>
            </div>
            <a [routerLink]="'/' + s.info.percorso" class="font-semibold text-blue-800 hover:underline">
              @if (s.prodotti.length > inEvidenza) {
                Tutti i {{ s.prodotti.length }} modelli →
              } @else {
                Confronta i modelli →
              }
            </a>
          </div>

          @if (s.prodotti.length) {
            <ul [class]="carosello">
              @for (p of s.prodotti.slice(0, inEvidenza); track p.slug) {
                <li [class]="elementoCarosello"><app-prodotto-card [prodotto]="p" /></li>
              }
            </ul>
          } @else {
            <p class="mt-6 text-slate-600">
              Catalogo in aggiornamento: contattaci e ti consigliamo noi il modello più adatto.
            </p>
          }
        </div>
      </section>
    }
    <app-cta-contatti />
  `,
})
export default class CatalogoCompleto {
  /** Dal resolver della route: modelli attivi per categoria. */
  readonly catalogo = input<Partial<Record<CategoriaProdotto, Prodotto[]>>>({});

  protected readonly site = SITE;
  protected readonly anni = ANNI_ESPERIENZA;
  protected readonly inEvidenza = IN_EVIDENZA;
  protected readonly carosello = CAROSELLO;
  protected readonly elementoCarosello = ELEMENTO_CAROSELLO;

  protected readonly sezioni = computed(() =>
    (Object.keys(CATEGORIE) as CategoriaProdotto[]).map((categoria) => ({
      categoria,
      info: CATEGORIE[categoria],
      prodotti: this.catalogo()[categoria] ?? [],
    })),
  );

  constructor() {
    inject(Seo).aggiorna({
      title: `Catalogo Caldaie e Condizionatori a ${SITE.indirizzo.citta} | ${SITE.nome}`,
      description: `Il catalogo ${SITE.nome}: caldaie a condensazione e condizionatori confrontati per efficienza, smart, silenziosità e prezzo. Installazione a ${SITE.zonaServita}.`,
      path: '/catalogo',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `Catalogo ${SITE.nome}`,
        url: `${SITE.url}/catalogo`,
        hasPart: Object.values(CATEGORIE).map((c) => ({
          '@type': 'CollectionPage',
          name: c.titolo,
          url: `${SITE.url}/${c.percorso}`,
        })),
      },
    });
  }
}
