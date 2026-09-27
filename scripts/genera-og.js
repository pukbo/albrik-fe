// Immagine di anteprima social (1200×630) e logo completo in SVG con il testo in tracciati (non serve il font).
// Uso (da Abrik-fe): node scripts/genera-og.js   — richiede sharp e opentype.js (npm i --no-save sharp opentype.js).
const opentype = require('opentype.js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const FONT = path.join(__dirname, '..', 'node_modules', '@fontsource', 'outfit', 'files');
const carica = (file) => opentype.parse(fs.readFileSync(path.join(FONT, file)).buffer);
const bold = carica('outfit-latin-700-normal.woff');
const medium = carica('outfit-latin-500-normal.woff');
const FE = path.join(__dirname, '..', 'public');

const GOCCIA = 'M32 5 C32 5 12 27 12 40 A20 20 0 0 0 52 40 C52 27 32 5 32 5 Z';
const FIAMMA = 'M32 24 C34 30 42 33 42 42 A10 10 0 0 1 22 42 C22 37 25 34 27 32 C27 36 29 38 31 38 C29 33 30 28 32 24 Z';

/** Testo in un unico tracciato SVG; spaziatura extra tra le lettere in unità em. */
function testo(font, stringa, x, y, dimensione, spaziatura = 0) {
  let cursore = x;
  const d = [];
  for (const car of stringa) {
    const glifo = font.charToGlyph(car);
    d.push(glifo.getPath(cursore, y, dimensione).toPathData(2));
    cursore += (glifo.advanceWidth / font.unitsPerEm) * dimensione + spaziatura * dimensione;
  }
  return { d: d.join(' '), larghezza: cursore - x };
}

function simbolo(x, y, scala, blu, arancio) {
  return `<g transform="translate(${x} ${y}) scale(${scala})"><path d="${GOCCIA}" fill="${blu}"/><path d="${FIAMMA}" fill="${arancio}"/></g>`;
}

(async () => {
  // --- Anteprima social: logo su blu notte + servizi ---
  const nome = testo(bold, 'Albrik', 470, 340, 132);
  const tagline = testo(medium, 'IMPIANTI · CASERTA', 476, 400, 30, 0.2);
  const servizi = testo(medium, 'Caldaie · Bagni · Climatizzazione', 150, 560, 34);
  const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#172554"/>
    ${simbolo(150, 165, 4.6, '#3b82f6', '#fb923c')}
    <path d="${nome.d}" fill="#ffffff"/>
    <path d="${tagline.d}" fill="#bfdbfe"/>
    <rect x="150" y="500" width="90" height="6" rx="3" fill="#fb923c"/>
    <path d="${servizi.d}" fill="#ffffff"/>
  </svg>`;
  // toBuffer + writeFileSync: libvips non gestisce i percorsi Windows oltre 260 caratteri
  fs.writeFileSync(path.join(FE, 'og-albrik.png'),
    await sharp(Buffer.from(og)).png({ compressionLevel: 9, palette: true }).toBuffer());

  // --- Logo completo in SVG (chiaro e scuro), per documenti, stampa, social ---
  for (const [file, colori] of [
    ['logo-albrik.svg', { blu: '#1e40af', arancio: '#f97316', nome: '#172554', tag: '#475569' }],
    ['logo-albrik-negativo.svg', { blu: '#3b82f6', arancio: '#fb923c', nome: '#ffffff', tag: '#bfdbfe' }],
  ]) {
    const n = testo(bold, 'Albrik', 72, 44, 36);
    const t = testo(medium, 'IMPIANTI · CASERTA', 73, 62, 11, 0.18);
    const larghezza = Math.ceil(72 + Math.max(n.larghezza, t.larghezza) + 4);
    fs.writeFileSync(path.join(FE, file),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${larghezza} 66" role="img" aria-label="Albrik – Impianti Caserta">` +
      simbolo(0, 0, 1, colori.blu, colori.arancio) +
      `<path d="${n.d}" fill="${colori.nome}"/><path d="${t.d}" fill="${colori.tag}"/></svg>`);
  }

  for (const f of ['og-albrik.png', 'logo-albrik.svg', 'logo-albrik-negativo.svg']) {
    console.log(f, fs.statSync(path.join(FE, f)).size);
  }
})();
