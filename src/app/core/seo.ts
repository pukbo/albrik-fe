import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE } from './site.config';

export interface PaginaSeo {
  /** Contenuto del tag <title>. */
  title: string;
  description: string;
  /** Percorso della pagina (es. '/servizi'), usato per canonical e og:url. */
  path: string;
  /** Dati strutturati Schema.org da iniettare come JSON-LD. */
  jsonLd?: object;
  /** Percorso di un'immagine del sito (es. /media/…) per l'anteprima sui social (og:image). */
  immagine?: string;
  /** true per pagine da non indicizzare (es. 404). */
  noindex?: boolean;
}

const JSON_LD_ID = 'jsonld-pagina';

/** Aggiorna title, meta tag, canonical e JSON-LD. Funziona anche in SSR. */
@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  aggiorna(pagina: PaginaSeo): void {
    const url = SITE.url + pagina.path;

    this.title.setTitle(pagina.title);
    this.meta.updateTag({ name: 'description', content: pagina.description });
    this.meta.updateTag({ name: 'robots', content: pagina.noindex ? 'noindex, follow' : 'index, follow' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE.nome });
    this.meta.updateTag({ property: 'og:locale', content: 'it_IT' });
    this.meta.updateTag({ property: 'og:title', content: pagina.title });
    this.meta.updateTag({ property: 'og:description', content: pagina.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    if (pagina.immagine) {
      this.meta.updateTag({ property: 'og:image', content: SITE.url + pagina.immagine });
      this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    } else {
      this.meta.removeTag("property='og:image'");
      this.meta.removeTag("name='twitter:card'");
    }

    this.impostaCanonical(url);
    this.impostaJsonLd(pagina.jsonLd);
  }

  private impostaCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private impostaJsonLd(dati: object | undefined): void {
    this.document.getElementById(JSON_LD_ID)?.remove();
    if (!dati) {
      return;
    }
    const script = this.document.createElement('script');
    script.id = JSON_LD_ID;
    script.type = 'application/ld+json';
    // "<" escapato per non poter chiudere il tag <script> dall'interno dei dati
    script.textContent = JSON.stringify(dati).replace(/</g, '\\u003c');
    this.document.head.appendChild(script);
  }
}
