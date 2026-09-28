import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Header, descrizioneMenu } from './header';

describe('descrizioneMenu', () => {
  it('usa la parte del sommario prima dei due punti, senza tagliare le parole', () => {
    expect(descrizioneMenu('Ristrutturazione completa del bagno: impianti, sanitari e box doccia.')).toBe(
      'Ristrutturazione completa del bagno',
    );
    expect(descrizioneMenu('Manutenzione annuale della caldaia.')).toBe('Manutenzione annuale della caldaia');
    expect(descrizioneMenu('Senza punteggiatura')).toBe('Senza punteggiatura');
  });
});

describe('Header', () => {
  async function crea() {
    TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/servizi'))
      .flush([
        { slug: 'installazione-caldaie-caserta', titolo: 'Installazione caldaie', sommario: 'Caldaie a condensazione.' },
        { slug: 'rinnovo-bagno-caserta', titolo: 'Rinnovo bagno', sommario: 'Bagni chiavi in mano.' },
      ]);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('ha sempre nell\'HTML i link delle tendine, anche chiuse (per Google)', async () => {
    const { el } = await crea();
    const link = [...el.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(link).toEqual(
      expect.arrayContaining([
        '/servizi/installazione-caldaie-caserta',
        '/servizi/rinnovo-bagno-caserta',
        '/servizi',
        '/caldaie',
        '/condizionatori',
        '/catalogo',
        '/contatti',
      ]),
    );
  });

  it('pannello mobile: si apre, le sezioni si espandono a fisarmonica, Esc lo chiude', async () => {
    const { fixture, el } = await crea();
    const pannello = el.querySelector('#menu-mobile')!;
    const apri = el.querySelector<HTMLButtonElement>('button[aria-controls="menu-mobile"]')!;
    expect(pannello.hasAttribute('inert')).toBe(true);

    apri.click();
    await fixture.whenStable();
    expect(pannello.classList).toContain('aperto');
    expect(pannello.hasAttribute('inert')).toBe(false);
    expect(apri.getAttribute('aria-expanded')).toBe('true');

    // Catalogo chiuso: i suoi link non sono raggiungibili finché non si espande
    const sezione = pannello.querySelector('#mobile-catalogo')!;
    const catalogo = pannello.querySelector<HTMLButtonElement>('button[aria-controls="mobile-catalogo"]')!;
    expect(sezione.hasAttribute('inert')).toBe(true);
    catalogo.click();
    await fixture.whenStable();
    expect(catalogo.getAttribute('aria-expanded')).toBe('true');
    expect(sezione.hasAttribute('inert')).toBe(false);
    expect(sezione.querySelector('a[href="/caldaie"]')).not.toBeNull();
    // azione principale del pannello: il preventivo
    expect(pannello.querySelector('a[href="/contatti"]')?.textContent).toContain('Contatti');
    expect([...pannello.querySelectorAll('a')].some((a) => a.textContent!.includes('Richiedi un preventivo gratuito'))).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(pannello.classList).not.toContain('aperto');
    expect(document.documentElement.classList).not.toContain('menu-aperto');
  });

  it('apre e chiude una tendina con il pulsante e con Esc', async () => {
    const { fixture, el } = await crea();
    const pulsante = [...el.querySelectorAll<HTMLButtonElement>('button[aria-controls^="sottomenu-"]')].find((b) =>
      b.textContent!.includes('Catalogo'),
    )!;
    expect(pulsante.getAttribute('aria-expanded')).toBe('false');

    pulsante.click();
    await fixture.whenStable();
    expect(pulsante.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('#sottomenu-catalogo')!.classList).toContain('aperta');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(pulsante.getAttribute('aria-expanded')).toBe('false');
  });
});
