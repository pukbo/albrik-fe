import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Header } from './header';

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
