import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ModuloPreventivo } from './modulo-preventivo';

describe('ModuloPreventivo', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModuloPreventivo],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  function crea() {
    const fixture = TestBed.createComponent(ModuloPreventivo);
    const el = fixture.nativeElement as HTMLElement;
    const compila = (id: string, valore: string) => {
      const campo = el.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)!;
      campo.value = valore;
      campo.dispatchEvent(new Event('input'));
    };
    return { fixture, el, compila };
  }

  it('non invia un modulo vuoto e mostra gli errori', async () => {
    const { fixture, el } = crea();
    await fixture.whenStable();

    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(el.querySelector('#nome-errore')?.textContent).toContain('Inserisci il tuo nome');
    expect(el.querySelector('#consenso-errore')?.textContent).toContain('informativa privacy');
    http.expectNone(() => true);
  });

  it('invia la richiesta e mostra la conferma', async () => {
    const { fixture, el, compila } = crea();
    fixture.componentRef.setInput('servizioIniziale', 'rinnovo-bagno-caserta');
    await fixture.whenStable();

    compila('nome', 'Mario Rossi');
    compila('email', 'mario@example.com');
    compila('messaggio', 'Vorrei un preventivo');
    el.querySelector<HTMLInputElement>('#consenso')!.click();
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    const req = http.expectOne((r) => r.url.endsWith('/richieste'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toMatchObject({
      nome: 'Mario Rossi',
      servizioSlug: 'rinnovo-bagno-caserta',
      consensoPrivacy: true,
    });
    req.flush(null, { status: 201, statusText: 'Created' });
    // lascia completare la Promise dell'azione di submit prima del rendering
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();

    expect(el.querySelector('[role="status"]')?.textContent).toContain('Richiesta inviata');
  });

  describe('servizio con catalogo', () => {
    const servizi = [
      { slug: 'installazione-caldaie-caserta', titolo: 'Installazione caldaie', categoriaProdotti: 'CALDAIA' },
      { slug: 'rinnovo-bagno-caserta', titolo: 'Rinnovo bagno', categoriaProdotti: null },
    ];
    const caldaia = {
      slug: 'demo-eco-24',
      nome: 'Termika Eco 24',
      categoria: 'CALDAIA',
      valutazioni: { efficienza: 4, smart: 2, silenziosita: 3, fasciaPrezzo: 2, livello: 3 },
    };

    function compilaObbligatori(el: HTMLElement, compila: (id: string, v: string) => void) {
      compila('nome', 'Mario Rossi');
      compila('email', 'mario@example.com');
      compila('messaggio', 'Vorrei cambiare la caldaia');
      el.querySelector<HTMLInputElement>('#consenso')!.click();
    }

    it('si espande, carica i modelli e invia quello scelto', async () => {
      const { fixture, el, compila } = crea();
      fixture.componentRef.setInput('servizi', servizi);
      fixture.componentRef.setInput('servizioIniziale', 'installazione-caldaie-caserta');
      fixture.componentRef.setInput('prodottoIniziale', 'demo-eco-24');
      // la richiesta dei modelli resta in sospeso finché non risponde: niente whenStable prima del flush
      fixture.detectChanges();

      http.expectOne((r) => r.url.endsWith('/prodotti') && r.params.get('categoria') === 'CALDAIA').flush([caldaia]);
      await fixture.whenStable();
      // i menu mostrano davvero le voci preselezionate (le opzioni arrivano dopo il valore)
      expect(el.querySelector<HTMLSelectElement>('#servizio')!.value).toBe('installazione-caldaie-caserta');
      expect(el.querySelector<HTMLSelectElement>('#prodotto')!.value).toBe('demo-eco-24');
      // anteprima della scheda del modello preselezionato
      expect(el.textContent).toContain('Scheda tecnica');

      compilaObbligatori(el, compila);
      el.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();

      const req = http.expectOne((r) => r.url.endsWith('/richieste'));
      expect(req.request.body).toMatchObject({ prodottoSlug: 'demo-eco-24', prodottoDelCliente: false });
      expect(req.request.body.sceltaProdotto).toBeUndefined();
    });

    it('"Ho già la caldaia" invia prodottoDelCliente senza modello', async () => {
      const { fixture, el, compila } = crea();
      fixture.componentRef.setInput('servizi', servizi);
      fixture.componentRef.setInput('servizioIniziale', 'installazione-caldaie-caserta');
      fixture.detectChanges();
      http.expectOne((r) => r.url.endsWith('/prodotti')).flush([caldaia]);
      await fixture.whenStable();

      const mio = [...el.querySelectorAll<HTMLInputElement>('input[type="radio"]')].find((r) => r.value === 'mio')!;
      mio.click();
      await fixture.whenStable();
      expect(el.querySelector('#prodotto')).toBeNull();

      compilaObbligatori(el, compila);
      el.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();

      const req = http.expectOne((r) => r.url.endsWith('/richieste'));
      expect(req.request.body).toMatchObject({ prodottoSlug: null, prodottoDelCliente: true });
    });

    it('per i condizionatori adatta i testi al maschile', async () => {
      const { fixture, el } = crea();
      fixture.componentRef.setInput('servizi', [
        { slug: 'installazione-condizionatori-caserta', titolo: 'Installazione condizionatori', categoriaProdotti: 'CONDIZIONATORE' },
      ]);
      fixture.componentRef.setInput('servizioIniziale', 'installazione-condizionatori-caserta');
      fixture.detectChanges();
      http.expectOne((r) => r.params.get('categoria') === 'CONDIZIONATORE').flush([]);
      await fixture.whenStable();

      const testo = el.querySelector('fieldset')!.textContent!;
      expect(testo).toContain('Quale condizionatore vuoi installare?');
      expect(testo).toContain('Voglio sceglierne uno');
      expect(testo).toContain('Ho già il condizionatore');
    });

    it('senza catalogo non mostra la scelta e non invia dati di prodotto', async () => {
      const { fixture, el, compila } = crea();
      fixture.componentRef.setInput('servizi', servizi);
      fixture.componentRef.setInput('servizioIniziale', 'rinnovo-bagno-caserta');
      await fixture.whenStable();

      expect(el.querySelector('fieldset')).toBeNull();
      compilaObbligatori(el, compila);
      el.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();

      const req = http.expectOne((r) => r.url.endsWith('/richieste'));
      expect(req.request.body).toMatchObject({ prodottoSlug: null, prodottoDelCliente: null });
    });
  });
});
