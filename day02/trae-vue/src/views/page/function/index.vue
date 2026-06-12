<template>
  <div class="page-function">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="pageFunctionApi.getPageFunctionList"
      :pagination="pagination"
      :search-fields="searchFields"
      :show-copy="true"
      :show-selection="true"
      :operation-width="320"
      row-key="pageId"
      @add="handleAdd"
      @edit="handleEdit"
      @copy="handleCopy"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
    >
      <template #status="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'danger'">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </el-tag>
      </template>

      <template #operation="{ row }">
        <el-button
          v-if="generatingPageId === row.pageId"
          type="danger"
          size="small"
          link
          :loading="generateLoading"
          @click="handleStopGenerate(row)"
        >
          <el-icon><CircleClose /></el-icon>
          <span>结束生成</span>
        </el-button>
        <el-button
          v-else
          type="warning"
          size="small"
          link
          :disabled="Boolean(generatingPageId)"
          :loading="generateLoading && !generatingPageId"
          @click="handleGenerate(row)"
        >
          <el-icon><Document /></el-icon>
          <span>生成脚本</span>
        </el-button>
        <el-button type="info" size="small" link @click="handleDetail(row)">
          <el-icon><View /></el-icon>
          <span>查看详情</span>
        </el-button>
      </template>
    </common-table>

    <common-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :form-data="formData"
      :rules="formRules"
      :loading="submitLoading"
      width="700px"
      @confirm="handleSubmit"
    >
      <el-form-item label="功能名称" prop="pageName">
        <el-input v-model="formData.pageName" placeholder="请输入页面功能名称" />
      </el-form-item>
      <el-form-item label="页面地址" prop="pageUrl">
        <el-input v-model="formData.pageUrl" placeholder="请输入页面地址" />
      </el-form-item>
      <el-form-item label="脚本文件" prop="fileName">
        <el-input v-model="formData.fileName" placeholder="请输入脚本文件名称" />
      </el-form-item>
      <el-form-item label="所属项目" prop="projectId">
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
      <el-form-item label="信息Token" prop="tokenId">
        <el-select
          v-model="formData.tokenId"
          filterable
          clearable
          placeholder="请选择信息Token"
          style="width: 100%"
          :disabled="!formData.projectId"
        >
          <el-option
            v-for="token in tokenOptions"
            :key="token.tokenId"
            :label="buildTokenLabel(token)"
            :value="token.tokenId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CircleClose, Document, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import * as pageFunctionApi from '@/api/page/page-function'
import { getProjectList } from '@/api/project/project'
import { getTokenList } from '@/api/project/token'
import { handleApiResponse } from '@/utils/responseHandler'

const router = useRouter()
const tableRef = ref(null)
const submitLoading = ref(false)
const projectOptions = ref([])
const tokenOptions = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitMode = ref('add')
const generatingPageId = ref(null)
const generateLoading = ref(false)

const columns = [
  { prop: 'pageName', label: '功能名称', minWidth: 180 },
  { prop: 'pageUrl', label: '页面地址', minWidth: 240 },
  { prop: 'fileName', label: '脚本文件', minWidth: 160 },
  { prop: 'status', label: '状态', width: 90, slot: 'status' },
  { prop: 'createTime', label: '创建时间', width: 180 }
]

const searchFields = [
  { type: 'input', prop: 'pageName', label: '功能名称', placeholder: '请输入页面功能名称' },
  {
    type: 'select',
    prop: 'status',
    label: '状态',
    placeholder: '请选择状态',
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ]
  }
]

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive({
  pageId: null,
  pageName: '',
  pageUrl: '',
  fileName: '',
  projectId: null,
  tokenId: null,
  remark: '',
  status: 1
})

