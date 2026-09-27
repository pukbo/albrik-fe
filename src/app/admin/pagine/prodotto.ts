import { Component, computed, inject, input, linkedSignal, numberAttribute, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { fotoProdotto } from '../../core/immagini';
import { CATEGORIE, CategoriaProdotto, Prodotto } from '../../core/prodotti-api';
import { SITE } from '../../core/site.config';
import { SchedaTecnica } from '../../shared/scheda-tecnica';
import { AdminApi, DatiProdotto, ProdottoAdmin } from '../admin-api';
import { messaggiErrore } from '../errori';
import { creaSlug } from './servizio';

type Valutazione = 'efficienza' | 'smart' | 'silenziosita' | 'fasciaPrezzo';

const CAMPO =
  'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 ' +
  'focus:border-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none';

const META_TITLE_IDEALE = 60;
const META_DESCRIPTION_IDEALE = 160;

/** Criteri da tenere uguali per tutti i modelli, così il confronto nel catalogo è onesto. */
const VALUTAZIONI: { chiave: Valutazione; etichetta: string; guida: string }[] = [
  {
    chiave: 'efficienza',
    etichetta: 'Efficienza energetica',
    guida: 'Classe energetica e rendimento stagionale: 5 = il migliore della gamma che installi.',
  },
  {
    chiave: 'smart',
    etichetta: 'Tecnologia smart',
    guida: '1 = nessun controllo remoto, 3 = termostato Wi-Fi opzionale, 5 = app, diagnostica e modulazione evoluta inclusi.',
  },
  {
    chiave: 'silenziosita',
    etichetta: 'Silenziosità',
    guida: 'Rumorosità dichiarata in dB e percepita in installazione: 5 = quasi impercettibile.',
  },
  {
    chiave: 'fasciaPrezzo',
    etichetta: 'Fascia di prezzo (€ … €€€€€)',
    guida: '1 = la più economica, 5 = premium. Non entra nel livello (LV): è un\'informazione, non un voto.',
  },
];

function vuoto(): DatiProdotto {
  return {
    categoria: 'CALDAIA',
    slug: '',
    marca: '',
    modello: '',
    sommario: '',
    descrizione: '',
    potenzaKw: null,
    classeEnergetica: null,
    efficienza: 3,
    smart: 3,
    silenziosita: 3,
    fasciaPrezzo: 3,
    metaTitle: '',
    metaDescription: '',
    ordine: 10,
    attivo: false,
  };
}

/** Stessi campi e stesso ordine di vuoto(): la bozza si confronta come JSON. */
function datiDi(p: ProdottoAdmin): DatiProdotto {
  const d = p.dati;
  return {
    categoria: d.categoria,
    slug: d.slug,
    marca: d.marca,
    modello: d.modello,
    sommario: d.sommario,
    descrizione: d.descrizione,
    potenzaKw: d.potenzaKw,
    classeEnergetica: d.classeEnergetica,
    efficienza: d.valutazioni.efficienza,
    smart: d.valutazioni.smart,
    silenziosita: d.valutazioni.silenziosita,
    fasciaPrezzo: d.valutazioni.fasciaPrezzo,
    metaTitle: d.metaTitle,
    metaDescription: d.metaDescription,
    ordine: p.ordine,
    attivo: p.attivo,
  };
}

@Component({
  selector: 'app-admin-prodotto',
  imports: [RouterLink, SchedaTecnica],
  template: `
    <a routerLink="/admin/catalogo" class="text-sm font-medium text-blue-800 hover:underline">← Tutto il catalogo</a>

    @if (prodotto.error()) {
      <p role="alert" class="mt-4 rounded-lg bg-red-50 p-4 text-red-800">Modello non trovato.</p>
    } @else if (bozza(); as b) {
      <div class="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">{{ nuovo() ? 'Nuovo modello' : anteprima()?.nome || 'Modello' }}</h1>
          @if (modificato()) { <p class="mt-1 text-sm text-amber-800">Modifiche non salvate</p> }
        </div>
        <div class="flex flex-wrap gap-2">
          @if (!nuovo() && prodotto.value()?.attivo) {
            <a [href]="prodotto.value()?.dati?.percorso" target="_blank" rel="noopener"
              class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">Vedi sul sito ↗</a>
          }
          <button type="button" (click)="salva()" [disabled]="occupato() || !modificato()"
            class="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
            {{ occupato() ? 'Salvataggio…' : nuovo() ? 'Crea modello' : 'Salva' }}
          </button>
        </div>
      </div>

      <div aria-live="polite" class="mt-3 space-y-2">
        @if (errori().length) {
          <div role="alert" class="rounded-lg bg-red-50 p-4 text-sm text-red-800">
            <ul class="list-inside list-disc">@for (e of errori(); track $index) { <li>{{ e }}</li> }</ul>
          </div>
        }
        @if (messaggio()) { <p class="rounded-lg bg-green-50 p-3 text-sm text-green-900">{{ messaggio() }}</p> }
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <section class="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titolo-prodotto">
            <h2 id="titolo-prodotto" class="font-semibold text-slate-900">Prodotto</h2>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label for="categoria" class="text-sm font-medium text-slate-700">Categoria *</label>
                <select id="categoria" [class]="campo" (change)="impostaCategoria(testo($event))">
                  @for (c of categorie; track c.valore) {
                    <option [value]="c.valore" [selected]="b.categoria === c.valore">{{ c.etichetta }}</option>
                  }
                </select>
              </div>
              <div></div>
              <div>
                <label for="marca" class="text-sm font-medium text-slate-700">Marca *</label>
                <input id="marca" type="text" maxlength="80" [class]="campo" [value]="b.marca" (input)="aggiornaNome({ marca: testo($event) })" />
              </div>
              <div>
                <label for="modello" class="text-sm font-medium text-slate-700">Modello *</label>
                <input id="modello" type="text" maxlength="120" [class]="campo" [value]="b.modello" (input)="aggiornaNome({ modello: testo($event) })" />
              </div>
              <div>
                <label for="potenza" class="text-sm font-medium text-slate-700">Potenza (kW)</label>
                <input id="potenza" type="number" min="0.1" max="9999" step="0.1" [class]="campo" [value]="b.potenzaKw ?? ''"
                  (input)="imposta({ potenzaKw: testo($event) === '' ? null : +testo($event) })" />
              </div>
              <div>
                <label for="classe" class="text-sm font-medium text-slate-700">Classe energetica</label>
                <input id="classe" type="text" maxlength="10" list="classi" placeholder="es. A+" [class]="campo" [value]="b.classeEnergetica ?? ''"
                  (input)="imposta({ classeEnergetica: testo($event).trim() || null })" />
                <datalist id="classi">
                  @for (c of classi; track c) { <option [value]="c"></option> }
                </datalist>
              </div>
              <div class="sm:col-span-2">
                <label for="sommario" class="text-sm font-medium text-slate-700">Sommario (card del catalogo) *</label>
                <textarea id="sommario" rows="2" maxlength="300" [class]="campo" [value]="b.sommario" (input)="imposta({ sommario: testo($event) })"></textarea>
                <p class="mt-1 text-xs text-slate-500">{{ b.sommario.length }}/300</p>
              </div>
              <div class="sm:col-span-2">
                <label for="descrizione" class="text-sm font-medium text-slate-700">Descrizione completa *</label>
                <textarea id="descrizione" rows="8" maxlength="10000" [class]="campo" [value]="b.descrizione" (input)="imposta({ descrizione: testo($event) })"></textarea>
                <p class="mt-1 text-xs text-slate-500">
                  Scrivi con parole tue (non copiare i testi del produttore: Google penalizza i contenuti duplicati).
                  Per chi è adatta, punti di forza, garanzia, detrazioni.
                </p>
              </div>
            </div>
          </section>

          <section class="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titolo-valutazioni">
            <h2 id="titolo-valutazioni" class="font-semibold text-slate-900">Valutazioni da 1 a 5</h2>
            <div class="mt-4 space-y-5">
              @for (v of valutazioni; track v.chiave) {
                <div>
                  <div class="flex items-center justify-between gap-3">
                    <label [for]="'val-' + v.chiave" class="text-sm font-medium text-slate-700">{{ v.etichetta }}</label>
                    <span class="font-mono text-sm font-bold text-slate-900">{{ b[v.chiave] }}/5</span>
                  </div>
                  <input [id]="'val-' + v.chiave" type="range" min="1" max="5" step="1" class="mt-2 w-full accent-orange-700"
                    [value]="b[v.chiave]" (input)="impostaValutazione(v.chiave, +testo($event))"
                    [attr.aria-describedby]="'guida-' + v.chiave" />
                  <p [id]="'guida-' + v.chiave" class="mt-1 text-xs text-slate-500">{{ v.guida }}</p>
                </div>
              }
            </div>
          </section>

          <section class="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titolo-seo">
            <h2 id="titolo-seo" class="font-semibold text-slate-900">SEO</h2>
            <div class="mt-4 space-y-4">
              <div>
                <label for="slug" class="text-sm font-medium text-slate-700">Slug (indirizzo della pagina) *</label>
                <div class="mt-1 flex items-center rounded-lg border border-slate-300 bg-slate-50 focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-200">
                  <span class="pl-3 text-sm text-slate-500">/{{ percorsoCategoria() }}/</span>
                  <input id="slug" type="text" maxlength="120" class="w-full rounded-r-lg bg-white px-2 py-2 focus:outline-none"
                    [value]="b.slug" (input)="aggiornaSlug(testo($event))" />
                </div>
                @if (percorsoCambiato()) {
                  <p class="mt-1 text-sm text-amber-800">
                    L'indirizzo cambia: il vecchio verrà reindirizzato automaticamente (redirect 301).
                  </p>
                }
              </div>
              <div>
                <div class="flex items-center justify-between gap-3">
                  <label for="meta-title" class="text-sm font-medium text-slate-700">Meta title *</label>
                  <button type="button" (click)="suggerisciMeta()" [disabled]="!b.marca || !b.modello"
                    class="text-sm font-semibold text-blue-800 hover:underline disabled:opacity-50">Suggerisci title e description</button>
                </div>
                <input id="meta-title" type="text" maxlength="70" [class]="campo" [value]="b.metaTitle" (input)="imposta({ metaTitle: testo($event) })" />
                <p class="mt-1 text-xs" [class]="b.metaTitle.length > metaTitleIdeale ? 'text-amber-800' : 'text-slate-500'">
                  {{ b.metaTitle.length }}/{{ metaTitleIdeale }} consigliati.
                </p>
              </div>
              <div>
                <label for="meta-description" class="text-sm font-medium text-slate-700">Meta description *</label>
                <textarea id="meta-description" rows="3" maxlength="170" [class]="campo" [value]="b.metaDescription" (input)="imposta({ metaDescription: testo($event) })"></textarea>
                <p class="mt-1 text-xs" [class]="b.metaDescription.length > metaDescriptionIdeale ? 'text-amber-800' : 'text-slate-500'">
                  {{ b.metaDescription.length }}/{{ metaDescriptionIdeale }} consigliati.
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside class="space-y-6">
          @if (anteprima(); as p) {
            <section aria-labelledby="titolo-anteprima-scheda">
              <h2 id="titolo-anteprima-scheda" class="mb-3 font-semibold text-slate-900">Anteprima della scheda</h2>
              <app-scheda-tecnica [prodotto]="p" />
            </section>
          }

          <section class="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titolo-pubblicazione">
            <h2 id="titolo-pubblicazione" class="font-semibold text-slate-900">Pubblicazione</h2>
            <label class="mt-4 flex items-center gap-3">
              <input type="checkbox" class="size-5 accent-blue-800" [checked]="b.attivo"
                (change)="imposta({ attivo: $any($event.target).checked })" />
              <span class="text-sm text-slate-800">Online (catalogo, sitemap e modulo contatti)</span>
            </label>
            <label for="ordine" class="mt-4 block text-sm font-medium text-slate-700">Ordine di visualizzazione</label>
            <input id="ordine" type="number" min="0" max="9999" [class]="campo" [value]="b.ordine"
              (input)="imposta({ ordine: +testo($event) || 0 })" />
            <p class="mt-1 text-xs text-slate-500">I numeri più bassi vengono mostrati per primi.</p>
          </section>

          <section class="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titolo-foto">
            <h2 id="titolo-foto" class="font-semibold text-slate-900">Foto</h2>
            @if (nuovo()) {
              <p class="mt-3 text-sm text-slate-600">Potrai caricare la foto dopo aver creato il modello.</p>
            } @else {
              @if (foto(); as f) {
                <img [src]="f.src" [srcset]="f.srcset" sizes="320px" [width]="f.larghezza" [height]="f.altezza"
                  [alt]="'Foto attuale di ' + anteprima()?.nome" class="mt-4 aspect-square w-full rounded-lg border border-slate-200 object-contain" />
              } @else {
                <p class="mt-3 text-sm text-slate-600">Nessuna foto: sul sito viene mostrato il simbolo di Albrik.</p>
              }
              <label for="foto" class="mt-4 inline-block cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 has-[:disabled]:cursor-default has-[:disabled]:opacity-60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-300">
                {{ caricamento() ? 'Caricamento…' : foto() ? 'Sostituisci foto' : 'Carica foto' }}
                <input id="foto" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only"
                  [disabled]="caricamento()" (change)="caricaFoto($event)" />
              </label>
              @if (foto()) {
                <button type="button" (click)="rimuoviFoto()" [disabled]="caricamento()"
                  class="ml-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">Rimuovi</button>
              }
              <p class="mt-2 text-xs text-slate-500">
                JPG, PNG o WebP fino a 10 MB. Viene inserita intera in un quadrato su fondo bianco (niente ritagli) e
                convertita in WebP. Usa foto di cui hai i diritti: quelle dei produttori vanno autorizzate (area rivenditori).
              </p>
            }
          </section>
        </aside>
      </div>
    } @else {
      <p class="mt-4 text-slate-500">Caricamento…</p>
    }
  `,
})
export default class AdminProdotto {
  /** Assente sulla route /admin/catalogo/nuovo. */
  readonly id = input(undefined, { transform: (v: unknown) => (v === undefined ? undefined : numberAttribute(v)) });

  private readonly api = inject(AdminApi);
  private readonly router = inject(Router);

  protected readonly campo = CAMPO;
  protected readonly metaTitleIdeale = META_TITLE_IDEALE;
  protected readonly metaDescriptionIdeale = META_DESCRIPTION_IDEALE;
  protected readonly valutazioni = VALUTAZIONI;
  protected readonly classi = ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D'];
  protected readonly categorie = Object.entries(CATEGORIE).map(([valore, c]) => ({ valore, etichetta: c.plurale }));

  protected readonly nuovo = computed(() => this.id() === undefined);

  protected readonly prodotto = rxResource({
    params: () => this.id(),
    stream: ({ params }) => (params === undefined ? of(null) : this.api.prodotto(params)),
  });

  protected readonly bozza = linkedSignal<DatiProdotto | null>(() => {
    if (this.nuovo()) return vuoto();
    const p = this.prodotto.value();
    return p ? datiDi(p) : null;
  });

  /** Nei modelli nuovi lo slug segue marca e modello finché non viene modificato a mano. */
  private readonly slugManuale = signal(false);

  protected readonly modificato = computed(() => {
    const p = this.prodotto.value();
    return JSON.stringify(this.bozza()) !== JSON.stringify(p ? datiDi(p) : vuoto());
  });
  protected readonly percorsoCategoria = computed(() => CATEGORIE[this.bozza()?.categoria ?? 'CALDAIA'].percorso);
  protected readonly percorsoCambiato = computed(() => {
    const p = this.prodotto.value();
    const b = this.bozza();
    return !!p && !!b && p.attivo && (b.slug !== p.dati.slug || b.categoria !== p.dati.categoria);
  });

  /** La bozza nella forma pubblica, per l'anteprima della scheda tecnica. */
  protected readonly anteprima = computed<Prodotto | null>(() => {
    const b = this.bozza();
    if (!b) return null;
    const salvato = this.prodotto.value()?.dati;
    return {
      categoria: b.categoria,
      slug: b.slug,
      percorso: `/${CATEGORIE[b.categoria].percorso}/${b.slug}`,
      marca: b.marca,
      modello: b.modello,
      nome: `${b.marca} ${b.modello}`.trim(),
      sommario: b.sommario,
      descrizione: b.descrizione,
      potenzaKw: b.potenzaKw,
      classeEnergetica: b.classeEnergetica,
      valutazioni: {
        efficienza: b.efficienza,
        smart: b.smart,
        silenziosita: b.silenziosita,
        fasciaPrezzo: b.fasciaPrezzo,
        // come nel backend (ProdottoDto): il prezzo non conta nel livello
        livello: Math.round((b.efficienza + b.smart + b.silenziosita) / 3),
      },
      metaTitle: b.metaTitle,
      metaDescription: b.metaDescription,
      immagine: salvato?.immagine ?? null,
      ultimaModifica: salvato?.ultimaModifica ?? null,
    };
  });

  protected readonly foto = computed(() => fotoProdotto(this.prodotto.value()?.dati.immagine));
  protected readonly caricamento = signal(false);
  protected readonly occupato = signal(false);
  protected readonly errori = signal<string[]>([]);
  protected readonly messaggio = signal('');

  protected testo(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  /** Applica le modifiche all'ultimo valore della bozza (mai alla copia del template). */
  protected imposta(modifica: Partial<DatiProdotto>): void {
    this.bozza.update((b) => (b ? { ...b, ...modifica } : b));
  }

  protected impostaCategoria(valore: string): void {
    this.imposta({ categoria: valore as CategoriaProdotto });
  }

  protected impostaValutazione(chiave: Valutazione, valore: number): void {
    this.imposta({ [chiave]: Math.min(5, Math.max(1, valore)) });
  }

  protected aggiornaNome(modifica: { marca?: string; modello?: string }): void {
    this.bozza.update((b) => {
      if (!b) return b;
      const aggiornata = { ...b, ...modifica };
      if (this.nuovo() && !this.slugManuale()) {
        aggiornata.slug = creaSlug(`${aggiornata.marca} ${aggiornata.modello}`);
      }
      return aggiornata;
    });
  }

  protected aggiornaSlug(slug: string): void {
    this.slugManuale.set(true);
    this.imposta({ slug });
  }

  /** Testi di partenza da rifinire a mano: nome del modello, categoria e zona. */
  protected suggerisciMeta(): void {
    const b = this.bozza();
    if (!b) return;
    const nome = `${b.marca} ${b.modello}`.trim();
    const cat = CATEGORIE[b.categoria];
    const titolo = `${nome} – ${cat.tipo} | ${SITE.nome}`;
    this.imposta({
      metaTitle: titolo.length <= 70 ? titolo : `${nome} | ${SITE.nome}`.slice(0, 70),
      metaDescription: (
        `${nome}: ${cat.singolare}${b.classeEnergetica ? ' in classe ' + b.classeEnergetica : ''}, ` +
        `scheda tecnica e installazione a ${SITE.zonaServita} con ${SITE.nome}. Preventivo gratuito.`
      ).slice(0, 170),
    });
  }

  protected async caricaFoto(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    const id = this.id();
    if (!file || id === undefined) return;
    if (file.size > 10 * 1024 * 1024) {
      this.errori.set(['File troppo grande (massimo 10 MB)']);
      return;
    }
    await this.operazioneFoto(() => firstValueFrom(this.api.caricaImmagineProdotto(id, file)), 'Foto caricata: è già online.');
  }

  protected async rimuoviFoto(): Promise<void> {
    const id = this.id();
    if (id === undefined || !confirm('Rimuovere la foto del modello?')) return;
    await this.operazioneFoto(() => firstValueFrom(this.api.eliminaImmagineProdotto(id)), 'Foto rimossa.');
  }

  /** La foto si salva subito e da sola: le altre modifiche della bozza restano in sospeso. */
  private async operazioneFoto(azione: () => Promise<ProdottoAdmin>, esito: string): Promise<void> {
    this.caricamento.set(true);
    this.errori.set([]);
    this.messaggio.set('');
    const bozzaInCorso = this.bozza();
    try {
      this.prodotto.set(await azione());
      this.bozza.set(bozzaInCorso);
      this.messaggio.set(esito);
    } catch (e) {
      this.errori.set(messaggiErrore(e));
    } finally {
      this.caricamento.set(false);
    }
  }

  protected async salva(): Promise<void> {
    const dati = this.bozza();
    if (!dati) return;
    this.occupato.set(true);
    this.errori.set([]);
    this.messaggio.set('');
    try {
      const id = this.id();
      if (id === undefined) {
        const creato = await firstValueFrom(this.api.creaProdotto(dati));
        await this.router.navigate(['/admin/catalogo', creato.id]);
      } else {
        this.prodotto.set(await firstValueFrom(this.api.aggiornaProdotto(id, dati)));
        this.messaggio.set(dati.attivo ? 'Salvato: le modifiche sono già online.' : 'Salvato (modello non attivo, non visibile sul sito).');
      }
    } catch (e) {
      this.errori.set(messaggiErrore(e));
    } finally {
      this.occupato.set(false);
    }
  }
}
