import { Component } from '@angular/core';

/** I quattro passi del lavoro con Albrik, in home e nelle pagine dei servizi. */
@Component({
  selector: 'app-come-lavoriamo',
  template: `
    <section class="mx-auto max-w-6xl px-4 py-12 md:py-20" aria-labelledby="titolo-come">
      <div class="text-center sm:text-left">
        <p class="font-semibold tracking-wide text-orange-700 uppercase">Semplice e trasparente</p>
        <h2 id="titolo-come" class="mt-2 text-3xl font-bold text-blue-950 md:text-4xl">Come lavoriamo</h2>
        <span class="mx-auto mt-4 block h-1 w-12 rounded-full bg-orange-500 sm:mx-0" aria-hidden="true"></span>
      </div>
      <!-- su telefono: linea del tempo verticale (numero a sinistra); da tablet in su: quattro colonne -->
      <ol class="mt-8 grid gap-6 md:mt-10 md:grid-cols-4 md:gap-8">
        @for (passo of passi; track passo.titolo; let i = $index, ultimo = $last) {
          <li class="rivela relative flex gap-4 md:block">
            @if (!ultimo) {
              <!-- linea di collegamento: verticale su telefono, orizzontale su schermi larghi -->
              <span class="absolute top-12 bottom-[-1.5rem] left-6 w-0.5 bg-slate-200 md:top-6 md:bottom-auto md:left-14 md:h-0.5 md:w-[calc(100%-3rem)]" aria-hidden="true"></span>
            }
            <span class="font-display relative inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-700 text-lg font-bold text-white">
              {{ i + 1 }}
            </span>
            <div class="pt-2 md:pt-0">
              <h3 class="text-lg font-bold text-slate-900 md:mt-4">{{ passo.titolo }}</h3>
              <p class="mt-1 text-slate-600 md:mt-2">{{ passo.testo }}</p>
            </div>
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
