<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    :destroy-on-close="destroyOnClose"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      class="common-form"
    >
      <slot :form-data="formData"></slot>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '标题'
  },
  width: {
    type: String,
    default: '600px'
  },
  formData: {
    type: Object,
    default: () => ({})
  },
  rules: {
    type: Object,
    default: () => ({})
  },
  closeOnClickModal: {
    type: Boolean,
    default: false
  },
  destroyOnClose: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'close'])

const formRef = ref(null)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleConfirm = async () => {
  if (!formRef.value) {
    emit('confirm')
    return
  }

  await formRef.value.validate((valid) => {
    if (valid) {
      emit('confirm')
    }
  })
}

const handleCancel = () => {
  dialogVisible.value = false
  emit('cancel')
}

const handleClose = () => {
  formRef.value?.resetFields()
  emit('close')
}

defineExpose({
  formRef,
  resetForm: () => formRef.value?.resetFields(),
  validate: () => formRef.value?.validate()
})
</script>

<style scoped>
.common-form {
  padding: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
