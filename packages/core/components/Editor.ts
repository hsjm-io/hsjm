/* eslint-disable @typescript-eslint/consistent-type-imports */
import { PropType, defineComponent, h, mergeProps, ref, watch } from 'vue-demi'
import { useVModel } from '@vueuse/core'
import { tryOnMounted } from '@vueuse/shared'
import { isBrowser, pick } from '@hsjm/shared'
import { EditorView } from 'codemirror'
import { EditorViewConfig } from '@codemirror/view'
import { exposeToDevtool } from '../utils'

export default /* @__PURE__ */ defineComponent({
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
    const editorElement = ref<HTMLDivElement>()
    const editor = ref<EditorView>()

    // --- Declare function to instantiate the editor.
    const createEditor = () => editor.value = new EditorView({
      doc: modelValue.value,
      parent: editorElement.value,
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
      editorElement,
      editor,
    })

    // --- Watch for external changes to the modelValue.
    watch(modelValue, (value) => {
      if (editor.value && !editor.value?.hasFocus) {
        editor.value.dispatch({
          changes: {
            from: 0,
            to: editor.value.state.doc.length,
            insert: value,
          },
        })
      }
    })

    // --- Create the editor on mount.
    if (isBrowser) tryOnMounted(createEditor)
    return () => h('div', mergeProps(
      pick(attrs, ['class', 'style']),
      { ref: editorElement },
    ))
  },
})
