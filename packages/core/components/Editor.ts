/* eslint-disable @typescript-eslint/consistent-type-imports */
import { PropType, defineComponent, h, mergeProps, ref } from 'vue-demi'
import { useVModel } from '@vueuse/core'
import { tryOnMounted } from '@vueuse/shared'
import { isBrowser } from '@hsjm/shared'
import { /* @__PURE__ */ EditorView, basicSetup } from 'codemirror'
import { /* @__PURE__ */ EditorViewConfig } from '@codemirror/view'
import { /* @__PURE__ */ oneDark } from '@codemirror/theme-one-dark'
import { /* @__PURE__ */ markdown } from '@codemirror/lang-markdown'

export const Editor = /* @__PURE__ */ defineComponent({
  name: 'Editor',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: '' },
    options: { type: Object as PropType<EditorViewConfig>, default: () => ({}) },
  },
  emit: [
    'onUpdate:modelValue',
  ],
  setup(props, { attrs, emit }) {
    const modelValue = useVModel(props, 'modelValue', emit, { passive: true })
    const editorElement = ref<HTMLDivElement>()
    const editor = ref<EditorView>()

    // --- Declare function to instantiate the editor.
    const createEditor = () =>
      editor.value = new EditorView({
        doc: modelValue.value,
        extensions: [basicSetup, markdown(), oneDark],
        parent: editorElement.value,
        ...props.options,
      })

    // --- Create the editor on mount.
    if (isBrowser) tryOnMounted(createEditor)
    return () => h('div', mergeProps(attrs, { ref: editorElement }))
  },
})
