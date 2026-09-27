/**
 * Comparsa allo scorrimento (classe .rivela) per i browser senza le "scroll-driven animations"
 * (es. Safari su iPhone): un IntersectionObserver aggiunge .vista agli elementi quando entrano
 * nello schermo. Dove il CSS le supporta non fa nulla.
 *
 * La classe rivela-js su <html> attiva lo stato iniziale nascosto solo quando il JavaScript è
 * partito: senza JavaScript (o per Google) i contenuti restano sempre visibili.
 */
export function attivaRivelaDiRiserva(documento: Document): (() => void) | null {
  const finestra = documento.defaultView;
  if (!finestra || !('IntersectionObserver' in finestra) || CSS.supports('animation-timeline: view()')) {
    return null;
  }
  if (finestra.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  documento.documentElement.classList.add('rivela-js');
  const osservatore = new IntersectionObserver(
    (voci) => {
      for (const voce of voci) {
        if (voce.isIntersecting) {
          voce.target.classList.add('vista');
          osservatore.unobserve(voce.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );

  /** Da richiamare dopo ogni cambio pagina: osserva i nuovi elementi .rivela. */
  return () => {
    documento.querySelectorAll('.rivela:not(.vista)').forEach((el) => osservatore.observe(el));
  };
}
