import { Component, computed, input } from '@angular/core';

type Icona = 'fiamma' | 'goccia' | 'fiocco' | 'chiave';

/**
 * Icona illustrativa di un servizio, scelta in base allo slug.
 * Segnaposto finché non ci sono le foto reali in WebP.
 */
@Component({
  selector: 'app-servizio-icona',
  host: { class: 'inline-flex', 'aria-hidden': 'true' },
  template: `
    <svg class="size-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      @switch (icona()) {
        @case ('fiamma') {
          <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 1.7 1.2 2.7 2.5 3-1-3 0-6 0-8z" />
        }
        @case ('goccia') {
          <path d="M12 3.5c3 4 6 7.2 6 10.5a6 6 0 0 1-12 0c0-3.3 3-6.5 6-10.5z" />
          <path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5" />
        }
        @case ('fiocco') {
          <path d="M12 2v20M3.3 7l17.4 10M20.7 7L3.3 17" />
          <path d="M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5" />
        }
        @default {
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3.5 17.5a1.4 1.4 0 0 0 2 2l5.8-5.8a4 4 0 0 0 5.4-5.4l-2.4 2.4-2-2z" />
        }
      }
    </svg>
  `,
})
export class ServizioIcona {
  readonly slug = input.required<string>();

  protected readonly icona = computed<Icona>(() => {
    const slug = this.slug();
    if (slug.includes('caldai')) return 'fiamma';
    if (slug.includes('bagno')) return 'goccia';
    if (slug.includes('condizionator') || slug.includes('clima')) return 'fiocco';
    return 'chiave';
  });
}