const formRules = {
  pageName: [{ required: true, message: '请输入页面功能名称', trigger: 'blur' }],
  pageUrl: [{ required: true, message: '请输入页面地址', trigger: 'blur' }],
  fileName: [{ required: true, message: '请输入脚本文件名称', trigger: 'blur' }],
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const loadProjects = async () => {
  try {
    const res = await getProjectList({ pageNum: 1, pageSize: 100 })
    projectOptions.value = res.data?.items || res.data?.list || res.data || []
  } catch (error) {
    console.error('加载项目列表失败:', error)
  }
}

const loadTokenOptions = async (projectId) => {
  if (!projectId) {
    tokenOptions.value = []
    return
  }
  try {
    const res = await getTokenList({
      projectId,
      tokenType: 2,
      pageNum: 1,
      pageSize: 100
    })
    tokenOptions.value = res.data?.items || res.data?.list || res.data || []
  } catch (error) {
    console.error('加载Token列表失败:', error)
  }
}

const buildTokenLabel = (token) => {
  const fileName = token.token ? ` / ${token.token}` : ''
  return `${token.name || token.tokenId}${fileName}`
}

const handleProjectChange = (projectId) => {
  formData.tokenId = null
  loadTokenOptions(projectId)
}

const resetForm = () => {
  Object.assign(formData, {
    pageId: null,
    pageName: '',
    pageUrl: '',
    fileName: '',
    projectId: null,
    tokenId: null,
    remark: '',
    status: 1
  })
  tokenOptions.value = []
}

const handleAdd = () => {
  submitMode.value = 'add'
  dialogTitle.value = '新增页面功能'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  submitMode.value = 'edit'
  dialogTitle.value = '编辑页面功能'
  resetForm()
  Object.assign(formData, {
    pageId: row.pageId,
    pageName: row.pageName || '',
    pageUrl: row.pageUrl || '',
    fileName: row.fileName || '',
    projectId: row.projectId || null,
    tokenId: row.tokenId || null,
    remark: row.remark || '',
    status: row.status ?? 1
  })
  loadTokenOptions(formData.projectId)
  dialogVisible.value = true
}

const handleCopy = (row) => {
  submitMode.value = 'add'
  dialogTitle.value = '复制页面功能'
  resetForm()
  Object.assign(formData, {
    pageName: `${row.pageName || ''} - 副本`,
    pageUrl: row.pageUrl || '',
    fileName: row.fileName || '',
    projectId: row.projectId || null,
    tokenId: row.tokenId || null,
    remark: row.remark || '',
    status: row.status ?? 1
  })
  loadTokenOptions(formData.projectId)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除页面功能"${row.pageName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await pageFunctionApi.deletePageFunction(row.pageId)
    if (handleApiResponse(res, '删除成功', '删除失败')) {
      tableRef.value?.refresh()
    }
  }).catch(() => {})
}

const handleBatchDelete = (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个页面功能吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const ids = rows.map(row => row.pageId)
    const res = await pageFunctionApi.batchDeletePageFunction(ids)
    if (handleApiResponse(res, '批量删除成功', '批量删除失败')) {
      tableRef.value?.refresh()
      tableRef.value?.clearSelection()
    }
  }).catch(() => {})
}

const handleGenerate = async (row) => {
  if (generatingPageId.value) {
    ElMessage.warning('已有脚本录制正在进行，请先结束当前录制')
    return
  }
  generateLoading.value = true
  try {
    const res = await pageFunctionApi.generatePlaywrightScript(row.pageId)
    if (res.success) {
      handleApiResponse(res, '脚本录制已启动', '生成脚本失败')
      generatingPageId.value = row.pageId
    } else {
      showGenerateError(res)
    }
  } catch (error) {
    console.error('生成脚本失败:', error)
  } finally {
    generateLoading.value = false
  }
}

const handleStopGenerate = async (row) => {
  generateLoading.value = true
  try {
    const res = await pageFunctionApi.stopGeneratePlaywrightScript(row.pageId)
    if (res.success) {
      handleApiResponse(res, '脚本录制已结束', '结束生成失败')
      generatingPageId.value = null
    } else {
      showGenerateError(res)
    }
  } catch (error) {
    console.error('结束生成失败:', error)
  } finally {
    generateLoading.value = false
  }
}

const showGenerateError = (res) => {
  const message = res?.data?.错误信息 || res?.data?.error || res?.msg || '生成脚本失败'
  ElMessageBox.alert(message, res?.msg || '生成脚本失败', {
    confirmButtonText: '确定',
    type: 'error'
  })
}

const handleDetail = (row) => {
  router.push({
    path: `/page/function-detail/${row.pageId}`,
    query: {
      pageName: row.pageName,
      pageUrl: row.pageUrl
    }
  })
}

const handleSubmit = async () => {
  submitLoading.value = true
  try {
    const payload = {
      pageName: formData.pageName,
      pageUrl: formData.pageUrl,
      fileName: formData.fileName,
      projectId: formData.projectId,
      tokenId: formData.tokenId,
      remark: formData.remark,
      status: formData.status
    }

    let res
    if (submitMode.value === 'edit') {
      res = await pageFunctionApi.updatePageFunction({
        ...payload,
        pageId: formData.pageId
      })
    } else {
      res = await pageFunctionApi.addPageFunction(payload)
    }

    if (handleApiResponse(res, submitMode.value === 'edit' ? '编辑成功' : '新增成功', '提交失败')) {
      dialogVisible.value = false
      tableRef.value?.refresh()
    }
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.page-function {
  height: 100%;
}
</style>
