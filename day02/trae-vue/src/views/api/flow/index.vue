<template>
  <div class="flow-list">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="flowApi.getFlowList"
      :pagination="pagination"
      :search-fields="searchFields"
      :show-selection="true"
      row-key="flowId"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      @selection-change="handleSelectionChange"
    >
      <!-- 自定义操作列 -->
      <template #operation="{ row }">
        <el-button
          type="primary"
          size="small"
          link
          @click="handleCopy(row)"
        >
          <el-icon><DocumentCopy /></el-icon>
          <span>复制</span>
        </el-button>
        
        <el-button
          type="success"
          size="small"
          link
          @click="handleViewDetail(row)"
        >
          <el-icon><View /></el-icon>
          <span>详情</span>
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
      <el-form-item label="流程名称" prop="flowName">
        <el-input v-model="formData.flowName" placeholder="请输入流程名称" />
      </el-form-item>

      <el-form-item label="所属项目" prop="projectId">
        <el-select
          v-model="formData.projectId"
          placeholder="请选择所属项目"
          style="width: 100%"
        >
          <el-option
            v-for="item in projectOptions"
            :key="item.projectId"
            :label="item.projectName"
            :value="item.projectId"
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

    <!-- 复制流程弹窗 -->
    <common-dialog
      v-model="copyDialogVisible"
      title="复制流程"
      :form-data="copyFormData"
      :rules="formRules"
      :loading="copySubmitLoading"
      width="700px"
      @confirm="handleCopySubmit"
    >
      <el-form-item label="流程名称" prop="flowName">
        <el-input v-model="copyFormData.flowName" placeholder="请输入流程名称" />
      </el-form-item>

      <el-form-item label="所属项目" prop="projectId">
        <el-select
          v-model="copyFormData.projectId"
          placeholder="请选择所属项目"
          style="width: 100%"
        >
          <el-option
            v-for="item in projectOptions"
            :key="item.projectId"
            :label="item.projectName"
            :value="item.projectId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input 
          v-model="copyFormData.remark" 
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DocumentCopy, View, Delete } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import * as flowApi from '@/api/api/api-flow'
import * as projectApi from '@/api/project/project'
import { handleApiResponse } from '@/utils/responseHandler'

const router = useRouter()
const tableRef = ref(null)

// 表格配置
const columns = [
  { prop: 'flowName', label: '流程名称', minWidth: 200 },
  { prop: 'projectName', label: '项目名称', minWidth: 150 },
  { prop: 'projectAddress', label: '项目地址', minWidth: 200 },
  { prop: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true },
  { prop: 'creator', label: '创建人', width: 100 },
  { prop: 'createTime', label: '创建时间', width: 180 }
]

const pagination = {
  pageNum: 1,
  pageSize: 10
}

const searchFields = [
  {
    prop: 'flowName',
    label: '流程名称',
    type: 'input',
    placeholder: '请输入流程名称'
  },
  {
    prop: 'projectId',
    label: '所属项目',
    type: 'select',
    placeholder: '请选择项目',
    options: []
  }
]

// 项目选项
const projectOptions = ref([])

// 选中行
const selectedRows = ref([])

// 弹窗配置
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitLoading = ref(false)

const formData = reactive({
  flowId: null,
  flowName: '',
  projectId: null,
  remark: ''
})

// 复制弹窗配置
const copyDialogVisible = ref(false)
const copySubmitLoading = ref(false)
const copyFormData = reactive({
  flowId: null,
  flowName: '',
  projectId: null,
  remark: ''
})

// 表单验证规则
const formRules = {
  flowName: [{ required: true, message: '请输入流程名称', trigger: 'blur' }],
  projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }]
}

// 加载项目列表
const loadProjects = async () => {
  try {
    const res = await projectApi.getProjectList({ pageNum: 1, pageSize: 1000 })
    projectOptions.value = res.data?.items || res.data?.list || res.data || []
    
    // 更新搜索字段的项目选项
    const projectField = searchFields.find(f => f.prop === 'projectId')
    if (projectField) {
      projectField.options = projectOptions.value.map(p => ({
        label: p.projectName,
        value: p.projectId
      }))
    }
  } catch (error) {
    console.error('加载项目列表失败:', error)
  }
}

// 处理选择变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 处理新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增流程'
  Object.assign(formData, {
    flowId: null,
    flowName: '',
    projectId: null,
    remark: ''
  })
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑流程'
  Object.assign(formData, {
    flowId: row.flowId,
    flowName: row.flowName,
    projectId: row.projectId,
    remark: row.remark || ''
  })
  dialogVisible.value = true
}

// 处理复制
const handleCopy = (row) => {
  Object.assign(copyFormData, {
    flowId: null,
    flowName: row.flowName + ' - 副本',
    projectId: row.projectId,
    remark: row.remark || ''
  })
  copyDialogVisible.value = true
}

// 提交复制表单
const handleCopySubmit = async () => {
  try {
    copySubmitLoading.value = true
    const res = await flowApi.addFlow(copyFormData)
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

// 查看详情
const handleViewDetail = (row) => {
  router.push(`/api/flow-detail/${row.flowId}`)
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除流程“${row.flowName}”吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await flowApi.deleteFlow(row.flowId)
      if (handleApiResponse(res, '删除成功', '删除失败')) {
        tableRef.value?.refresh()
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 处理批量删除
const handleBatchDelete = () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的流程')
    return
  }

  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个流程吗？`, '批量删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = selectedRows.value.map(item => item.flowId)
      const res = await flowApi.batchDeleteFlow(ids)
      if (handleApiResponse(res, '批量删除成功', '批量删除失败')) {
        tableRef.value?.refresh()
        // 清空选择
        tableRef.value.clearSelection()
      }
    } catch (error) {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }).catch(() => {})
}

// 处理提交
const handleSubmit = async () => {
  submitLoading.value = true
  try {
    let res
    if (isEdit.value) {
      res = await flowApi.updateFlow(formData)
    } else {
      res = await flowApi.addFlow(formData)
    }
    
    if (handleApiResponse(res, isEdit.value ? '编辑成功' : '添加成功', '提交失败')) {
      dialogVisible.value = false
      tableRef.value?.refresh()
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.flow-list {
  padding: 20px;
}
</style>
