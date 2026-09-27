// Genera favicon, icone app e logo per il PDF (logo "goccia e fiamma") a partire dal simbolo SVG.
// Uso (da Abrik-fe): node scripts/genera-icone.js   — richiede sharp (npm i --no-save sharp).
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const FE = path.join(__dirname, '..', 'public');
const BE = path.join(__dirname, '..', '..', 'Abrik-be', 'src', 'main', 'resources', 'templates', 'pdf');
fs.mkdirSync(FE, { recursive: true });
fs.mkdirSync(BE, { recursive: true });

const GOCCIA = 'M32 5 C32 5 12 27 12 40 A20 20 0 0 0 52 40 C52 27 32 5 32 5 Z';
const FIAMMA = 'M32 24 C34 30 42 33 42 42 A10 10 0 0 1 22 42 C22 37 25 34 27 32 C27 36 29 38 31 38 C29 33 30 28 32 24 Z';

/** Simbolo in un quadrato di lato 64, eventualmente ridotto (scala) e centrato su uno sfondo. */
function simbolo({ sfondo = null, scala = 1, raggio = 0 } = {}) {
  const t = (64 - 64 * scala) / 2;
  const fondo = sfondo ? `<rect width="64" height="64" rx="${raggio}" fill="${sfondo}"/>` : '';
  // la goccia occupa y 5..60: la sposto di 0.5 in giù per centrarla otticamente
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${fondo}` +
    `<g transform="translate(${t} ${t + 0.5 * scala}) scale(${scala})">` +
    `<path d="${GOCCIA}" fill="#1e40af"/><path d="${FIAMMA}" fill="#f97316"/></g></svg>`;
}

async function png(svg, lato, file) {
  const buf = await sharp(Buffer.from(svg), { density: 72 * (lato / 64) * 2 }).resize(lato, lato).png({ compressionLevel: 9 }).toBuffer();
  if (file) fs.writeFileSync(file, buf);
  return buf;
}

/** ICO con immagini PNG incorporate (formato supportato da tutti i browser moderni). */
function ico(immagini) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(immagini.length, 4);
  const voci = []; let offset = 6 + 16 * immagini.length;
  for (const { lato, dati } of immagini) {
    const v = Buffer.alloc(16);
    v.writeUInt8(lato === 256 ? 0 : lato, 0); v.writeUInt8(lato === 256 ? 0 : lato, 1);
    v.writeUInt8(0, 2); v.writeUInt8(0, 3); v.writeUInt16LE(1, 4); v.writeUInt16LE(32, 6);
    v.writeUInt32LE(dati.length, 8); v.writeUInt32LE(offset, 12);
    offset += dati.length; voci.push(v);
  }
  return Buffer.concat([header, ...voci, ...immagini.map((i) => i.dati)]);
}

(async () => {
  // favicon vettoriale: simbolo pieno, sfondo trasparente
  fs.writeFileSync(path.join(FE, 'favicon.svg'), simbolo());
  fs.writeFileSync(path.join(FE, 'logo-simbolo.svg'), simbolo());

  // favicon.ico 16/32/48
  const lati = [16, 32, 48];
  const immagini = [];
  for (const lato of lati) immagini.push({ lato, dati: await png(simbolo(), lato) });
  fs.writeFileSync(path.join(FE, 'favicon.ico'), ico(immagini));

  // iPhone/iPad: sfondo pieno (iOS non gestisce la trasparenza), margine attorno al simbolo
  await png(simbolo({ sfondo: '#ffffff', scala: 0.74 }), 180, path.join(FE, 'apple-touch-icon.png'));
  // Android / manifest: "maskable" con area sicura (simbolo entro l'80% centrale)
  await png(simbolo({ sfondo: '#ffffff', scala: 0.62 }), 192, path.join(FE, 'icon-192.png'));
  await png(simbolo({ sfondo: '#ffffff', scala: 0.62 }), 512, path.join(FE, 'icon-512.png'));

  // PDF dei preventivi: simbolo ad alta risoluzione, sfondo trasparente
  await png(simbolo(), 256, path.join(BE, 'logo-simbolo.png'));

  for (const f of fs.readdirSync(FE)) console.log('fe/public/' + f, fs.statSync(path.join(FE, f)).size);
  console.log('pdf/logo-simbolo.png', fs.statSync(path.join(BE, 'logo-simbolo.png')).size);
})();
