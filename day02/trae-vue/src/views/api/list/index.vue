<template>
  <div class="api-list">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="apiApi.getApiList"
      :pagination="pagination"
      :search-fields="searchFields"
      :show-selection="true"
      :show-row-edit="false"
      :show-row-delete="false"
      row-key="apiId"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      @selection-change="handleSelectionChange"
    >
      <template #methodType="{ row }">
        <el-tag :type="getMethodTypeColor(row.methodType)">
          {{ getMethodTypeText(row.methodType) }}
        </el-tag>
      </template>
      
      <!-- 自定义操作列 -->
      <template #operation="{ row }">
        <el-button
          type="success"
          size="small"
          link
          @click="handleRun(row)"
        >
          <el-icon><VideoPlay /></el-icon>
          <span>运行</span>
        </el-button>
        <el-dropdown trigger="click" @command="command => handleMoreCommand(command, row)">
          <el-button type="primary" size="small" link>
            <span>更多</span>
            <el-icon><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="edit">
                <el-icon><Edit /></el-icon>
                <span>编辑</span>
              </el-dropdown-item>
              <el-dropdown-item command="copy">
                <el-icon><DocumentCopy /></el-icon>
                <span>复制</span>
              </el-dropdown-item>
              <el-dropdown-item command="testcase">
                <el-icon><Files /></el-icon>
                <span>用例</span>
              </el-dropdown-item>
              <el-dropdown-item command="delete">
                <el-icon><Delete /></el-icon>
                <span>删除</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </common-table>

    <!-- 新增/编辑弹窗 -->
    <common-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :form-data="formData"
      :rules="formRules"
      :loading="submitLoading"
      width="700px"
      @confirm="handleSubmit"
    >
      <el-form-item label="接口名称" prop="apiName">
        <el-input v-model="formData.apiName" placeholder="请输入接口名称" />
      </el-form-item>

      <el-form-item label="URL" prop="methodUrl">
        <el-input v-model="formData.methodUrl" placeholder="请输入URL" />
      </el-form-item>

      <el-form-item label="方法类型" prop="methodType">
        <el-select filterable v-model="formData.methodType" placeholder="请选择方法类型" style="width: 100%">
          <el-option label="GET" :value="1" />
          <el-option label="POST" :value="2" />
          <el-option label="PUT" :value="3" />
          <el-option label="DELETE" :value="4" />
          <el-option label="PATCH" :value="5" />
        </el-select>
      </el-form-item>

      <el-form-item label="参数类型" prop="paramsPath">
        <el-input v-model="formData.paramsPath" placeholder="请输入参数类型" />
      </el-form-item>

      <el-form-item label="请求头" prop="requestHeader">
        <el-input v-model="formData.requestHeader" placeholder="请输入请求头" />
      </el-form-item>

      <el-form-item label="所属项目" prop="projectId">
        <el-select filterable
          v-model="formData.projectId"
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

      <el-form-item label="Token" prop="tokenIds">
        <el-select filterable
          v-model="formData.tokenIds"
          placeholder="请先选择项目再选择Token"
          style="width: 100%"
          :disabled="!formData.projectId"
          multiple
          collapse-tags
          collapse-tags-tooltip
        >
          <el-option
            v-for="item in tokenOptions"
            :key="item.tokenId"
            :label="item.name"
            :value="item.tokenId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
        />
      </el-form-item>
    </common-dialog>

    <!-- 复制API弹窗 -->
    <common-dialog
      v-model="copyDialogVisible"
      title="复制API"
      :form-data="copyFormData"
      :rules="formRules"
      :loading="copySubmitLoading"
      width="700px"
      @confirm="handleCopySubmit"
    >
      <el-form-item label="接口名称" prop="apiName">
        <el-input v-model="copyFormData.apiName" placeholder="请输入接口名称" />
      </el-form-item>

      <el-form-item label="URL" prop="methodUrl">
        <el-input v-model="copyFormData.methodUrl" placeholder="请输入URL" />
      </el-form-item>

      <el-form-item label="方法类型" prop="methodType">
        <el-select filterable v-model="copyFormData.methodType" placeholder="请选择方法类型" style="width: 100%">
          <el-option label="GET" :value="1" />
          <el-option label="POST" :value="2" />
          <el-option label="PUT" :value="3" />
          <el-option label="DELETE" :value="4" />
          <el-option label="PATCH" :value="5" />
        </el-select>
      </el-form-item>

      <el-form-item label="参数类型" prop="paramsPath">
        <el-input v-model="copyFormData.paramsPath" placeholder="请输入参数类型" />
      </el-form-item>

      <el-form-item label="请求头" prop="requestHeader">
        <el-input v-model="copyFormData.requestHeader" placeholder="请输入请求头" />
      </el-form-item>

      <el-form-item label="所属项目" prop="projectId">
        <el-select filterable
          v-model="copyFormData.projectId"
          placeholder="请选择所属项目"
          style="width: 100%"
          @change="handleCopyProjectChange"
        >
          <el-option
            v-for="item in projectOptions"
            :key="item.projectId"
            :label="item.projectName"
            :value="item.projectId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Token" prop="tokenIds">
        <el-select filterable
          v-model="copyFormData.tokenIds"
          placeholder="请先选择项目再选择Token"
          style="width: 100%"
          :disabled="!copyFormData.projectId"
          clearable
          multiple
          collapse-tags
          collapse-tags-tooltip
        >
          <el-option
            v-for="item in tokenOptions"
            :key="item.tokenId"
            :label="item.name"
            :value="item.tokenId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="copyFormData.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>
    </common-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, VideoPlay, Files, DocumentCopy, Edit, Delete } from '@element-plus/icons-vue'
