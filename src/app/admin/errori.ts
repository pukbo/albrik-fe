import { HttpErrorResponse } from '@angular/common/http';

/** Messaggi leggibili dagli errori del backend ({errori: {campo: msg}} o {errore: msg}). */
export function messaggiErrore(e: unknown): string[] {
  if (e instanceof HttpErrorResponse) {
    const corpo = e.error as { errori?: Record<string, string>; errore?: string } | null;
    if (corpo?.errori) {
      return Object.entries(corpo.errori).map(([campo, msg]) => {
        const riga = /^righe\[(\d+)\]\.(\w+)$/.exec(campo);
        return riga ? `Riga ${Number(riga[1]) + 1}: ${msg}` : msg;
      });
    }
    if (corpo?.errore) return [corpo.errore];
  }
  return ['Operazione non riuscita. Riprova.'];
}
