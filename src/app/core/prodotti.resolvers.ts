import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { CategoriaProdotto, Prodotto, ProdottiApi } from './prodotti-api';

/** Modelli attivi della categoria indicata in data.categoria della route; vuoto se il backend non risponde. */
export const prodottiResolver: ResolveFn<Prodotto[]> = (route) =>
  inject(ProdottiApi)
    .elenco(route.data['categoria'] as CategoriaProdotto)
    .pipe(catchError(() => of([])));

/** Modello per slug, solo se della categoria della route; null altrimenti (la pagina mostra il 404). */
export const prodottoResolver: ResolveFn<Prodotto | null> = (route) =>
  inject(ProdottiApi)
    .perSlug(route.paramMap.get('slug') ?? '')
    .pipe(
      catchError(() => of(null)),
      map((p) => (p && p.categoria === route.data['categoria'] ? p : null)),
    );
