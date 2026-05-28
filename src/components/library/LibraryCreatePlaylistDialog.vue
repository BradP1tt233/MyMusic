<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [title: string]
}>()

const title = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const errorMessage = ref('')

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      title.value = ''
      errorMessage.value = ''
      return
    }

    await nextTick()
    inputRef.value?.focus()
  },
)

function handleSubmit() {
  const trimmed = title.value.trim()
  if (!trimmed) {
    errorMessage.value = '请输入歌单名称'
    return
  }

  emit('confirm', trimmed)
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="library-create-dialog fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
      role="presentation"
      @click.self="handleClose"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-create-dialog-title"
        class="w-full max-w-md rounded-lg bg-[#282828] p-6 shadow-2xl"
        @click.stop
      >
        <h2 id="library-create-dialog-title" class="text-2xl font-bold text-white">
          创建歌单
        </h2>
        <p class="mt-2 text-sm text-[#b3b3b3]">为你的新歌单取一个名称。</p>

        <label class="mt-6 block">
          <span class="mb-2 block text-sm font-bold text-white">歌单名称</span>
          <input
            ref="inputRef"
            v-model="title"
            type="text"
            maxlength="40"
            placeholder="我的歌单"
            class="w-full rounded-sm border border-transparent bg-[#3e3e3e] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-white"
            @keydown.enter.prevent="handleSubmit"
          />
        </label>

        <p v-if="errorMessage" class="mt-2 text-sm text-[#f15e6c]">{{ errorMessage }}</p>

        <div class="mt-8 flex justify-end gap-4">
          <button
            type="button"
            class="cursor-pointer border-0 bg-transparent px-4 py-2 text-sm font-bold text-[#b3b3b3] transition-colors hover:text-white"
            @click="handleClose"
          >
            取消
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-full border-0 bg-[#1ed760] px-6 py-2.5 text-sm font-bold text-black transition-transform hover:scale-[1.04] active:scale-[0.96]"
            @click="handleSubmit"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
