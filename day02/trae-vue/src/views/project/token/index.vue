<template>
  <div class="token-list">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="tokenApi.getTokenList"
      :pagination="pagination"
      :search-fields="searchFields"
      :show-selection="true"
      row-key="tokenId"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      @selection-change="handleSelectionChange"
    >
      <template #type="{ row }">
        <el-tag :type="getTypeColor(row.type)">
          {{ getTypeText(row.type) }}
        </el-tag>
      </template>

      <template #tokenType="{ row }">
        <el-tag :type="row.tokenType === 2 ? 'success' : 'primary'">
          {{ getSourceText(row.tokenType) }}
        </el-tag>
      </template>

      <template #instance="{ row }">
        {{ getInstanceText(row) }}
      </template>

      <template #operation="{ row }">
        <el-button
          type="primary"
          size="small"
          link
          @click="handleRefreshToken(row)"
        >
          <el-icon><Refresh /></el-icon>
          <span>刷新</span>
        </el-button>
      </template>

      <template #toolbar-right>
        <el-button
          type="warning"
          :disabled="!selectedRows || selectedRows.length === 0"
          @click="handleBatchRefresh"
        >
          <el-icon><Refresh /></el-icon>
          <span>批量刷新 ({{ selectedRows?.length || 0 }})</span>
        </el-button>
      </template>
    </common-table>

    <common-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :form-data="formData"
      :rules="formRules"
      :loading="submitLoading"
      width="720px"
      @confirm="handleSubmit"
    >
      <el-form-item label="Token名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入Token名称" />
      </el-form-item>

      <el-form-item label="Token类型" prop="type">
        <el-select v-model="formData.type" filterable placeholder="请选择Token类型" style="width: 100%">
          <el-option label="Bearer" :value="1" />
          <el-option label="Basic" :value="2" />
          <el-option label="自定义" :value="3" />
        </el-select>
      </el-form-item>

      <el-form-item label="来源" prop="tokenType">
        <el-select v-model="formData.tokenType" placeholder="请选择来源" style="width: 100%" @change="handleSourceChange">
          <el-option label="API" :value="1" />
          <el-option label="Web" :value="2" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="isApiToken" label="Token" prop="token">
        <el-input v-model="formData.token" placeholder="请输入Token，刷新后会自动更新" />
      </el-form-item>

      <el-form-item label="所属项目" prop="projectId">
        <el-select
          v-model="formData.projectId"
          filterable
          placeholder="请选择所属项目"
          style="width: 100%"
          @change="handleProjectChange"
        >
          <el-option
            v-for="item in projectOptions"
            :key="item.projectId"
            :label="item.projectName"
            :value="item.projectId"
          />
        </el-select>
      </el-form-item>

      <template v-if="isApiToken">
        <el-form-item label="API" prop="apiId">
          <el-select
            v-model="formData.apiId"
            filterable
            placeholder="请选择API"
            style="width: 100%"
            :disabled="!formData.projectId"
            @change="handleApiChange"
          >
            <el-option
              v-for="item in apiOptions"
              :key="item.apiId"
              :label="item.apiName"
              :value="item.apiId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="API实例" prop="instanceId">
          <el-select
            v-model="formData.instanceId"
            filterable
            placeholder="请选择API实例"
            style="width: 100%"
            :disabled="!formData.apiId"
          >
            <el-option
              v-for="item in apiInstanceOptions"
              :key="item.instanceId"
              :label="item.instanceName"
              :value="item.instanceId"
            />
          </el-select>
        </el-form-item>
      </template>

      <template v-else>
        <el-form-item label="页面" prop="pageId">
          <el-select
            v-model="formData.pageId"
            filterable
            placeholder="请选择页面"
            style="width: 100%"
            :disabled="!formData.projectId"
            @change="handlePageChange"
          >
            <el-option
              v-for="item in pageOptions"
              :key="item.pageId"
              :label="item.pageName"
              :value="item.pageId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="页面实例" prop="instanceId">
          <el-select
            v-model="formData.instanceId"
            filterable
            placeholder="请选择页面实例"
            style="width: 100%"
            :disabled="!formData.pageId"
          >
            <el-option
              v-for="item in pageInstanceOptions"
              :key="item.pageInstanceId"
              :label="item.instanceName"
              :value="item.pageInstanceId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Token文件名" prop="token">
          <el-input v-model="formData.token" placeholder="请输入token文件名，不填则自动生成" />
        </el-form-item>
      </template>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
        />
      </el-form-item>
    </common-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { handleApiResponse } from '@/utils/responseHandler'
import * as tokenApi from '@/api/project/token'
import * as projectApi from '@/api/project/project'
import * as apiApi from '@/api/api/api'
import * as testcaseApi from '@/api/api/api-testcase'
import { getPageFunctionList } from '@/api/page/page-function'
import { getPageTestCaseList } from '@/api/page/page-testcase'

const tableRef = ref(null)
const submitLoading = ref(false)

