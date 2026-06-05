<template>
  <div class="workflow-result">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="workflowResultApi.getWorkflowResultList"
      :pagination="pagination"
      :search-fields="searchFields"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      :show-add="false"
      :show-edit="false"
    >
      <template #status="{ row }">
        <el-tag :type="getStatusType(row.status)">
          {{ getStatusText(row.status) }}
        </el-tag>
      </template>
    </common-table>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import CommonTable from '@/components/CommonTable.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as workflowResultApi from '@/api/workflow/workflow-result'

const tableRef = ref(null)

const columns = [
  { prop: 'workflowName', label: '工作流名称', minWidth: 200 },
  { prop: 'status', label: '测试结果', width: 100, slot: 'status' },
  { prop: 'executeTime', label: '执行时间', width: 180 }
]

const searchFields = [
  { type: 'input', prop: 'workflowName', label: '工作流名称', placeholder: '请输入工作流名称' },
  { type: 'select', prop: 'status', label: '测试结果', placeholder: '请选择状态',
    options: [
      { label: '通过', value: 1 },
      { label: '失败', value: 0 }
    ]
  }
]

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const getStatusType = (status) => {
  return status === 1 ? 'success' : 'danger'
}

const getStatusText = (status) => {
  return status === 1 ? '通过' : '失败'
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该测试结果吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await workflowResultApi.deleteWorkflowResult(row.id)
      ElMessage.success('删除成功')
      tableRef.value?.refresh()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleBatchDelete = async (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个测试结果吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.id)
      await workflowResultApi.batchDeleteWorkflowResult(ids)
      ElMessage.success('批量删除成功')
      tableRef.value?.refresh()
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {})
}
</script>

<style scoped>
.workflow-result {
  height: 100%;
}
</style>