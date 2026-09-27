import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type StatoPreventivoOnline = 'INVIATO' | 'ACCETTATO' | 'RIFIUTATO' | 'SOSTITUITO';

/** Preventivo come lo vede il cliente dal link personale (PreventivoPubblico nel backend). */
export interface PreventivoOnline {
  numero: string;
  stato: StatoPreventivoOnline;
  dataEmissione: string;
  scadenza: string;
  scaduto: boolean;
  clienteNome: string;
  luogoIntervento: string | null;
  oggetto: string | null;
  righe: {
    descrizione: string;
    unitaMisura: string | null;
    quantita: number;
    prezzoUnitario: number;
    aliquotaIva: number;
    importo: number;
  }[];
  totali: {
    imponibile: number;
    perAliquota: { aliquota: number; imponibile: number; iva: number }[];
    iva: number;
    totale: number;
  };
  tempiEsecuzione: string | null;
  condizioniPagamento: string | null;
  garanzie: string | null;
  esclusioni: string | null;
  note: string | null;
  recesso: string;
  impresa: string;
  telefono: string;
  email: string;
  esitoIl: string | null;
  esitoNome: string | null;
}

@Injectable({ providedIn: 'root' })
export class PreventiviOnlineApi {
  private readonly http = inject(HttpClient);

  private url(token: string): string {
    return `${environment.apiUrl}/preventivi-online/${encodeURIComponent(token)}`;
  }

  preventivo(token: string): Observable<PreventivoOnline> {
    return this.http.get<PreventivoOnline>(this.url(token));
  }

  urlPdf(token: string): string {
    return `${this.url(token)}/pdf`;
  }

  accetta(token: string, nome: string, presaVisione: boolean): Observable<PreventivoOnline> {
    return this.http.post<PreventivoOnline>(`${this.url(token)}/accetta`, { nome, presaVisione });
  }

  rifiuta(token: string, motivo: string): Observable<PreventivoOnline> {
    return this.http.post<PreventivoOnline>(`${this.url(token)}/rifiuta`, { motivo });
  }
}
