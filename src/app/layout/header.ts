import { Component, DOCUMENT, ElementRef, computed, effect, inject, signal } from '@angular/core';
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
    <!-- bianco pieno: una testata semitrasparente sopra le fasce blu diventerebbe grigia -->
    <header class="testata-sito border-b border-slate-200 bg-white">
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
          <!-- tre linee che si trasformano in una X -->
          <span class="hamburger" [class.aperto]="aperto()" aria-hidden="true"><span></span><span></span><span></span></span>
        </button>

        <!-- velo scuro dietro il menu mobile (sfuma): un tocco fuori lo chiude -->
        <div class="velo md:hidden" [class.aperto]="aperto()" aria-hidden="true" (click)="aperto.set(false)"></div>

        <nav id="menu-principale" aria-label="Menu principale">
          <!-- su telefono il pannello resta nell'HTML e si apre/chiude con una transizione (menu-mobile in styles) -->
          <ul
            class="menu-mobile absolute inset-x-0 top-16 flex max-h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto border-b border-slate-200 bg-white p-4 shadow-lg md:static md:max-h-none md:flex-row md:items-center md:gap-1 md:overflow-visible md:border-0 md:bg-transparent md:p-0 md:shadow-none"
            [class.aperto]="aperto()"
          >
            @for (g of gruppi(); track g.id; let i = $index) {
              <li class="gruppo relative" [class.in-pausa]="inPausa()" (mouseleave)="inPausa.set(false)" [style.--i]="i">
                <!-- su telefono: titolo della sezione e link già visibili (un solo tocco per ogni pagina) -->
                <p class="px-3 pt-2 pb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase md:hidden">{{ g.etichetta }}</p>
                <!-- da tablet in su: pulsante che apre la tendina -->
                <button
                  type="button"
                  class="hidden w-full items-center justify-between gap-1.5 rounded-lg px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 md:flex"
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
                            class="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50 active:bg-slate-100 md:items-start md:p-3">
                            <app-servizio-icona [slug]="v.icona" class="size-9 shrink-0 rounded-lg bg-blue-50 p-2 text-blue-800 md:size-10" />
                            <span class="min-w-0">
                              <span class="block font-semibold text-slate-900">{{ v.titolo }}</span>
                              <span class="hidden text-sm text-slate-600 md:block">{{ v.descrizione }}</span>
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
            <li [style.--i]="2">
              <a
                routerLink="/contatti"
                routerLinkActive="text-blue-800 bg-blue-50"
                ariaCurrentWhenActive="page"
                class="block rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-slate-100 active:bg-slate-100 md:py-2"
                (click)="chiudi()"
              >
                Contatti
              </a>
            </li>
            <li [style.--i]="3">
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
    /* mobile: le sezioni sono sempre aperte dentro il menu, sotto il loro titolo */
    .riquadro {
      padding: 0 0 0.5rem;
    }

    /* icona del menu: tre linee che diventano una X */
    .hamburger {
      position: relative;
      display: block;
      width: 1.375rem;
      height: 1rem;
    }

    .hamburger span {
      position: absolute;
      left: 0;
      width: 100%;
      height: 2px;
      border-radius: 2px;
      background: currentColor;
      transition:
        transform 0.3s cubic-bezier(0.65, 0, 0.35, 1),
        opacity 0.2s ease;
    }

    .hamburger span:nth-child(1) {
      top: 0;
    }

    .hamburger span:nth-child(2) {
      top: calc(50% - 1px);
    }

    .hamburger span:nth-child(3) {
      bottom: 0;
    }

    .hamburger.aperto span:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }

    .hamburger.aperto span:nth-child(2) {
      opacity: 0;
      transform: scaleX(0.2);
    }

    .hamburger.aperto span:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }

    /* velo scuro dietro il menu: sfuma dentro e fuori */
    .velo {
      position: fixed;
      inset: 4rem 0 0;
      background: rgb(15 23 42 / 0.45);
      opacity: 0;
      visibility: hidden;
      transition:
        opacity 0.3s ease,
        visibility 0.3s;
    }

    .velo.aperto {
      opacity: 1;
      visibility: visible;
    }

    /*
     * Pannello del menu su telefono: scende e sfuma; le voci entrano una dopo l'altra (--i).
     * Chiuso resta nell'HTML (link visibili a Google) ma invisibile e non raggiungibile con la tastiera.
     */
    @media (max-width: 767.98px) {
      .menu-mobile {
        visibility: hidden;
        opacity: 0;
        transform: translateY(-12px);
        transform-origin: top;
        transition:
          opacity 0.25s ease,
          transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
          visibility 0.3s;
      }

      .menu-mobile.aperto {
        visibility: visible;
        opacity: 1;
        transform: translateY(0);
      }

      .menu-mobile > li {
        opacity: 0;
        transform: translateY(-8px);
        transition:
          opacity 0.3s ease,
          transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
      }

      .menu-mobile.aperto > li {
        opacity: 1;
        transform: translateY(0);
        transition-delay: calc(60ms + var(--i, 0) * 55ms);
      }
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
        /* allineata a destra della voce: le voci stanno a destra dell'header, così non esce dallo schermo */
        right: -0.5rem;
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
      .freccia-giu,
      .velo,
      .hamburger span,
      .menu-mobile,
      .menu-mobile > li {
        transition: none !important;
        transform: none !important;
      }

      /* la X resta comunque una X, solo senza animazione */
      .hamburger.aperto span:nth-child(1) {
        transform: translateY(7px) rotate(45deg) !important;
      }

      .hamburger.aperto span:nth-child(3) {
        transform: translateY(-7px) rotate(-45deg) !important;
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

  constructor() {
    // con il menu mobile aperto la pagina sotto non scorre (classe su <html>, vedi styles.css)
    const documento = inject(DOCUMENT);
    effect(() => documento.documentElement.classList.toggle('menu-aperto', this.aperto()));
  }

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
