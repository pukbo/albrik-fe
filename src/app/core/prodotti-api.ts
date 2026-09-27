/// <reference lib="es2023.intl" />
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type CategoriaProdotto = 'CALDAIA' | 'CONDIZIONATORE';

export interface InfoCategoria {
  /** Percorso pubblico del catalogo, senza barra iniziale. */
  percorso: string;
  plurale: string;
  singolare: string;
  /** Titolo del catalogo (H1 e SEO). */
  titolo: string;
  /** Una riga sotto il nome, nel menu e nella pagina /catalogo. */
  descrizioneBreve: string;
  /** Tipo di prodotto nel meta title dei modelli, es. "caldaia a condensazione". */
  tipo: string;
  conArticolo: string;
  /** Pronome per "sceglierne una/uno". */
  pronome: 'una' | 'uno';
  /** Cosa comprende l'installazione, nella pagina del modello. */
  installazione: string;
}

/** Percorso pubblico, etichette e testi di ogni categoria del catalogo (CategoriaProdotto nel backend). */
export const CATEGORIE: Record<CategoriaProdotto, InfoCategoria> = {
  CALDAIA: {
    percorso: 'caldaie',
    plurale: 'Caldaie',
    singolare: 'caldaia',
    titolo: 'Caldaie a condensazione',
    descrizioneBreve: 'Modelli a condensazione, dalla più economica alla premium',
    tipo: 'caldaia a condensazione',
    conArticolo: 'la caldaia',
    pronome: 'una',
    installazione:
      'Sopralluogo gratuito, smontaggio e smaltimento della vecchia caldaia, installazione a norma, ' +
      'prima accensione e pratiche comprese nel preventivo.',
  },
  CONDIZIONATORE: {
    percorso: 'condizionatori',
    plurale: 'Condizionatori',
    singolare: 'condizionatore',
    titolo: 'Condizionatori e climatizzatori',
    descrizioneBreve: 'Mono e multi-split, anche con Wi-Fi e pompa di calore',
    tipo: 'condizionatore',
    conArticolo: 'il condizionatore',
    pronome: 'uno',
    installazione:
      'Sopralluogo gratuito, posa delle tubazioni e dello scarico condensa, collegamento elettrico, ' +
      'messa in funzione e dichiarazione di conformità comprese nel preventivo.',
  },
};

/**
 * Potenza come la cerca il cliente: kW per le caldaie, BTU per i condizionatori
 * (1 kW ≈ 3412 BTU/h, arrotondati al migliaio: 2,5 kW → 9000 BTU).
 */
export function potenzaLeggibile(prodotto: Pick<Prodotto, 'categoria' | 'potenzaKw'>): string | null {
  const kw = prodotto.potenzaKw;
  if (!kw) return null;
  if (prodotto.categoria === 'CONDIZIONATORE') {
    return `${(Math.round((kw * 3412) / 1000) * 1000).toLocaleString('it-IT', { useGrouping: 'always' })} BTU`;
  }
  return `${kw.toLocaleString('it-IT')} kW`;
}

/** Valutazioni Albrik da 1 a 5. Il livello è la media di efficienza, smart e silenziosità (il prezzo non conta). */
export interface Valutazioni {
  efficienza: number;
  smart: number;
  silenziosita: number;
  fasciaPrezzo: number;
  livello: number;
}

/** Modello del catalogo, come restituito dal backend (ProdottoDto). */
export interface Prodotto {
  categoria: CategoriaProdotto;
  slug: string;
  /** Pagina pubblica, es. /caldaie/slug. */
  percorso: string;
  marca: string;
  modello: string;
  nome: string;
  sommario: string;
  descrizione: string;
  potenzaKw: number | null;
  classeEnergetica: string | null;
  valutazioni: Valutazioni;
  metaTitle: string;
  metaDescription: string;
  immagine: string | null;
  ultimaModifica: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProdottiApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/prodotti`;

  elenco(categoria: CategoriaProdotto): Observable<Prodotto[]> {
    return this.http.get<Prodotto[]>(this.baseUrl, { params: { categoria } });
  }

  perSlug(slug: string): Observable<Prodotto> {
    return this.http.get<Prodotto>(`${this.baseUrl}/${encodeURIComponent(slug)}`);
  }
}
