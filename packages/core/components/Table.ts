/* eslint-disable unicorn/consistent-function-scoping */
import { Key, MaybeArray, filter, sort } from '@hsjm/shared'
import { PropType, computed, defineComponent, h, toRefs } from 'vue-demi'

interface Cell {
  value: any
  row: any
  column: Column
  active: boolean
}

interface Column {
  key?: string
  name?: string
  transform?: (cell: Cell) => any
  onClickCell?: (cell: Cell) => any
  onClickHeader?: (cell: Cell) => any
  [x: string]: any
}

export const Table = defineComponent({
  name: 'Table',
  props: {
    // --- State.
    modelValue: [Object, Array] as PropType<any | any[]>,
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,

    // --- Table.
    rows: [Object, Array] as PropType<any[] | Record<string, any>>,
    columns: [Object, Array] as PropType<Column[] | Record<string, Column>>,
    columnFilter: [String, Array, Function] as PropType<MaybeArray<Key> | ((column: Column) => boolean)>,
    columnSort: [String, Array, Function] as PropType<MaybeArray<Key> | ((column: Column) => any)>,
    sort: [String, Array, Function] as PropType<MaybeArray<Key> | ((cell: Cell) => any)>,
    filter: [String, Array, Function] as PropType<MaybeArray<Key> | ((cell: Cell) => boolean)>,

    // --- Classes.
    classHeader: {} as PropType<any>,
    classHeaderCell: {} as PropType<any>,
    classBody: {} as PropType<any>,
    classRow: {} as PropType<any>,
    classCell: {} as PropType<any>,

    // --- Events.
    onClickRow: Function as PropType<(cell: Cell) => any>,
  },

  setup: (properties, { slots }) => {
    // --- Destructure props.
    const {
      rows, columns, columnFilter, columnSort, onClickRow,
      classHeader, classHeaderCell, classBody, classRow, classCell,
    } = toRefs(properties)

    const $columns = computed(() => {
      let _columns = columns.value
      const _columnFilter = columnFilter.value
      const _columnSort = columnSort.value
      if (!_columns) return []

      // --- Arrayify columns.
      if (!Array.isArray(_columns)) {
        _columns = Object.entries(_columns)
          .map(([key, value]) => ({ key, ...value }))
      }

      // --- Filter and sort column with function or keys.
      if (_columnFilter) _columns = filter(_columns, _columnFilter)
      if (_columnSort) _columns = sort(_columns, _columnSort)

      // --- Return columns.
      return _columns
    })

    const nodeHeadCell = (column: Column, index: number) => {
      const type = index > 0 ? 'td' : 'th'
      return h(type, { class: classHeaderCell.value }, column.name)
    }

    const nodeHead = () => {
      const children = $columns.value.map(nodeHeadCell)
      return h('thead', { class: classHeader.value }, children)
    }

    const nodeCell = (column: Column, row: any, index: number) => {
      const type = index > 0 ? 'td' : 'th'
      const key = column.key as string
      const value = typeof column.transform === 'function'
        ? column.transform(row?.[key])
        : row?.[key]

      // --- Compute slot vnode, default to value.
      const cell = ({ value, column, row, active: false })
      const slot = (slots[`cell-${key}`] ?? slots.cell)?.(cell)
      const props = {
        class: classCell.value,
        onClick: column.onClickCell ? () => column.onClickCell?.(cell) : undefined,
      }

      // --- Return vnode.
      return h(type, props, slot ?? value)
    }

    const nodeRow = (row: any) => {
      const nodeCells = $columns.value.map((column, number) => nodeCell(column, row, number))
      const props = {
        class: classRow.value,
        onClick: onClickRow.value ? () => onClickRow.value?.(row) : undefined,
      }
      return h('tr', props, nodeCells)
    }

    const nodeBody = () => {
      const nodeRows = (rows as any).value.map(nodeRow)
      return h('tbody', { class: classBody.value }, nodeRows)
    }

    return () => h('table', [
      nodeHead(),
      nodeBody(),
    ])
  },
})
