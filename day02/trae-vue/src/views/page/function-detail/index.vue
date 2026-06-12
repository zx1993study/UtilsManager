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
          <el-tab-pane label="参数json" name="params">
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
        </el-tabs>
      </el-card>

      <el-card shadow="never" class="right-panel">
        <el-tabs v-model="rightActiveTab" class="panel-tabs" @tab-change="handleRightTabChange">
          <el-tab-pane label="实例列表" name="instances">
            <div class="table-actions">
              <el-button type="success" :disabled="!selectedRows.length || !realFileName" @click="handleBatchRun">
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
                <el-button type="success" size="small" link :disabled="!realFileName" @click="handleRunInstance(row)">
                  <el-icon><VideoPlay /></el-icon>
                  <span>运行</span>
                </el-button>
                <el-button type="primary" size="small" link @click="handleEditInstance(row)">
                  <el-icon><Edit /></el-icon>
                  <span>编辑</span>
                </el-button>
                <el-button type="danger" size="small" link @click="handleDeleteInstance(row)">
                  <el-icon><Delete /></el-icon>
                  <span>删除</span>
                </el-button>
              </template>
            </common-table>
          </el-tab-pane>

          <el-tab-pane label="脚本内容" name="script">
            <div class="script-toolbar">
              <el-button type="primary" :disabled="!realFileName" @click="scriptEditable = true">
                <el-icon><Edit /></el-icon>
                <span>编辑</span>
              </el-button>
              <el-button type="success" :disabled="!realFileName || !scriptEditable" @click="handleSaveScript">
                <el-icon><Check /></el-icon>
                <span>保存</span>
              </el-button>
              <el-button type="danger" :disabled="!realFileName" @click="handleDeleteScript">
                <el-icon><Delete /></el-icon>
                <span>删除</span>
              </el-button>
            </div>
            <el-input
              v-model="scriptContent"
              type="textarea"
              :rows="24"
              :disabled="!scriptEditable"
              placeholder="暂无脚本内容"
              class="script-editor"
            />
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
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Back, Check, Delete, Edit, Plus, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonDialog from '@/components/CommonDialog.vue'
import CommonTable from '@/components/CommonTable.vue'
import {
  deleteExecuteFile,
  getExecuteFile,
  getPageFunctionDetail,
  updateExecuteFile
} from '@/api/page/page-function'
import {
  addPageTestCase,
  batchDeletePageTestCase,
  batchExecutePageTestCase,
  deletePageTestCase,
  executePageTestCase,
  getPageTestCaseList,
  updatePageTestCase
} from '@/api/page/page-testcase'
import { getLatestPageResultByInstance } from '@/api/page/page-result'
import { handleApiResponse } from '@/utils/responseHandler'

const route = useRoute()
const router = useRouter()
const pageId = Number(route.params.pageId)
const instanceTableRef = ref(null)
const selectedRows = ref([])
const selectedInstance = ref(null)
const latestResult = ref(null)
const leftActiveTab = ref('params')
const rightActiveTab = ref('instances')
const scriptContent = ref('')
const scriptEditable = ref(false)
const scriptLoaded = ref(false)
const submitLoading = ref(false)
const instanceDialogVisible = ref(false)
const instanceDialogTitle = ref('')
const instanceMode = ref('add')

