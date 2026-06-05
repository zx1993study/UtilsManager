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
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">
          确 定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  // 是否显示弹窗
  modelValue: {
    type: Boolean,
    default: false
  },
  // 弹窗标题
  title: {
    type: String,
    default: '标题'
  },
  // 弹窗宽度
  width: {
    type: String,
    default: '600px'
  },
  // 表单数据
  formData: {
    type: Object,
    default: () => ({})
  },
  // 表单验证规则
  rules: {
    type: Object,
    default: () => ({})
  },
  // 点击遮罩层关闭
  closeOnClickModal: {
    type: Boolean,
    default: false
  },
  // 关闭时销毁
  destroyOnClose: {
    type: Boolean,
    default: false
  },
  // 加载状态
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

// 处理确认
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

// 处理取消
const handleCancel = () => {
  dialogVisible.value = false
  emit('cancel')
}

// 处理关闭
const handleClose = () => {
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields()
  }
  emit('close')
}

// 暴露方法给父组件
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
