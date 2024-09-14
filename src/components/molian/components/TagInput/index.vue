<script setup lang="ts">
import { ref, nextTick, inject, defineProps, defineEmits } from "vue";
const props = defineProps({
  inputText: { type: String },
  modelValue: {
    type: Array as any,
    default: () => [],
  },
});
const emit = defineEmits(["update:modelValue"]);
const t: any = inject("mlLangs");
const customComps: any = inject("customComps");
const { customInput, customTag, customButton } = customComps;

const inputValue = ref("");
const dynamicTags = ref(props.modelValue);
const inputVisible = ref(false);
const inputRef = ref();
watch(
  () => props.modelValue,
  (newVal) => {
    dynamicTags.value = newVal;
  },
  {
    deep: true,
  }
);
const handleClose = (tag: string) => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1);
};

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    inputRef.value.$refs.ref.focus();
  });
};
const handleInputConfirm = (evt: { key: string }) => {
  if (typeof evt !== "string") {
    if (evt.key !== "Enter") {
      return false;
    }
  } else if (typeof evt === "string") {
    return false;
  }
  if (inputValue.value) {
    dynamicTags.value.push(inputValue.value);
    emit("update:modelValue", dynamicTags.value);
  }
  inputVisible.value = false;
  inputValue.value = "";
};
const enterConfirm = () => {
  if (inputValue.value) {
    dynamicTags.value.push(inputValue.value);
    emit("update:modelValue", dynamicTags.value);
  }
  inputVisible.value = false;
  inputValue.value = "";
};
</script>

<template>
  <div class="tag-input-container">
    <customTag
      theme="default"
      v-for="tag in modelValue"
      :key="tag"
      closable
      :disable-transitions="false"
      @close="handleClose(tag)"
    >
      {{ tag }}
    </customTag>
    <customInput
      style="width: 70px"
      v-if="inputVisible"
      ref="inputRef"
      v-model="inputValue"
      size="small"
      @enter="enterConfirm"
      @keyup="handleInputConfirm"
      @blur="enterConfirm"
    />
    <customButton theme="primary" v-else size="small" @click="showInput">
      {{ inputText || t("options.addNewTag") }}
    </customButton>
  </div>
</template>
<style scoped>
.tag-input-container {
  display: flex;
  flex-wrap: wrap;
  > * {
    margin: var(--ml-mg-small);
  }
}
</style>
