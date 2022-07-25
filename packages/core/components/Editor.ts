/* eslint-disable @typescript-eslint/consistent-type-imports */
import { PropType, defineComponent, h, mergeProps, ref, watch } from 'vue-demi'
import { useVModel } from '@vueuse/core'
import { tryOnMounted, tryOnUnmounted } from '@vueuse/shared'
import { isBrowser, pick } from '@hsjm/shared'
import { EditorView, EditorViewConfig } from '@codemirror/view'
import { exposeToDevtool } from '../utils'

export default /** @__PURE__ */ defineComponent({
  name: 'Editor',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: '' },
    options: { type: Object as PropType<EditorViewConfig>, default: () => ({}) },
  },
  emit: [
    'emit',
    'blur',
    'onUpdate:modelValue',
  ],
  setup(props, { attrs, emit }) {
    const modelValue = useVModel(props, 'modelValue', emit, { passive: true })
    const editor = ref<HTMLDivElement>()
    const view = ref<EditorView>()

    // --- Declare function to instantiate the view.
    const createEditor = () => view.value = new EditorView({
      doc: modelValue.value,
      parent: editor.value,
      ...props.options,
      extensions: [
        props.options.extensions ?? [],
        EditorView.updateListener.of((viewUpdate) => {
          if (viewUpdate.docChanged) modelValue.value = viewUpdate.state.doc.toString()
          if (viewUpdate.focusChanged) emit(viewUpdate.view.hasFocus ? 'focus' : 'blur', viewUpdate)
        }),
      ],
    })

    // --- Expose the contentMarkdown to the devtool.
    exposeToDevtool({
      modelValue,
      editor,
      view,
    })

    // --- Watch for external changes to the modelValue.
    watch(modelValue, (value) => {
      if (view.value && !view.value?.hasFocus) {
        view.value.dispatch({
          changes: {
            from: 0,
            to: view.value.state.doc.length,
            insert: value,
          },
        })
      }
    })

    // --- Declare lifecycle.
    if (isBrowser) tryOnMounted(createEditor, false)
    tryOnUnmounted(() => view.value?.destroy())

    // --- Render the editor.
    return () => h('div', mergeProps(
      pick(attrs, ['class', 'style']),
      {
        tabindex: -1,
        ref: editor,
        onFocus: () => view.value?.focus(),
        style: { cursor: 'text' },
      },
    ))
  },
})
