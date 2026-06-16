<template>
  <div class="app-page">
    <common-table ref="tableRef" :columns="columns" :api-method="getAppTemplateList" :pagination="pagination" :search-fields="searchFields" :show-selection="true" :show-copy="true" row-key="templateId" operation-width="220" @add="openAdd" @edit="openEdit" @copy="openCopy" @delete="removeOne" @batch-delete="removeBatch">
      <template #actionType="{ row }"><el-tag>{{ row.actionType }}</el-tag></template>
      <template #status="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag></template>
    </common-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="720px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="模板名称" prop="templateName"><el-input v-model="form.templateName" /></el-form-item>
        <el-form-item label="App ID" prop="appId"><el-input-number v-model="form.appId" :min="1" style="width:100%" /></el-form-item>
        <el-form-item label="定位方式"><el-select v-model="form.locatorType" style="width:100%"><el-option v-for="i in locatorOptions" :key="i.value" :label="i.label" :value="i.value" /></el-select></el-form-item>
        <el-form-item label="定位值" prop="locatorValue"><el-input v-model="form.locatorValue" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="元素类型"><el-select v-model="form.elementType" style="width:100%"><el-option v-for="i in elementOptions" :key="i.value" :label="i.label" :value="i.value" /></el-select></el-form-item>
        <el-form-item label="操作类型"><el-select v-model="form.actionType" style="width:100%"><el-option v-for="i in actionOptions" :key="i.value" :label="i.label" :value="i.value" /></el-select></el-form-item>
        <el-form-item label="参数Key"><el-input v-model="form.inputKey" /></el-form-item>
        <el-form-item label="默认值"><el-input v-model="form.defaultValue" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="1" style="width:100%" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :label="1">启用</el-radio><el-radio :label="0">禁用</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" :loading="loading" @click="submit">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import CommonTable from '@/components/CommonTable.vue'
import { addAppTemplate, batchDeleteAppTemplate, deleteAppTemplate, getAppTemplateList, updateAppTemplate } from '@/api/app/app'
import { actionOptions, confirmDelete, elementOptions, handleApi, locatorOptions } from '../shared'

const route = useRoute()
const tableRef = ref(null)
const formRef = ref(null)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const mode = ref('add')
const loading = ref(false)
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const form = reactive({})

const columns = [
  { prop: 'templateName', label: '模板名称', minWidth: 160 },
  { prop: 'appId', label: 'App ID', width: 90 },
  { prop: 'locatorType', label: '定位方式', width: 140 },
  { prop: 'locatorValue', label: '定位值', minWidth: 220 },
  { prop: 'actionType', label: '操作', width: 100, slot: 'actionType' },
  { prop: 'inputKey', label: '参数Key', width: 120 },
  { prop: 'sortOrder', label: '排序', width: 80 },
  { prop: 'status', label: '状态', width: 90, slot: 'status' }
]
const searchFields = [
  { prop: 'appId', label: 'App ID', type: 'input' },
  { prop: 'templateName', label: '模板名称', type: 'input' }
]
const rules = {
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  appId: [{ required: true, message: '请输入App ID', trigger: 'change' }],
  locatorValue: [{ required: true, message: '请输入定位值', trigger: 'blur' }]
}
function reset(row = {}) {
  Object.assign(form, { templateId: row.templateId || null, templateName: row.templateName || '', appId: row.appId || Number(route.query.appId) || null, locatorType: row.locatorType || 'id', locatorValue: row.locatorValue || '', elementType: row.elementType || 'input', actionType: row.actionType || 'click', inputKey: row.inputKey || '', defaultValue: row.defaultValue || '', sortOrder: row.sortOrder || 1, status: row.status ?? 1 })
}
function openAdd() { mode.value = 'add'; dialogTitle.value = '新增App模板'; reset(); dialogVisible.value = true }
function openEdit(row) { mode.value = 'edit'; dialogTitle.value = '编辑App模板'; reset(row); dialogVisible.value = true }
function openCopy(row) { mode.value = 'add'; dialogTitle.value = '复制App模板'; reset({ ...row, templateId: null, templateName: `${row.templateName}_copy` }); dialogVisible.value = true }
async function submit() { await formRef.value.validate(async valid => { if (!valid) return; loading.value = true; try { const res = mode.value === 'edit' ? await updateAppTemplate(form) : await addAppTemplate(form); if (handleApi(res)) { dialogVisible.value = false; tableRef.value?.refresh() } } finally { loading.value = false } }) }
function removeOne(row) { confirmDelete(`确定删除「${row.templateName}」吗？`, async () => { if (handleApi(await deleteAppTemplate(row.templateId))) tableRef.value?.refresh() }) }
function removeBatch(rows) { confirmDelete(`确定删除选中的 ${rows.length} 条模板吗？`, async () => { if (handleApi(await batchDeleteAppTemplate(rows.map(i => i.templateId)))) tableRef.value?.refresh() }) }
</script>
