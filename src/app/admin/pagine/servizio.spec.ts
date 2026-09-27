import { creaSlug } from './servizio';

describe('creaSlug', () => {
  it('produce uno slug valido per il backend', () => {
    expect(creaSlug('Installazione Caldaie a Caserta')).toBe('installazione-caldaie-a-caserta');
    expect(creaSlug('Rinnovo bagno: più comfort & città')).toBe('rinnovo-bagno-piu-comfort-citta');
    expect(creaSlug('  --Manutenzione  2026--  ')).toBe('manutenzione-2026');
  });
});
