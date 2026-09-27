import { Component } from '@angular/core';

/** I quattro passi del lavoro con Albrik, in home e nelle pagine dei servizi. */
@Component({
  selector: 'app-come-lavoriamo',
  template: `
    <section class="mx-auto max-w-6xl px-4 py-16 md:py-20" aria-labelledby="titolo-come">
      <p class="font-semibold tracking-wide text-orange-700 uppercase">Semplice e trasparente</p>
      <h2 id="titolo-come" class="mt-2 text-3xl font-bold text-blue-950 md:text-4xl">Come lavoriamo</h2>
      <ol class="mt-10 grid gap-8 md:grid-cols-4">
        @for (passo of passi; track passo.titolo; let i = $index, ultimo = $last) {
          <li class="rivela relative">
            <!-- linea di collegamento tra i passi (solo su schermi larghi) -->
            @if (!ultimo) {
              <span class="absolute top-6 left-14 hidden h-0.5 w-[calc(100%-3rem)] bg-slate-200 md:block" aria-hidden="true"></span>
            }
            <span class="font-display relative inline-flex size-12 items-center justify-center rounded-full bg-orange-700 text-lg font-bold text-white">
              {{ i + 1 }}
            </span>
            <h3 class="mt-4 text-lg font-bold text-slate-900">{{ passo.titolo }}</h3>
            <p class="mt-2 text-slate-600">{{ passo.testo }}</p>
          </li>
        }
      </ol>
    </section>
  `,
})
export class ComeLavoriamo {
  protected readonly passi = [
    { titolo: 'Ci contatti', testo: 'Compila il modulo online o chiamaci: ti rispondiamo in giornata.' },
    { titolo: 'Sopralluogo gratuito', testo: 'Veniamo a vedere l’impianto e ascoltiamo cosa ti serve.' },
    { titolo: 'Preventivo chiaro', testo: 'Ricevi il preventivo via email e puoi accettarlo online in un clic.' },
    { titolo: 'Lavori e certificazione', testo: 'Installiamo a regola d’arte e ti consegniamo la documentazione.' },
  ];
}
