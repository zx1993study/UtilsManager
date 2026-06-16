<template>
  <div class="page-function-detail">
    <el-card shadow="never" class="header-card">
      <div class="header-content">
        <div class="title-block">
          <h2 class="page-title">{{ pageInfo.pageName || '页面功能详情' }}</h2>
          <span class="url-text">{{ pageInfo.pageUrl || '-' }}</span>
        </div>
        <el-button @click="router.back()">
          <el-icon><Back /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
    </el-card>

    <div class="content-layout">
      <el-card shadow="never" class="left-panel">
        <el-tabs v-model="leftActiveTab" class="panel-tabs">
          <el-tab-pane label="参数JSON" name="params">
            <div v-if="selectedInstance" class="tab-content">
              <pre class="json-content">{{ formatJson(selectedOperationJson) }}</pre>
            </div>
            <el-empty v-else description="请选择实例" />
          </el-tab-pane>

          <el-tab-pane label="结果详情" name="result">
            <div v-if="selectedInstance" class="tab-content">
              <el-descriptions v-if="latestResult" :column="1" border>
                <el-descriptions-item label="状态">
                  <el-tag :type="latestResult.resultStatus === 1 ? 'success' : 'danger'">
                    {{ latestResult.resultStatus === 1 ? '成功' : '失败' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="Code">
                  {{ latestResult.code || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="返回信息">
                  <pre class="json-content">{{ latestResult.responseInfo || '-' }}</pre>
                </el-descriptions-item>
              </el-descriptions>

              <div v-if="screenshotList.length" class="screenshot-list">
                <el-image
                  v-for="name in screenshotList"
                  :key="name"
                  :src="buildScreenshotUrl(name)"
                  :preview-src-list="screenshotUrls"
                  fit="contain"
                  class="screenshot-image"
                />
              </div>
              <el-empty v-else description="暂无截图" />
            </div>
            <el-empty v-else description="请选择实例" />
          </el-tab-pane>

          <el-tab-pane label="元素模板" name="elements">
            <div class="tab-content">
              <div class="table-actions">
                <el-button type="primary" @click="handleAddElement">
                  <el-icon><Plus /></el-icon>
                  <span>新增</span>
                </el-button>
              </div>

              <common-table
                :data="elementTemplates"
                :columns="elementColumns"
                :loading="elementLoading"
                :show-toolbar="false"
                :show-pagination="false"
                :show-operation="true"
                :show-edit="false"
                :show-delete="false"
                :show-index="false"
                :operation-width="150"
                row-key="elementId"
              >
                <template #locatorType="{ row }">
                  <el-tag effect="plain">{{ getOptionLabel(locatorTypeOptions, row.locatorType) }}</el-tag>
                </template>
                <template #elementType="{ row }">
                  <el-tag effect="plain">{{ getOptionLabel(elementTypeOptions, row.elementType) }}</el-tag>
                </template>
                <template #operation="{ row }">
                  <el-button type="primary" size="small" link @click="handleEditElement(row)">
                    <el-icon><Edit /></el-icon>
                    <span>编辑</span>
                  </el-button>
                  <el-button type="danger" size="small" link @click="handleDeleteElement(row)">
                    <el-icon><Delete /></el-icon>
                    <span>删除</span>
                  </el-button>
                </template>
              </common-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <el-card shadow="never" class="right-panel">
        <el-tabs v-model="rightActiveTab" class="panel-tabs">
          <el-tab-pane label="实例列表" name="instances">
            <div class="table-actions">
              <el-button
                type="success"
                :loading="batchRunning"
                :disabled="!selectedRows.length || batchRunning || !!runningInstanceIds.length"
                @click="handleBatchRun"
              >
                <el-icon><VideoPlay /></el-icon>
                <span>批量运行 ({{ selectedRows.length }})</span>
              </el-button>
              <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
                <el-icon><Delete /></el-icon>
                <span>批量删除 ({{ selectedRows.length }})</span>
              </el-button>
              <el-button type="primary" @click="handleAddInstance">
                <el-icon><Plus /></el-icon>
                <span>添加</span>
              </el-button>
            </div>

            <common-table
              ref="instanceTableRef"
              :columns="instanceColumns"
              :api-method="getInstanceList"
              :pagination="pagination"
              :search-fields="[]"
              :show-add="false"
              :show-delete="false"
              :show-edit="false"
              :show-selection="true"
              :show-toolbar="false"
              :operation-width="280"
              row-key="pageInstanceId"
              @edit="handleEditInstance"
              @delete="handleDeleteInstance"
              @selection-change="handleSelectionChange"
              @row-click="handleViewInstance"
            >
              <template #status="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>

              <template #operation="{ row }">
                <el-button
                  type="success"
                  size="small"
                  link
                  :loading="isInstanceRunning(row.pageInstanceId)"
                  :disabled="isInstanceRunning(row.pageInstanceId)"
                  @click.stop="handleRunInstance(row)"
                >
                  <el-icon><VideoPlay /></el-icon>
                  <span>运行</span>
                </el-button>
                <el-button type="primary" size="small" link @click.stop="handleEditInstance(row)">
                  <el-icon><Edit /></el-icon>
                  <span>编辑</span>
                </el-button>
                <el-button type="primary" size="small" link @click.stop="handleCopyInstance(row)">
                  <el-icon><Plus /></el-icon>
                  <span>复制</span>
                </el-button>
                <el-button type="danger" size="small" link @click.stop="handleDeleteInstance(row)">
                  <el-icon><Delete /></el-icon>
                  <span>删除</span>
                </el-button>
              </template>
            </common-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <common-dialog
      v-model="instanceDialogVisible"
      :title="instanceDialogTitle"
      :form-data="instanceForm"
      :rules="instanceRules"
      :loading="submitLoading"
      width="720px"
      @confirm="handleSubmitInstance"
    >
      <el-form-item label="实例名称" prop="instanceName">
        <el-input v-model="instanceForm.instanceName" placeholder="请输入实例名称" />
      </el-form-item>
      <el-form-item label="操作JSON" prop="operationJson">
        <el-input v-model="instanceForm.operationJson" type="textarea" :rows="6" placeholder="请输入操作JSON" />
      </el-form-item>
      <el-form-item label="预期结果" prop="expectResult">
        <el-input v-model="instanceForm.expectResult" type="textarea" :rows="3" placeholder="请输入预期结果" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="instanceForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="instanceForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="instanceForm.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </common-dialog>

    <common-dialog
      v-model="elementDialogVisible"
      :title="elementDialogTitle"
      :form-data="elementForm"
      :rules="elementRules"
      :loading="elementSubmitLoading"
      width="760px"
      @confirm="handleSubmitElement"
    >
      <el-form-item label="元素名称" prop="elementName">
        <el-input v-model="elementForm.elementName" placeholder="请输入元素名称" clearable />
      </el-form-item>
      <el-form-item label="定位器类型" prop="locatorType">
        <el-select v-model="elementForm.locatorType" placeholder="请选择定位器类型" style="width: 100%">
          <el-option v-for="item in locatorTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="元素类型" prop="elementType">
        <el-select v-model="elementForm.elementType" placeholder="请选择元素类型" style="width: 100%">
          <el-option v-for="item in elementTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作" prop="operation">
        <el-select v-model="elementForm.operation" placeholder="请选择操作" style="width: 100%">
          <el-option v-for="item in operationOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="元素定位值" prop="elementValue">
        <el-input
          v-model="elementForm.elementValue"
          type="textarea"
          :rows="5"
          placeholder='例如 {"locatorType":5,"selector":"#submit","value":"#submit"}'
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="elementForm.remark"
          type="textarea"
          :rows="4"
          placeholder='可保存参数key，例如 {"paramKey":"username","defaultValue":"admin"}'
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="elementForm.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </common-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Back, Delete, Edit, Plus, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonDialog from '@/components/CommonDialog.vue'
import CommonTable from '@/components/CommonTable.vue'
import { getPageFunctionDetail } from '@/api/page/page-function'
import {
  addPageTestCase,
  batchDeletePageTestCase,
  batchExecutePageTestCase,
  deletePageTestCase,
  executePageTestCase,
  getPageTestCaseList,
  updatePageTestCase
} from '@/api/page/page-testcase'
import {
  addPageTemplate,
  deletePageTemplate,
  getPageTemplateByPage,
  updatePageTemplate
} from '@/api/page/page-template'
import { getLatestPageResultByInstance } from '@/api/page/page-result'
import { handleApiResponse } from '@/utils/responseHandler'

const route = useRoute()
const router = useRouter()
const pageId = Number(route.params.pageId)
const instanceTableRef = ref(null)
const selectedRows = ref([])
const selectedInstance = ref(null)
const latestResult = ref(null)
const elementTemplates = ref([])
const elementLoading = ref(false)
const elementSubmitLoading = ref(false)
const runningInstanceIds = ref([])
const batchRunning = ref(false)
const leftActiveTab = ref('elements')
const rightActiveTab = ref('instances')
const submitLoading = ref(false)
const instanceDialogVisible = ref(false)
const instanceDialogTitle = ref('')
const instanceMode = ref('add')
const elementDialogVisible = ref(false)
const elementDialogTitle = ref('')
const elementMode = ref('add')

const pageInfo = reactive({
  pageId,
  pageName: route.query.pageName || '',
  pageUrl: route.query.pageUrl || ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const instanceForm = reactive({
  pageInstanceId: null,
  pageId,
  instanceName: '',
  operationJson: '',
  expectResult: '',
  description: '',
  remark: '',
  status: 1
})

const instanceRules = {
  instanceName: [{ required: true, message: '请输入实例名称', trigger: 'blur' }],
  operationJson: [{ required: true, message: '请输入操作JSON', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const elementForm = reactive({
  elementId: null,
  elementName: '',
  pageId,
  locatorType: 5,
  elementValue: '',
  elementType: 1,
  operation: 1,
  remark: '',
  status: 1
})

const elementRules = {
  elementName: [{ required: true, message: '请输入元素名称', trigger: 'blur' }],
  locatorType: [{ required: true, message: '请选择定位器类型', trigger: 'change' }],
  elementValue: [{ required: true, message: '请输入元素定位值', trigger: 'blur' }],
  elementType: [{ required: true, message: '请选择元素类型', trigger: 'change' }],
  operation: [{ required: true, message: '请选择操作', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const instanceColumns = [
  { prop: 'instanceName', label: '实例名称', minWidth: 150 },
  { prop: 'expectResult', label: '预期结果', minWidth: 150 },
  { prop: 'description', label: '描述', minWidth: 180 },
  { prop: 'remark', label: '备注', minWidth: 160 },
  { prop: 'execCount', label: '执行次数', width: 100 },
  { prop: 'status', label: '状态', width: 90, slot: 'status' }
]

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

const elementColumns = [
  { prop: 'elementId', label: '序号', width: 90 },
  { prop: 'elementName', label: '元素名称', minWidth: 120 },
  { prop: 'locatorType', label: '定位器', width: 120, slot: 'locatorType' },
  { prop: 'elementType', label: '元素类型', width: 110, slot: 'elementType' },
  { prop: 'elementValue', label: '定位值', minWidth: 220, showOverflowTooltip: true },
  { prop: 'remark', label: '备注', minWidth: 160, showOverflowTooltip: true }
]

const getOptionLabel = (options, value) => {
  return options.find(item => item.value === value)?.label || value || '-'
}

const screenshotList = computed(() => latestResult.value?.screenshotPath || [])
const screenshotUrls = computed(() => screenshotList.value.map(buildScreenshotUrl))
const selectedOperationJson = computed(() => {
  return selectedInstance.value?.operationJson ?? selectedInstance.value?.operation_json ?? ''
})

const isInstanceRunning = (id) => runningInstanceIds.value.includes(id)

const setInstanceRunning = (id, running) => {
  runningInstanceIds.value = running
    ? [...new Set([...runningInstanceIds.value, id])]
    : runningInstanceIds.value.filter(item => item !== id)
}

const getInstanceList = (params) => {
  return getPageTestCaseList({
    ...params,
    pageId
  })
}

const parseRemark = (value) => {
  if (!value) return null
  try {
    return typeof value === 'string' ? JSON.parse(value) : value
  } catch (error) {
    return null
  }
}

const hasNthRemark = (remark) => {
  if (Array.isArray(remark)) {
    return remark.some(item => item && Object.prototype.hasOwnProperty.call(item, 'nth'))
  }
  return !!remark && typeof remark === 'object' && Object.prototype.hasOwnProperty.call(remark, 'nth')
}

const getNthRemarkValue = (remark) => {
  if (Array.isArray(remark)) {
    const item = remark.find(row => row && Object.prototype.hasOwnProperty.call(row, 'nth'))
    return item ? item.nth : ''
  }
  if (remark && typeof remark === 'object' && Object.prototype.hasOwnProperty.call(remark, 'nth')) {
    return remark.nth
  }
  return ''
}

const buildAutoOperationJson = () => {
  const result = {}
  const usedKeys = new Set()
  elementTemplates.value.forEach(item => {
    const remark = parseRemark(item.remark)
    const needParam = item.operation === 2 || item.operation === 4 || hasNthRemark(remark)
    if (!needParam) return

    const baseKey = item.elementName || item.element_name || `element_${item.elementId || item.element_id || ''}`
    const key = usedKeys.has(baseKey) ? `${baseKey}#${item.elementId || item.element_id}` : baseKey
    usedKeys.add(key)
    result[key] = hasNthRemark(remark) ? getNthRemarkValue(remark) : ''
  })
  const lastTemplate = elementTemplates.value[elementTemplates.value.length - 1]
  const lastElementId = lastTemplate?.elementId || lastTemplate?.element_id
  if (lastElementId) {
    const numericElementId = Number(lastElementId)
    result.screenAfter = [Number.isNaN(numericElementId) ? lastElementId : numericElementId]
  }
  return JSON.stringify(result, null, 2)
}

const loadPageInfo = async () => {
  try {
    const res = await getPageFunctionDetail(pageId)
    if (res.success && res.data) {
      Object.assign(pageInfo, {
        pageId: res.data.pageId,
        pageName: res.data.pageName || pageInfo.pageName,
        pageUrl: res.data.pageUrl || pageInfo.pageUrl
      })
    }
  } catch (error) {
      console.error('加载页面功能详情失败:', error)
  }
}

const loadLatestResult = async () => {
  latestResult.value = null
  if (!selectedInstance.value?.pageInstanceId) {
    return
  }
  try {
    const res = await getLatestPageResultByInstance(selectedInstance.value.pageInstanceId)
    latestResult.value = res.success ? res.data : null
  } catch (error) {
    console.error('加载最新结果失败:', error)
  }
}

const loadElementTemplates = async () => {
  elementLoading.value = true
  try {
    const res = await getPageTemplateByPage(pageId)
    elementTemplates.value = res.success ? (res.data || []) : []
  } catch (error) {
    elementTemplates.value = []
    console.error('加载元素模板失败:', error)
  } finally {
    elementLoading.value = false
  }
}

const resetElementForm = () => {
  Object.assign(elementForm, {
    elementId: null,
    elementName: '',
    pageId,
    locatorType: 5,
    elementValue: '',
    elementType: 1,
    operation: 1,
    remark: '',
    status: 1
  })
}

const fillElementForm = (row) => {
  Object.assign(elementForm, {
    elementId: row.elementId,
    elementName: row.elementName || '',
    pageId,
    locatorType: row.locatorType ?? 5,
    elementValue: row.elementValue || '',
    elementType: row.elementType ?? 1,
    operation: row.operation ?? 1,
    remark: row.remark || '',
    status: row.status ?? 1
  })
}

const buildElementPayload = () => ({
  elementName: elementForm.elementName,
  pageId,
  locatorType: elementForm.locatorType,
  elementValue: elementForm.elementValue,
  elementType: elementForm.elementType,
  operation: elementForm.operation,
  remark: elementForm.remark,
  status: elementForm.status
})

const handleAddElement = () => {
  elementMode.value = 'add'
  elementDialogTitle.value = '新增元素模板'
  resetElementForm()
  elementDialogVisible.value = true
}

const handleEditElement = (row) => {
  elementMode.value = 'edit'
  elementDialogTitle.value = '编辑元素模板'
  resetElementForm()
  fillElementForm(row)
  elementDialogVisible.value = true
}

const handleDeleteElement = (row) => {
  ElMessageBox.confirm(`确定要删除元素模板「${row.elementName}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deletePageTemplate(row.elementId)
    if (handleApiResponse(res, '删除成功', '删除失败')) {
      await loadElementTemplates()
    }
  }).catch(() => {})
}

const handleSubmitElement = async () => {
  elementSubmitLoading.value = true
  try {
    const res = elementMode.value === 'edit'
      ? await updatePageTemplate({ elementId: elementForm.elementId, ...buildElementPayload() })
      : await addPageTemplate(buildElementPayload())

    if (handleApiResponse(res, elementMode.value === 'edit' ? '编辑成功' : '新增成功', '提交失败')) {
      elementDialogVisible.value = false
      await loadElementTemplates()
    }
  } catch (error) {
    console.error('提交元素模板失败:', error)
  } finally {
    elementSubmitLoading.value = false
  }
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleViewInstance = (row) => {
  selectedInstance.value = row
  leftActiveTab.value = 'params'
}

const handleRunInstance = (row) => {
  if (isInstanceRunning(row.pageInstanceId) || batchRunning.value) {
    return
  }
  setInstanceRunning(row.pageInstanceId, true)
  executePageTestCase(pageId, row.pageInstanceId)
    .then(async (res) => {
      if (handleApiResponse(res, '运行成功', '运行失败')) {
        selectedInstance.value = row
        leftActiveTab.value = 'result'
        await loadLatestResult()
        instanceTableRef.value?.refresh()
      }
    })
    .finally(() => {
      setInstanceRunning(row.pageInstanceId, false)
    })
}

const handleBatchRun = () => {
  if (batchRunning.value || runningInstanceIds.value.length) {
    return
  }
  if (!selectedRows.value.length) {
    ElMessage.warning('请选择要运行的实例')
    return
  }
  batchRunning.value = true
  const ids = selectedRows.value.map(row => row.pageInstanceId)
  runningInstanceIds.value = ids
  ElMessageBox.confirm(`确定要运行选中的 ${selectedRows.value.length} 个实例吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      const res = await batchExecutePageTestCase(pageId, ids)
      if (handleApiResponse(res, '批量运行成功', '批量运行失败')) {
        instanceTableRef.value?.refresh()
        instanceTableRef.value?.clearSelection()
        selectedRows.value = []
        if (selectedInstance.value) {
          await loadLatestResult()
        }
      }
    } finally {
      batchRunning.value = false
      runningInstanceIds.value = []
    }
  }).catch(() => {
    batchRunning.value = false
    runningInstanceIds.value = []
  })
}

const resetInstanceForm = () => {
  Object.assign(instanceForm, {
    pageInstanceId: null,
    pageId,
    instanceName: '',
    operationJson: '',
    expectResult: '',
    description: '',
    remark: '',
    status: 1
  })
}

const handleAddInstance = async () => {
  instanceMode.value = 'add'
  instanceDialogTitle.value = '新增实例'
  resetInstanceForm()
  if (!elementTemplates.value.length) {
    await loadElementTemplates()
  }
  instanceForm.operationJson = buildAutoOperationJson()
  instanceDialogVisible.value = true
}

const handleEditInstance = (row) => {
  instanceMode.value = 'edit'
  instanceDialogTitle.value = '编辑实例'
  resetInstanceForm()
  Object.assign(instanceForm, {
    pageInstanceId: row.pageInstanceId,
    pageId,
    instanceName: row.instanceName || '',
    operationJson: row.operationJson ?? row.operation_json ?? '',
    expectResult: row.expectResult || '',
    description: row.description || '',
    remark: row.remark || '',
    status: row.status ?? 1
  })
  instanceDialogVisible.value = true
}

const handleCopyInstance = (row) => {
  instanceMode.value = 'copy'
  instanceDialogTitle.value = '复制实例'
  resetInstanceForm()
  Object.assign(instanceForm, {
    pageInstanceId: null,
    pageId,
    instanceName: `${row.instanceName || ''}_复制`,
    operationJson: row.operationJson ?? row.operation_json ?? '',
    expectResult: row.expectResult || '',
    description: row.description || '',
    remark: row.remark || '',
    status: row.status ?? 1
  })
  instanceDialogVisible.value = true
}

const handleDeleteInstance = (row) => {
  ElMessageBox.confirm(`确定要删除实例「${row.instanceName}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deletePageTestCase(row.pageInstanceId)
    if (handleApiResponse(res, '删除成功', '删除失败')) {
      if (selectedInstance.value?.pageInstanceId === row.pageInstanceId) {
        selectedInstance.value = null
        latestResult.value = null
      }
      instanceTableRef.value?.refresh()
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请选择要删除的实例')
    return
  }
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个实例吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const ids = selectedRows.value.map(row => row.pageInstanceId)
    const res = await batchDeletePageTestCase(ids)
    if (handleApiResponse(res, '批量删除成功', '批量删除失败')) {
      if (selectedInstance.value && ids.includes(selectedInstance.value.pageInstanceId)) {
        selectedInstance.value = null
        latestResult.value = null
      }
      instanceTableRef.value?.refresh()
      instanceTableRef.value?.clearSelection()
      selectedRows.value = []
    }
  }).catch(() => {})
}

const handleSubmitInstance = async () => {
  submitLoading.value = true
  try {
    const payload = {
      pageId,
      instanceName: instanceForm.instanceName,
      operationJson: instanceForm.operationJson,
      expectResult: instanceForm.expectResult,
      description: instanceForm.description,
      remark: instanceForm.remark,
      status: instanceForm.status
    }
    const isEdit = instanceMode.value === 'edit'
    const res = isEdit
      ? await updatePageTestCase({ ...payload, pageInstanceId: instanceForm.pageInstanceId })
      : await addPageTestCase(payload)

    const successMessage = isEdit ? '编辑成功' : (instanceMode.value === 'copy' ? '复制成功' : '新增成功')
    if (handleApiResponse(res, successMessage, '提交失败')) {
      instanceDialogVisible.value = false
      instanceTableRef.value?.refresh()
    }
  } catch (error) {
    console.error('提交实例失败:', error)
  } finally {
    submitLoading.value = false
  }
}

const formatJson = (value) => {
  if (!value) return ''
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    return JSON.stringify(parsed, null, 2)
  } catch (error) {
    return value
  }
}

function buildScreenshotUrl(name) {
  const base = import.meta.env.VITE_API_BASE_URL || '/api'
  return `${base}/static/screenshots/${name}`
}

watch(selectedInstance, () => {
  loadLatestResult()
})

watch(leftActiveTab, (tabName) => {
  if (tabName === 'elements') {
    loadElementTemplates()
  }
})

onMounted(async () => {
  await loadPageInfo()
  await loadElementTemplates()
  instanceTableRef.value?.refresh()
})
</script>

<style scoped>
.page-function-detail {
  height: 100%;
}

.header-card {
  margin-bottom: 10px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.title-block {
  min-width: 0;
}

.page-title {
  margin: 0 0 8px;
  font-size: 22px;
  color: #303133;
}

.url-text {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #606266;
  font-family: Consolas, 'Courier New', monospace;
}

.content-layout {
  display: flex;
  gap: 10px;
  height: calc(100% - 88px);
}

.left-panel {
  flex: 0 0 42%;
  min-width: 420px;
  overflow: hidden;
}

.right-panel {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.panel-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
}

.tab-content {
  padding: 10px 0;
}

.json-content {
  margin: 0;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  color: #303133;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.screenshot-list {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.screenshot-image {
  width: 100%;
  min-height: 180px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #f5f7fa;
}

.table-actions,
.script-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 12px;
}

.script-editor {
  font-family: Consolas, 'Courier New', monospace;
}
</style>

