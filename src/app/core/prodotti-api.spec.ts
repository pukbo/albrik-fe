import { potenzaLeggibile } from './prodotti-api';

describe('potenzaLeggibile', () => {
  it('mostra i kW per le caldaie', () => {
    expect(potenzaLeggibile({ categoria: 'CALDAIA', potenzaKw: 24 })).toBe('24 kW');
    expect(potenzaLeggibile({ categoria: 'CALDAIA', potenzaKw: 3.5 })).toBe('3,5 kW');
  });

  it('converte in BTU per i condizionatori, con le taglie commerciali', () => {
    expect(potenzaLeggibile({ categoria: 'CONDIZIONATORE', potenzaKw: 2.5 })).toBe('9.000 BTU');
    expect(potenzaLeggibile({ categoria: 'CONDIZIONATORE', potenzaKw: 3.5 })).toBe('12.000 BTU');
    expect(potenzaLeggibile({ categoria: 'CONDIZIONATORE', potenzaKw: 5.3 })).toBe('18.000 BTU');
  });

  it('niente potenza se non indicata', () => {
    expect(potenzaLeggibile({ categoria: 'CONDIZIONATORE', potenzaKw: null })).toBeNull();
  });
});
