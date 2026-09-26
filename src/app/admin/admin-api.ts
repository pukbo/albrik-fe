import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/*
 * Le API admin usano URL relativi (/api/admin/...): in sviluppo passano dal proxy di ng serve,
 * in produzione sono sullo stesso dominio. Serve perché Angular aggiunge l'header CSRF
 * (X-XSRF-TOKEN) solo alle richieste con URL relativo.
 */
const BASE = '/api/admin';

export type StatoRichiesta = 'NUOVA' | 'IN_LAVORAZIONE' | 'PREVENTIVO_INVIATO' | 'ACCETTATO' | 'RIFIUTATO';

export interface RichiestaAdmin {
  id: number;
  nome: string;
  email: string;
  telefono: string | null;
  comune: string | null;
  servizioSlug: string | null;
  servizioTitolo: string | null;
  messaggio: string;
  stato: StatoRichiesta;
  noteInterne: string | null;
  creataIl: string;
  aggiornataIl: string;
}

export interface Pagina<T> {
  contenuto: T[];
  pagina: number;
  totalePagine: number;
  totaleElementi: number;
}

export interface FiltroRichieste {
  stato?: StatoRichiesta;
  testo?: string;
  pagina?: number;
}

export interface UtenteAdmin {
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly http = inject(HttpClient);

  /** Fa impostare al backend il cookie XSRF-TOKEN, necessario per il login. */
  csrf(): Observable<void> {
    return this.http.get<void>(`${BASE}/csrf`);
  }

  login(username: string, password: string): Observable<UtenteAdmin> {
    return this.http.post<UtenteAdmin>(`${BASE}/login`, { username, password });
  }

  me(): Observable<UtenteAdmin> {
    return this.http.get<UtenteAdmin>(`${BASE}/me`);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${BASE}/logout`, null);
  }

  richieste(filtro: FiltroRichieste): Observable<Pagina<RichiestaAdmin>> {
    let params = new HttpParams().set('pagina', filtro.pagina ?? 0);
    if (filtro.stato) params = params.set('stato', filtro.stato);
    if (filtro.testo) params = params.set('testo', filtro.testo);
    return this.http.get<Pagina<RichiestaAdmin>>(`${BASE}/richieste`, { params });
  }

  conteggi(): Observable<Record<StatoRichiesta, number>> {
    return this.http.get<Record<StatoRichiesta, number>>(`${BASE}/richieste/conteggi`);
  }

  richiesta(id: number): Observable<RichiestaAdmin> {
    return this.http.get<RichiestaAdmin>(`${BASE}/richieste/${id}`);
  }

  aggiorna(id: number, modifica: { stato?: StatoRichiesta; noteInterne?: string }): Observable<RichiestaAdmin> {
    return this.http.patch<RichiestaAdmin>(`${BASE}/richieste/${id}`, modifica);
  }
}
