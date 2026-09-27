import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Servizio } from '../../core/servizi-api';
import { Seo } from '../../core/seo';
import { SITE, TELEFONO_LINK } from '../../core/site.config';
import { CtaContatti } from '../../shared/cta-contatti';
import { ElencoFaq } from '../../shared/elenco-faq';
import { IntestazionePagina } from '../../shared/intestazione-pagina';
import { ServizioIcona, tonoIcona } from '../../shared/servizio-icona';

/**
 * Tutte le domande frequenti, divise per servizio (si gestiscono dal pannello, nella scheda del servizio).
 * Il JSON-LD FAQPage resta solo nelle pagine dei servizi: Google vuole ogni domanda marcata su una sola pagina.
 */
@Component({
  selector: 'app-faq',
  imports: [RouterLink, CtaContatti, ElencoFaq, IntestazionePagina, ServizioIcona],
  template: `
    <app-intestazione-pagina
      etichetta="Domande frequenti"
      titolo="Hai dei dubbi? Ecco le risposte"
      [sottotitolo]="'Le domande che ci fanno più spesso su caldaie, bagni e condizionatori. Non trovi la tua? Chiamaci o scrivici: rispondiamo in giornata.'"
    >
      <nav briciole aria-label="Percorso" class="mb-6 text-sm text-blue-200">
        <ol class="flex flex-wrap items-center gap-1">
          <li><a routerLink="/" class="inline-block py-1.5 hover:text-white hover:underline">Home</a> /</li>
          <li aria-current="page" class="text-white">Domande frequenti</li>
        </ol>
      </nav>
      @if (sezioni().length > 1) {
        <ul class="mt-8 flex flex-wrap gap-3">
          @for (s of sezioni(); track s.slug) {
            <li>
              <a routerLink="/faq" [fragment]="s.slug"
                class="pulsante inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-semibold hover:bg-white/20">
                <app-servizio-icona [slug]="s.slug" class="size-5 text-orange-300" />
                {{ s.titolo }}
              </a>
            </li>
          }
        </ul>
      }
    </app-intestazione-pagina>

    <div class="mx-auto max-w-3xl space-y-12 px-4 py-12 md:py-16">
      @for (s of sezioni(); track s.slug) {
        <section [id]="s.slug" class="scroll-mt-24" [attr.aria-labelledby]="'titolo-' + s.slug">
          <div class="flex items-center gap-3">
            <app-servizio-icona [slug]="s.slug" [class]="'size-11 shrink-0 rounded-xl p-2.5 ring-1 ' + tono(s.slug)" />
            <h2 [id]="'titolo-' + s.slug" class="text-2xl font-bold text-slate-900">{{ s.titolo }}</h2>
          </div>
          <app-elenco-faq class="mt-5 block" [faq]="s.faq" />
          <a [routerLink]="['/servizi', s.slug]" class="mt-4 inline-flex min-h-11 items-center font-semibold text-blue-800 hover:underline">
            Scopri il servizio →
          </a>
        </section>
      } @empty {
        <p class="text-slate-600">
          Le domande frequenti sono in preparazione. Nel frattempo chiamaci al
          <a [href]="telefonoLink" class="font-semibold text-blue-800 underline">{{ site.telefono }}</a>.
        </p>
      }
    </div>
    <app-cta-contatti />
  `,
})
export default class FaqPagina {
  /** Dal resolver della route. */
  readonly servizi = input<Servizio[]>([]);

  protected readonly site = SITE;
  protected readonly telefonoLink = TELEFONO_LINK;
  protected readonly tono = tonoIcona;
  /** Solo i servizi che hanno almeno una domanda. */
  protected readonly sezioni = computed(() => this.servizi().filter((s) => s.faq.length > 0));

  constructor() {
    inject(Seo).aggiorna({
      title: `Domande Frequenti su Caldaie, Bagni e Condizionatori | ${SITE.nome}`,
      description: `Tempi, detrazioni, modelli e installazione: le risposte di ${SITE.nome} alle domande più frequenti su caldaie, rinnovo bagno e condizionatori a ${SITE.zonaServita}.`,
      path: '/faq',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url + '/' },
          { '@type': 'ListItem', position: 2, name: 'Domande frequenti', item: `${SITE.url}/faq` },
        ],
      },
    });
  }
}
