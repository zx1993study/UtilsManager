<template>
  <div class="exception-case-type">
    <common-table
      ref="tableRef"
      row-key="exceptionId"
      :columns="columns"
      :api-method="exceptionCaseTypeApi.getExceptionCaseTypeList"
      :pagination="pagination"
      :search-fields="searchFields"
      :show-selection="true"
      :operation-width="150"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
    >
      <template #exceptionType="{ row }">
        <el-tag effect="plain">
          {{ getExceptionTypeLabel(row.exceptionType) }}
        </el-tag>
      </template>

      <template #operationType="{ row }">
        <div class="operation-tags">
          <el-tag
            v-for="type in normalizeOperationTypes(row)"
            :key="type"
            type="success"
            effect="plain"
          >
            {{ getOperationTypeLabel(type) }}
          </el-tag>
        </div>
      </template>
    </common-table>

    <common-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :form-data="formData"
      :rules="formRules"
      :loading="submitLoading"
      width="620px"
      @confirm="handleSubmit"
    >
      <el-form-item label="异常名称" prop="exceptionName">
        <el-input
          v-model="formData.exceptionName"
          placeholder="请输入异常名称"
          clearable
        />
      </el-form-item>

      <el-form-item label="异常类型" prop="exceptionType">
        <el-select
          v-model="formData.exceptionType"
          placeholder="请选择异常类型"
          clearable
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="item in exceptionTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="操作类型" prop="operationTypes">
        <el-select
          v-model="formData.operationTypes"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择操作类型"
          clearable
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="item in operationTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="异常值" prop="exceptionValue">
        <el-input
          v-model="formData.exceptionValue"
          type="textarea"
          :rows="6"
          placeholder="请输入异常值"
          clearable
        />
        <div class="exception-value-tools">
          <span>当前长度：{{ exceptionValueLength }}</span>
          <el-button
            v-if="repeatValuePreview"
            type="primary"
            link
            size="small"
            @click="expandExceptionValue"
          >
            生成内容
          </el-button>
          <span v-if="repeatValuePreview" class="repeat-preview">
            展开后长度：{{ repeatValuePreview.length }}
          </span>
        </div>
      </el-form-item>
    </common-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import CommonDialog from '@/components/CommonDialog.vue'
import CommonTable from '@/components/CommonTable.vue'
import * as exceptionCaseTypeApi from '@/api/system/exception-case-type'
import { handleApiResponse } from '@/utils/responseHandler'

const tableRef = ref(null)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitMode = ref('add')
const repeatValuePattern = /^\{([\s\S]*)\}\s*\*\s*(\d+)$/

const exceptionTypeOptions = [
  { label: '空值异常', value: 1 },
  { label: '超长异常', value: 2 },
  { label: '格式异常', value: 3 },
  { label: '类型异常', value: 4 },
  { label: '边界异常', value: 5 },
  { label: '特殊字符异常', value: 6 },
  { label: '其他异常', value: 9 }
]

const operationTypeOptions = [
  { label: '添加', value: 1 },
  { label: '编辑', value: 2 },
  { label: '删除', value: 3 },
  { label: '登录', value: 4 },
  { label: '搜索', value: 5 }
]

const getExceptionTypeLabel = (type) => {
  return exceptionTypeOptions.find(item => item.value === type)?.label || type || '-'
}

const getOperationTypeLabel = (type) => {
  const numberType = Number(type)
  return operationTypeOptions.find(item => item.value === numberType)?.label || type || '-'
}

const normalizeOperationTypes = (row = {}) => {
  const value = row.operationTypes ?? row.operation_types ?? row.operationType ?? row.operation_type
  if (Array.isArray(value)) {
    return value.map(item => Number(item)).filter(item => !Number.isNaN(item))
  }
  if (value === null || value === undefined || value === '') {
    return []
  }
  return String(value)
    .split(',')
    .map(item => Number(item.trim()))
    .filter(item => !Number.isNaN(item))
}

const exceptionValueLength = computed(() => Array.from(formData.exceptionValue || '').length)
const repeatValuePreview = computed(() => {
  const parsed = parseRepeatValue(formData.exceptionValue)
  if (!parsed) {
    return null
  }
  return {
    count: parsed.count,
    length: Array.from(parsed.content).length * parsed.count
  }
})

const parseRepeatValue = (value) => {
  const matched = String(value || '').match(repeatValuePattern)
  if (!matched) {
    return null
  }

  const count = Number(matched[2])
  if (!Number.isInteger(count) || count < 0 || count > 10000) {
    return null
  }

  return {
    content: matched[1],
    count
  }
}

