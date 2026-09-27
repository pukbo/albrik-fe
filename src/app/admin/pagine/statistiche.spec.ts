import { etichettaMese, fondoScala, formattaOre } from './statistiche';

describe('statistiche', () => {
  it('fondo scala tondo per l’asse', () => {
    expect(fondoScala(0)).toBe(1);
    expect(fondoScala(1)).toBe(1);
    expect(fondoScala(7)).toBe(8);
    expect(fondoScala(13)).toBe(15);
    expect(fondoScala(120)).toBe(200);
  });

  it('tempo di risposta in ore o giorni', () => {
    expect(formattaOre(null)).toBe('–');
    expect(formattaOre(1)).toBe('1 ora');
    expect(formattaOre(3.5)).toBe('3,5 ore');
    expect(formattaOre(60)).toBe('2,5 giorni');
  });

  it('etichette dei mesi con l’anno solo dove serve', () => {
    expect(etichettaMese('2026-09', false)).toBe('set');
    expect(etichettaMese('2027-01', false)).toBe('gen 27');
    expect(etichettaMese('2025-10', true)).toBe('ott 25');
  });
});
