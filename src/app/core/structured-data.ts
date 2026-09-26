import { Servizio } from './servizi-api';
import { SITE } from './site.config';

const BUSINESS_ID = `${SITE.url}/#azienda`;

/** JSON-LD Schema.org dell'azienda (HVACBusiness, sottotipo di LocalBusiness). */
export function aziendaJsonLd(servizi: Servizio[] = []): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'HVACBusiness',
    '@id': BUSINESS_ID,
    name: SITE.nome,
    description: SITE.descrizione,
    url: SITE.url,
    email: SITE.email,
    telephone: SITE.telefono,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.indirizzo.via,
      postalCode: SITE.indirizzo.cap,
      addressLocality: SITE.indirizzo.citta,
      addressRegion: SITE.indirizzo.provincia,
      addressCountry: 'IT',
    },
    areaServed: { '@type': 'AdministrativeArea', name: SITE.zonaServita },
    ...(servizi.length > 0 && {
      makesOffer: servizi.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.titolo, url: `${SITE.url}/servizi/${s.slug}` },
      })),
    }),
  };
}

/** JSON-LD di un singolo servizio, collegato all'azienda che lo offre. */
export function servizioJsonLd(servizio: Servizio): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: servizio.titolo,
    description: servizio.metaDescription,
    url: `${SITE.url}/servizi/${servizio.slug}`,
    areaServed: { '@type': 'AdministrativeArea', name: SITE.zonaServita },
    provider: aziendaJsonLd(),
  };
}
