import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('mostra header, contenuto principale e footer', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    // servizi per il menu dell'header
    TestBed.inject(HttpTestingController).match(() => true).forEach((r) => r.flush([]));
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('header')).toBeTruthy();
    expect(el.querySelector('main#contenuto')).toBeTruthy();
    expect(el.querySelector('footer')?.textContent).toContain('info@albrik.it');
  });
});
