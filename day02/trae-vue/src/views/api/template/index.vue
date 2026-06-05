<template>
  <div class="api-template">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="getTemplateListWithSearch"
      :pagination="pagination"
      :search-fields="searchFields"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      @reset="handleResetSearch"
    >
      <!-- 自定义搜索区域 -->
      <template #projectSearch>
        <el-form-item label="项目">
          <el-select
            v-model="searchProjectId"
            placeholder="请选择项目"
            clearable
            style="width: 200px"
            @change="handleSearchProjectChange"
          >
            <el-option
              v-for="item in projectList"
              :key="item.projectId"
              :label="item.projectName"
              :value="item.projectId"
            />
          </el-select>
        </el-form-item>
      </template>
      
      <template #apiSearch>
        <el-form-item label="API">
          <el-select
            v-model="searchApiId"
            placeholder="请先选择项目"
            clearable
            style="width: 200px"
            :disabled="!searchProjectId"
          >
            <el-option
              v-for="item in searchApiList"
              :key="item.apiId"
              :label="item.apiName"
              :value="item.apiId"
            />
          </el-select>
        </el-form-item>
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
      <el-form-item label="项目" prop="projectId">
        <el-select
          v-model="formData.projectId"
          placeholder="请选择项目"
          style="width: 100%"
          @change="handleProjectChange"
        >
          <el-option
            v-for="item in projectList"
            :key="item.projectId"
            :label="item.projectName"
            :value="item.projectId"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="API" prop="apiId">
        <el-select
          v-model="formData.apiId"
          placeholder="请选择API"
          style="width: 100%"
          :disabled="!formData.projectId"
        >
          <el-option
            v-for="item in apiList"
            :key="item.apiId"
            :label="item.apiName"
            :value="item.apiId"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="字段名称" prop="fieldName">
        <el-input v-model="formData.fieldName" placeholder="请输入字段名称" />
      </el-form-item>
      
      <el-form-item label="字段类型" prop="fieldType">
        <el-select v-model="formData.fieldType" placeholder="请选择字段类型" style="width: 100%">
          <el-option label="String" :value="1" />
          <el-option label="Integer" :value="2" />
          <el-option label="Boolean" :value="3" />
          <el-option label="Array" :value="4" />
          <el-option label="Object" :value="5" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="字段大小" prop="fieldSize">
        <el-input v-model="formData.fieldSize" placeholder="请输入字段大小" type="number" />
      </el-form-item>
      
      <el-form-item label="是否必填" prop="isRequired">
        <el-radio-group v-model="formData.isRequired">
          <el-radio label="Y">是</el-radio>
          <el-radio label="N">否</el-radio>
        </el-radio-group>
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
import { ref, reactive, onMounted, watch } from 'vue'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as apiTemplateApi from '@/api/api/api-template'
import * as projectApi from '@/api/project/project'
import * as apiListApi from '@/api/api/api'

const tableRef = ref(null)
const submitLoading = ref(false)

// 搜索区域的项目和API列表
const searchProjectId = ref(null)
const searchApiId = ref(null)
const searchApiList = ref([])

const columns = [
  { prop: 'fieldName', label: '字段名称', minWidth: 150 },
  { 
    prop: 'fieldType', 
    label: '字段类型', 
    minWidth: 100,
    formatter: (row) => {
      const typeMap = {
        1: 'String',
        2: 'Integer',
        3: 'Boolean',
        4: 'Array',
        5: 'Object'
      }
      return typeMap[row.fieldType] || row.fieldType
    }
  },
  { prop: 'fieldSize', label: '字段大小', minWidth: 100 },
  { 
    prop: 'isRequired', 
    label: '是否必填', 
    minWidth: 100,
    formatter: (row) => row.isRequired === 'Y' ? '是' : '否'
  },
  { prop: 'apiName', label: '接口名称', minWidth: 150, showOverflowTooltip: true },
  { prop: 'projectName', label: '项目名称', minWidth: 150, showOverflowTooltip: true },
  { prop: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true }
]

const searchFields = [
  { type: 'input', prop: 'fieldName', label: '字段名称', placeholder: '请输入字段名称' },
  { 
    type: 'select', 
    prop: 'fieldType', 
    label: '字段类型', 
    placeholder: '请选择字段类型',
    options: [
      { label: 'String', value: 1 },
      { label: 'Integer', value: 2 },
      { label: 'Boolean', value: 3 },
      { label: 'Array', value: 4 },
      { label: 'Object', value: 5 }
    ]
  },
  { 
    type: 'select', 
    prop: 'isRequired', 
    label: '是否必填', 
    placeholder: '请选择是否必填',
    options: [
      { label: '是', value: 'Y' },
      { label: '否', value: 'N' }
    ]
  },
  {
    type: 'custom',
    slot: 'projectSearch'
  },
  {
    type: 'custom',
    slot: 'apiSearch'
  }
]

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = reactive({
  templateId: null,
  fieldName: '',
  fieldType: null,
  fieldSize: null,
  isRequired: 'N',
  remark: '',
  projectId: null,
  apiId: null
})

// 项目列表
const projectList = ref([])
// API列表
const apiList = ref([])

