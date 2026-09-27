import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { BarraAzioni } from './barra-azioni';

@Component({ template: '' })
class Vuota {}

describe('BarraAzioni', () => {
  function scorri(y: number) {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
    window.dispatchEvent(new Event('scroll'));
  }

  async function crea(url: string) {
    TestBed.configureTestingModule({
      imports: [BarraAzioni],
      providers: [provideRouter([{ path: '**', component: Vuota }])],
    });
    await TestBed.inject(Router).navigateByUrl(url);
    const fixture = TestBed.createComponent(BarraAzioni);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  afterEach(() => scorri(0));

  it('compare solo dopo aver scorso la pagina', async () => {
    const { fixture, el } = await crea('/');
    const barra = el.querySelector('nav')!;
    expect(barra.classList).not.toContain('visibile');
    expect(barra.hasAttribute('inert')).toBe(true);

    scorri(600);
    await fixture.whenStable();
    expect(barra.classList).toContain('visibile');
    expect(barra.hasAttribute('inert')).toBe(false);

    scorri(0);
    await fixture.whenStable();
    expect(barra.classList).not.toContain('visibile');
  });

  it('nella pagina di un servizio porta al preventivo con il servizio scelto', async () => {
    const { el } = await crea('/servizi/rinnovo-bagno-caserta');
    const link = [...el.querySelectorAll('a')].find((a) => a.textContent!.includes('Preventivo'))!;
    expect(link.getAttribute('href')).toBe('/contatti?servizio=rinnovo-bagno-caserta');
  });

  it('non c\'è nella pagina contatti', async () => {
    const { el } = await crea('/contatti');
    expect(el.querySelector('nav')).toBeNull();
  });
});
