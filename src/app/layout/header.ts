import { Component, DOCUMENT, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
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
 * Testata del sito.
 * - Da tablet in su: due tendine (Servizi e Catalogo) aperte al passaggio del mouse o con il pulsante.
 * - Su telefono: pannello a tutto schermo che entra da destra, con le sezioni a fisarmonica.
 * I link di tendine e pannello sono sempre nell'HTML (anche renderizzato sul server) e vengono solo
 * nascosti con il CSS: così Google li segue da ogni pagina.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Logo, ServizioIcona],
  host: {
    // sticky sull'elemento host: un <header> sticky dentro <app-header> resterebbe confinato
    // nel suo contenitore (alto quanto lui) e scorrerebbe via con la pagina.
    // z-50: il pannello mobile deve stare sopra la barra d'azione in basso (z-40)
    class: 'sticky top-0 z-50 block',
    '(document:keydown.escape)': 'esc()',
    '(document:click)': 'clicFuori($event)',
  },
  template: `
    <!-- bianco pieno: una testata semitrasparente sopra le fasce blu diventerebbe grigia -->
    <header class="testata-sito border-b border-slate-200 bg-white">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a routerLink="/" [attr.aria-label]="site.nome + ', torna alla home'" (click)="chiudiSezione()">
          <app-logo [dimensione]="36" />
        </a>

        <!-- Telefono: apre il pannello a tutto schermo -->
        <button
          #pulsanteMenu
          type="button"
          class="-mr-2 inline-flex size-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
          [attr.aria-expanded]="aperto()"
          aria-controls="menu-mobile"
          (click)="apriMenu()"
        >
          <span class="sr-only">Apri menu</span>
          <span class="hamburger" aria-hidden="true"><span></span><span></span><span></span></span>
        </button>

        <!-- Da tablet in su: voci con tendina -->
        <nav aria-label="Menu principale" class="hidden md:block">
          <ul class="flex items-center gap-1">
            @for (g of gruppi(); track g.id) {
              <li class="gruppo relative" [class.in-pausa]="inPausa()" (mouseleave)="inPausa.set(false)">
                <button
                  type="button"
                  class="flex items-center gap-1.5 rounded-lg px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
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
                          <a [routerLink]="v.path" routerLinkActive="bg-blue-50" ariaCurrentWhenActive="page" (click)="chiudiTendina()"
                            class="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50">
                            <app-servizio-icona [slug]="v.icona" class="size-10 shrink-0 rounded-lg bg-blue-50 p-2 text-blue-800" />
                            <span class="min-w-0">
                              <span class="block font-semibold text-slate-900">{{ v.titolo }}</span>
                              <span class="block text-sm text-slate-600">{{ v.descrizione }}</span>
                            </span>
                          </a>
                        </li>
                      }
                    </ul>
                    <a [routerLink]="g.tutti.path" (click)="chiudiTendina()"
                      class="mt-1 flex items-center justify-between rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-50">
                      {{ g.tutti.etichetta }} <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </li>
            }
            <li>
              <a routerLink="/contatti" routerLinkActive="text-blue-800 bg-blue-50" ariaCurrentWhenActive="page"
                class="block rounded-lg px-4 py-2 font-medium text-slate-700 hover:bg-slate-100">
                Contatti
              </a>
            </li>
            <li>
              <a [href]="telefonoLink"
                class="pulsante ml-2 block rounded-lg bg-orange-700 px-4 py-2 text-center font-semibold text-white hover:bg-orange-800">
                Chiama ora
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>

    <!--
      Telefono: pannello a tutto schermo che entra da destra. Chiuso resta nell'HTML (link per Google)
      ma è fuori schermo, invisibile e "inert" (non raggiungibile con la tastiera né dagli screen reader).
    -->
    <div
      id="menu-mobile"
      class="pannello md:hidden"
      [class.aperto]="aperto()"
      [attr.inert]="aperto() ? null : ''"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <div class="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <a routerLink="/" [attr.aria-label]="site.nome + ', torna alla home'" (click)="chiudiMenu(false)">
          <app-logo [dimensione]="36" [scuro]="true" />
        </a>
        <button #pulsanteChiudi type="button" (click)="chiudiMenu()"
          class="-mr-2 inline-flex size-11 items-center justify-center rounded-lg text-white hover:bg-white/10">
          <span class="sr-only">Chiudi menu</span>
          <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <nav aria-label="Menu principale" class="flex-1 overflow-y-auto overscroll-contain px-5 pt-2 pb-8">
        <ul>
          @for (g of gruppi(); track g.id; let i = $index) {
            <li class="voce border-b border-white/10" [style.--i]="i">
              <button
                type="button"
                class="flex w-full items-center justify-between py-5 text-left font-display text-lg font-bold tracking-wider uppercase"
                [class.text-orange-300]="attivo(g)"
                [attr.aria-expanded]="espanso() === g.id"
                [attr.aria-controls]="'mobile-' + g.id"
                (click)="espandi(g.id)"
              >
                {{ g.etichetta }}
                <span class="piu" [class.meno]="espanso() === g.id" aria-hidden="true"></span>
              </button>

              <!-- fisarmonica: si apre in altezza; da chiusa i link non sono raggiungibili -->
              <div [id]="'mobile-' + g.id" class="fisarmonica" [class.aperta]="espanso() === g.id"
                [attr.inert]="espanso() === g.id ? null : ''">
                <div class="min-h-0 overflow-hidden">
                  <ul class="mb-5 rounded-2xl bg-white/[0.06] p-2">
                    @for (v of g.voci; track v.path; let j = $index) {
                      <li class="sottovoce" [style.--j]="j">
                        <a [routerLink]="v.path" routerLinkActive="bg-white/10" ariaCurrentWhenActive="page" (click)="chiudiMenu(false)"
                          class="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors active:bg-white/10">
                          <app-servizio-icona [slug]="v.icona" class="size-9 shrink-0 rounded-lg bg-white/10 p-2 text-orange-300" />
                          <span class="font-medium">{{ v.titolo }}</span>
                        </a>
                      </li>
                    }
                    <li class="sottovoce" [style.--j]="g.voci.length">
                      <a [routerLink]="g.tutti.path" (click)="chiudiMenu(false)"
                        class="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-orange-300 active:bg-white/10">
                        {{ g.tutti.etichetta }} <span aria-hidden="true">→</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </li>
          }
          <li class="voce border-b border-white/10" [style.--i]="2">
            <a routerLink="/contatti" (click)="chiudiMenu(false)" routerLinkActive="text-orange-300" ariaCurrentWhenActive="page"
              class="flex items-center justify-between py-5 font-display text-lg font-bold tracking-wider uppercase">
              Contatti <span class="text-xl font-normal" aria-hidden="true">→</span>
            </a>
          </li>
        </ul>

        <div class="voce mt-8 space-y-3" [style.--i]="3">
          <!-- azione principale: il preventivo (nella pagina di un servizio parte con quel servizio già scelto) -->
          <a routerLink="/contatti" [queryParams]="parametriPreventivo()" (click)="chiudiMenu(false)"
            class="pulsante flex items-center justify-center gap-2 rounded-xl bg-orange-700 py-4 text-lg font-semibold text-white">
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" aria-hidden="true">
              <path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /><path d="M10 13h6M10 17h4" />
            </svg>
            Richiedi un preventivo gratuito
          </a>
          <a [href]="telefonoLink"
            class="pulsante flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/5 py-3.5 font-semibold text-white active:bg-white/10">
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" aria-hidden="true">
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
            </svg>
            Chiama ora · {{ site.telefono }}
          </a>
          <a [href]="'mailto:' + site.email"
            class="flex min-h-11 items-center justify-center gap-2 text-sm font-medium text-blue-200 active:text-white">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
            </svg>
            {{ site.email }}
          </a>
          <p class="text-center text-sm text-blue-300">Impiantistica a {{ site.zonaServita }} dal {{ site.attivitaDal }}</p>
        </div>
      </nav>
    </div>
  `,
  styles: `
    /* icona del menu: tre linee */
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
    }

    .hamburger span:nth-child(1) {
      top: 0;
    }

    .hamburger span:nth-child(2) {
      top: calc(50% - 1px);
      width: 75%;
      left: 25%;
    }

    .hamburger span:nth-child(3) {
      bottom: 0;
    }

    /* ---------- Pannello mobile a tutto schermo ---------- */
    .pannello {
      position: fixed;
      inset: 0;
      z-index: 60;
      display: flex;
      flex-direction: column;
      height: 100dvh;
      background: linear-gradient(160deg, #172554 0%, #1e3a8a 100%);
      color: white;
      transform: translateX(100%);
      visibility: hidden;
      transition:
        transform 0.45s cubic-bezier(0.7, 0, 0.2, 1),
        visibility 0.45s;
    }

    .pannello.aperto {
      transform: translateX(0);
      visibility: visible;
    }

    /* le voci principali entrano da destra una dopo l'altra (--i) */
    .voce {
      opacity: 0;
      transform: translateX(28px);
      transition:
        opacity 0.3s ease,
        transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .pannello.aperto .voce {
      opacity: 1;
      transform: translateX(0);
      transition-delay: calc(180ms + var(--i, 0) * 70ms);
    }

    /* "+" che diventa "−": la barra verticale ruota e si sovrappone all'orizzontale */
    .piu {
      position: relative;
      width: 1.1rem;
      height: 1.1rem;
      flex-shrink: 0;
      color: #fdba74;
    }

    .piu::before,
    .piu::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      height: 2px;
      margin-top: -1px;
      border-radius: 2px;
      background: currentColor;
      transition: transform 0.35s cubic-bezier(0.65, 0, 0.35, 1);
    }

    .piu::after {
      transform: rotate(90deg);
    }

    .piu.meno::after {
      transform: rotate(180deg);
    }

    /* fisarmonica: altezza animata con grid 0fr -> 1fr (eccezione alla regola transform/opacity: pannello piccolo) */
    .fisarmonica {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .fisarmonica.aperta {
      grid-template-rows: 1fr;
    }

    .sottovoce {
      opacity: 0;
      transform: translateY(-6px);
      transition:
        opacity 0.25s ease,
        transform 0.3s ease;
    }

    .fisarmonica.aperta .sottovoce {
      opacity: 1;
      transform: translateY(0);
      transition-delay: calc(80ms + var(--j, 0) * 45ms);
    }

    /* ---------- Tendine da tablet in su ---------- */
    .freccia-giu {
      transition: transform 0.2s ease;
    }

    .freccia-giu.girata {
      transform: rotate(180deg);
    }

    .sottomenu {
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

    /*
     * Apertura al passaggio del mouse solo con un mouse vero (sui touch il :hover resta "attaccato").
     * Dopo un clic su un link la tendina resta chiusa finché il mouse non esce dalla voce.
     */
    @media (hover: hover) {
      .gruppo:not(.in-pausa):hover .sottomenu {
        visibility: visible;
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .pannello,
      .voce,
      .sottovoce,
      .fisarmonica,
      .piu::before,
      .piu::after,
      .sottomenu,
      .freccia-giu {
        transition: none !important;
      }

      .voce,
      .sottovoce {
        transform: none !important;
      }
    }
  `,
})
export class Header {
  private readonly router = inject(Router);
  private readonly elemento = inject(ElementRef<HTMLElement>);
  private readonly pulsanteMenu = viewChild<ElementRef<HTMLButtonElement>>('pulsanteMenu');
  private readonly pulsanteChiudi = viewChild<ElementRef<HTMLButtonElement>>('pulsanteChiudi');

