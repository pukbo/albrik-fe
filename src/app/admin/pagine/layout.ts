import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Seo } from '../../core/seo';
import { AdminAuth } from '../admin-auth';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  host: { class: 'flex min-h-dvh flex-col bg-slate-100' },
  template: `
    <header class="bg-blue-950 text-white">
      <div class="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <div class="flex items-center gap-6">
          <a routerLink="/admin" class="font-extrabold">Albrik <span class="font-normal text-blue-200">Admin</span></a>
          <nav aria-label="Menu pannello">
            <a routerLink="/admin/richieste" routerLinkActive="bg-white/15" ariaCurrentWhenActive="page"
              class="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-white/10">Richieste</a>
            <a routerLink="/admin/servizi" routerLinkActive="bg-white/15" ariaCurrentWhenActive="page"
              class="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-white/10">Servizi</a>
          </nav>
        </div>
        <div class="flex items-center gap-3 text-sm">
          <a href="/" target="_blank" rel="noopener" class="hidden text-blue-200 hover:text-white sm:inline">Vedi il sito ↗</a>
          <button type="button" (click)="esci()" class="rounded-md border border-white/30 px-3 py-1.5 hover:bg-white/10">
            Esci
          </button>
        </div>
      </div>
    </header>
    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <router-outlet />
    </main>
  `,
})
export default class AdminLayout {
  private readonly auth = inject(AdminAuth);
  private readonly router = inject(Router);

  constructor() {
    inject(Seo).aggiorna({ title: 'Albrik Admin', description: '', path: '/admin', noindex: true });
  }

  protected async esci(): Promise<void> {
    await this.auth.logout();
    await this.router.navigate(['/admin/login']);
  }
}
