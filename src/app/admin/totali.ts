/// <reference lib="es2023.intl" /> // per useGrouping: 'always' (il progetto compila con lib ES2022)
import { RigaPreventivo, TotaliPreventivo } from './admin-api';

/**
 * Stesso calcolo del backend (Totali.java), per mostrare i totali mentre si scrive:
 * importo riga arrotondato al centesimo, IVA per aliquota sulla somma degli imponibili.
 * Si lavora in centesimi interi per evitare gli errori dei numeri decimali in virgola mobile.
 */
export function calcolaTotali(righe: RigaPreventivo[]): TotaliPreventivo {
  const perAliquota = new Map<number, number>();
  for (const r of righe) {
    perAliquota.set(r.aliquotaIva, (perAliquota.get(r.aliquotaIva) ?? 0) + importoCentesimi(r));
  }

  const gruppi = [...perAliquota.entries()]
    .sort(([a], [b]) => a - b)
    .map(([aliquota, imponibile]) => ({ aliquota, imponibile, iva: Math.round((imponibile * aliquota) / 100) }));

  const imponibile = gruppi.reduce((s, g) => s + g.imponibile, 0);
  const iva = gruppi.reduce((s, g) => s + g.iva, 0);
  return {
    imponibile: imponibile / 100,
    perAliquota: gruppi.map((g) => ({ aliquota: g.aliquota, imponibile: g.imponibile / 100, iva: g.iva / 100 })),
    iva: iva / 100,
    totale: (imponibile + iva) / 100,
  };
}

export function importoRiga(r: RigaPreventivo): number {
  return importoCentesimi(r) / 100;
}

function importoCentesimi(r: RigaPreventivo): number {
  const q = Math.round((r.quantita ?? 0) * 100);
  const p = Math.round((r.prezzoUnitario ?? 0) * 100);
  return Math.round((q * p) / 100);
}

// useGrouping 'always': in italiano Intl non separa le migliaia sotto 10.000 (1600,25), il PDF sì (1.600,25)
const EURO = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', useGrouping: 'always' });

export function euro(valore: number): string {
  return EURO.format(valore);
}