  protected readonly site = SITE;
  protected readonly telefonoLink = TELEFONO_LINK;
  /** Pannello mobile aperto. */
  protected readonly aperto = signal(false);
  /** Sezione aperta nella fisarmonica del pannello mobile. */
  protected readonly espanso = signal<IdGruppo | null>(null);
  /** Tendina desktop aperta con il pulsante (si apre anche al passaggio del mouse). */
  protected readonly sezione = signal<IdGruppo | null>(null);
  /** Dopo un clic su un link la tendina non si riapre al passaggio del mouse finché il mouse non esce. */
  protected readonly inPausa = signal(false);

  constructor() {
    // con il pannello mobile aperto la pagina sotto non scorre (classe su <html>, vedi styles.css)
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

  /** Nella pagina di un servizio il modulo preventivo si apre con quel servizio già scelto. */
  protected readonly parametriPreventivo = computed(() => {
    const servizio = /^\/servizi\/([a-z0-9-]+)$/.exec(this.url().split(/[?#]/)[0])?.[1];
    return servizio ? { servizio } : {};
  });

  protected attivo(gruppo: GruppoMenu): boolean {
    const percorso = this.url().split(/[?#]/)[0];
    return gruppo.prefissi.some((p) => percorso === p || percorso.startsWith(p + '/'));
  }

  // --- Pannello mobile ---

  protected apriMenu(): void {
    // parte con aperta la sezione della pagina in cui ci si trova (es. Catalogo su una caldaia)
    this.espanso.set(this.gruppi().find((g) => this.attivo(g))?.id ?? null);
    this.aperto.set(true);
    // il cursore della tastiera va dentro il pannello
    setTimeout(() => this.pulsanteChiudi()?.nativeElement.focus(), 50);
  }

  /** @param tornaAlPulsante false quando si chiude perché si va a un'altra pagina */
  protected chiudiMenu(tornaAlPulsante = true): void {
    if (!this.aperto()) return;
    this.aperto.set(false);
    if (tornaAlPulsante) {
      this.pulsanteMenu()?.nativeElement.focus();
    }
  }

  protected espandi(id: IdGruppo): void {
    this.espanso.update((attuale) => (attuale === id ? null : id));
  }

  // --- Tendine desktop ---

  protected alterna(id: IdGruppo): void {
    this.sezione.update((attuale) => (attuale === id ? null : id));
  }

  protected chiudiSezione(): void {
    this.sezione.set(null);
  }

  /** Dopo un clic su un link della tendina: resta chiusa anche se il mouse è ancora sopra. */
  protected chiudiTendina(): void {
    this.sezione.set(null);
    this.inPausa.set(true);
  }

  protected esc(): void {
    this.chiudiSezione();
    this.chiudiMenu();
  }

  protected clicFuori(evento: MouseEvent): void {
    if (!this.elemento.nativeElement.contains(evento.target as Node)) {
      this.sezione.set(null);
    }
  }
}
