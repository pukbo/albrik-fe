import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE, TELEFONO_LINK } from '../core/site.config';

/** Banner "richiedi un preventivo" riutilizzato in fondo alle pagine. */
@Component({
  selector: 'app-cta-contatti',
  imports: [RouterLink],
  template: `
    <section class="bg-blue-900 text-white">
      <div class="mx-auto max-w-6xl px-4 py-12 text-center md:py-16">
        <h2 class="text-2xl font-bold md:text-3xl">Richiedi un preventivo gratuito</h2>
        <p class="mx-auto mt-3 max-w-xl text-blue-100">
          Sopralluogo senza impegno a {{ site.zonaServita }}. Rispondiamo in giornata.
        </p>
        <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            routerLink="/contatti"
            [queryParams]="servizioSlug() ? { servizio: servizioSlug() } : {}"
            class="rounded-lg bg-orange-700 px-6 py-3 font-semibold hover:bg-orange-800"
          >
            Richiedi un preventivo online
          </a>
          <a [href]="telefonoLink" class="rounded-lg border border-white/40 px-6 py-3 font-semibold hover:bg-white/10">
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