const pageInfo = reactive({
  pageId,
  pageName: route.query.pageName || '',
  pageUrl: route.query.pageUrl || '',
  realFileName: '',
  fileName: ''
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

const instanceColumns = [
  { prop: 'instanceName', label: '实例名称', minWidth: 150 },
  { prop: 'expectResult', label: '预期结果', minWidth: 150 },
  { prop: 'description', label: '描述', minWidth: 180 },
  { prop: 'remark', label: '备注', minWidth: 160 },
  { prop: 'status', label: '状态', width: 90, slot: 'status' }
]

const realFileName = computed(() => pageInfo.realFileName || pageInfo.fileName)
const screenshotList = computed(() => latestResult.value?.screenshotPath || [])
const screenshotUrls = computed(() => screenshotList.value.map(buildScreenshotUrl))
const selectedOperationJson = computed(() => {
  return selectedInstance.value?.operationJson ?? selectedInstance.value?.operation_json ?? ''
})

const getInstanceList = (params) => {
  return getPageTestCaseList({
    ...params,
    pageId
  })
}

const loadPageInfo = async () => {
  try {
    const res = await getPageFunctionDetail(pageId)
    if (res.success && res.data) {
      Object.assign(pageInfo, {
        pageId: res.data.pageId,
        pageName: res.data.pageName || pageInfo.pageName,
        pageUrl: res.data.pageUrl || pageInfo.pageUrl,
        fileName: res.data.fileName || '',
        realFileName: res.data.realFileName || ''
      })
    }
  } catch (error) {
    console.error('加载页面功能详情失败:', error)
  }
}

const loadScriptContent = async () => {
  if (!realFileName.value || scriptLoaded.value) {
    return
  }
  try {
    const res = await getExecuteFile(realFileName.value)
    if (res.success) {
      scriptContent.value = res.data?.content || res.data?.fileContent || res.data?.文件内容 || ''
      scriptLoaded.value = true
      scriptEditable.value = false
    } else {
      scriptContent.value = ''
    }
  } catch (error) {
    scriptContent.value = ''
    console.error('读取脚本内容失败:', error)
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

const handleRightTabChange = (tabName) => {
  if (tabName === 'script') {
    loadScriptContent()
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
  if (!realFileName.value) {
    ElMessage.warning('缺少脚本文件')
    return
  }
  ElMessageBox.confirm(`确定要运行实例"${row.instanceName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    const res = await executePageTestCase(realFileName.value, row.pageInstanceId)
    if (handleApiResponse(res, '运行成功', '运行失败')) {
      selectedInstance.value = row
      leftActiveTab.value = 'result'
      await loadLatestResult()
      instanceTableRef.value?.refresh()
    }
  }).catch(() => {})
}

const handleBatchRun = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请选择要运行的实例')
    return
  }
  if (!realFileName.value) {
    ElMessage.warning('缺少脚本文件')
    return
  }
  ElMessageBox.confirm(`确定要运行选中的 ${selectedRows.value.length} 个实例吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    const ids = selectedRows.value.map(row => row.pageInstanceId)
    const res = await batchExecutePageTestCase(realFileName.value, ids)
    if (handleApiResponse(res, '批量运行成功', '批量运行失败')) {
      instanceTableRef.value?.refresh()
      instanceTableRef.value?.clearSelection()
      selectedRows.value = []
      if (selectedInstance.value) {
        await loadLatestResult()
      }
    }
  }).catch(() => {})
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

const handleAddInstance = () => {
  instanceMode.value = 'add'
  instanceDialogTitle.value = '新增实例'
  resetInstanceForm()
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

const handleDeleteInstance = (row) => {
  ElMessageBox.confirm(`确定要删除实例"${row.instanceName}"吗？`, '提示', {
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
    const res = instanceMode.value === 'edit'
      ? await updatePageTestCase({ ...payload, pageInstanceId: instanceForm.pageInstanceId })
      : await addPageTestCase(payload)

    if (handleApiResponse(res, instanceMode.value === 'edit' ? '编辑成功' : '新增成功', '提交失败')) {
      instanceDialogVisible.value = false
      instanceTableRef.value?.refresh()
    }
  } catch (error) {
    console.error('提交实例失败:', error)
  } finally {
    submitLoading.value = false
  }
}

const handleSaveScript = async () => {
  if (!realFileName.value) {
    return
  }
  const res = await updateExecuteFile(realFileName.value, scriptContent.value)
  if (handleApiResponse(res, '保存成功', '保存失败')) {
    scriptEditable.value = false
    scriptLoaded.value = true
  }
}

const handleDeleteScript = () => {
  if (!realFileName.value) {
    return
  }
  ElMessageBox.confirm(`确定要删除脚本"${realFileName.value}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteExecuteFile(realFileName.value)
    if (handleApiResponse(res, '删除成功', '删除失败')) {
      scriptContent.value = ''
      scriptEditable.value = false
      scriptLoaded.value = true
    }
  }).catch(() => {})
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

watch(realFileName, () => {
  scriptLoaded.value = false
  scriptEditable.value = false
  scriptContent.value = ''
  if (rightActiveTab.value === 'script') {
    loadScriptContent()
  }
})

onMounted(async () => {
  await loadPageInfo()
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
