<template>
  <div class="api-detail">
    <!-- 页面标题 -->
    <el-card shadow="never" class="header-card">
      <div class="page-header">
        <h2 class="title">
          <el-tag :type="getMethodType(apiData.methodType)" size="large">
            {{ getMethodLabel(apiData.methodType) }}
          </el-tag>
          <span class="url">{{ apiData.methodUrl }}</span>
        </h2>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
    </el-card>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 左侧：参数模板列表 -->
      <el-card shadow="never" class="left-panel">
        <template #header>
          <div class="panel-header">
            <span>参数模板</span>
          </div>
        </template>
        
        <common-table
          ref="templateTableRef"
          :columns="templateColumns"
          :api-method="apiTemplateApi.getTemplateList"
          :api-params="{ apiId: route.params.id }"
          :pagination="templatePagination"
          :search-fields="[]"
          :show-add="false"
          :show-edit="true"
          :show-delete="true"
          :show-operation="true"
          @edit="handleEditTemplate"
          @delete="handleDeleteTemplate"
        >
          <template #operation="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleSelectTemplate(row)"
            >
              <el-icon><View /></el-icon>
              <span>查看用例</span>
            </el-button>
          </template>
        </common-table>
      </el-card>

      <!-- 右侧：测试用例列表 -->
      <el-card shadow="never" class="right-panel">
        <template #header>
          <div class="panel-header">
            <span>测试用例</span>
            <el-button
              v-if="selectedTemplateId"
              type="primary"
              size="small"
              @click="handleAddTestcase"
            >
              <el-icon><Plus /></el-icon>
              <span>新增用例</span>
            </el-button>
          </div>
        </template>

        <div v-if="selectedTemplateId" class="testcase-content">
          <common-table
            ref="testcaseTableRef"
            :columns="testcaseColumns"
            :api-method="apiTestcaseApi.getTestCaseList"
            :api-params="{ templateId: selectedTemplateId }"
            :pagination="testcasePagination"
            :search-fields="[]"
            :auto-load="false"
            @delete="handleDeleteTestcase"
            @batch-delete="handleBatchDeleteTestcase"
            :show-add="false"
            :show-edit="true"
          >
            <template #status="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </common-table>
        </div>
        
        <el-empty v-else description="请先选择一个参数模板" />
      </el-card>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, View } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable.vue'
import * as apiApi from '@/api/api/api'
import * as apiTemplateApi from '@/api/api/api-template'
import * as apiTestcaseApi from '@/api/api/api-testcase'
import { apiTemplateConfig, apiTestcaseConfig } from '@/config/table-config'

const route = useRoute()
const router = useRouter()
const templateTableRef = ref(null)
const testcaseTableRef = ref(null)

// API数据
const apiData = reactive({
  apiId: null,
  apiName: '',
  methodUrl: '',
  methodType: 1
})

// 选中的模板ID
const selectedTemplateId = ref(null)

// 参数模板列配置
const templateColumns = [
  ...apiTemplateConfig.columns,
  { 
    prop: 'operation', 
    label: '操作', 
    width: 80, 
    fixed: 'right',
    slot: 'operation'
  }
]

// 参数模板分页
const templatePagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 测试用例列配置
const testcaseColumns = apiTestcaseConfig.columns

// 测试用例分页
const testcasePagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 参数模板对话框
const templateDialogVisible = ref(false)
const templateDialogTitle = ref('')
const templateFormData = reactive({
  id: null,
  templateName: '',
  templateUrl: '',
  description: '',
  apiId: null
})

const templateFormRules = {
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  templateUrl: [{ required: true, message: '请输入模板URL', trigger: 'blur' }]
}

// 获取HTTP方法类型
// 方法类型映射（后端 methodType 为数字：1=GET, 2=POST, 3=PUT, 4=DELETE）
const methodMap = {
  1: { label: 'GET', type: 'success' },
  2: { label: 'POST', type: 'primary' },
  3: { label: 'PUT', type: 'warning' },
  4: { label: 'DELETE', type: 'danger' }
}

const getMethodType = (methodType) => {
  return methodMap[methodType]?.type || 'info'
}

const getMethodLabel = (methodType) => {
  return methodMap[methodType]?.label || 'UNKNOWN'
}

// 加载API详情
const loadApiDetail = async () => {
  try {
    // 如果路由中已经有API数据，直接使用
    if (route.query.apiData) {
      Object.assign(apiData, JSON.parse(route.query.apiData))
    } else {
      // 否则从API获取
      const res = await apiApi.getApiDetail(route.params.id)
      Object.assign(apiData, res.data)
    }
  } catch (error) {
    console.error('加载API详情失败:', error)
    ElMessage.error('加载API详情失败')
  }
}

// 选择模板
const handleSelectTemplate = (template) => {
  selectedTemplateId.value = template.id
  // 重置测试用例分页
  testcasePagination.page = 1
  // 刷新测试用例列表
  setTimeout(() => {
    testcaseTableRef.value?.refresh()
  }, 100)
}

// 编辑模板
const handleEditTemplate = (row) => {
  templateDialogTitle.value = '编辑模板'
  Object.assign(templateFormData, row)
  templateDialogVisible.value = true
}

// 删除模板
const handleDeleteTemplate = (row) => {
  ElMessageBox.confirm(`确定要删除模板"${row.templateName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await apiTemplateApi.deleteTemplate(row.id)
      ElMessage.success('删除成功')
      templateTableRef.value?.refresh()
      if (selectedTemplateId.value === row.id) {
        selectedTemplateId.value = null
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

// 返回
const goBack = () => {
  router.back()
}

// 新增测试用例
const handleAddTestcase = () => {
  ElMessage.info('新增测试用例功能待实现')
}

// 删除测试用例
const handleDeleteTestcase = (row) => {
  ElMessageBox.confirm(`确定要删除用例"${row.testcaseName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await apiTestcaseApi.deleteTestCase(row.id)
      ElMessage.success('删除成功')
      testcaseTableRef.value?.refresh()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

// 批量删除测试用例
const handleBatchDeleteTestcase = async (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个测试用例吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.id)
      await apiTestcaseApi.batchDeleteTestCase(ids)
      ElMessage.success('批量删除成功')
      testcaseTableRef.value?.refresh()
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {})
}

// 初始化
onMounted(async () => {
  console.log('详情页初始化, route.params:', route.params)
  console.log('详情页初始化, route.query:', route.query)
  await loadApiDetail()
  console.log('API详情加载完成, apiData:', apiData)
})
</script>

<style scoped>
.api-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header-card {
  margin-bottom: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 18px;
}

.url {
  font-family: 'Courier New', monospace;
  color: #606266;
}

.content-wrapper {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow: hidden;
}

.left-panel {
  width: 500px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.testcase-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
