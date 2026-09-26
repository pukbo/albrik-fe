import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { AdminApi, UtenteAdmin } from './admin-api';

@Injectable({ providedIn: 'root' })
export class AdminAuth {
  private readonly api = inject(AdminApi);

  /** Utente loggato, null se non autenticato. */
  readonly utente = signal<UtenteAdmin | null>(null);

  /** Verifica con il backend se la sessione è ancora valida. */
  async verifica(): Promise<boolean> {
    try {
      this.utente.set(await firstValueFrom(this.api.me()));
      return true;
    } catch {
      this.utente.set(null);
      return false;
    }
  }

  async login(username: string, password: string): Promise<void> {
    await firstValueFrom(this.api.csrf());
    this.utente.set(await firstValueFrom(this.api.login(username, password)));
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.api.logout());
    } finally {
      this.utente.set(null);
    }
  }
}

/** Protegge le pagine del pannello: senza sessione valida si va al login. */
export const adminGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AdminAuth);
  const router = inject(Router);
  if (auth.utente() || (await auth.verifica())) {
    return true;
  }
  return router.createUrlTree(['/admin/login'], { queryParams: { ritorno: state.url } });
};

/** Se la sessione scade mentre si usa il pannello, riporta al login. */
export const adminSessioneScadutaInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AdminAuth);
  return next(req).pipe(
    catchError((err: unknown) => {
      const sessioneScaduta =
        err instanceof HttpErrorResponse &&
        err.status === 401 &&
        req.url.startsWith('/api/admin/') &&
        !req.url.endsWith('/login') &&
        !req.url.endsWith('/me');
      if (sessioneScaduta) {
        auth.utente.set(null);
        router.navigate(['/admin/login'], { queryParams: { ritorno: router.url } });
      }
      return throwError(() => err);
    }),
  );
};
