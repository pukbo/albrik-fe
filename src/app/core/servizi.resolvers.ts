import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Servizio, ServiziApi } from './servizi-api';

/** Elenco dei servizi attivi; se il backend non risponde la pagina resta comunque navigabile. */
export const serviziResolver: ResolveFn<Servizio[]> = () =>
  inject(ServiziApi)
    .elenco()
    .pipe(catchError(() => of([])));

/** Servizio per slug; null se non esiste (la pagina mostra il 404). */
export const servizioResolver: ResolveFn<Servizio | null> = (route) =>
  inject(ServiziApi)
    .perSlug(route.paramMap.get('slug') ?? '')
    .pipe(catchError(() => of(null)));
