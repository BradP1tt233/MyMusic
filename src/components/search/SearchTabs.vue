<script setup lang="ts">
import { SEARCH_TABS, type SearchTypeValue } from '@/constants/search'

defineProps<{
  modelValue: SearchTypeValue
}>()

defineEmits<{
  'update:modelValue': [value: SearchTypeValue]
}>()
</script>

<template>
  <div class="search-tabs flex flex-wrap gap-2 px-10">
    <button
      v-for="tab in SEARCH_TABS"
      :key="tab.type"
      type="button"
      class="rounded-full border-0 px-4 py-2 text-sm font-bold transition-colors duration-[220ms] ease-in"
      :class="
        modelValue === tab.type
          ? 'bg-white text-black'
          : 'bg-[#2a2a2a] text-[#b3b3b3] hover:bg-[#3e3e3e] hover:text-white'
      "
      @click="$emit('update:modelValue', tab.type)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
