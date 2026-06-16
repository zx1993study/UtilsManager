<template>
  <div class="page-result">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="pageResultApi.getPageTestResultList"
      :pagination="pagination"
      :search-fields="searchFields"
      :show-add="false"
      :show-edit="false"
      :show-selection="true"
      :operation-width="190"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
    >
      <template #resultStatus="{ row }">
        <el-tag :type="getStatusType(row.resultStatus)">
          {{ getStatusText(row.resultStatus) }}
        </el-tag>
      </template>

      <template #operation="{ row }">
        <el-button type="primary" size="small" link @click.stop="handleView(row)">
          <el-icon><View /></el-icon>
          <span>查看详情</span>
        </el-button>
      </template>
    </common-table>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { View } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable.vue'
import * as pageResultApi from '@/api/page/page-result'
import { handleApiResponse } from '@/utils/responseHandler'

const router = useRouter()
const tableRef = ref(null)

const columns = [
  { prop: 'pageResultId', label: '结果ID', width: 90 },
  { prop: 'pageName', label: '页面功能名称', minWidth: 160 },
  { prop: 'testcaseName', label: '测试用例名称', minWidth: 180 },
  { prop: 'resultStatus', label: '执行结果', width: 100, slot: 'resultStatus' },
  { prop: 'code', label: '编码', width: 90 },
  { prop: 'executeTime', label: '执行时间', width: 180 }
]

const searchFields = [
  { type: 'input', prop: 'testcaseName', label: '测试用例名称', placeholder: '请输入测试用例名称' },
  {
    type: 'select',
    prop: 'resultStatus',
    label: '执行结果',
    placeholder: '请选择执行结果',
    options: [
      { label: '成功', value: 1 },
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
  return status === 1 ? '成功' : '失败'
}

const handleView = (row) => {
  router.push({
    name: 'PageResultDetail',
    params: { resultId: row.pageResultId }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该测试结果吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await pageResultApi.deletePageResult(row.pageResultId)
    if (handleApiResponse(res, '删除成功', '删除失败')) {
      tableRef.value?.refresh()
    }
  }).catch(() => {})
}

const handleBatchDelete = (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 条测试结果吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const ids = rows.map(row => row.pageResultId)
    const res = await pageResultApi.batchDeletePageResult(ids)
    if (handleApiResponse(res, '批量删除成功', '批量删除失败')) {
      tableRef.value?.refresh()
      tableRef.value?.clearSelection()
    }
  }).catch(() => {})
}
</script>

<style scoped>
.page-result {
  height: 100%;
}
</style>
