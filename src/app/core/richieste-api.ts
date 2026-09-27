import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/** Richiesta di preventivo inviata dal modulo contatti (NuovaRichiestaDto nel backend). */
export interface NuovaRichiesta {
  nome: string;
  email: string;
  telefono: string;
  comune: string;
  servizioSlug: string;
  /** Modello scelto dal catalogo (solo per i servizi con un catalogo collegato, es. caldaie). */
  prodottoSlug: string | null;
  /** true = il cliente ha già il prodotto; null = scelta non prevista o "consigliatemi voi". */
  prodottoDelCliente: boolean | null;
  messaggio: string;
  consensoPrivacy: boolean;
  /** Honeypot anti-spam: deve restare vuoto. */
  sito: string;
}

@Injectable({ providedIn: 'root' })
export class RichiesteApi {
  private readonly http = inject(HttpClient);

  invia(richiesta: NuovaRichiesta): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/richieste`, richiesta);
  }
}
