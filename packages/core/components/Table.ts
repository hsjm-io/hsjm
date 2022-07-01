/* eslint-disable unicorn/consistent-function-scoping */
import { Key, filter, sortBy, values } from '@hsjm/shared'
import { PropType, computed, defineComponent, h } from 'vue-demi'
import { exposeToDevtool } from '../composables'

export interface Cell {
  value: any
  row: any
  column: Column
  active: boolean
}

export interface Column {
  key?: Key
  name?: string
  transform?: (cell: Cell) => any
  onClickCell?: (cell: Cell) => any
  onClickHeader?: (cell: Cell) => any
  [x: string]: any
}

export const Table = /* @__PURE__ */ defineComponent({
  name: 'Table',
  props: {
    // --- State.
    modelValue: [Object, Array] as PropType<any | any[]>,
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,

    // --- Table.
    rows: { type: [Object, Array] as PropType<any[] | Record<string, any>>, default: () => [] },
    columns: { type: [Object, Array] as PropType<Column[] | Record<string, Column>>, required: true },
    columnFilter: [String, Function] as PropType<Key | ((column: Column) => boolean)>,
    columnSort: [String, Function] as PropType<Key | ((column: Column) => any)>,
    sortBy: [String, Function] as PropType<Key | ((cell: Cell) => any)>,
    filter: [String, Function] as PropType<Key | ((cell: Cell) => boolean)>,

    // --- Classes.
    classHeader: {} as PropType<any>,
    classHeaderCell: {} as PropType<any>,
    classBody: {} as PropType<any>,
    classRow: {} as PropType<any>,
    classCell: {} as PropType<any>,

    // --- Events.
    onClickRow: Function as PropType<(row: any) => any>,
  },
  setup: (props, { slots }) => {
    // --- Arrayify, filter and sort columns.
    const columnsFiltered = computed(() => {
      let result = values(props.columns, 'key')
      if (props.columnFilter) result = filter(result, props.columnFilter as any)
      if (props.columnSort) result = sortBy(result, props.columnSort as any)
      return result
    })

    // --- Arrayify, filter and sort rows.
    const rowsFiltered = computed(() => {
      let result = values(props.rows, 'key')
      if (props.columnFilter) result = filter(result, props.columnFilter as any)
      if (props.columnSort) result = sortBy(result, props.columnSort as any)
      return result
    })

    // --- Expose to devtool.
    exposeToDevtool({
      columnsFiltered,
      rowsFiltered,
    })

    // --- Render a VNode cell.
    const nodeHeadCell = (column: Column, index: number) =>
      h(index > 0 ? 'td' : 'th', { class: props.classHeaderCell }, column.name)

    // --- Render a VNode header.
    const nodeHead = () =>
      h('thead', { class: props.classHeader }, columnsFiltered.value.map(nodeHeadCell))

    // --- Render a VNode cell.
    const nodeCell = (column: Column & { key: string }, row: any, index: number) => {
      // --- Compute slot vnode, default to value.
      let value = row?.[column.key]
      if (typeof column.transform === 'function') value = column.transform(value)
      const cell = ({ value, column, row, active: false })
      const slot = (slots[`cell-${column.key}`] ?? slots.cell)?.(cell)

      // --- Return vnode.
      return h(index > 0 ? 'td' : 'th', {
        class: props.classCell,
        onClick: column.onClickCell,
      }, slot ?? value.toString())
    }

    // --- Render a VNode row.
    const nodeRow = (row: any) => h(
      'tr',
      { class: props.classRow, onClick: props.onClickRow?.bind(undefined, row) },
      columnsFiltered.value.map((column, index) => nodeCell(column, row, index)),
    )

    // --- Render the body.
    const nodeBody = () =>
      h('tbody', { class: props.classBody }, rowsFiltered.value.map(nodeRow))

    // --- Render the table.
    return () => h('table', [nodeHead(), nodeBody()])
  },
})
