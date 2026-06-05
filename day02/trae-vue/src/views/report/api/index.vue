<template>
  <div class="report-api">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="reportApiApi.getApiReportList"
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
import * as reportApiApi from '@/api/report/report-api'

const tableRef = ref(null)

const columns = [
  { prop: 'reportName', label: '报告名称', minWidth: 250 },
  { prop: 'totalCases', label: '总用例数', width: 100 },
  { prop: 'passCount', label: '通过数', width: 100 },
  { prop: 'failCount', label: '失败数', width: 100 },
  { prop: 'passRate', label: '通过率', width: 100 },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { prop: 'generateTime', label: '生成时间', width: 180 }
]

const searchFields = [
  { type: 'input', prop: 'reportName', label: '报告名称', placeholder: '请输入报告名称' },
  { type: 'select', prop: 'status', label: '状态', placeholder: '请选择状态',
    options: [
      { label: '已完成', value: 1 },
      { label: '生成中', value: 0 }
    ]
  }
]

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const getStatusType = (status) => {
  return status === 1 ? 'success' : 'warning'
}

const getStatusText = (status) => {
  return status === 1 ? '已完成' : '生成中'
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该报告吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await reportApiApi.deleteReportApi(row.id)
      ElMessage.success('删除成功')
      tableRef.value?.refresh()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleBatchDelete = async (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个报告吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.id)
      await reportApiApi.batchDeleteReportApi(ids)
      ElMessage.success('批量删除成功')
      tableRef.value?.refresh()
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {})
}
</script>

<style scoped>
.report-api {
  height: 100%;
}
</style>
