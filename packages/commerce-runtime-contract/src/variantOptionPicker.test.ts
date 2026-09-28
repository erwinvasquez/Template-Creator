import { describe, expect, it } from 'vitest'

import {
  buildOptionDimensions,
  canUseVariantOptionPickers,
  chipStateForOptionValue,
  isOptionValueSelectable,
  resolveVariantForDimensionSelection,
  sortOptionValuesAsc,
  valuesForDimension,
  type VariantOptionLike,
} from './variantOptionPicker'

const colorTallaVariants: VariantOptionLike[] = [
  {
    id: 'negro-7',
    optionValues: [
      { option: 'Talla', value: '7' },
      { option: 'Color', value: 'Negro' },
    ],
  },
  {
    id: 'negro-8',
    optionValues: [
      { option: 'Talla', value: '8' },
      { option: 'Color', value: 'Negro' },
    ],
  },
  {
    id: 'cafe-8',
    optionValues: [
      { option: 'Talla', value: '8' },
      { option: 'Color', value: 'Café' },
    ],
  },
]

const colorFirstDimensions = ['Color', 'Talla']

const materialColorVariants: VariantOptionLike[] = [
  {
    id: 'mat-x-rojo',
    optionValues: [
      { option: 'Material', value: 'Material X' },
      { option: 'Color', value: 'Rojo' },
    ],
  },
  {
    id: 'mat-y-verde',
    optionValues: [
      { option: 'Material', value: 'Material Y' },
      { option: 'Color', value: 'Verde' },
    ],
  },
  {
    id: 'mat-y-amarillo',
    optionValues: [
      { option: 'Material', value: 'Material Y' },
      { option: 'Color', value: 'Amarillo' },
    ],
  },
]

const materialColorDimensions = ['Material', 'Color']

describe('sortOptionValuesAsc', () => {
  it('ordena alfabéticamente y numéricamente de forma natural', () => {
    expect(sortOptionValuesAsc(['10', '2', '1', 'Negro', 'Café', 'Azul'])).toEqual([
      '1',
      '2',
      '10',
      'Azul',
      'Café',
      'Negro',
    ])
  })
})

describe('buildOptionDimensions', () => {
  it('respeta el orden de optionDefinitions aunque las variantes aparezcan invertidas', () => {
    expect(
      buildOptionDimensions(colorTallaVariants, [
        { name: 'Color', values: ['Negro', 'Café'] },
        { name: 'Talla', values: ['7', '8'] },
      ]),
    ).toEqual(['Color', 'Talla'])
  })

  it('añade dimensiones extra no definidas al final', () => {
    const variants: VariantOptionLike[] = [
      {
        id: 'v1',
        optionValues: [
          { option: 'Material', value: 'Cuero' },
          { option: 'Color', value: 'Negro' },
        ],
      },
    ]
    expect(buildOptionDimensions(variants, [{ name: 'Color', values: ['Negro'] }])).toEqual([
      'Color',
      'Material',
    ])
  })
})

describe('valuesForDimension', () => {
  it('devuelve valores únicos ordenados ascendentemente', () => {
    expect(valuesForDimension(colorTallaVariants, 'Color')).toEqual(['Café', 'Negro'])
    expect(valuesForDimension(colorTallaVariants, 'Talla')).toEqual(['7', '8'])
  })
})

describe('picker estilo Shopify por índice de dimensión', () => {
  const selections = { Color: 'Negro', Talla: '7' }
  const maxAddQty = {
    'negro-7': 2,
    'negro-8': 1,
    'cafe-8': 3,
  }

  it('permite elegir Café aunque no exista café+talla 7', () => {
    expect(
      isOptionValueSelectable(colorTallaVariants, colorFirstDimensions, selections, 0, 'Café'),
    ).toBe(true)
    expect(
      chipStateForOptionValue(
        colorTallaVariants,
        colorFirstDimensions,
        selections,
        0,
        'Café',
        maxAddQty,
      ),
    ).toBe('available')
  })

  it('marca imposible solo cuando no hay variante con ese valor y dimensiones previas', () => {
    expect(
      isOptionValueSelectable(colorTallaVariants, colorFirstDimensions, selections, 1, '9'),
    ).toBe(false)
  })

  it('al elegir Café resuelve la mejor variante con stock y mayor estabilidad en tallas posteriores', () => {
    const resolved = resolveVariantForDimensionSelection(
      colorTallaVariants,
      colorFirstDimensions,
      selections,
      0,
      'Café',
      { maxAddQtyByVariantId: maxAddQty, preferredVariantId: 'negro-7' },
    )
    expect(resolved?.id).toBe('cafe-8')
  })

  it('filtra tallas según el color ya elegido', () => {
    const cafeSelections = { Color: 'Café', Talla: '8' }
    expect(
      isOptionValueSelectable(colorTallaVariants, colorFirstDimensions, cafeSelections, 1, '7'),
    ).toBe(false)
    expect(
      isOptionValueSelectable(colorTallaVariants, colorFirstDimensions, cafeSelections, 1, '8'),
    ).toBe(true)
  })
})

describe('material × color (deadlock P0)', () => {
  const maxAddQty = {
    'mat-x-rojo': 5,
    'mat-y-verde': 5,
    'mat-y-amarillo': 5,
  }

  it('con Material X + Rojo, Verde y Amarillo son imposibles', () => {
    const selections = { Material: 'Material X', Color: 'Rojo' }
    expect(
      chipStateForOptionValue(
        materialColorVariants,
        materialColorDimensions,
        selections,
        1,
        'Verde',
        maxAddQty,
      ),
    ).toBe('impossible')
    expect(
      chipStateForOptionValue(
        materialColorVariants,
        materialColorDimensions,
        selections,
        1,
        'Amarillo',
        maxAddQty,
      ),
    ).toBe('impossible')
  })

  it('al elegir Material Y habilita colores válidos y resuelve variante purchasable', () => {
    const selections = { Material: 'Material X', Color: 'Rojo' }
    expect(
      isOptionValueSelectable(
        materialColorVariants,
        materialColorDimensions,
        selections,
        0,
        'Material Y',
      ),
    ).toBe(true)

    const resolved = resolveVariantForDimensionSelection(
      materialColorVariants,
      materialColorDimensions,
      selections,
      0,
      'Material Y',
      { maxAddQtyByVariantId: maxAddQty, preferredVariantId: 'mat-x-rojo' },
    )
    expect(resolved?.id).toBe('mat-y-verde')
  })

  it('con Material Y, Rojo es imposible y Verde/Amarillo disponibles', () => {
    const selections = { Material: 'Material Y', Color: 'Verde' }
    expect(
      isOptionValueSelectable(materialColorVariants, materialColorDimensions, selections, 1, 'Rojo'),
    ).toBe(false)
    expect(
      chipStateForOptionValue(
        materialColorVariants,
        materialColorDimensions,
        selections,
        1,
        'Amarillo',
        maxAddQty,
      ),
    ).toBe('available')
  })
})

describe('canUseVariantOptionPickers', () => {
  it('requiere más de una variante con opciones', () => {
    expect(canUseVariantOptionPickers(colorTallaVariants)).toBe(true)
    expect(canUseVariantOptionPickers([colorTallaVariants[0]!])).toBe(false)
    expect(canUseVariantOptionPickers([{ id: 'x', optionValues: [] }])).toBe(false)
  })
})
