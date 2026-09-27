import { StatoPreventivo, StatoRichiesta } from './admin-api';

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

const STATI_PREVENTIVO: Record<StatoPreventivo, { etichetta: string; classi: string }> = {
  BOZZA: { etichetta: 'Bozza', classi: 'bg-amber-100 text-amber-900' },
  INVIATO: { etichetta: 'Inviato', classi: 'bg-violet-100 text-violet-900' },
  ACCETTATO: { etichetta: 'Accettato', classi: 'bg-green-100 text-green-900' },
  RIFIUTATO: { etichetta: 'Rifiutato', classi: 'bg-slate-200 text-slate-800' },
  SOSTITUITO: { etichetta: 'Sostituito', classi: 'bg-slate-100 text-slate-600' },
};

export function infoStatoPreventivo(stato: StatoPreventivo) {
  return STATI_PREVENTIVO[stato];
}
