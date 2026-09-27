import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SITE, TELEFONO_LINK } from '../core/site.config';
import { Logo } from '../shared/logo';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Logo],
  template: `
    <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a routerLink="/" [attr.aria-label]="site.nome + ', torna alla home'" (click)="chiudi()">
          <app-logo [dimensione]="36" />
        </a>

        <button
          type="button"
          class="inline-flex size-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
          [attr.aria-expanded]="aperto()"
          aria-controls="menu-principale"
          (click)="aperto.set(!aperto())"
        >
          <span class="sr-only">{{ aperto() ? 'Chiudi menu' : 'Apri menu' }}</span>
          <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            @if (aperto()) {
              <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
            } @else {
              <path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" />
            }
          </svg>
        </button>

        <nav id="menu-principale" aria-label="Menu principale" class="md:block" [class.hidden]="!aperto()">
          <ul
            class="absolute inset-x-0 top-16 flex flex-col gap-1 border-b border-slate-200 bg-white p-4 shadow-lg md:static md:flex-row md:items-center md:gap-2 md:border-0 md:p-0 md:shadow-none"
          >
            @for (voce of voci; track voce.path) {
              <li>
                <a
                  [routerLink]="voce.path"
                  routerLinkActive="text-blue-800 bg-blue-50"
                  [routerLinkActiveOptions]="{ exact: voce.path === '/' }"
                  ariaCurrentWhenActive="page"
                  class="block rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-slate-100 md:py-2"
                  (click)="chiudi()"
                >
                  {{ voce.label }}
                </a>
              </li>
            }
            <li>
              <a
                [href]="telefonoLink"
                class="mt-2 block rounded-lg bg-orange-700 px-4 py-3 text-center font-semibold text-white hover:bg-orange-800 md:mt-0 md:ml-2 md:py-2"
              >
                Chiama ora
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  `,
})
export class Header {
  protected readonly site = SITE;
  protected readonly telefonoLink = TELEFONO_LINK;
  protected readonly aperto = signal(false);
  protected readonly voci = [
    { path: '/', label: 'Home' },
    { path: '/servizi', label: 'Servizi' },
    { path: '/contatti', label: 'Contatti' },
  ];

  protected chiudi(): void {
    this.aperto.set(false);
  }
}
