import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { TELEFONO_LINK } from '../core/site.config';

/** Pagine in cui la barra non serve: il modulo è già lì, oppure sono pagine personali. */
const SENZA_BARRA = ['/contatti', '/preventivo', '/privacy'];

/** Scorrimento dopo cui compare la barra (in cima alla pagina ci sono già i pulsanti della testata). */
const SOGLIA_PX = 320;

/**
 * Barra fissa in basso, solo su telefono: "Chiama" e "Preventivo" sempre a portata di pollice.
 * Compare scorrendo la pagina. Nelle pagine di un servizio il preventivo parte con il servizio già scelto.
 */
@Component({
  selector: 'app-barra-azioni',
  host: {
    class: 'md:hidden',
    '(window:scroll)': 'aggiornaScorrimento()',
  },
  imports: [RouterLink],
  template: `
    @if (attiva()) {
      <!-- spazio in fondo alla pagina, così la barra non copre il footer -->
      <div class="h-20 bg-blue-950" aria-hidden="true"></div>
      <nav
        aria-label="Azioni rapide"
        class="barra fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pt-2.5 backdrop-blur"
        [class.visibile]="scorsa()"
        [attr.inert]="scorsa() ? null : ''"
      >
        <div class="flex gap-2">
          <a [href]="telefonoLink"
            class="pulsante flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-900 py-3 font-semibold text-blue-900">
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" aria-hidden="true">
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
            </svg>
            Chiama
          </a>
          <a routerLink="/contatti" [queryParams]="parametri()"
            class="pulsante flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-orange-700 py-3 font-semibold text-white">
            Preventivo gratuito <span class="freccia" aria-hidden="true">→</span>
          </a>
        </div>
      </nav>
    }
  `,
  styles: `
    .barra {
      /* spazio per la barra dei gesti degli iPhone */
      padding-bottom: calc(0.625rem + env(safe-area-inset-bottom));
      box-shadow: 0 -8px 24px -12px rgb(15 23 42 / 0.25);
      transform: translateY(110%);
      transition: transform 0.25s ease;
    }

    .barra.visibile {
      transform: translateY(0);
    }

    @media (prefers-reduced-motion: reduce) {
      .barra {
        transition: none;
      }
    }
  `,
})
export class BarraAzioni {
  private readonly router = inject(Router);

  protected readonly telefonoLink = TELEFONO_LINK;
  protected readonly scorsa = signal(false);

  private readonly percorso = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.split(/[?#]/)[0]),
    ),
    { initialValue: this.router.url.split(/[?#]/)[0] },
  );

  protected readonly attiva = computed(() => !SENZA_BARRA.some((p) => this.percorso().startsWith(p)));

  /** Nella pagina di un servizio il modulo si apre con quel servizio già selezionato. */
  protected readonly parametri = computed(() => {
    const servizio = /^\/servizi\/([a-z0-9-]+)$/.exec(this.percorso())?.[1];
    return servizio ? { servizio } : {};
  });

  protected aggiornaScorrimento(): void {
    const scorsa = window.scrollY > SOGLIA_PX;
    if (scorsa !== this.scorsa()) {
      this.scorsa.set(scorsa);
    }
  }
}
