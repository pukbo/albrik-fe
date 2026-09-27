/**
 * Foto dei servizi: il backend salva due versioni WebP 16:9, "…-1600.webp" (1600×900) e "…-800.webp" (800×450).
 * Il DB contiene il percorso della versione grande (/media/servizi/…-1600.webp).
 */
export interface FotoServizio {
  src: string;
  srcset: string;
  larghezza: number;
  altezza: number;
}

/** Foto dei prodotti del catalogo: quadrate su fondo bianco, "…-1000.webp" (1000×1000) e "…-500.webp" (500×500). */
export function fotoProdotto(percorso: string | null | undefined): FotoServizio | null {
  if (!percorso) return null;
  const piccola = percorso.replace(/-1000\.webp$/, '-500.webp');
  return { src: percorso, srcset: `${piccola} 500w, ${percorso} 1000w`, larghezza: 1000, altezza: 1000 };
}

export function fotoServizio(percorso: string | null | undefined): FotoServizio | null {
  if (!percorso) return null;
  const piccola = percorso.replace(/-1600\.webp$/, '-800.webp');
  return { src: percorso, srcset: `${piccola} 800w, ${percorso} 1600w`, larghezza: 1600, altezza: 900 };
}
