<template>
  <div class="app-page">
    <common-table ref="tableRef" :columns="columns" :api-method="getAppCaseList" :pagination="pagination" :search-fields="searchFields" :show-selection="true" :show-copy="true" row-key="appInstanceId" operation-width="300" @add="openAdd" @edit="openEdit" @copy="openCopy" @delete="removeOne" @batch-delete="removeBatch" @selection-change="rows => selectedRows = rows">
      <template #operationJson="{ row }"><pre class="json-preview">{{ prettyJson(row.operationJson) }}</pre></template>
      <template #status="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '成功/启用' : '失败/禁用' }}</el-tag></template>
      <template #toolbar-left><el-button type="success" :disabled="!selectedRows.length" @click="runBatch">批量执行</el-button></template>
      <template #operation="{ row }"><el-button type="success" size="small" link @click="runOne(row)">执行</el-button></template>
    </common-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="760px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="用例名称" prop="instanceName"><el-input v-model="form.instanceName" /></el-form-item>
        <el-form-item label="App ID" prop="appId"><el-input-number v-model="form.appId" :min="1" style="width:100%" /></el-form-item>
        <el-form-item label="参数JSON"><el-input v-model="form.operationJson" type="textarea" :rows="6" placeholder='{"username":"admin"}' /></el-form-item>
        <el-form-item label="期望结果"><el-input v-model="form.expectResult" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :label="1">启用</el-radio><el-radio :label="0">禁用</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" :loading="loading" @click="submit">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import CommonTable from '@/components/CommonTable.vue'
import { addAppCase, batchDeleteAppCase, deleteAppCase, executeAppCase, getAppCaseList, updateAppCase } from '@/api/app/app'
import { confirmDelete, handleApi, prettyJson } from '../shared'

const tableRef = ref(null)
const formRef = ref(null)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const mode = ref('add')
const loading = ref(false)
const selectedRows = ref([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const form = reactive({})

const columns = [
  { prop: 'instanceName', label: '测试用例名称', minWidth: 170 },
  { prop: 'appId', label: 'App ID', width: 90 },
  { prop: 'operationJson', label: '参数JSON', minWidth: 260, slot: 'operationJson' },
  { prop: 'expectResult', label: '期望结果', minWidth: 160 },
  { prop: 'execCount', label: '执行次数', width: 100 },
  { prop: 'screenPhotoFile', label: '最新截图', minWidth: 160 },
  { prop: 'status', label: '状态', width: 110, slot: 'status' }
]
const searchFields = [
  { prop: 'appId', label: 'App ID', type: 'input' },
  { prop: 'instanceName', label: '用例名称', type: 'input' }
]
const rules = {
  instanceName: [{ required: true, message: '请输入用例名称', trigger: 'blur' }],
  appId: [{ required: true, message: '请输入App ID', trigger: 'change' }]
}
function reset(row = {}) { Object.assign(form, { appInstanceId: row.appInstanceId || null, appId: row.appId || null, instanceName: row.instanceName || '', operationJson: row.operationJson || '{}', expectResult: row.expectResult || '', description: row.description || '', status: row.status ?? 1 }) }
function openAdd() { mode.value = 'add'; dialogTitle.value = '新增测试用例'; reset(); dialogVisible.value = true }
function openEdit(row) { mode.value = 'edit'; dialogTitle.value = '编辑测试用例'; reset(row); dialogVisible.value = true }
function openCopy(row) { mode.value = 'add'; dialogTitle.value = '复制测试用例'; reset({ ...row, appInstanceId: null, instanceName: `${row.instanceName}_copy` }); dialogVisible.value = true }
async function submit() { await formRef.value.validate(async valid => { if (!valid) return; loading.value = true; try { const res = mode.value === 'edit' ? await updateAppCase(form) : await addAppCase(form); if (handleApi(res)) { dialogVisible.value = false; tableRef.value?.refresh() } } finally { loading.value = false } }) }
function removeOne(row) { confirmDelete(`确定删除「${row.instanceName}」吗？`, async () => { if (handleApi(await deleteAppCase(row.appInstanceId))) tableRef.value?.refresh() }) }
function removeBatch(rows) { confirmDelete(`确定删除选中的 ${rows.length} 条用例吗？`, async () => { if (handleApi(await batchDeleteAppCase(rows.map(i => i.appInstanceId)))) tableRef.value?.refresh() }) }
async function runOne(row) { const res = await executeAppCase(row.appId, [row.appInstanceId]); if (handleApi(res, '执行完成')) tableRef.value?.refresh() }
async function runBatch() {
  const appId = selectedRows.value[0]?.appId
  if (!appId) return
  const rows = selectedRows.value.filter(i => i.appId === appId)
  if (rows.length !== selectedRows.value.length) return handleApi({ success: false, msg: '请选择同一个App下的用例' })
  const res = await executeAppCase(appId, rows.map(i => i.appInstanceId))
  if (handleApi(res, '执行完成')) tableRef.value?.refresh()
}
</script>

<style scoped>
.json-preview { margin: 0; white-space: pre-wrap; text-align: left; max-height: 90px; overflow: auto; }
</style>
