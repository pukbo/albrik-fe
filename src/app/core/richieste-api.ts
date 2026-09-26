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
