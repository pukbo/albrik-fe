/**
 * Onda al clic sui pulsanti con classe "pulsante": un cerchio che si allarga dal punto cliccato
 * (stile in styles.css, .onda-clic). Un solo listener per tutta la pagina, attivato solo nel browser.
 */
export function attivaOndaAlClic(documento: Document): void {
  documento.addEventListener('pointerdown', (evento: PointerEvent) => {
    const pulsante = (evento.target as Element | null)?.closest<HTMLElement>('.pulsante');
    if (!pulsante || evento.button !== 0) return;

    const area = pulsante.getBoundingClientRect();
    const diametro = Math.max(area.width, area.height) * 2.2;
    const onda = documento.createElement('span');
    onda.className = 'onda-clic';
    onda.setAttribute('aria-hidden', 'true');
    onda.style.width = onda.style.height = `${diametro}px`;
    onda.style.left = `${evento.clientX - area.left - diametro / 2}px`;
    onda.style.top = `${evento.clientY - area.top - diametro / 2}px`;
    pulsante.appendChild(onda);
    // rimozione a fine animazione; il timer copre i casi in cui animationend non arriva
    // (scheda in background, animazioni disattivate con "riduci movimento")
    onda.addEventListener('animationend', () => onda.remove(), { once: true });
    setTimeout(() => onda.remove(), 800);
  });
}
