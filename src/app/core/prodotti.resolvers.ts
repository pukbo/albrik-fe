import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { CATEGORIE, CategoriaProdotto, Prodotto, ProdottiApi } from './prodotti-api';

/** Modelli attivi della categoria indicata in data.categoria della route; vuoto se il backend non risponde. */
export const prodottiResolver: ResolveFn<Prodotto[]> = (route) =>
  inject(ProdottiApi)
    .elenco(route.data['categoria'] as CategoriaProdotto)
    .pipe(catchError(() => of([])));

/** Modelli attivi di tutte le categorie, per la pagina /catalogo. */
export const catalogoCompletoResolver: ResolveFn<Partial<Record<CategoriaProdotto, Prodotto[]>>> = () => {
  const api = inject(ProdottiApi);
  const categorie = Object.keys(CATEGORIE) as CategoriaProdotto[];
  return forkJoin(
    Object.fromEntries(categorie.map((c) => [c, api.elenco(c).pipe(catchError(() => of([] as Prodotto[])))])),
  );
};

/** Modello per slug, solo se della categoria della route; null altrimenti (la pagina mostra il 404). */
export const prodottoResolver: ResolveFn<Prodotto | null> = (route) =>
  inject(ProdottiApi)
    .perSlug(route.paramMap.get('slug') ?? '')
    .pipe(
      catchError(() => of(null)),
      map((p) => (p && p.categoria === route.data['categoria'] ? p : null)),
    );
