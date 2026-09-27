import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE, TELEFONO_LINK } from '../core/site.config';

/** Banner "richiedi un preventivo" riutilizzato in fondo alle pagine. */
@Component({
  selector: 'app-cta-contatti',
  imports: [RouterLink],
  template: `
    <!-- card su fondo chiaro: così non si fonde con il footer blu notte -->
    <section class="px-4 pb-16 md:pb-20">
      <div class="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-blue-900 px-6 py-12 text-center text-white md:py-16">
        <svg viewBox="0 0 64 64" class="pointer-events-none absolute -right-10 -bottom-12 size-64 opacity-10" aria-hidden="true">
          <path d="M32 5 C32 5 12 27 12 40 A20 20 0 0 0 52 40 C52 27 32 5 32 5 Z" fill="#ffffff" />
        </svg>
        <h2 class="relative text-2xl font-bold md:text-3xl">Richiedi un preventivo gratuito</h2>
        <p class="relative mx-auto mt-3 max-w-xl text-blue-100">
          Sopralluogo senza impegno a {{ site.zonaServita }}. Rispondiamo in giornata.
        </p>
        <div class="relative mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            routerLink="/contatti"
            [queryParams]="servizioSlug() ? { servizio: servizioSlug() } : {}"
            class="pulsante rounded-lg bg-orange-700 px-6 py-3 font-semibold hover:bg-orange-800"
          >
            Richiedi un preventivo online <span class="freccia" aria-hidden="true">→</span>
          </a>
          <a [href]="telefonoLink" class="pulsante rounded-lg border border-white/40 px-6 py-3 font-semibold hover:bg-white/10">
            Chiama {{ site.telefono }}
          </a>
        </div>
      </div>
    </section>
  `,
})
export class CtaContatti {
  /** Se valorizzato, il modulo contatti si apre con questo servizio già selezionato. */
  readonly servizioSlug = input<string>();

  protected readonly site = SITE;
  protected readonly telefonoLink = TELEFONO_LINK;
}
