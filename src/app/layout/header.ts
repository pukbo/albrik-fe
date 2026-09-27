import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { catchError, filter, map, of } from 'rxjs';
import { CATEGORIE } from '../core/prodotti-api';
import { ServiziApi } from '../core/servizi-api';
import { SITE, TELEFONO_LINK } from '../core/site.config';
import { Logo } from '../shared/logo';
import { ServizioIcona } from '../shared/servizio-icona';

type IdGruppo = 'servizi' | 'catalogo';

interface VoceMenu {
  path: string;
  titolo: string;
  descrizione: string;
  /** Slug usato per scegliere l'icona (vedi ServizioIcona). */
  icona: string;
}

interface GruppoMenu {
  id: IdGruppo;
  etichetta: string;
  voci: VoceMenu[];
  tutti: { path: string; etichetta: string };
  /** Percorsi che rendono attiva la voce del menu. */
  prefissi: string[];
}

/**
 * Testata con due sezioni a tendina (Servizi e Catalogo).
 * I link delle tendine sono sempre nell'HTML (anche renderizzato sul server) e vengono solo nascosti
 * con il CSS: così Google li segue da ogni pagina. Su desktop la tendina si apre al passaggio del mouse
 * o con il pulsante (tastiera, touch); su mobile le sezioni si aprono dentro il menu.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Logo, ServizioIcona],
  host: {
    // sticky sull'elemento host: un <header> sticky dentro <app-header> resterebbe confinato
    // nel suo contenitore (alto quanto lui) e scorrerebbe via con la pagina
    class: 'sticky top-0 z-40 block',
    '(document:keydown.escape)': 'chiudiSezione()',
    '(document:click)': 'clicFuori($event)',
  },
  template: `
    <header class="testata-sito border-b border-slate-200 bg-white/95 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a routerLink="/" [attr.aria-label]="site.nome + ', torna alla home'" (click)="chiudiSezione(); aperto.set(false)">
          <app-logo [dimensione]="36" />
        </a>

        <button
          type="button"
          class="inline-flex size-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
          [attr.aria-expanded]="aperto()"
          aria-controls="menu-principale"
          (click)="aperto.set(!aperto())"
        >
          <span class="sr-only">{{ aperto() ? 'Chiudi menu' : 'Apri menu' }}</span>
          <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            @if (aperto()) {
              <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
            } @else {
              <path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" />
            }
          </svg>
        </button>

        <nav id="menu-principale" aria-label="Menu principale" class="md:block" [class.hidden]="!aperto()">
          <ul
            class="absolute inset-x-0 top-16 flex max-h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto border-b border-slate-200 bg-white p-4 shadow-lg md:static md:max-h-none md:flex-row md:items-center md:gap-1 md:overflow-visible md:border-0 md:p-0 md:shadow-none"
          >
            @for (g of gruppi(); track g.id) {
              <li class="gruppo relative" [class.in-pausa]="inPausa()" (mouseleave)="inPausa.set(false)">
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-1.5 rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-slate-100 md:py-2"
                  [class.text-blue-800]="attivo(g)"
                  [class.bg-blue-50]="attivo(g)"
                  [attr.aria-expanded]="sezione() === g.id"
                  [attr.aria-controls]="'sottomenu-' + g.id"
                  (click)="alterna(g.id)"
                >
                  {{ g.etichetta }}
                  <svg class="freccia-giu size-4" [class.girata]="sezione() === g.id" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                <div [id]="'sottomenu-' + g.id" class="sottomenu" [class.aperta]="sezione() === g.id">
                  <div class="riquadro">
                    <ul class="space-y-0.5">
                      @for (v of g.voci; track v.path) {
                        <li>
                          <a [routerLink]="v.path" routerLinkActive="bg-blue-50" ariaCurrentWhenActive="page" (click)="chiudi(true)"
                            class="flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50">
                            <app-servizio-icona [slug]="v.icona" class="size-10 shrink-0 rounded-lg bg-blue-50 p-2 text-blue-800" />
                            <span class="min-w-0">
                              <span class="block font-semibold text-slate-900">{{ v.titolo }}</span>
                              <span class="block text-sm text-slate-600">{{ v.descrizione }}</span>
                            </span>
                          </a>
                        </li>
                      }
                    </ul>
                    <a [routerLink]="g.tutti.path" (click)="chiudi(true)"
                      class="mt-1 flex items-center justify-between rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-50">
                      {{ g.tutti.etichetta }} <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </li>
            }
            <li>
              <a
                routerLink="/contatti"
                routerLinkActive="text-blue-800 bg-blue-50"
                ariaCurrentWhenActive="page"
                class="block rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-slate-100 md:py-2"
                (click)="chiudi()"
              >
                Contatti
              </a>
            </li>
            <li>
              <a
                [href]="telefonoLink"
                class="pulsante mt-2 block rounded-lg bg-orange-700 px-4 py-3 text-center font-semibold text-white hover:bg-orange-800 md:mt-0 md:ml-2 md:py-2"
              >
                Chiama ora
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  `,
  styles: `
    /* mobile: le sezioni si aprono dentro il menu, sotto il pulsante */
    .sottomenu {
      display: none;
    }

    .sottomenu.aperta {
      display: block;
    }

    .riquadro {
      padding: 0.25rem 0 0.5rem 0.5rem;
    }

    .freccia-giu {
      transition: transform 0.2s ease;
    }

    .freccia-giu.girata {
      transform: rotate(180deg);
    }

    /* desktop: tendina sotto la voce, aperta al passaggio del mouse o con il pulsante */
    @media (min-width: 768px) {
      .sottomenu {
        display: block;
        position: absolute;
        top: 100%;
        left: -0.5rem;
        width: 22rem;
        /* il margine trasparente tiene aperta la tendina mentre il mouse scende dalla voce */
        padding-top: 0.5rem;
        visibility: hidden;
        opacity: 0;
        transform: translateY(6px);
        transition:
          opacity 0.18s ease,
          transform 0.18s ease,
          visibility 0.18s;
      }

      .sottomenu.aperta {
        visibility: visible;
        opacity: 1;
        transform: translateY(0);
      }

      .riquadro {
        padding: 0.5rem;
        border: 1px solid rgb(226 232 240);
        border-radius: 1rem;
        background: white;
        box-shadow: 0 20px 40px -16px rgb(15 23 42 / 0.3);
      }
    }

    /*
     * Apertura al passaggio del mouse solo con un mouse vero (sui touch il :hover resta "attaccato").
     * Dopo un clic su un link la tendina resta chiusa finché il mouse non esce dalla voce.
     */
    @media (min-width: 768px) and (hover: hover) {
      .gruppo:not(.in-pausa):hover .sottomenu {
        visibility: visible;
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .sottomenu,
      .freccia-giu {
        transition: none;
        transform: none;
      }
    }
  `,
})
export class Header {
  private readonly router = inject(Router);
  private readonly elemento = inject(ElementRef<HTMLElement>);

  protected readonly site = SITE;
  protected readonly telefonoLink = TELEFONO_LINK;
  /** Menu mobile aperto. */
  protected readonly aperto = signal(false);
  /** Sezione a tendina aperta con il pulsante (su desktop si apre anche al passaggio del mouse). */
  protected readonly sezione = signal<IdGruppo | null>(null);
  /** Dopo un clic su un link la tendina non si riapre al passaggio del mouse finché il mouse non esce. */
  protected readonly inPausa = signal(false);

  private readonly serviziApi = inject(ServiziApi);
  private readonly servizi = rxResource({
    stream: () => this.serviziApi.elenco().pipe(catchError(() => of([]))),
    defaultValue: [],
  });

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly gruppi = computed<GruppoMenu[]>(() => [
    {
      id: 'servizi',
      etichetta: 'Servizi',
      voci: this.servizi.value().map((s) => ({
        path: `/servizi/${s.slug}`,
        titolo: s.titolo,
        descrizione: s.sommario.length > 70 ? s.sommario.slice(0, 68).trimEnd() + '…' : s.sommario,
        icona: s.slug,
      })),
      tutti: { path: '/servizi', etichetta: 'Tutti i servizi' },
      prefissi: ['/servizi'],
    },
    {
      id: 'catalogo',
      etichetta: 'Catalogo',
      voci: Object.values(CATEGORIE).map((c) => ({
        path: `/${c.percorso}`,
        titolo: c.plurale,
        descrizione: c.descrizioneBreve,
        icona: c.percorso,
      })),
      tutti: { path: '/catalogo', etichetta: 'Tutto il catalogo' },
      prefissi: ['/catalogo', ...Object.values(CATEGORIE).map((c) => `/${c.percorso}`)],
    },
  ]);

  protected attivo(gruppo: GruppoMenu): boolean {
    const percorso = this.url().split(/[?#]/)[0];
    return gruppo.prefissi.some((p) => percorso === p || percorso.startsWith(p + '/'));
  }

  protected alterna(id: IdGruppo): void {
    this.sezione.update((attuale) => (attuale === id ? null : id));
  }

  protected chiudiSezione(): void {
    this.sezione.set(null);
  }

  /** @param daTendina true per i link delle tendine: la tendina resta chiusa anche se il mouse è sopra */
  protected chiudi(daTendina = false): void {
    this.aperto.set(false);
    this.sezione.set(null);
    this.inPausa.set(daTendina);
  }

  protected clicFuori(evento: MouseEvent): void {
    if (!this.elemento.nativeElement.contains(evento.target as Node)) {
      this.aperto.set(false);
      this.sezione.set(null);
    }
  }
}
