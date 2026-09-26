import { RESPONSE_INIT, inject } from '@angular/core';

/**
 * Imposta il codice HTTP della risposta durante il rendering lato server
 * (es. 404 per le pagine inesistenti, così Google non le indicizza). Nel browser non fa nulla.
 * Va chiamata in un contesto di injection (costruttore o inizializzatore di campo).
 */
export function impostaStatoHttp(status: number): void {
  const risposta = inject(RESPONSE_INIT, { optional: true });
  if (risposta) {
    risposta.status = status;
  }
}