import * as projectApi from '@/api/project/project'
import * as tokenApi from '@/api/project/token'
import * as apiApi from '@/api/api/api'
import { useRouter } from 'vue-router'
import { handleApiResponse } from '@/utils/responseHandler'

const tableRef = ref(null)
const submitLoading = ref(false)
const router = useRouter()
const API_TOKEN_TYPE = 1

// 下拉框选项
const projectOptions = ref([])
const tokenOptions = ref([])

// 列配置
const columns = [
  { prop: 'apiName', label: '接口名称', minWidth: 150 },
  { prop: 'methodUrl', label: 'URL', minWidth: 200, showOverflowTooltip: true },
  { prop: 'methodType', label: '方法类型', width: 100, slot: 'methodType' },
  { prop: 'projectName', label: '项目名称', minWidth: 150 },
  { prop: 'projectAddress', label: '项目地址', minWidth: 200, showOverflowTooltip: true },
  { prop: 'tokenName', label: 'Token名称', width: 120 },
  { prop: 'remark', label: '备注', minWidth: 150, showOverflowTooltip: true }
]

// 搜索字段配置
const searchFields = [
  { type: 'input', prop: 'apiName', label: '接口名称', placeholder: '请输入接口名称' },
  { type: 'input', prop: 'methodUrl', label: 'URL', placeholder: '请输入URL' }
]

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 选中行
const selectedRows = ref([])

// 处理选择变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 弹窗配置
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = reactive({
  apiId: null,
  apiName: '',
  methodUrl: '',
  methodType: 1,
  paramsPath: '',
  requestHeader: '{"content-type":"application/json"}',
  projectId: null,
  tokenId: null,
  tokenIds: [],
  remark: ''
})

// 复制弹窗配置
const copyDialogVisible = ref(false)
const copySubmitLoading = ref(false)
const copyFormData = reactive({
  apiId: null,
  apiName: '',
  methodUrl: '',
  methodType: 1,
  paramsPath: '',
  requestHeader: '{"content-type":"application/json"}',
  projectId: null,
  tokenId: null,
  tokenIds: [],
  remark: ''
})

const formRules = {
  apiName: [{ required: true, message: '请输入接口名称', trigger: 'blur' }],
  methodUrl: [{ required: true, message: '请输入URL', trigger: 'blur' }],
  methodType: [{ required: true, message: '请选择方法类型', trigger: 'change' }],
  paramsPath: [{ required: true, message: '请输入参数类型', trigger: 'blur' }],
  requestHeader: [{ required: true, message: '请输入请求头', trigger: 'blur' }],
  projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }]
}

// 获取方法类型文本
const getMethodTypeText = (type) => {
  const types = {
    1: 'GET',
    2: 'POST',
    3: 'PUT',
    4: 'DELETE',
    5: 'PATCH'
  }
  return types[type] || 'UNKNOWN'
}

// 获取方法类型颜色
const getMethodTypeColor = (type) => {
  const colors = {
    1: 'success',
    2: 'primary',
    3: 'warning',
    4: 'danger',
    5: 'info'
  }
  return colors[type] || 'info'
}

const normalizeTokenIds = (row = {}) => {
  if (Array.isArray(row.tokenIds)) {
    return row.tokenIds.filter(Boolean)
  }
  return row.tokenId ? [row.tokenId] : []
}

const buildApiPayload = (data) => {
  const tokenIds = Array.isArray(data.tokenIds) ? data.tokenIds.filter(Boolean) : []
  return {
    ...data,
    tokenIds,
    tokenId: tokenIds[0] || null
  }
}

const getListItems = (res) => res.data?.items || res.data?.list || res.data || []

const loadApiTokenOptions = async (projectId) => {
  if (!projectId) {
    tokenOptions.value = []
    return
  }
  const res = await tokenApi.getTokenOptions({
    projectId,
    tokenType: API_TOKEN_TYPE,
  })
  tokenOptions.value = getListItems(res)
}

const keepAvailableTokenIds = (targetForm) => {
  const availableIds = new Set(tokenOptions.value.map(item => item.tokenId))
  const tokenIds = Array.isArray(targetForm.tokenIds)
    ? targetForm.tokenIds.filter(tokenId => availableIds.has(tokenId))
    : []
  targetForm.tokenIds = tokenIds
  targetForm.tokenId = tokenIds[0] || null
}

