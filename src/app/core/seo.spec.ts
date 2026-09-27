import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Seo } from './seo';

describe('Seo', () => {
  let seo: Seo;
  let document: Document;

  beforeEach(() => {
    seo = TestBed.inject(Seo);
    document = TestBed.inject(DOCUMENT);
  });

  it('imposta title, description e canonical', () => {
    seo.aggiorna({ title: 'Titolo di prova', description: 'Descrizione di prova', path: '/servizi' });

    expect(document.title).toBe('Titolo di prova');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Descrizione di prova');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://albrik.it/servizi');
  });

  it('sostituisce il JSON-LD a ogni cambio pagina, senza duplicarlo', () => {
    seo.aggiorna({ title: 'A', description: 'A', path: '/a', jsonLd: { '@type': 'HVACBusiness' } });
    seo.aggiorna({ title: 'B', description: 'B', path: '/b', jsonLd: { '@type': 'Service', name: '</script>' } });

    const script = document.querySelectorAll('script[type="application/ld+json"]');
    expect(script.length).toBe(1);
    expect(script[0].textContent).toContain('"Service"');
    expect(script[0].textContent).not.toContain('</script>');
  });

  it('imposta og:image assoluta solo quando la pagina ha una foto', () => {
    seo.aggiorna({ title: 'A', description: 'A', path: '/a', immagine: '/media/servizi/x-1600.webp' });
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      'https://albrik.it/media/servizi/x-1600.webp',
    );
    seo.aggiorna({ title: 'B', description: 'B', path: '/b' });
    expect(document.querySelector('meta[property="og:image"]')).toBeNull();
  });

  it('rimuove il JSON-LD e imposta noindex sulle pagine che non vanno indicizzate', () => {
    seo.aggiorna({ title: 'A', description: 'A', path: '/a', jsonLd: { '@type': 'HVACBusiness' } });
    seo.aggiorna({ title: '404', description: '404', path: '/x', noindex: true });

    expect(document.querySelector('script[type="application/ld+json"]')).toBeNull();
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
  });
});
