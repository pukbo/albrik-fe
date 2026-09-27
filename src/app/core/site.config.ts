/** Anno di inizio attività: 37 anni di esperienza nel settore nel 2026. */
const ATTIVITA_DAL = 1989;

/** Anni di esperienza, calcolati: si aggiornano da soli ogni anno. */
export const ANNI_ESPERIENZA = new Date().getFullYear() - ATTIVITA_DAL;

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
  attivitaDal: ATTIVITA_DAL,
  descrizione:
    `Impiantistica a Caserta da ${ANNI_ESPERIENZA} anni: installazione caldaie e caldaie a condensazione, ` +
    'rinnovo bagno e installazione condizionatori.',
} as const;

/** Numero di telefono in formato adatto ai link tel: (solo + e cifre). */
export const TELEFONO_LINK = `tel:${SITE.telefono.replace(/[^+\d]/g, '')}`;
