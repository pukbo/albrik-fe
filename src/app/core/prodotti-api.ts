import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type CategoriaProdotto = 'CALDAIA' | 'CONDIZIONATORE';

/** Percorso pubblico ed etichette di ogni categoria del catalogo (CategoriaProdotto nel backend). */
export const CATEGORIE: Record<
  CategoriaProdotto,
  { percorso: string; plurale: string; singolare: string; titolo: string; conArticolo: string }
> = {
  CALDAIA: {
    percorso: 'caldaie',
    plurale: 'Caldaie',
    singolare: 'caldaia',
    titolo: 'Caldaie a condensazione',
    conArticolo: 'la caldaia',
  },
  CONDIZIONATORE: {
    percorso: 'condizionatori',
    plurale: 'Condizionatori',
    singolare: 'condizionatore',
    titolo: 'Condizionatori e climatizzatori',
    conArticolo: 'il condizionatore',
  },
};

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
