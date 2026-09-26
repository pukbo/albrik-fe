import { Component, inject } from '@angular/core';
import { Seo } from '../../core/seo';
import { SITE } from '../../core/site.config';

/**
 * TODO: BOZZA. Il testo va verificato da un consulente privacy/legale prima della pubblicazione
 * e completato con i dati reali del titolare (ragione sociale, P.IVA, sede).
 */
@Component({
  selector: 'app-privacy',
  template: `
    <article class="mx-auto max-w-3xl px-4 py-12 md:py-16 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_p]:mt-3 [&_p]:text-slate-700">
      <h1 class="text-3xl font-extrabold text-slate-900">Informativa privacy</h1>
      <p>Informativa ai sensi dell'art. 13 del Regolamento UE 2016/679 (GDPR) per i dati raccolti tramite il modulo contatti.</p>

      <h2>Titolare del trattamento</h2>
      <p>
        {{ site.nome }}, {{ site.indirizzo.via }}, {{ site.indirizzo.cap }} {{ site.indirizzo.citta }}
        ({{ site.indirizzo.provincia }}), email {{ site.email }}.
      </p>

      <h2>Dati raccolti e finalità</h2>
      <p>
        Nome, email, telefono, comune e contenuto del messaggio, usati esclusivamente per rispondere alla tua richiesta
        di informazioni o di preventivo.
      </p>

      <h2>Base giuridica</h2>
      <p>Il consenso espresso tramite il modulo e l'esecuzione di misure precontrattuali richieste dall'interessato.</p>

      <h2>Conservazione</h2>
      <p>I dati sono conservati per il tempo necessario a gestire la richiesta e comunque non oltre 24 mesi.</p>

      <h2>Diritti dell'interessato</h2>
      <p>
        Puoi chiedere in qualsiasi momento l'accesso, la rettifica o la cancellazione dei tuoi dati scrivendo a
        {{ site.email }}, e proporre reclamo al Garante per la protezione dei dati personali.
      </p>
    </article>
  `,
})
export default class Privacy {
  protected readonly site = SITE;

  constructor() {
    inject(Seo).aggiorna({
      title: `Informativa Privacy | ${SITE.nome}`,
      description: `Informativa sul trattamento dei dati personali raccolti dal sito di ${SITE.nome}.`,
      path: '/privacy',
    });
  }
}
