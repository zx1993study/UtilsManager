<template>
  <div class="app-page">
    <common-table ref="tableRef" :columns="columns" :api-method="getAppResultList" :pagination="pagination" :search-fields="searchFields" :show-selection="true" row-key="appResultId" operation-width="160" @delete="removeOne" @batch-delete="removeBatch">
      <template #resultStatus="{ row }"><el-tag :type="row.resultStatus === 1 ? 'success' : 'danger'">{{ row.resultStatus === 1 ? '成功' : '失败' }}</el-tag></template>
      <template #responseInfo="{ row }"><pre class="log-preview">{{ row.responseInfo }}</pre></template>
      <template #screenshotPath="{ row }"><span>{{ parseScreenshots(row.screenshotPath).join(', ') || '-' }}</span></template>
    </common-table>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import CommonTable from '@/components/CommonTable.vue'
import { batchDeleteAppResult, deleteAppResult, getAppResultList } from '@/api/app/app'
import { confirmDelete, handleApi } from '../shared'

const tableRef = ref(null)
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const columns = [
  { prop: 'appResultId', label: '结果ID', width: 90 },
  { prop: 'appInstanceId', label: '用例ID', width: 90 },
  { prop: 'resultStatus', label: '状态', width: 90, slot: 'resultStatus' },
  { prop: 'code', label: 'Code', width: 90 },
  { prop: 'responseInfo', label: '响应信息', minWidth: 280, slot: 'responseInfo' },
  { prop: 'screenshotPath', label: '截图', minWidth: 180, slot: 'screenshotPath' },
  { prop: 'createTime', label: '执行时间', width: 180 }
]
const searchFields = [
  { prop: 'appInstanceId', label: '用例ID', type: 'input' },
  { prop: 'resultStatus', label: '状态', type: 'select', options: [{ label: '成功', value: 1 }, { label: '失败', value: 0 }] }
]
function parseScreenshots(value) { try { const list = JSON.parse(value || '[]'); return Array.isArray(list) ? list : [] } catch { return [] } }
function removeOne(row) { confirmDelete(`确定删除结果 ${row.appResultId} 吗？`, async () => { if (handleApi(await deleteAppResult(row.appResultId))) tableRef.value?.refresh() }) }
function removeBatch(rows) { confirmDelete(`确定删除选中的 ${rows.length} 条结果吗？`, async () => { if (handleApi(await batchDeleteAppResult(rows.map(i => i.appResultId)))) tableRef.value?.refresh() }) }
</script>

<style scoped>
.log-preview { margin: 0; max-height: 100px; overflow: auto; white-space: pre-wrap; text-align: left; }
</style>
