<template>
  <div class="workflow-function">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="workflowFunctionApi.getWorkflowFunctionList"
      :pagination="pagination"
      :search-fields="searchFields"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
    >
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
      width="600px"
      @confirm="handleSubmit"
    >
      <el-form-item label="功能名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入功能名称" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
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
import { ref, reactive } from 'vue'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { handleApiResponse } from '@/utils/responseHandler'
import * as workflowFunctionApi from '@/api/workflow/workflow-function'

const tableRef = ref(null)
const submitLoading = ref(false)

const columns = [
  { prop: 'name', label: '功能名称', minWidth: 200 },
  { prop: 'description', label: '描述', minWidth: 250, showOverflowTooltip: true },
  { prop: 'status', label: '状态', width: 80, slot: 'status' },
  { prop: 'createTime', label: '创建时间', width: 180 }
]

const searchFields = [
  { type: 'input', prop: 'name', label: '功能名称', placeholder: '请输入功能名称' },
  { type: 'select', prop: 'status', label: '状态', placeholder: '请选择状态',
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ]
  }
]

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = reactive({
  id: null,
  name: '',
  description: '',
  status: 1
})

const formRules = {
  name: [{ required: true, message: '请输入功能名称', trigger: 'blur' }]
}

const handleAdd = () => {
  dialogTitle.value = '新增功能'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑功能'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除功能"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await workflowFunctionApi.deleteWorkflowFunction(row.id)
      if (handleApiResponse(res, '删除成功', '删除失败')) {
        tableRef.value?.refresh()
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleBatchDelete = async (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个功能吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.id)
      const res = await workflowFunctionApi.batchDeleteWorkflowFunction(ids)
      if (handleApiResponse(res, '批量删除成功', '批量删除失败')) {
        tableRef.value?.refresh()
      }
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  submitLoading.value = true
  try {
    const res = formData.id
      ? await workflowFunctionApi.updateWorkflowFunction(formData)
      : await workflowFunctionApi.addWorkflowFunction(formData)
    if (handleApiResponse(res, formData.id ? '编辑成功' : '新增成功', '提交失败')) {
      dialogVisible.value = false
      tableRef.value?.refresh()
    }
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    description: '',
    status: 1
  })
}
</script>

<style scoped>
.workflow-function {
  height: 100%;
}
</style>