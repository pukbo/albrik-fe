import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { adminSessioneScadutaInterceptor } from './admin/admin-auth';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // parametri, query param e dati dei resolver arrivano ai componenti come input()
      withComponentInputBinding(),
      // anchorScrolling: i link con fragment (es. /catalogo#caldaie) scorrono alla sezione
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      // passaggio animato tra le pagine (stile in styles.css); i browser senza supporto cambiano pagina normalmente
      withViewTransitions({ skipInitialTransition: true }),
    ),
    // la protezione CSRF (cookie XSRF-TOKEN -> header X-XSRF-TOKEN) è attiva di default in HttpClient
    provideHttpClient(withFetch(), withInterceptors([adminSessioneScadutaInterceptor])),
    // l'HTML del server viene riusato nel browser e le chiamate HTTP non vengono ripetute
    provideClientHydration(withEventReplay()),
  ],
};
