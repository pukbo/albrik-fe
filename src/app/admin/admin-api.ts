import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoriaProdotto, Prodotto } from '../core/prodotti-api';
import { Faq } from '../core/servizi-api';

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
  /** Modello scelto dal catalogo nel modulo contatti. */
  prodottoSlug: string | null;
  prodottoNome: string | null;
  prodottoPercorso: string | null;
  /** true = il cliente ha già il prodotto; null = scelta non prevista o "consigliatemi voi". */
  prodottoDelCliente: boolean | null;
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

export type StatoPreventivo = 'BOZZA' | 'INVIATO' | 'ACCETTATO' | 'RIFIUTATO' | 'SOSTITUITO';

export interface RigaPreventivo {
  descrizione: string;
  unitaMisura: string | null;
  quantita: number | null;
  prezzoUnitario: number | null;
  aliquotaIva: number;
}

/** Campi modificabili di un preventivo (corpo del PUT). */
export interface DatiPreventivo {
  dataEmissione: string;
  validitaGiorni: number;
  clienteNome: string;
  clienteIndirizzo: string | null;
  clienteCodiceFiscale: string | null;
  clienteEmail: string | null;
  luogoIntervento: string | null;
  oggetto: string | null;
  tempiEsecuzione: string | null;
  condizioniPagamento: string | null;
  garanzie: string | null;
  esclusioni: string | null;
  note: string | null;
  righe: RigaPreventivo[];
}

export interface TotaliPreventivo {
  imponibile: number;
  perAliquota: { aliquota: number; imponibile: number; iva: number }[];
  iva: number;
  totale: number;
}

export interface Preventivo extends DatiPreventivo {
  id: number;
  richiestaId: number;
  numero: string;
  stato: StatoPreventivo;
  scadenza: string;
  totali: TotaliPreventivo;
  inviatoIl: string | null;
  inviatoA: string | null;
  /** Link personale di accettazione, presente dopo il primo invio. */
  linkAccettazione: string | null;
  /** Accettazione o rifiuto registrati online dal cliente. */
  esito: { il: string; nome: string | null; ip: string; note: string | null } | null;
  aggiornatoIl: string;
}

export interface RiepilogoPreventivo {
  id: number;
  numero: string;
  stato: StatoPreventivo;
  dataEmissione: string;
  totale: number;
  inviatoIl: string | null;
}

export interface EmailPreventivo {
  destinatario: string;
  oggetto: string;
  messaggio: string;
}

/** Campi modificabili di un servizio (corpo di POST/PUT). */
export interface DatiServizio {
  slug: string;
  titolo: string;
  sommario: string;
  descrizione: string;
  metaTitle: string;
  metaDescription: string;
  /** Catalogo collegato: nel modulo contatti il cliente può sceglierne un modello. */
  categoriaProdotti: CategoriaProdotto | null;
  /** Badge in testata alla pagina, al massimo 4. */
  puntiChiave: string[];
  /** Voci di "Cosa comprende", al massimo 12. */
  incluso: string[];
  /** Domande frequenti, al massimo 10. */
  faq: Faq[];
  ordine: number;
  attivo: boolean;
}

/** Campi modificabili di un prodotto del catalogo (corpo di POST/PUT). */
export interface DatiProdotto {
  categoria: CategoriaProdotto;
  slug: string;
  marca: string;
  modello: string;
  sommario: string;
  descrizione: string;
  potenzaKw: number | null;
  classeEnergetica: string | null;
  efficienza: number;
  smart: number;
  silenziosita: number;
  fasciaPrezzo: number;
  metaTitle: string;
  metaDescription: string;
  ordine: number;
  attivo: boolean;
}

/** Prodotto come restituito dal pannello: dati pubblici più id, stato e ordine. */
export interface ProdottoAdmin {
  id: number;
  attivo: boolean;
  ordine: number;
  dati: Prodotto;
}

export interface ServizioAdmin extends DatiServizio {
  id: number;
  /** Gestita con caricaImmagine/eliminaImmagine, non con il salvataggio dei dati. */
  immagine: string | null;
  ultimaModifica: string;
}

/** Statistiche delle richieste arrivate negli ultimi N mesi (StatisticheService nel backend). */
export interface Statistiche {
  dal: string;
  al: string;
  richieste: number;
  conPreventivo: number;
  accettate: number;
  rifiutate: number;
  /** Tra 0 e 1; null se nessun preventivo inviato. */
  tassoAccettazione: number | null;
  valoreAccettato: number;
  oreMediePrimoPreventivo: number | null;
  /** mese nel formato 2026-09, dal più vecchio al corrente */
  perMese: { mese: string; richieste: number; accettate: number }[];
  perServizio: { slug: string | null; titolo: string; richieste: number; accettate: number }[];
}

