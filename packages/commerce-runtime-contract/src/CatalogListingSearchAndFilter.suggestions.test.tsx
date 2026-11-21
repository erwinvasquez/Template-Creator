// @vitest-environment happy-dom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { CatalogListingSearchAndFilter } from './CatalogListingSearchAndFilter'

afterEach(() => cleanup())

const baseFilters = { salesMode: 'stock', categories: [], collections: [], brands: [] } as never

function renderWith(filters: Record<string, unknown>) {
  render(
    <CatalogListingSearchAndFilter
      filters={{ ...(baseFilters as object), ...filters } as never}
      listing={{ searchLabel: 'Buscar', searchPlaceholder: 'Buscar' } as never}
      showSearch
      search=""
      onSearchChange={() => undefined}
      onSubmitSearch={() => undefined}
      onApplyFilters={() => undefined}
    />
  )
}

describe('aviso de sugerencias en el listado', () => {
  it('se muestra cuando los resultados son sugerencias', () => {
    renderWith({ searchQuery: 'perfume amaderado', searchSuggestionsOnly: true })
    expect(screen.getByRole('status').textContent).toBe('No encontramos «perfume amaderado». Te puede interesar:')
  })

  it('no aparece con resultados exactos', () => {
    renderWith({ searchQuery: 'diadema' })
    expect(screen.queryByRole('status')).toBeNull()
  })
})
