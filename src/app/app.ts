import { Component, DOCUMENT, afterNextRender, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { attivaOndaAlClic } from './core/onda-clic';
import { Footer } from './layout/footer';
import { Header } from './layout/header';

const inAreaAdmin = (url: string | undefined) => !!url && (url === '/admin' || url.startsWith('/admin/'));

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  host: { class: 'flex min-h-dvh flex-col' },
  template: `
    @if (areaAdmin()) {
      <!-- il pannello admin ha il suo layout -->
      <router-outlet />
    } @else {
      <a href="#contenuto" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:p-3">
        Vai al contenuto
      </a>
      <app-header />
      <main id="contenuto" class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
    }
  `,
})
export class App {
  private readonly router = inject(Router);

  constructor() {
    const documento = inject(DOCUMENT);
    // solo nel browser: sul server non ci sono clic
    afterNextRender(() => attivaOndaAlClic(documento));
  }

  protected readonly areaAdmin = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => inAreaAdmin(e.urlAfterRedirects.split('?')[0])),
    ),
    // valore iniziale dall'indirizzo del browser, così il layout pubblico non lampeggia aprendo /admin
    { initialValue: inAreaAdmin(inject(DOCUMENT).location?.pathname) },
  );
}
