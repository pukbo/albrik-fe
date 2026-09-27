import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategoriaProdotto } from './prodotti-api';

/** Servizio offerto da Albrik, come restituito dal backend (ServizioDto). */
export interface Servizio {
  slug: string;
  titolo: string;
  sommario: string;
  descrizione: string;
  metaTitle: string;
  metaDescription: string;
  immagine: string | null;
  /** Catalogo collegato (es. CALDAIA): nel modulo contatti si può scegliere il modello. */
  categoriaProdotti: CategoriaProdotto | null;
  ultimaModifica: string | null;
}

@Injectable({ providedIn: 'root' })
export class ServiziApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/servizi`;

  elenco(): Observable<Servizio[]> {
    return this.http.get<Servizio[]>(this.baseUrl);
  }

  perSlug(slug: string): Observable<Servizio> {
    return this.http.get<Servizio>(`${this.baseUrl}/${encodeURIComponent(slug)}`);
  }
}
