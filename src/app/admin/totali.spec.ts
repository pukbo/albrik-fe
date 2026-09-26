import { calcolaTotali } from './totali';

describe('calcolaTotali', () => {
  it('coincide con il calcolo del backend (IVA per aliquota, arrotondamento al centesimo)', () => {
    const t = calcolaTotali([
      { descrizione: 'a', unitaMisura: null, quantita: 1, prezzoUnitario: 1500, aliquotaIva: 10 },
      { descrizione: 'b', unitaMisura: null, quantita: 2.5, prezzoUnitario: 40.1, aliquotaIva: 22 },
      { descrizione: 'c', unitaMisura: null, quantita: 1, prezzoUnitario: 0.05, aliquotaIva: 22 },
    ]);
    // stessi valori di TotaliTest.java
    expect(t.imponibile).toBe(1600.3);
    expect(t.perAliquota.map((a) => a.aliquota)).toEqual([10, 22]);
    expect(t.perAliquota[1].iva).toBe(22.07);
    expect(t.iva).toBe(172.07);
    expect(t.totale).toBe(1772.37);
  });

  it('non si rompe con campi vuoti', () => {
    const t = calcolaTotali([{ descrizione: '', unitaMisura: null, quantita: null, prezzoUnitario: null, aliquotaIva: 22 }]);
    expect(t.totale).toBe(0);
  });
});
