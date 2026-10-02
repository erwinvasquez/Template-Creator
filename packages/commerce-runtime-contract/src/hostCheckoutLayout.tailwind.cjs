/**
 * Clases de checkout host que viven solo como strings en TS (no detectables por JIT).
 * Consumido por atelierStorefront / atelierPreview tailwind configs.
 */
module.exports = {
  safelist: [
    'grid-cols-1',
    'lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]',
    'line-clamp-2',
  ],
}
