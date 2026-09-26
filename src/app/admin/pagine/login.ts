import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { FormField, form, required, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Seo } from '../../core/seo';
import { AdminAuth } from '../admin-auth';

@Component({
  selector: 'app-admin-login',
  imports: [FormField],
  template: `
    <main class="flex min-h-dvh items-center justify-center bg-slate-100 px-4">
      <form novalidate (submit)="accedi($event)" class="w-full max-w-sm space-y-5 rounded-2xl bg-white p-8 shadow-sm">
        <div>
          <p class="text-2xl font-extrabold text-blue-900">Albrik</p>
          <h1 class="mt-1 text-lg font-semibold text-slate-700">Pannello amministrazione</h1>
        </div>

        <div>
          <label for="username" class="font-medium text-slate-800">Nome utente</label>
          <input id="username" type="text" autocomplete="username" [formField]="f.username"
            class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
        </div>
        <div>
          <label for="password" class="font-medium text-slate-800">Password</label>
          <input id="password" type="password" autocomplete="current-password" [formField]="f.password"
            class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
        </div>

        @if (errore()) {
          <p role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-red-800">{{ errore() }}</p>
        }

        <button type="submit" [disabled]="f().submitting()"
          class="w-full rounded-lg bg-blue-900 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
          {{ f().submitting() ? 'Accesso in corso…' : 'Accedi' }}
        </button>
      </form>
    </main>
  `,
})
export default class AdminLogin {
  /** Pagina da riaprire dopo il login (query param). */
  readonly ritorno = input<string>();

  private readonly auth = inject(AdminAuth);
  private readonly router = inject(Router);

  protected readonly errore = signal('');
  protected readonly credenziali = signal({ username: '', password: '' });
  protected readonly f = form(this.credenziali, (p) => {
    required(p.username);
    required(p.password);
  });

  constructor() {
    inject(Seo).aggiorna({ title: 'Accesso | Albrik Admin', description: '', path: '/admin/login', noindex: true });
  }

  protected async accedi(event: Event): Promise<void> {
    event.preventDefault();
    this.errore.set('');
    await submit(this.f, {
      action: async () => {
        try {
          const { username, password } = this.credenziali();
          await this.auth.login(username, password);
          const ritorno = this.ritorno();
          // solo percorsi interni al pannello, mai URL esterni
          await this.router.navigateByUrl(ritorno?.startsWith('/admin') ? ritorno : '/admin');
        } catch (e) {
          const status = e instanceof HttpErrorResponse ? e.status : 0;
          this.errore.set(
            status === 401
              ? 'Nome utente o password non validi.'
              : status === 429
                ? 'Troppi tentativi. Riprova tra qualche minuto.'
                : 'Accesso non riuscito. Riprova.',
          );
        }
        return undefined;
      },
      onInvalid: () => this.errore.set('Inserisci nome utente e password.'),
    });
  }
}
