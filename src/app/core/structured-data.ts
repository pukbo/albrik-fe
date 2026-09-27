import { CATEGORIE, Prodotto } from './prodotti-api';
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
    foundingDate: String(SITE.attivitaDal),
    logo: `${SITE.url}/icon-512.png`,
    image: `${SITE.url}/og-albrik.png`,
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

/** JSON-LD di un modello del catalogo, con le briciole di pane per i risultati di Google. */
export function prodottoJsonLd(prodotto: Prodotto): object[] {
  const categoria = CATEGORIE[prodotto.categoria];
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: prodotto.nome,
      brand: { '@type': 'Brand', name: prodotto.marca },
      model: prodotto.modello,
      category: categoria.plurale,
      description: prodotto.metaDescription,
      url: SITE.url + prodotto.percorso,
      ...(prodotto.immagine && { image: SITE.url + prodotto.immagine }),
      ...(prodotto.classeEnergetica && {
        additionalProperty: { '@type': 'PropertyValue', name: 'Classe energetica', value: prodotto.classeEnergetica },
      }),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url + '/' },
        { '@type': 'ListItem', position: 2, name: 'Catalogo', item: `${SITE.url}/catalogo` },
        { '@type': 'ListItem', position: 3, name: categoria.plurale, item: `${SITE.url}/${categoria.percorso}` },
        { '@type': 'ListItem', position: 4, name: prodotto.nome, item: SITE.url + prodotto.percorso },
      ],
    },
  ];
}

/** JSON-LD dell'elenco dei modelli di una categoria. */
export function catalogoJsonLd(prodotti: Prodotto[], nome: string, percorso: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: nome,
    url: SITE.url + percorso,
    itemListElement: prodotti.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.nome,
      url: SITE.url + p.percorso,
    })),
  };
}

/** JSON-LD della pagina di un servizio: il servizio, le briciole di pane e (se ci sono) le domande frequenti. */
export function paginaServizioJsonLd(servizio: Servizio): object[] {
  const url = `${SITE.url}/servizi/${servizio.slug}`;
  return [
    servizioJsonLd(servizio),
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url + '/' },
        { '@type': 'ListItem', position: 2, name: 'Servizi', item: `${SITE.url}/servizi` },
        { '@type': 'ListItem', position: 3, name: servizio.titolo, item: url },
      ],
    },
    ...(servizio.faq.length > 0
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            url,
            mainEntity: servizio.faq.map((f) => ({
              '@type': 'Question',
              name: f.domanda,
              acceptedAnswer: { '@type': 'Answer', text: f.risposta },
            })),
          },
        ]
      : []),
  ];
}

/** JSON-LD di un singolo servizio, collegato all'azienda che lo offre. */
export function servizioJsonLd(servizio: Servizio): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: servizio.titolo,
    description: servizio.metaDescription,
    url: `${SITE.url}/servizi/${servizio.slug}`,
    ...(servizio.immagine && { image: SITE.url + servizio.immagine }),
    areaServed: { '@type': 'AdministrativeArea', name: SITE.zonaServita },
    provider: aziendaJsonLd(),
  };
}
