<template>
  <div class="workflow-step">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="workflowStepApi.getWorkflowStepList"
      :pagination="pagination"
      :search-fields="searchFields"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
    />

    <common-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :form-data="formData"
      :rules="formRules"
      :loading="submitLoading"
      width="700px"
      @confirm="handleSubmit"
    >
      <el-form-item label="步骤名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入步骤名称" />
      </el-form-item>
      <el-form-item label="步骤描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入步骤描述" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" style="width: 100%" />
      </el-form-item>
    </common-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as workflowStepApi from '@/api/workflow/workflow-step'

const tableRef = ref(null)
const submitLoading = ref(false)

const columns = [
  { prop: 'name', label: '步骤名称', minWidth: 200 },
  { prop: 'description', label: '步骤描述', minWidth: 250, showOverflowTooltip: true },
  { prop: 'sort', label: '排序', width: 80 },
  { prop: 'createTime', label: '创建时间', width: 180 }
]

const searchFields = [
  { type: 'input', prop: 'name', label: '步骤名称', placeholder: '请输入步骤名称' }
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
  sort: 0
})

const formRules = {
  name: [{ required: true, message: '请输入步骤名称', trigger: 'blur' }]
}

const handleAdd = () => {
  dialogTitle.value = '新增步骤'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑步骤'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除步骤"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await workflowStepApi.deleteWorkflowStep(row.id)
      ElMessage.success('删除成功')
      tableRef.value?.refresh()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleBatchDelete = async (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个步骤吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.id)
      await workflowStepApi.batchDeleteWorkflowStep(ids)
      ElMessage.success('批量删除成功')
      tableRef.value?.refresh()
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  submitLoading.value = true
  try {
    if (formData.id) {
      await workflowStepApi.updateWorkflowStep(formData)
      ElMessage.success('编辑成功')
    } else {
      await workflowStepApi.addWorkflowStep(formData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    tableRef.value?.refresh()
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
    sort: 0
  })
}
</script>

<style scoped>
.workflow-step {
  height: 100%;
}
</style>