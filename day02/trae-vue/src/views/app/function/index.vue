<template>
  <div class="app-page">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="getAppList"
      :pagination="pagination"
      :search-fields="searchFields"
      :show-selection="true"
      :show-copy="true"
      row-key="appId"
      operation-width="230"
      @add="openAdd"
      @edit="openEdit"
      @copy="openCopy"
      @delete="removeOne"
      @batch-delete="removeBatch"
    >
      <template #status="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
      </template>
      <template #operation="{ row }">
        <el-button type="success" size="small" link @click="goTemplate(row)">模板</el-button>
      </template>
    </common-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="780px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="App功能名称" prop="appName"><el-input v-model="form.appName" /></el-form-item>
        <el-form-item label="项目ID"><el-input-number v-model="form.projectId" :min="1" style="width:100%" /></el-form-item>
        <el-form-item label="平台"><el-select v-model="form.platform" style="width:100%"><el-option v-for="i in platformOptions" :key="i.value" :label="i.label" :value="i.value" /></el-select></el-form-item>
        <el-form-item label="包名"><el-input v-model="form.appPackage" /></el-form-item>
        <el-form-item label="Activity"><el-input v-model="form.appActivity" /></el-form-item>
        <el-form-item label="Bundle ID"><el-input v-model="form.bundleId" /></el-form-item>
        <el-form-item label="设备名称"><el-input v-model="form.deviceName" /></el-form-item>
        <el-form-item label="系统版本"><el-input v-model="form.platformVersion" /></el-form-item>
        <el-form-item label="Appium服务"><el-input v-model="form.appiumServer" /></el-form-item>
        <el-form-item label="能力JSON"><el-input v-model="form.desiredCaps" type="textarea" :rows="5" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :label="1">启用</el-radio><el-radio :label="0">禁用</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import CommonTable from '@/components/CommonTable.vue'
import { addApp, batchDeleteApp, deleteApp, getAppList, updateApp } from '@/api/app/app'
import { confirmDelete, handleApi, platformOptions } from '../shared'

const router = useRouter()
const tableRef = ref(null)
const formRef = ref(null)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const mode = ref('add')
const loading = ref(false)
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const form = reactive({})

const columns = [
  { prop: 'appName', label: 'App功能名称', minWidth: 180 },
  { prop: 'platform', label: '平台', width: 100 },
  { prop: 'appPackage', label: '包名', minWidth: 160 },
  { prop: 'appActivity', label: 'Activity', minWidth: 160 },
  { prop: 'deviceName', label: '设备', width: 130 },
  { prop: 'appiumServer', label: 'Appium服务', minWidth: 180 },
  { prop: 'status', label: '状态', width: 90, slot: 'status' }
]
const searchFields = [
  { prop: 'appName', label: '功能名称', type: 'input' },
  { prop: 'projectId', label: '项目ID', type: 'input' }
]
const rules = { appName: [{ required: true, message: '请输入App功能名称', trigger: 'blur' }] }

function reset(row = {}) {
  Object.assign(form, {
    appId: row.appId || null,
    appName: row.appName || '',
    projectId: row.projectId || null,
    platform: row.platform || 'Android',
    appPackage: row.appPackage || '',
    appActivity: row.appActivity || '',
    bundleId: row.bundleId || '',
    deviceName: row.deviceName || '',
    platformVersion: row.platformVersion || '',
    appiumServer: row.appiumServer || 'http://127.0.0.1:4723',
    desiredCaps: row.desiredCaps || '',
    description: row.description || '',
    status: row.status ?? 1
  })
}
function openAdd() { mode.value = 'add'; dialogTitle.value = '新增App功能'; reset(); dialogVisible.value = true }
function openEdit(row) { mode.value = 'edit'; dialogTitle.value = '编辑App功能'; reset(row); dialogVisible.value = true }
function openCopy(row) { mode.value = 'add'; dialogTitle.value = '复制App功能'; reset({ ...row, appId: null, appName: `${row.appName}_copy` }); dialogVisible.value = true }
async function submit() {
  await formRef.value.validate(async valid => {
    if (!valid) return
    loading.value = true
    try {
      const res = mode.value === 'edit' ? await updateApp(form) : await addApp(form)
      if (handleApi(res)) { dialogVisible.value = false; tableRef.value?.refresh() }
    } finally { loading.value = false }
  })
}
function removeOne(row) { confirmDelete(`确定删除「${row.appName}」吗？`, async () => { if (handleApi(await deleteApp(row.appId))) tableRef.value?.refresh() }) }
function removeBatch(rows) { confirmDelete(`确定删除选中的 ${rows.length} 条App功能吗？`, async () => { if (handleApi(await batchDeleteApp(rows.map(i => i.appId)))) tableRef.value?.refresh() }) }
function goTemplate(row) { router.push({ path: '/app/template', query: { appId: row.appId } }) }
</script>
