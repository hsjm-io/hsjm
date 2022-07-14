/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/consistent-function-scoping */
import { Key, filter, get, sortBy, values } from '@hsjm/shared'
import { PropType, computed, defineComponent, h } from 'vue-demi'
import { exposeToDevtool } from '../utils'

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
    const columns = computed(() => {
      let result = values(props.columns, 'key')
      if (props.columnFilter) result = filter(result, props.columnFilter as any)
      if (props.columnSort) result = sortBy(result, props.columnSort as any)
      return result
    })

    // --- Arrayify, filter and sort rows.
    const rows = computed(() => {
      let result = values(props.rows, 'key')
      if (props.columnFilter) result = filter(result, props.columnFilter as any)
      if (props.columnSort) result = sortBy(result, props.columnSort as any)
      return result
    })

    // --- Expose to devtool.
    const slotProps = exposeToDevtool({ columns, rows })

    // --- Create <thead> VNode.
    const createVNodeHead = () => {
      // --- Create <th> VNodes.
      const vNodeHeaderCells = columns.value.map((column, index) =>
        h(index > 0 ? 'td' : 'th', { class: props.classHeaderCell }, column.name))

      // --- Create <thead> VNode.
      return h('thead', { class: props.classHeader }, vNodeHeaderCells)
    }

    // --- Create <td> VNodes.
    const createVNodeRow = (row: any) => {
      // --- Create a VNode cell.
      const vNodeCells = columns.value.map((column, index) => {
        // --- Compute slot vnode, default to value.
        let value = get(row, column.key, '')
        if (typeof column.transform === 'function') value = column.transform(value)

        // --- The cell's content
        const content = (slots[`cell-${column.key}`] ?? slots.cell)?.({ column, row }) ?? value

        // --- Return vnode.
        return h(index > 0 ? 'td' : 'th', {
          class: props.classCell,
          onClick: column.onClickCell,
        }, content)
      })

      return h('tr', {
        class: props.classRow,
        onClick: () => props.onClickRow?.(row),
      }, vNodeCells)
    }

    // --- Render the table.
    return () => {
      const vNodeHead = slots.head?.(slotProps) ?? createVNodeHead()
      const vNodeRows = slots.rows?.(slotProps) ?? rows.value.map(createVNodeRow)
      const vNodeBody = h('tbody', { class: props.classBody }, vNodeRows)
      return h('table', [vNodeHead, vNodeBody])
    }
  },
})
