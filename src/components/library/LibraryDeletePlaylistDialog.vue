<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title: string
  busy?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

function handleClose() {
  if (props.busy) {
    return
  }

  emit('close')
}

function handleConfirm() {
  if (props.busy) {
    return
  }

  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="library-delete-dialog fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
      role="presentation"
      @click.self="handleClose"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-delete-dialog-title"
        class="w-full max-w-md rounded-lg bg-[#282828] p-6 shadow-2xl"
        @click.stop
      >
        <h2 id="library-delete-dialog-title" class="text-2xl font-bold text-white">
          删除歌单
        </h2>
        <p class="mt-2 text-sm text-[#b3b3b3]">
          确定要从音乐库中删除「{{ title }}」吗？此操作无法撤销。
        </p>

        <div class="mt-8 flex justify-end gap-4">
          <button
            type="button"
            class="cursor-pointer border-0 bg-transparent px-4 py-2 text-sm font-bold text-[#b3b3b3] transition-colors hover:text-white disabled:cursor-default disabled:opacity-50"
            :disabled="busy"
            @click="handleClose"
          >
            取消
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-full border-0 bg-[#1ed760] px-6 py-2.5 text-sm font-bold text-black transition-transform hover:scale-[1.04] active:scale-[0.96] disabled:cursor-default disabled:opacity-50 disabled:hover:scale-100"
            :disabled="busy"
            @click="handleConfirm"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
