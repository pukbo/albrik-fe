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
});
