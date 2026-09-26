import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './layout/footer';
import { Header } from './layout/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  host: { class: 'flex min-h-dvh flex-col' },
  template: `
    <a href="#contenuto" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:p-3">
      Vai al contenuto
    </a>
    <app-header />
    <main id="contenuto" class="flex-1">
      <router-outlet />
    </main>
    <app-footer />
  `,
})
export class App {}
