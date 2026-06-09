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
      <el-form-item label="Token名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入Token名称" />
      </el-form-item>

      <el-form-item label="Token类型" prop="type">
        <el-select filterable v-model="formData.type" placeholder="请选择Token类型" style="width: 100%">
          <el-option label="Bearer" :value="1" />
          <el-option label="Basic" :value="2" />
          <el-option label="自定义" :value="3" />
        </el-select>
      </el-form-item>

      <el-form-item label="Token" prop="token">
        <el-input v-model="formData.token" placeholder="请输入Token" />
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

      <el-form-item label="API" prop="apiId">
        <el-select filterable
          v-model="formData.apiId"
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
        <el-select filterable
          v-model="formData.instanceId"
          placeholder="请选择API实例"
          style="width: 100%"
          :disabled="!formData.apiId"
        >
          <el-option
            v-for="item in instanceOptions"
            :key="item.instanceId"
            :label="item.instanceName"
            :value="item.instanceId"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import * as tokenApi from '@/api/project/token'
import * as projectApi from '@/api/project/project'
import * as apiApi from '@/api/api/api'
import * as testcaseApi from '@/api/api/api-testcase'

const tableRef = ref(null)
const submitLoading = ref(false)

// 下拉框选项
const projectOptions = ref([])
const apiOptions = ref([])
const instanceOptions = ref([])

// 选中的行
const selectedRows = ref([])

// 列配置
const columns = [
  { prop: 'name', label: 'Token名称', minWidth: 150 },
  { prop: 'type', label: 'Token类型', width: 100, slot: 'type' },
  { prop: 'projectName', label: '项目名称', minWidth: 200, showOverflowTooltip: true },
  { prop: 'projectAddress', label: '项目地址', minWidth: 200, showOverflowTooltip: true },
  { prop: 'remark', label: '备注', minWidth: 150, showOverflowTooltip: true }
]

// 搜索字段配置
const searchFields = [
  { type: 'input', prop: 'name', label: 'Token名称', placeholder: '请输入Token名称' },
  { type: 'input', prop: 'projectName', label: '项目名称', placeholder: '请输入项目名称' }
]

// 分页配置
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 弹窗配置
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = reactive({
  tokenId: null,
  name: '',
  type: null,
  token: '',
  projectId: null,
  apiId: null,
  instanceId: null,
  remark: ''
})

const formRules = {
  name: [{ required: true, message: '请输入Token名称', trigger: 'blur' }],
  projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }]
}

// 获取Token类型文本
const getTypeText = (type) => {
  const types = {
    1: 'Bearer',
    2: 'Basic',
    3: '自定义'
  }
  return types[type] || '未知'
}

// 获取Token类型颜色
const getTypeColor = (type) => {
  const colors = {
    1: 'primary',
    2: 'success',
    3: 'info'
  }
  return colors[type] || 'info'
}

// 加载项目下拉列表
const loadProjectOptions = async () => {
  try {
    const res = await projectApi.getProjectList({ pageNum: 1, pageSize: 1000 })
    projectOptions.value = res.data?.items || res.data?.list || res.data || []
  } catch (error) {
    console.error('加载项目列表失败:', error)
  }
}

// 加载API下拉列表
const loadApiOptions = async (projectId) => {
  if (!projectId) {
    apiOptions.value = []
    return
  }
  try {
    const res = await apiApi.getApiList({ projectId, pageNum: 1, pageSize: 1000 })
    apiOptions.value = res.data?.items || res.data?.list || res.data || []
  } catch (error) {
    console.error('加载API列表失败:', error)
  }
}

// 加载API实例下拉列表
const loadInstanceOptions = async (apiId) => {
  if (!apiId) {
    instanceOptions.value = []
    return
  }
  try {
    const res = await testcaseApi.getTestcaseList({ apiId, pageNum: 1, pageSize: 1000 })
    instanceOptions.value = res.data?.items || res.data?.list || res.data || []
  } catch (error) {
    console.error('加载API实例列表失败:', error)
  }
}

// 处理项目变化
const handleProjectChange = (projectId) => {
  // 清空API和实例选择
  formData.apiId = null
  formData.instanceId = null
  apiOptions.value = []
  instanceOptions.value = []
  
  // 加载API列表
  if (projectId) {
    loadApiOptions(projectId)
  }
}

// 处理API变化
const handleApiChange = (apiId) => {
  // 清空实例选择
  formData.instanceId = null
  instanceOptions.value = []
  
  // 加载实例列表
  if (apiId) {
    loadInstanceOptions(apiId)
  }
}

// 处理新增
const handleAdd = () => {
  dialogTitle.value = '新增Token'
  resetForm()
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑Token'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除Token"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await tokenApi.deleteToken(row.tokenId)
      ElMessage.success('删除成功')
      tableRef.value?.refresh()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

// 处理批量删除
const handleBatchDelete = async (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个Token吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.tokenId)
      await tokenApi.batchDeleteToken(ids)
      ElMessage.success('批量删除成功')
      tableRef.value?.refresh()
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {})
}

// 处理单个刷新
const handleRefreshToken = (row) => {
  ElMessageBox.confirm(`确定要刷新Token“${row.name}”吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      await tokenApi.refreshToken(row.tokenId)
      ElMessage.success('刷新成功')
      tableRef.value?.refresh()
    } catch (error) {
      console.error('刷新失败:', error)
      ElMessage.error('刷新失败')
    }
  }).catch(() => {})
}

// 处理批量刷新
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
      await tokenApi.batchRefreshToken(ids)
      ElMessage.success('批量刷新成功')
      tableRef.value?.refresh()
      // 清空选择
      tableRef.value.clearSelection()
    } catch (error) {
      console.error('批量刷新失败:', error)
      ElMessage.error('批量刷新失败')
    }
  }).catch(() => {})
}

// 处理提交
const handleSubmit = async () => {
  submitLoading.value = true
  try {
    if (formData.tokenId) {
      await tokenApi.updateToken(formData)
      ElMessage.success('编辑成功')
    } else {
      await tokenApi.addToken(formData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    tableRef.value?.refresh()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    tokenId: null,
    name: '',
    type: null,
    projectId: null,
    apiId: null,
    instanceId: null,
    remark: ''
  })
  // 清空下拉选项
  apiOptions.value = []
  instanceOptions.value = []
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 页面加载时获取项目列表
onMounted(() => {
  loadProjectOptions()
})
</script>

<style scoped>
.token-list {
  height: 100%;
}
</style>
