<template>
  <div class="page-testcase">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="pageTestcaseApi.getPageTestCaseList"
      :pagination="pagination"
      :search-fields="[]"
      :show-selection="true"
      :show-copy="true"
      :operation-width="280"
      row-key="pageInstanceId"
      @add="handleAdd"
      @edit="handleEdit"
      @copy="handleCopy"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      @selection-change="handleSelectionChange"
    >
      <template #pageName="{ row }">
        {{ getPageName(row.pageId) }}
      </template>
      <template #operationJson="{ row }">
        <span class="json-preview">{{ row.operationJson }}</span>
      </template>
      <template #toolbar-left>
        <el-button
          type="success"
          :loading="batchRunning"
          :disabled="!selectedRows.length || batchRunning || !!runningCaseIds.length"
          @click="handleBatchRun"
        >
          <el-icon><VideoPlay /></el-icon>
          <span>批量运行</span>
        </el-button>
      </template>
      <template #operation="{ row }">
        <el-button
          type="success"
          size="small"
          link
          :loading="isCaseRunning(row.pageInstanceId)"
          :disabled="isCaseRunning(row.pageInstanceId)"
          @click.stop="handleRun(row)"
        >
          <el-icon><VideoPlay /></el-icon>
          <span>运行</span>
        </el-button>
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
      <el-form-item label="测试用例名称" prop="instanceName">
        <el-input v-model="formData.instanceName" placeholder="请输入测试用例名称" />
      </el-form-item>

      <el-form-item label="期望结果" prop="expectResult">
        <el-input v-model="formData.expectResult" type="textarea" :rows="3" placeholder="请输入期望结果" />
      </el-form-item>

      <el-form-item label="用例JSON" prop="operationJson">
        <el-input v-model="formData.operationJson" type="textarea" :rows="6" placeholder="请输入用例JSON" />
      </el-form-item>

      <el-form-item label="截图名称" prop="screenPhotoFile">
        <el-input v-model="formData.screenPhotoFile" placeholder="请输入截图名称" />
      </el-form-item>

      <el-form-item label="项目" prop="projectId">
        <el-select
          v-model="formData.projectId"
          filterable
          clearable
          placeholder="请选择项目"
          style="width: 100%"
          @change="handleProjectChange"
        >
          <el-option
            v-for="project in projectOptions"
            :key="project.projectId"
            :label="project.projectName"
            :value="project.projectId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="页面功能" prop="pageId">
        <el-select
          v-model="formData.pageId"
          filterable
          clearable
          placeholder="请选择页面功能"
          style="width: 100%"
          :disabled="!formData.projectId"
        >
          <el-option
            v-for="page in filteredPageOptions"
            :key="page.pageId"
            :label="page.pageName"
            :value="page.pageId"
          />
        </el-select>
      </el-form-item>
    </common-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { VideoPlay } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as pageTestcaseApi from '@/api/page/page-testcase'
import { getPageFunctionList } from '@/api/page/page-function'
import { getProjectList } from '@/api/project/project'
import { handleApiResponse } from '@/utils/responseHandler'
import { normalizeJsonObject } from '@/utils/json'

const tableRef = ref(null)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitMode = ref('add')
const projectOptions = ref([])
const pageOptions = ref([])
const selectedRows = ref([])
const runningCaseIds = ref([])
const batchRunning = ref(false)

const columns = [
  { prop: 'instanceName', label: '测试用例名称', minWidth: 180 },
  { prop: 'pageName', label: '页面功能', minWidth: 160, slot: 'pageName' },
  { prop: 'expectResult', label: '期望结果', minWidth: 180 },
  { prop: 'operationJson', label: '用例JSON', minWidth: 240, slot: 'operationJson' },
  { prop: 'screenPhotoFile', label: '截图名称', minWidth: 160 },
  { prop: 'execCount', label: '执行次数', width: 100 },
  { prop: 'createTime', label: '创建时间', width: 180 }
]

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive({
  pageInstanceId: null,
  instanceName: '',
  expectResult: '',
  operationJson: '',
  screenPhotoFile: '',
  projectId: null,
  pageId: null
})

const formRules = {
  instanceName: [{ required: true, message: '请输入测试用例名称', trigger: 'blur' }],
  operationJson: [{ required: true, message: '请输入用例JSON', trigger: 'blur' }],
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  pageId: [{ required: true, message: '请选择页面功能', trigger: 'change' }]
}

const filteredPageOptions = computed(() => {
  if (!formData.projectId) {
    return []
  }
  return pageOptions.value.filter(page => page.projectId === formData.projectId)
})

const pageMap = computed(() => {
  return pageOptions.value.reduce((map, page) => {
    map[page.pageId] = page
    return map
  }, {})
})

const getPageName = (pageId) => {
  return pageMap.value[pageId]?.pageName || pageId || '-'
}

const isCaseRunning = (id) => runningCaseIds.value.includes(id)

const setCaseRunning = (id, running) => {
  runningCaseIds.value = running
    ? [...new Set([...runningCaseIds.value, id])]
    : runningCaseIds.value.filter(item => item !== id)
}

const loadPagedList = async (apiMethod, params = {}) => {
  const pageSize = 100
  const first = await apiMethod({ ...params, pageNum: 1, pageSize })
  const items = first.data?.items || first.data?.list || first.data || []
  const total = first.data?.total || items.length
  const result = [...items]
  const pageCount = Math.ceil(total / pageSize)

  for (let pageNum = 2; pageNum <= pageCount; pageNum += 1) {
    const res = await apiMethod({ ...params, pageNum, pageSize })
    result.push(...(res.data?.items || res.data?.list || res.data || []))
  }

  return result
}

