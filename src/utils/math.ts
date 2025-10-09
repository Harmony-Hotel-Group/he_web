/**
 * range(start, stop, step)
 * Genera un array de números similar al range() de Python.
 */
export const range = (start, stop, step = 1, autoAjust = true) => {
    // Si solo se pasa un argumento, se interpreta como stop
    if (stop === undefined) {
        stop = start;
        start = 0;
    }

    // Evitar bucles infinitos
    if (step === 0) throw new Error("step no puede ser 0");

    // Calcular longitud del array
    const length = Math.max(Math.ceil((stop - (start - (autoAjust ? 1 : 0))) / step), 0);

    // Generar array
    return Array.from({ length }, (_, i) => start + i * step);
};
