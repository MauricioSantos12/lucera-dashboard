// Fuerza el formato "en-US" (coma para miles, punto para decimales) sin
// importar el locale del navegador — evita que en locales es-* los números
// se muestren invertidos (1.200,50 en vez de 1,200.50).
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions
) {
  return value.toLocaleString("en-US", options);
}

export function formatCurrency(value: number, decimals = 2) {
  return `$${formatNumber(value, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