const loadProjects = async () => {
  try {
    projectOptions.value = await loadPagedList(getProjectList)
  } catch (error) {
    console.error('加载项目列表失败:', error)
  }
}

const loadPageFunctions = async () => {
  try {
    pageOptions.value = await loadPagedList(getPageFunctionList)
  } catch (error) {
    console.error('加载页面功能列表失败:', error)
  }
}

const handleProjectChange = () => {
  formData.pageId = null
}

const resetForm = () => {
  Object.assign(formData, {
    pageInstanceId: null,
    instanceName: '',
    expectResult: '',
    operationJson: '',
    screenPhotoFile: '',
    projectId: null,
    pageId: null
  })
}

const fillFormFromRow = (row, copy = false) => {
  const page = pageMap.value[row.pageId]
  Object.assign(formData, {
    pageInstanceId: copy ? null : row.pageInstanceId,
    instanceName: copy ? `${row.instanceName || ''} - 副本` : row.instanceName || '',
    expectResult: row.expectResult || '',
    operationJson: row.operationJson || '',
    screenPhotoFile: row.screenPhotoFile || '',
    projectId: page?.projectId || null,
    pageId: row.pageId || null
  })
}

const handleAdd = () => {
  submitMode.value = 'add'
  dialogTitle.value = '新增测试用例'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  submitMode.value = 'edit'
  dialogTitle.value = '编辑测试用例'
  resetForm()
  fillFormFromRow(row)
  dialogVisible.value = true
}

const handleCopy = (row) => {
  submitMode.value = 'add'
  dialogTitle.value = '复制测试用例'
  resetForm()
  fillFormFromRow(row, true)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除测试用例「${row.instanceName}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await pageTestcaseApi.deletePageTestCase(row.pageInstanceId)
      if (handleApiResponse(res, '删除成功', '删除失败')) {
        tableRef.value?.refresh()
      }
    } catch (error) {
      showRequestError(error, '删除失败')
    }
  }).catch(() => {})
}

const handleBatchDelete = (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个测试用例吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.pageInstanceId)
      const res = await pageTestcaseApi.batchDeletePageTestCase(ids)
      if (handleApiResponse(res, '批量删除成功', '批量删除失败')) {
        tableRef.value?.refresh()
        tableRef.value?.clearSelection()
      }
    } catch (error) {
      showRequestError(error, '批量删除失败')
    }
  }).catch(() => {})
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleRun = (row) => {
  if (isCaseRunning(row.pageInstanceId) || batchRunning.value) {
    return
  }
  setCaseRunning(row.pageInstanceId, true)
  pageTestcaseApi.executePageTestCase(row.pageId, row.pageInstanceId)
    .then((res) => {
      if (handleApiResponse(res, '执行完成', '执行失败')) {
        tableRef.value?.refresh()
      }
    })
    .catch((error) => {
      showRequestError(error, '执行失败')
    })
    .finally(() => {
      setCaseRunning(row.pageInstanceId, false)
    })
}

const handleBatchRun = () => {
  if (batchRunning.value || runningCaseIds.value.length) {
    return
  }
  if (!selectedRows.value.length) {
    ElMessage.warning('请选择要运行的测试用例')
    return
  }

  const pageIds = [...new Set(selectedRows.value.map(row => row.pageId))]
  if (pageIds.length !== 1) {
    ElMessage.warning('批量运行只能选择同一个页面功能下的测试用例')
    return
  }

  batchRunning.value = true
  const ids = selectedRows.value.map(row => row.pageInstanceId)
  runningCaseIds.value = ids
  ElMessageBox.confirm(`确定要运行选中的 ${selectedRows.value.length} 个测试用例吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      const res = await pageTestcaseApi.batchExecutePageTestCase(pageIds[0], ids)
      if (handleApiResponse(res, '批量执行完成', '批量执行失败')) {
        tableRef.value?.refresh()
        tableRef.value?.clearSelection()
        selectedRows.value = []
      }
    } catch (error) {
      showRequestError(error, '批量执行失败')
    } finally {
      batchRunning.value = false
      runningCaseIds.value = []
    }
  }).catch(() => {
    batchRunning.value = false
    runningCaseIds.value = []
  })
}

const buildPayload = () => {
  return {
    instanceName: formData.instanceName,
    expectResult: formData.expectResult,
    operationJson: normalizeJsonObject(formData.operationJson),
    screenPhotoFile: formData.screenPhotoFile,
    pageId: formData.pageId,
    status: 1
  }
}

const handleSubmit = async () => {
  submitLoading.value = true
  try {
    let res
    if (submitMode.value === 'edit') {
      res = await pageTestcaseApi.updatePageTestCase({
        ...buildPayload(),
        pageInstanceId: formData.pageInstanceId
      })
    } else {
      res = await pageTestcaseApi.addPageTestCase(buildPayload())
    }

    if (handleApiResponse(res, submitMode.value === 'edit' ? '编辑成功' : '新增成功', '提交失败')) {
      dialogVisible.value = false
      tableRef.value?.refresh()
    }
  } catch (error) {
    console.error('提交失败:', error)
    showRequestError(error, '提交失败')
  } finally {
    submitLoading.value = false
  }
}

const showRequestError = (error, title) => {
  const data = error?.response?.data
  const message = data?.detail || data?.error || data?.msg || error?.message || title
  ElMessageBox.alert(typeof message === 'string' ? message : JSON.stringify(message, null, 2), title, {
    confirmButtonText: '确定',
    type: 'error'
  })
}

onMounted(() => {
  loadProjects()
  loadPageFunctions()
})
</script>

<style scoped>
.page-testcase {
  height: 100%;
}

.json-preview {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

