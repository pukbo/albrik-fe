import { StatoRichiesta } from './admin-api';

/** Etichette e colori degli stati, nell'ordine del flusso di lavoro. */
export const STATI: { valore: StatoRichiesta; etichetta: string; classi: string }[] = [
  { valore: 'NUOVA', etichetta: 'Nuova', classi: 'bg-blue-100 text-blue-900' },
  { valore: 'IN_LAVORAZIONE', etichetta: 'In lavorazione', classi: 'bg-amber-100 text-amber-900' },
  { valore: 'PREVENTIVO_INVIATO', etichetta: 'Preventivo inviato', classi: 'bg-violet-100 text-violet-900' },
  { valore: 'ACCETTATO', etichetta: 'Accettato', classi: 'bg-green-100 text-green-900' },
  { valore: 'RIFIUTATO', etichetta: 'Rifiutato', classi: 'bg-slate-200 text-slate-800' },
];

export function infoStato(stato: StatoRichiesta) {
  return STATI.find((s) => s.valore === stato) ?? STATI[0];
}
