/**
 * Dati aziendali di Albrik: unico punto da modificare per footer, contatti e JSON-LD.
 * I valori marcati TODO sono segnaposto in attesa dei dati reali.
 */
export const SITE = {
  nome: 'Albrik',
  url: 'https://albrik.it',
  email: 'info@albrik.it',
  // TODO: numero reale
  telefono: '+39 333 333 3333',
  // TODO: indirizzo reale
  indirizzo: {
    via: 'Via Esempio 1',
    cap: '81100',
    citta: 'Caserta',
    provincia: 'CE',
  },
  zonaServita: 'Caserta e provincia',
  descrizione:
    'Impiantistica a Caserta: installazione caldaie e caldaie a condensazione, rinnovo bagno e installazione condizionatori.',
} as const;

/** Numero di telefono in formato adatto ai link tel: (solo + e cifre). */
export const TELEFONO_LINK = `tel:${SITE.telefono.replace(/[^+\d]/g, '')}`;
