<template>
  <div class="page-template">
    <common-table
      ref="tableRef"
      row-key="elementId"
      :columns="columns"
      :api-method="pageTemplateApi.getPageTemplateList"
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
      <template #locatorType="{ row }">
        <el-tag effect="plain">{{ getOptionLabel(locatorTypeOptions, row.locatorType) }}</el-tag>
      </template>

      <template #elementType="{ row }">
        <el-tag :type="row.elementType === 3 ? 'success' : row.elementType === 2 ? 'warning' : 'primary'" effect="plain">
          {{ getOptionLabel(elementTypeOptions, row.elementType) }}
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
      width="760px"
      @confirm="handleSubmit"
    >
      <el-form-item label="元素名称" prop="elementName">
        <el-input v-model="formData.elementName" placeholder="请输入元素名称" clearable />
      </el-form-item>

      <el-form-item label="页面ID" prop="pageId">
        <el-input-number v-model="formData.pageId" :min="1" style="width: 100%" />
      </el-form-item>

      <el-form-item label="定位器类型" prop="locatorType">
        <el-select v-model="formData.locatorType" placeholder="请选择定位器类型" style="width: 100%">
          <el-option v-for="item in locatorTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="元素类型" prop="elementType">
        <el-select v-model="formData.elementType" placeholder="请选择元素类型" style="width: 100%">
          <el-option v-for="item in elementTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="操作" prop="operation">
        <el-select v-model="formData.operation" placeholder="请选择操作" style="width: 100%">
          <el-option v-for="item in operationOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="元素定位值" prop="elementValue">
        <el-input
          v-model="formData.elementValue"
          type="textarea"
          :rows="5"
          placeholder='例如 {"locatorType":1,"value":"登录","role":"button"}'
        />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="4"
          placeholder='可保存参数key，例如 {"paramKey":"username","defaultValue":"admin"}'
        />
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
import * as pageTemplateApi from '@/api/page/page-template'
import { handleApiResponse } from '@/utils/responseHandler'

const tableRef = ref(null)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const mode = ref('add')

const locatorTypeOptions = [
  { label: 'role', value: 1 },
  { label: 'placeholder', value: 2 },
  { label: 'text', value: 3 },
  { label: 'listitem_text', value: 4 },
  { label: 'CSS', value: 5 },
  { label: 'label', value: 6 }
]

const elementTypeOptions = [
  { label: '文本框', value: 1 },
  { label: '下拉框', value: 2 },
  { label: '按钮', value: 3 },
  { label: '文本/选项', value: 4 }
]

const operationOptions = [
  { label: '点击', value: 1 },
  { label: '填写', value: 2 },
  { label: '选择', value: 3 },
  { label: '上传文件', value: 4 }
]

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]

const getOptionLabel = (options, value) => {
  return options.find(item => item.value === value)?.label || value || '-'
}

const columns = [
  { prop: 'elementName', label: '元素名称', minWidth: 150 },
  { prop: 'pageId', label: '页面ID', width: 90 },
  { prop: 'locatorType', label: '定位器', width: 130, slot: 'locatorType' },
  { prop: 'elementType', label: '元素类型', width: 120, slot: 'elementType' },
  { prop: 'elementValue', label: '元素定位值', minWidth: 260, showOverflowTooltip: true },
  { prop: 'remark', label: '备注', minWidth: 220, showOverflowTooltip: true },
  { prop: 'status', label: '状态', width: 90, slot: 'status' },
  { prop: 'createTime', label: '创建时间', width: 180 }
]

const searchFields = [
  { type: 'input', prop: 'elementName', label: '元素名称', placeholder: '请输入元素名称' },
  { type: 'input', prop: 'pageId', label: '页面ID', placeholder: '请输入页面ID' },
  { type: 'select', prop: 'locatorType', label: '定位器', placeholder: '请选择定位器', options: locatorTypeOptions },
  { type: 'select', prop: 'elementType', label: '元素类型', placeholder: '请选择元素类型', options: elementTypeOptions },
  { type: 'select', prop: 'operation', label: '操作', placeholder: '请选择操作', options: operationOptions },
  { type: 'select', prop: 'status', label: '状态', placeholder: '请选择状态', options: statusOptions }
]

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive({
  elementId: null,
  elementName: '',
  pageId: null,
  locatorType: 1,
  elementValue: '',
  elementType: 1,
  operation: 1,
  remark: '',
  status: 1
})

const formRules = {
  elementName: [{ required: true, message: '请输入元素名称', trigger: 'blur' }],
  pageId: [{ required: true, message: '请输入页面ID', trigger: 'change' }],
  locatorType: [{ required: true, message: '请选择定位器类型', trigger: 'change' }],
  elementValue: [{ required: true, message: '请输入元素定位值', trigger: 'blur' }],
  elementType: [{ required: true, message: '请选择元素类型', trigger: 'change' }],
  operation: [{ required: true, message: '请选择操作', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const resetForm = () => {
  Object.assign(formData, {
    elementId: null,
    elementName: '',
    pageId: null,
    locatorType: 1,
    elementValue: '',
    elementType: 1,
    operation: 1,
    remark: '',
    status: 1
  })
}

const fillForm = (row) => {
  Object.assign(formData, {
    elementId: row.elementId,
    elementName: row.elementName || '',
    pageId: row.pageId || null,
    locatorType: row.locatorType ?? 1,
    elementValue: row.elementValue || '',
    elementType: row.elementType ?? 1,
    operation: row.operation ?? 1,
    remark: row.remark || '',
    status: row.status ?? 1
  })
}

const buildPayload = () => ({
  elementName: formData.elementName,
  pageId: formData.pageId,
  locatorType: formData.locatorType,
  elementValue: formData.elementValue,
  elementType: formData.elementType,
  operation: formData.operation,
  remark: formData.remark,
  status: formData.status
})

const handleAdd = () => {
  resetForm()
  mode.value = 'add'
  dialogTitle.value = '新增元素模板'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  fillForm(row)
  mode.value = 'edit'
  dialogTitle.value = '编辑元素模板'
  dialogVisible.value = true
}

const handleCopy = (row) => {
  fillForm(row)
  formData.elementId = null
  formData.elementName = `${row.elementName || ''}_副本`
  mode.value = 'add'
  dialogTitle.value = '复制元素模板'
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除元素模板「${row.elementName}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await pageTemplateApi.deletePageTemplate(row.elementId)
    if (handleApiResponse(res, '删除成功', '删除失败')) {
      tableRef.value?.refresh()
    }
  }).catch(() => {})
}

const handleBatchDelete = (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 条元素模板吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const ids = rows.map(row => row.elementId)
    const res = await pageTemplateApi.batchDeletePageTemplate(ids)
    if (handleApiResponse(res, '批量删除成功', '批量删除失败')) {
      tableRef.value?.clearSelection()
      tableRef.value?.refresh()
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  submitLoading.value = true
  try {
    const res = mode.value === 'edit'
      ? await pageTemplateApi.updatePageTemplate({ elementId: formData.elementId, ...buildPayload() })
      : await pageTemplateApi.addPageTemplate(buildPayload())

    if (handleApiResponse(res, mode.value === 'edit' ? '编辑成功' : '保存成功', mode.value === 'edit' ? '编辑失败' : '保存失败')) {
      dialogVisible.value = false
      tableRef.value?.refresh()
    }
  } finally {
    submitLoading.value = false
  }
}
</script>

<style scoped>
.page-template {
  height: 100%;
}
</style>
