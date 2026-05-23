import { computed, ref } from 'vue'

const EXPANDED_WIDTH = 280
const COLLAPSED_WIDTH = 72

const isCollapsed = ref(false)
/** True while width animation is running — gates expanded content visibility */
const isTransitioning = ref(false)

let transitionTimer: ReturnType<typeof setTimeout> | undefined

function runTransition(onMid?: () => void) {
  isTransitioning.value = true
  clearTimeout(transitionTimer)
  transitionTimer = setTimeout(() => {
    isTransitioning.value = false
    onMid?.()
  }, 280)
}

export function useLibrarySidebar() {
  const sidebarWidth = computed(() => (isCollapsed.value ? COLLAPSED_WIDTH : EXPANDED_WIDTH))

  function toggleCollapse() {
    isCollapsed.value = !isCollapsed.value
    runTransition()
  }

  function expand() {
    if (!isCollapsed.value) return
    isCollapsed.value = false
    runTransition()
  }

  function collapse() {
    if (isCollapsed.value) return
    isCollapsed.value = true
    runTransition()
  }

  return {
    isCollapsed,
    isTransitioning,
    sidebarWidth,
    expandedWidth: EXPANDED_WIDTH,
    collapsedWidth: COLLAPSED_WIDTH,
    toggleCollapse,
    expand,
    collapse,
  }
}