const expandExceptionValueText = (value) => {
  const parsed = parseRepeatValue(value)
  return parsed ? parsed.content.repeat(parsed.count) : value
}

const expandExceptionValue = () => {
  formData.exceptionValue = expandExceptionValueText(formData.exceptionValue)
}

const columns = [
  { prop: 'exceptionName', label: '异常名称', minWidth: 160 },
  { prop: 'exceptionType', label: '异常类型', width: 120, slot: 'exceptionType' },
  { prop: 'operationType', label: '操作类型', width: 120, slot: 'operationType' },
  { prop: 'exceptionValue', label: '异常值', minWidth: 260, showOverflowTooltip: true },
  { prop: 'creator', label: '创建人', width: 110 },
  { prop: 'createTime', label: '创建时间', width: 170 },
  { prop: 'updateTime', label: '更新时间', width: 170 }
]

const searchFields = [
  {
    type: 'input',
    prop: 'exceptionName',
    label: '异常名称',
    placeholder: '请输入异常名称'
  },
  {
    type: 'select',
    prop: 'exceptionType',
    label: '异常类型',
    placeholder: '请选择异常类型',
    options: exceptionTypeOptions
  },
  {
    type: 'select',
    prop: 'operationType',
    label: '操作类型',
    placeholder: '请选择操作类型',
    options: operationTypeOptions
  }
]

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive({
  exceptionId: null,
  exceptionName: '',
  exceptionType: null,
  operationTypes: [],
  exceptionValue: ''
})

const formRules = {
  exceptionName: [{ required: true, message: '请输入异常名称', trigger: 'blur' }],
  exceptionType: [{ required: true, message: '请选择异常类型', trigger: 'change' }],
  operationTypes: [{ required: true, type: 'array', min: 1, message: '请选择操作类型', trigger: 'change' }],
  exceptionValue: [{ required: true, message: '请输入异常值', trigger: 'blur' }]
}

const resetForm = () => {
  Object.assign(formData, {
    exceptionId: null,
    exceptionName: '',
    exceptionType: null,
    operationTypes: [],
    exceptionValue: ''
  })
}

const fillForm = (row) => {
  Object.assign(formData, {
    exceptionId: row.exceptionId,
    exceptionName: row.exceptionName || '',
    exceptionType: row.exceptionType ?? null,
    operationTypes: normalizeOperationTypes(row),
    exceptionValue: row.exceptionValue || ''
  })
}

const buildPayload = () => ({
  exceptionName: formData.exceptionName,
  exceptionType: formData.exceptionType,
  operationTypes: formData.operationTypes,
  exceptionValue: expandExceptionValueText(formData.exceptionValue)
})

const handleAdd = () => {
  resetForm()
  submitMode.value = 'add'
  dialogTitle.value = '新增异常用例类型'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  fillForm(row)
  submitMode.value = 'edit'
  dialogTitle.value = '编辑异常用例类型'
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除异常用例类型「${row.exceptionName}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await exceptionCaseTypeApi.deleteExceptionCaseType(row.exceptionId)
    if (handleApiResponse(res, '删除成功', '删除失败')) {
      tableRef.value?.refresh()
    }
  }).catch(() => {})
}

const handleBatchDelete = (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 条异常用例类型吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const ids = rows.map(row => row.exceptionId)
    const res = await exceptionCaseTypeApi.batchDeleteExceptionCaseType(ids)
    if (handleApiResponse(res, '批量删除成功', '批量删除失败')) {
      tableRef.value?.clearSelection()
      tableRef.value?.refresh()
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  submitLoading.value = true
  try {
    let res
    if (submitMode.value === 'edit') {
      res = await exceptionCaseTypeApi.updateExceptionCaseType({
        exceptionId: formData.exceptionId,
        ...buildPayload()
      })
    } else {
      res = await exceptionCaseTypeApi.addExceptionCaseType(buildPayload())
    }

    const ok = handleApiResponse(
      res,
      submitMode.value === 'edit' ? '编辑成功' : '保存成功',
      submitMode.value === 'edit' ? '编辑失败' : '保存失败'
    )
    if (ok) {
      dialogVisible.value = false
      tableRef.value?.refresh()
    }
  } finally {
    submitLoading.value = false
  }
}
</script>

<style scoped>
.exception-case-type {
  height: 100%;
}

.exception-value-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
  color: #606266;
  font-size: 12px;
  line-height: 18px;
}

.repeat-preview {
  color: #909399;
}

.operation-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