const projectOptions = ref([])
const apiOptions = ref([])
const apiInstanceOptions = ref([])
const pageOptions = ref([])
const pageInstanceOptions = ref([])
const selectedRows = ref([])

const columns = [
  { prop: 'name', label: 'Token名称', minWidth: 150 },
  { prop: 'tokenType', label: '来源', width: 90, slot: 'tokenType' },
  { prop: 'type', label: 'Token类型', width: 100, slot: 'type' },
  { prop: 'projectName', label: '项目名称', minWidth: 180, showOverflowTooltip: true },
  { prop: 'instance', label: '关联实例', minWidth: 180, slot: 'instance', showOverflowTooltip: true },
  { prop: 'token', label: 'Token/文件名', minWidth: 180, showOverflowTooltip: true },
  { prop: 'remark', label: '备注', minWidth: 150, showOverflowTooltip: true }
]

const searchFields = [
  { type: 'input', prop: 'name', label: 'Token名称', placeholder: '请输入Token名称' },
  {
    type: 'select',
    prop: 'tokenType',
    label: '来源',
    placeholder: '请选择来源',
    options: [
      { label: 'API', value: 1 },
      { label: 'Web', value: 2 }
    ]
  }
]

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = reactive({
  tokenId: null,
  name: '',
  type: 1,
  tokenType: 1,
  token: '',
  projectId: null,
  apiId: null,
  pageId: null,
  instanceId: null,
  remark: ''
})

const isApiToken = computed(() => Number(formData.tokenType) === 1)

const validateApiId = (_rule, value, callback) => {
  if (isApiToken.value && !value) {
    callback(new Error('请选择API'))
    return
  }
  callback()
}

const validatePageId = (_rule, value, callback) => {
  if (!isApiToken.value && !value) {
    callback(new Error('请选择页面'))
    return
  }
  callback()
}

const validateInstanceId = (_rule, value, callback) => {
  if (!value) {
    callback(new Error(isApiToken.value ? '请选择API实例' : '请选择页面实例'))
    return
  }
  callback()
}

const formRules = {
  name: [{ required: true, message: '请输入Token名称', trigger: 'blur' }],
  tokenType: [{ required: true, message: '请选择来源', trigger: 'change' }],
  projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }],
  apiId: [{ validator: validateApiId, trigger: 'change' }],
  pageId: [{ validator: validatePageId, trigger: 'change' }],
  instanceId: [{ validator: validateInstanceId, trigger: 'change' }]
}

const getTypeText = (type) => {
  const types = {
    1: 'Bearer',
    2: 'Basic',
    3: '自定义'
  }
  return types[type] || '未知'
}

const getTypeColor = (type) => {
  const colors = {
    1: 'primary',
    2: 'success',
    3: 'info'
  }
  return colors[type] || 'info'
}

const getSourceText = (tokenType) => Number(tokenType) === 2 ? 'Web' : 'API'

const getInstanceText = (row) => {
  if (Number(row.tokenType) === 2) {
    return row.pageInstanceName || row.pageName || row.instanceId || '-'
  }
  return row.apiInstanceName || row.apiName || row.instanceId || '-'
}

const getListItems = (res) => res.data?.items || res.data?.list || res.data || []

const loadProjectOptions = async () => {
  try {
    const res = await projectApi.getProjectList({ pageNum: 1, pageSize: 100 })
    projectOptions.value = getListItems(res)
  } catch (error) {
    console.error('加载项目列表失败:', error)
  }
}

const loadApiOptions = async (projectId) => {
  if (!projectId) {
    apiOptions.value = []
    return
  }
  try {
    const res = await apiApi.getApiOptions({ projectId })
    apiOptions.value = getListItems(res)
  } catch (error) {
    console.error('加载API列表失败:', error)
  }
}

const loadApiInstanceOptions = async (apiId) => {
  if (!apiId) {
    apiInstanceOptions.value = []
    return
  }
  try {
    const res = await testcaseApi.getTestcaseList({ apiId, pageNum: 1, pageSize: 100 })
    apiInstanceOptions.value = getListItems(res)
  } catch (error) {
    console.error('加载API实例列表失败:', error)
  }
}

const loadPageOptions = async (projectId) => {
  if (!projectId) {
    pageOptions.value = []
    return
  }
  try {
    const res = await getPageFunctionList({ projectId, pageNum: 1, pageSize: 100 })
    pageOptions.value = getListItems(res)
  } catch (error) {
    console.error('加载页面列表失败:', error)
  }
}

const loadPageInstanceOptions = async (pageId) => {
  if (!pageId) {
    pageInstanceOptions.value = []
    return
  }
  try {
    const res = await getPageTestCaseList({ pageId, pageNum: 1, pageSize: 100 })
    pageInstanceOptions.value = getListItems(res)
  } catch (error) {
    console.error('加载页面实例列表失败:', error)
  }
}

const clearApiFields = () => {
  formData.apiId = null
  apiOptions.value = []
  apiInstanceOptions.value = []
}

