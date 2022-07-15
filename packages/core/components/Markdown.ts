import { PropType, computed, defineComponent, h, markRaw, mergeProps } from 'vue-demi'
import MarkdownIt from 'markdown-it'
import { exposeToDevtool } from '../utils'

export default /* @__PURE__ */ defineComponent({
  name: 'Markdown',
  inheritAttrs: false,
  props: {
    content: { type: String, default: '' },
    options: { type: Object as PropType<MarkdownIt.Options>, default: () => ({}) },
  },
  setup: (props, { attrs }) => {
    // --- Initialize
    const markdownIt = markRaw(computed(() => new MarkdownIt(props.options)))
    const contentMarkdown = computed(() => props.content)
    const contentHtml = computed(() => markdownIt.value.render(props.content))

    // --- Expose the contentMarkdown to the devtool.
    exposeToDevtool({
      markdownIt,
      contentMarkdown,
      contentHtml,
    })

    // --- Return rendered HTML.
    return () => h('div', mergeProps(attrs, {
      innerHTML: contentHtml.value,
    }))
  },
})
