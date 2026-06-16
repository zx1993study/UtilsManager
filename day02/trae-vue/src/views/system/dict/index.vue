<template>
  <div class="dict-management">
    <common-table
      ref="tableRef"
      row-key="dictId"
      :columns="columns"
      :api-method="dictApi.getDictList"
      :pagination="pagination"
      :search-fields="searchFields"
      :show-selection="true"
      :show-copy="true"
      :operation-width="220"
      @add="handleAdd"
      @edit="handleEdit"
      @copy="handleCopy"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
    >
      <template #type="{ row }">
        <el-tag :type="row.type === 1 ? 'primary' : 'info'" effect="plain">
          {{ getTypeLabel(row.type) }}
        </el-tag>
      </template>

      <template #status="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'danger'">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </el-tag>
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
      <el-form-item label="字典名称" prop="dictName">
        <el-input v-model="formData.dictName" placeholder="请输入字典名称" clearable />
      </el-form-item>

      <el-form-item label="字典键" prop="dictKey">
        <el-input v-model="formData.dictKey" placeholder="请输入字典键" clearable />
      </el-form-item>

      <el-form-item label="字典值" prop="dictValue">
        <el-input
          v-model="formData.dictValue"
          type="textarea"
          :rows="4"
          placeholder="请输入字典值"
          clearable
        />
      </el-form-item>

      <el-form-item label="类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </common-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import * as dictApi from '@/api/system/dict'
import { handleApiResponse } from '@/utils/responseHandler'

const tableRef = ref(null)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitMode = ref('add')

const typeOptions = [
  { label: '系统', value: 1 },
  { label: '业务', value: 2 }
]

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]

const getTypeLabel = (type) => {
  return typeOptions.find(item => item.value === type)?.label || type
}

const columns = [
  { prop: 'dictName', label: '字典名称', minWidth: 150 },
  { prop: 'dictKey', label: '字典键', minWidth: 150 },
  { prop: 'dictValue', label: '字典值', minWidth: 220, showOverflowTooltip: true },
  { prop: 'type', label: '类型', width: 100, slot: 'type' },
  { prop: 'status', label: '状态', width: 90, slot: 'status' },
  { prop: 'creator', label: '创建人', width: 120 },
  { prop: 'createTime', label: '创建时间', width: 180 },
  { prop: 'updateTime', label: '更新时间', width: 180 }
]

const searchFields = [
  { type: 'input', prop: 'dictName', label: '字典名称', placeholder: '请输入字典名称' },
  { type: 'input', prop: 'dictKey', label: '字典键', placeholder: '请输入字典键' },
  {
    type: 'select',
    prop: 'type',
    label: '类型',
    placeholder: '请选择类型',
    options: typeOptions
  },
  {
    type: 'select',
    prop: 'status',
    label: '状态',
    placeholder: '请选择状态',
    options: statusOptions
  }
]

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive({
  dictId: null,
  dictName: '',
  dictKey: '',
  dictValue: '',
  type: 1,
  status: 1
})

const formRules = {
  dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  dictKey: [{ required: true, message: '请输入字典键', trigger: 'blur' }],
  dictValue: [{ required: true, message: '请输入字典值', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const resetForm = () => {
  Object.assign(formData, {
    dictId: null,
    dictName: '',
    dictKey: '',
    dictValue: '',
    type: 1,
    status: 1
  })
}

const fillForm = (row) => {
  Object.assign(formData, {
    dictId: row.dictId,
    dictName: row.dictName || '',
    dictKey: row.dictKey || '',
    dictValue: row.dictValue || '',
    type: row.type ?? 1,
    status: row.status ?? 1
  })
}

const buildPayload = () => ({
  dictName: formData.dictName,
  dictKey: formData.dictKey,
  dictValue: formData.dictValue,
  type: formData.type,
  status: formData.status
})

const handleAdd = () => {
  resetForm()
  submitMode.value = 'add'
  dialogTitle.value = '新增字典'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  fillForm(row)
  submitMode.value = 'edit'
  dialogTitle.value = '编辑字典'
  dialogVisible.value = true
}

const handleCopy = (row) => {
  fillForm(row)
  formData.dictId = null
  formData.dictName = `${row.dictName || ''}_副本`
  formData.dictKey = `${row.dictKey || ''}_copy`
  submitMode.value = 'add'
  dialogTitle.value = '复制字典'
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除字典「${row.dictName}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await dictApi.deleteDict(row.dictId)
    if (handleApiResponse(res, '删除成功', '删除失败')) {
      tableRef.value?.refresh()
    }
  }).catch(() => {})
}

const handleBatchDelete = (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 条字典配置吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const ids = rows.map(row => row.dictId)
    const res = await dictApi.batchDeleteDict(ids)
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
      res = await dictApi.updateDict({
        dictId: formData.dictId,
        ...buildPayload()
      })
    } else {
      res = await dictApi.addDict(buildPayload())
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
.dict-management {
  height: 100%;
}
</style>