const formRules = {
  fieldName: [{ required: true, message: '请输入字段名称', trigger: 'blur' }],
  fieldType: [{ required: true, message: '请选择字段类型', trigger: 'change' }],
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }]
}

const handleAdd = async () => {
  dialogTitle.value = '新增字段'
  resetForm()
  // 确保项目列表已加载
  if (projectList.value.length === 0) {
    await loadProjectList()
  }
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  dialogTitle.value = '编辑字段'
  Object.assign(formData, {
    templateId: row.templateId,
    fieldName: row.fieldName || '',
    fieldType: row.fieldType ?? null,
    fieldSize: row.fieldSize || null,
    isRequired: row.isRequired || 'N',
    remark: row.remark || '',
    projectId: row.projectId || null,
    apiId: row.apiId || null
  })
  // 确保项目列表已加载
  if (projectList.value.length === 0) {
    await loadProjectList()
  }
  // 如果有项目ID，加载对应的API列表
  if (formData.projectId) {
    await loadApiList(formData.projectId)
  }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除字段"${row.fieldName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await apiTemplateApi.deleteTemplate(row.templateId)
      ElMessage.success('删除成功')
      tableRef.value?.refresh()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleBatchDelete = async (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个字段吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.templateId)
      await apiTemplateApi.batchDeleteTemplate(ids)
      ElMessage.success('批量删除成功')
      tableRef.value?.refresh()
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  submitLoading.value = true
  try {
    if (formData.templateId) {
      await apiTemplateApi.updateTemplate(formData)
      ElMessage.success('编辑成功')
    } else {
      await apiTemplateApi.addTemplate(formData)
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

const resetForm = () => {
  Object.assign(formData, {
    templateId: null,
    fieldName: '',
    fieldType: null,
    fieldSize: null,
    isRequired: 'N',
    remark: '',
    projectId: null,
    apiId: null
  })
  apiList.value = []
}

// 加载项目列表
const loadProjectList = async () => {
  try {
    const res = await projectApi.getProjectList({ pageSize: 1000 })
    
    // 尝试多种可能的数据结构
    let projects = []
    if (res.data?.items) {
      projects = res.data.items
    } else if (res.data?.list) {
      projects = res.data.list
    } else if (Array.isArray(res.data)) {
      projects = res.data
    } else if (res.data?.data) {
      // 有些API可能嵌套两层data
      projects = res.data.data.items || res.data.data.list || res.data.data
    }
    
    projectList.value = projects
  } catch (error) {
    console.error('获取项目列表失败:', error)
    ElMessage.error('获取项目列表失败')
  }
}

// 加载API列表
const loadApiList = async (projectId) => {
  try {
    const res = await apiListApi.getApiList({ projectId, pageSize: 1000 })
    
    // 尝试多种可能的数据结构
    let apis = []
    if (res.data?.items) {
      apis = res.data.items
    } else if (res.data?.list) {
      apis = res.data.list
    } else if (Array.isArray(res.data)) {
      apis = res.data
    } else if (res.data?.data) {
      // 有些API可能嵌套两层data
      apis = res.data.data.items || res.data.data.list || res.data.data
    }
    
    apiList.value = apis
  } catch (error) {
    console.error('获取API列表失败:', error)
    ElMessage.error('获取API列表失败')
  }
}

// 项目选择变更
const handleProjectChange = async (projectId) => {
  formData.apiId = null
  apiList.value = []
  if (projectId) {
    await loadApiList(projectId)
  }
}

// 项目选择变更（搜索区域）
const handleSearchProjectChange = async (projectId) => {
  searchApiId.value = null
  searchApiList.value = []
  if (projectId) {
    await loadSearchApiList(projectId)
  }
}

// 加载搜索区域的API列表
const loadSearchApiList = async (projectId) => {
  try {
    const res = await apiListApi.getApiList({ projectId, pageSize: 1000 })
    
    let apis = []
    if (res.data?.items) {
      apis = res.data.items
    } else if (res.data?.list) {
      apis = res.data.list
    } else if (Array.isArray(res.data)) {
      apis = res.data
    } else if (res.data?.data) {
      apis = res.data.data.items || res.data.data.list || res.data.data
    }
    
    searchApiList.value = apis
  } catch (error) {
    console.error('获取API列表失败:', error)
  }
}

// 包装API方法，添加搜索参数
const getTemplateListWithSearch = async (params) => {
  // 添加搜索区域的项目ID和API ID
  const requestParams = {
    ...params,
    projectId: searchProjectId.value || undefined,
    apiId: searchApiId.value || undefined
  }
  return await apiTemplateApi.getTemplateList(requestParams)
}

// 监听搜索条件变化，自动刷新表格
watch([searchProjectId, searchApiId], () => {
  if (tableRef.value) {
    tableRef.value.reload()
  }
})

// 处理重置搜索
const handleResetSearch = () => {
  // 清空自定义搜索变量
  searchProjectId.value = null
  searchApiId.value = null
  searchApiList.value = []
}

// 组件挂载时加载项目列表
onMounted(() => {
  loadProjectList()
  // 调用获取API参数模板列表接口
  tableRef.value?.refresh()
})
</script>

<style scoped>
.api-template {
  height: 100%;
}
</style>