export interface ConfigurazionePreventivi {
  aliquoteIva: number[];
  aliquotaPredefinita: number;
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

  statistiche(mesi: number): Observable<Statistiche> {
    return this.http.get<Statistiche>(`${BASE}/statistiche`, { params: { mesi } });
  }

  // --- Servizi ---

  servizi(): Observable<ServizioAdmin[]> {
    return this.http.get<ServizioAdmin[]>(`${BASE}/servizi`);
  }

  servizio(id: number): Observable<ServizioAdmin> {
    return this.http.get<ServizioAdmin>(`${BASE}/servizi/${id}`);
  }

  creaServizio(dati: DatiServizio): Observable<ServizioAdmin> {
    return this.http.post<ServizioAdmin>(`${BASE}/servizi`, dati);
  }

  aggiornaServizio(id: number, dati: DatiServizio): Observable<ServizioAdmin> {
    return this.http.put<ServizioAdmin>(`${BASE}/servizi/${id}`, dati);
  }

  caricaImmagine(id: number, file: File): Observable<ServizioAdmin> {
    const dati = new FormData();
    dati.append('file', file);
    return this.http.post<ServizioAdmin>(`${BASE}/servizi/${id}/immagine`, dati);
  }

  eliminaImmagine(id: number): Observable<ServizioAdmin> {
    return this.http.delete<ServizioAdmin>(`${BASE}/servizi/${id}/immagine`);
  }

  // --- Catalogo prodotti ---

  prodotti(): Observable<ProdottoAdmin[]> {
    return this.http.get<ProdottoAdmin[]>(`${BASE}/prodotti`);
  }

  prodotto(id: number): Observable<ProdottoAdmin> {
    return this.http.get<ProdottoAdmin>(`${BASE}/prodotti/${id}`);
  }

  creaProdotto(dati: DatiProdotto): Observable<ProdottoAdmin> {
    return this.http.post<ProdottoAdmin>(`${BASE}/prodotti`, dati);
  }

  aggiornaProdotto(id: number, dati: DatiProdotto): Observable<ProdottoAdmin> {
    return this.http.put<ProdottoAdmin>(`${BASE}/prodotti/${id}`, dati);
  }

  caricaImmagineProdotto(id: number, file: File): Observable<ProdottoAdmin> {
    const dati = new FormData();
    dati.append('file', file);
    return this.http.post<ProdottoAdmin>(`${BASE}/prodotti/${id}/immagine`, dati);
  }

  eliminaImmagineProdotto(id: number): Observable<ProdottoAdmin> {
    return this.http.delete<ProdottoAdmin>(`${BASE}/prodotti/${id}/immagine`);
  }

  // --- Preventivi ---

  configurazionePreventivi(): Observable<ConfigurazionePreventivi> {
    return this.http.get<ConfigurazionePreventivi>(`${BASE}/preventivi/configurazione`);
  }

  preventiviDellaRichiesta(richiestaId: number): Observable<RiepilogoPreventivo[]> {
    return this.http.get<RiepilogoPreventivo[]>(`${BASE}/richieste/${richiestaId}/preventivi`);
  }

  nuovoPreventivo(richiestaId: number): Observable<Preventivo> {
    return this.http.post<Preventivo>(`${BASE}/richieste/${richiestaId}/preventivi`, null);
  }

  preventivo(id: number): Observable<Preventivo> {
    return this.http.get<Preventivo>(`${BASE}/preventivi/${id}`);
  }

  salvaPreventivo(id: number, dati: DatiPreventivo): Observable<Preventivo> {
    return this.http.put<Preventivo>(`${BASE}/preventivi/${id}`, dati);
  }

  eliminaPreventivo(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/preventivi/${id}`);
  }

  duplicaPreventivo(id: number): Observable<Preventivo> {
    return this.http.post<Preventivo>(`${BASE}/preventivi/${id}/duplica`, null);
  }

  /** URL del PDF, da aprire in una nuova scheda (il cookie di sessione viene inviato dal browser). */
  urlPdf(id: number): string {
    return `${BASE}/preventivi/${id}/pdf`;
  }

  emailProposta(id: number): Observable<EmailPreventivo> {
    return this.http.get<EmailPreventivo>(`${BASE}/preventivi/${id}/email`);
  }

  inviaPreventivo(id: number, email: EmailPreventivo): Observable<{ preventivo: Preventivo; simulato: boolean }> {
    return this.http.post<{ preventivo: Preventivo; simulato: boolean }>(`${BASE}/preventivi/${id}/invia`, email);
  }
}
