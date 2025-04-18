<template>
  <el-row class="markdown-content" :gutter="gutter">
    <el-col :span="showToc ? 18 : 24">
      <div
        class="markdown-content"
        :class="{ 'markdown-body': !inTooltip }"
        ref="containerEle"
      ></div>
    </el-col>
    <el-col class="toc-list" v-if="showToc" :span="6">
      <div class="toc-title">{{ $t('Base.content') }}</div>
      <li v-for="item in toc" :key="item.slug" :class="['toc', `level-${item.level}`]">
        <a class="toc-item" @click="scrollView(item.slug)">{{ item.title }}</a>
      </li>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ref, defineProps, onMounted, onUnmounted, PropType, watch } from 'vue'
import { marked } from 'marked'
import { useStore } from 'vuex'
import xss from 'xss'

interface TocItem {
  title: string
  slug: string
  level: 1 | 2 | 3 | 4 | 5 | 6
}

const containerEle = ref()

const props = defineProps({
  content: String as PropType<string>,
  showToc: {
    required: false,
    type: Boolean as PropType<boolean>,
    default: false,
  },
  gutter: {
    required: false,
    type: Number,
    default: 40,
  },
  /**
   * do not use github style in tooltip
   */
  inTooltip: {
    required: false,
    type: Boolean,
    default: false,
  },
})

const renderer = new marked.Renderer()
const toc = ref<TocItem[]>([]) // your table of contents as a list.

const scrollView = (id: string) => {
  const ele = containerEle.value
  if (ele) {
    const target = document.getElementById(id)
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
      })
    }
  }
}

if (props.showToc) {
  renderer.heading = function (text, level) {
    const slug = text.toLowerCase().replace(/[^\w]+/g, '-')
    if (level > 1) {
      toc.value.push({ level, slug, title: text })
    }
    return `<h${level} id="${slug}">${text}</h${level}>`
  }
}
renderer.link = function (href, title, text) {
  if (href?.startsWith('http')) {
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
  }
  // @ts-ignore-line
  // Temp Fix: Dynamically add scroll events to links after conversion to html
  window.scrollView = scrollView
  const id = href?.replace('#', '')
  return `<a onclick="scrollView('${id}')">${text}</a>`
}

const convertMarkdown = function (text: string) {
  return marked(text, {
    renderer,
  })
}

const setEle = (val: string | undefined) => {
  if (!val) {
    containerEle.value.innerHTML = ''
  } else {
    containerEle.value.innerHTML = xss(convertMarkdown(val))
  }
}

const { state } = useStore()
onMounted(async () => {
  setEle(props.content)
  const theme = state.theme
  if (theme === 'dark') {
    await import('github-markdown-css/github-markdown-dark.css')
  } else {
    await import('github-markdown-css/github-markdown-light.css')
  }
})

onUnmounted(() => {
  // @ts-ignore-line
  window.scrollView = undefined
})

watch(() => props.content, setEle)
</script>

<style lang="scss">
[data-theme='dark'] {
  .markdown-content {
    .markdown-body {
      background-color: var(--color-bg-content);
    }
  }
}
</style>