const clearPageFields = () => {
  formData.pageId = null
  pageOptions.value = []
  pageInstanceOptions.value = []
}

const handleSourceChange = () => {
  formData.instanceId = null
  if (isApiToken.value) {
    clearPageFields()
    if (formData.projectId) {
      loadApiOptions(formData.projectId)
    }
  } else {
    clearApiFields()
    if (formData.projectId) {
      loadPageOptions(formData.projectId)
    }
  }
}

const handleProjectChange = (projectId) => {
  formData.apiId = null
  formData.pageId = null
  formData.instanceId = null
  apiOptions.value = []
  apiInstanceOptions.value = []
  pageOptions.value = []
  pageInstanceOptions.value = []

  if (!projectId) {
    return
  }

  if (isApiToken.value) {
    loadApiOptions(projectId)
  } else {
    loadPageOptions(projectId)
  }
}

const handleApiChange = (apiId) => {
  formData.instanceId = null
  apiInstanceOptions.value = []
  if (apiId) {
    loadApiInstanceOptions(apiId)
  }
}

const handlePageChange = (pageId) => {
  formData.instanceId = null
  pageInstanceOptions.value = []
  if (pageId) {
    loadPageInstanceOptions(pageId)
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增Token'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  dialogTitle.value = '编辑Token'
  resetForm()
  Object.assign(formData, {
    tokenId: row.tokenId,
    name: row.name || '',
    type: row.type || 1,
    tokenType: row.tokenType || 1,
    token: row.token || '',
    projectId: row.projectId || null,
    apiId: row.apiId || null,
    pageId: row.pageId || null,
    instanceId: row.instanceId || null,
    remark: row.remark || ''
  })

  dialogVisible.value = true
  if (formData.projectId) {
    if (isApiToken.value) {
      await loadApiOptions(formData.projectId)
      if (formData.apiId) {
        await loadApiInstanceOptions(formData.apiId)
      }
    } else {
      await loadPageOptions(formData.projectId)
      if (formData.pageId) {
        await loadPageInstanceOptions(formData.pageId)
      }
    }
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除Token"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await tokenApi.deleteToken(row.tokenId)
      if (handleApiResponse(res, '删除成功', '删除失败')) {
        tableRef.value?.refresh()
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleBatchDelete = async (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个Token吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.tokenId)
      const res = await tokenApi.batchDeleteToken(ids)
      if (handleApiResponse(res, '批量删除成功', '批量删除失败')) {
        tableRef.value?.refresh()
      }
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {})
}

const handleRefreshToken = (row) => {
  ElMessageBox.confirm(`确定要刷新Token“${row.name}”吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      const res = await tokenApi.refreshToken(row.tokenId)
      if (handleApiResponse(res, '刷新成功', '刷新失败')) {
        tableRef.value?.refresh()
      }
    } catch (error) {
      console.error('刷新失败:', error)
      ElMessage.error('刷新失败')
    }
  }).catch(() => {})
}

const handleBatchRefresh = () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    ElMessage.warning('请选择要刷新的Token')
    return
  }

  ElMessageBox.confirm(`确定要刷新选中的 ${selectedRows.value.length} 个Token吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      const ids = selectedRows.value.map(row => row.tokenId)
      const res = await tokenApi.batchRefreshToken(ids)
      if (handleApiResponse(res, '批量刷新成功', '批量刷新失败')) {
        tableRef.value?.refresh()
        tableRef.value?.clearSelection()
      }
    } catch (error) {
      console.error('批量刷新失败:', error)
      ElMessage.error('批量刷新失败')
    }
  }).catch(() => {})
}

const buildSubmitPayload = () => {
  const payload = {
    name: formData.name,
    type: formData.type,
    tokenType: formData.tokenType,
    token: formData.token,
    projectId: formData.projectId,
    instanceId: formData.instanceId,
    remark: formData.remark
  }
  if (formData.tokenId) {
    payload.tokenId = formData.tokenId
  }
  return payload
}

const handleSubmit = async () => {
  submitLoading.value = true
  try {
    const payload = buildSubmitPayload()
    const res = formData.tokenId
      ? await tokenApi.updateToken(payload)
      : await tokenApi.addToken(payload)
    if (handleApiResponse(res, formData.tokenId ? '编辑成功' : '新增成功', '提交失败')) {
      dialogVisible.value = false
      tableRef.value?.refresh()
    }
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

const resetForm = () => {
  Object.assign(formData, {
    tokenId: null,
    name: '',
    type: 1,
    tokenType: 1,
    token: '',
    projectId: null,
    apiId: null,
    pageId: null,
    instanceId: null,
    remark: ''
  })
  apiOptions.value = []
  apiInstanceOptions.value = []
  pageOptions.value = []
  pageInstanceOptions.value = []
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

onMounted(() => {
  loadProjectOptions()
})
</script>

<style scoped>
.token-list {
  height: 100%;
}
</style>