// 加载项目下拉列表
const loadProjectOptions = async () => {
  try {
    const res = await projectApi.getProjectList({ page: 1, pageSize: 1000 })
    projectOptions.value = getListItems(res)
  } catch (error) {
    console.error('加载项目列表失败:', error)
  }
}

// 项目切换时加载Token列表
const handleProjectChange = async (projectId) => {
  // 清空已选的Token
  formData.tokenId = null
  formData.tokenIds = []
  tokenOptions.value = []

  if (!projectId) return

  try {
    await loadApiTokenOptions(projectId)
  } catch (error) {
    console.error('加载Token列表失败:', error)
  }
}

// 复制弹窗项目切换
const handleCopyProjectChange = async (projectId) => {
  copyFormData.tokenId = null
  copyFormData.tokenIds = []
  
  if (!projectId) {
    tokenOptions.value = []
    return
  }

  try {
    await loadApiTokenOptions(projectId)
  } catch (error) {
    console.error('加载Token列表失败:', error)
  }
}

// 处理新增
const handleAdd = () => {
  dialogTitle.value = '新增API'
  resetForm()
  tokenOptions.value = []
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = async (row) => {
  dialogTitle.value = '编辑API'
  Object.assign(formData, row)
  formData.tokenIds = normalizeTokenIds(row)
  formData.tokenId = formData.tokenIds[0] || null
  dialogVisible.value = true

  // 如果已有项目ID，加载对应的Token列表
  if (row.projectId) {
    try {
      await loadApiTokenOptions(row.projectId)
      keepAvailableTokenIds(formData)
    } catch (error) {
      console.error('加载Token列表失败:', error)
    }
  }
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除API"${row.apiName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await apiApi.deleteApi(row.apiId)
      if (handleApiResponse(res, '删除成功', '删除失败')) {
        tableRef.value?.refresh()
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

// 处理复制
const handleCopy = async (row) => {
  const tokenIds = normalizeTokenIds(row)
  // 填充复制表单数据
  Object.assign(copyFormData, {
    apiId: null, // 清空ID，因为是新增
    apiName: row.apiName + ' - 副本',
    methodUrl: row.methodUrl,
    methodType: row.methodType,
    paramsPath: row.paramsPath,
    requestHeader: row.requestHeader,
    projectId: row.projectId,
    tokenId: tokenIds[0] || null,
    tokenIds,
    remark: row.remark
  })
  
  // 加载Token列表
  if (row.projectId) {
    await handleCopyProjectChange(row.projectId)
    copyFormData.tokenIds = tokenIds
    copyFormData.tokenId = tokenIds[0] || null
  }
  
  copyDialogVisible.value = true
}

// 提交复制表单
const handleCopySubmit = async () => {
  try {
    copySubmitLoading.value = true
    const res = await apiApi.addApi(buildApiPayload(copyFormData))
    if (handleApiResponse(res, '复制成功', '复制失败')) {
      copyDialogVisible.value = false
      tableRef.value?.refresh()
    }
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  } finally {
    copySubmitLoading.value = false
  }
}

// 处理批量删除
const handleBatchDelete = async (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个API吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.apiId)
      const res = await apiApi.batchDeleteApi(ids)
      if (handleApiResponse(res, '批量删除成功', '批量删除失败')) {
        tableRef.value?.refresh()
      }
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {})
}

// 处理提交
const handleSubmit = async () => {
  submitLoading.value = true
  try {
    let res
    const payload = buildApiPayload(formData)
    if (formData.apiId) {
      res = await apiApi.updateApi(payload)
    } else {
      res = await apiApi.addApi(payload)
    }
    if (handleApiResponse(res, formData.apiId ? '编辑成功' : '新增成功', '提交失败')) {
      dialogVisible.value = false
      tableRef.value?.refresh()
    }
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    apiId: null,
    apiName: '',
    methodUrl: '',
    methodType: 1,
    projectId: null,
    tokenId: null,
    tokenIds: [],
    remark: ''
  })
}

// 处理运行
const handleRun = async (row) => {
  try {
    ElMessage.info(`运行API: ${row.apiName}`)
    // 调用API执行接口
    const res = await apiApi.executeApiTest(row.apiId)
    console.log('运行结果:', res)
    handleApiResponse(res, '运行成功', '运行失败')
  } catch (error) {
    console.error('运行失败:', error)
    ElMessage.error('运行失败')
  }
}

// 处理新增用例
const handleAddTestcase = (row) => {
  // 跳转到API测试用例详情页面
  router.push({
    path: `/api/testcase-detail/${row.apiId}`,
    query: {
      apiName: row.apiName,
      methodType: row.methodType,
      methodUrl: row.methodUrl
    }
  })
}

const handleMoreCommand = (command, row) => {
  const actions = {
    edit: handleEdit,
    copy: handleCopy,
    testcase: handleAddTestcase,
    delete: handleDelete
  }
  actions[command]?.(row)
}

// 页面加载时获取项目列表
onMounted(() => {
  loadProjectOptions()
})
</script>

<style scoped>
.api-list {
  height: 100%;
}
</style>
