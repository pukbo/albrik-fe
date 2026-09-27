# Albrik – Frontend

Frontend del sito di Albrik (impiantistica: caldaie, rinnovo bagno, climatizzazione).

- **Stack:** Angular 22 con SSR (Server-Side Rendering), Tailwind CSS 4
- **Backend:** [albrik-be](https://github.com/pukbo/albrik-be)

## Avvio in locale

Serve il backend avviato su http://localhost:8081, poi:

```bash
npm install
npm start
```

Il sito è su http://localhost:4200, già renderizzato lato server.
Il pannello admin è su http://localhost:4200/admin (credenziali di sviluppo nel `application.yml` del backend).

In sviluppo `ng serve` inoltra `/api` al backend tramite `proxy.conf.json`: le API admin usano URL relativi,
necessari perché Angular invii il token CSRF.

## Struttura

| Percorso                          | Contenuto                                                      |
|-----------------------------------|----------------------------------------------------------------|
| `src/app/core/site.config.ts`     | Dati aziendali (telefono, indirizzo, email): **modificare qui** |
| `src/app/core/seo.ts`             | Title, meta description, canonical e JSON-LD per ogni pagina    |
| `src/app/core/structured-data.ts` | JSON-LD Schema.org (`HVACBusiness`, `Service`)                  |
| `src/app/pages/`                  | Home, elenco servizi, dettaglio servizio, contatti, privacy, 404 |
| `src/app/admin/`                  | Pannello admin (solo nel browser, niente SSR): login, richieste, preventivi, servizi |
| `src/server.ts`                   | Server Node/Express per l'SSR, espone anche `/sitemap.xml`      |
| `src/environments/`               | URL delle API in sviluppo e in produzione                       |

## Build di produzione

```bash
npm run build
npm run serve:ssr:albrik-fe
```
