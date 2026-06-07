<template>
  <div class="api-result">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="apiResultApi.getTestResultList"
      :pagination="pagination"
      :search-fields="searchFields"
      :show-selection="true"
      row-key="resultId"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      @selection-change="handleSelectionChange"
      :show-add="false"
      :show-edit="false"
    >
      <template #resultStatus="{ row }">
        <el-tag :type="getResultStatusType(row.resultStatus)">
          {{ getResultStatusText(row.resultStatus) }}
        </el-tag>
      </template>
      
      <!-- 自定义操作列 -->
      <template #operation="{ row }">
        <el-button
          type="primary"
          size="small"
          link
          @click="handleViewDetail(row)"
        >
          <el-icon><View /></el-icon>
          <span>详情</span>
        </el-button>
        
        <el-button
          type="warning"
          size="small"
          link
          @click="handleEditRemark(row)"
        >
          <el-icon><Edit /></el-icon>
          <span>备注</span>
        </el-button>
        
        <el-button
          type="danger"
          size="small"
          link
          @click="handleDelete(row)"
        >
          <el-icon><Delete /></el-icon>
          <span>删除</span>
        </el-button>
      </template>
    </common-table>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="API返回结果"
      width="60%"
      :close-on-click-modal="false"
    >
      <div class="response-info-container">
        <pre class="response-content">{{ currentRow.responseInfo }}</pre>
      </div>
    </el-dialog>

    <!-- 备注编辑弹窗 -->
    <common-dialog
      v-model="remarkDialogVisible"
      title="编辑备注"
      :form-data="remarkFormData"
      :rules="remarkFormRules"
      :loading="remarkSubmitLoading"
      width="500px"
      @confirm="handleRemarkSubmit"
    >
      <el-form-item label="结果状态" prop="resultStatus">
        <el-select v-model="remarkFormData.resultStatus" placeholder="请选择结果状态" style="width: 100%">
          <el-option label="正常" :value="1" />
          <el-option label="异常" :value="2" />
          <el-option label="偶现" :value="3" />
          <el-option label="待定" :value="4" />
        </el-select>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="remarkFormData.remark"
          type="textarea"
          :rows="4"
          placeholder="请输入备注"
        />
      </el-form-item>
    </common-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Edit, Delete } from '@element-plus/icons-vue'
import * as apiResultApi from '@/api/api/api-result'

const tableRef = ref(null)

// 详情弹窗
const detailDialogVisible = ref(false)
const currentRow = ref({})

// 备注编辑弹窗
const remarkDialogVisible = ref(false)
const remarkSubmitLoading = ref(false)
const remarkFormData = reactive({
  resultId: null,
  resultStatus: 1,
  remark: ''
})

const remarkFormRules = {
  resultStatus: [{ required: true, message: '请选择结果状态', trigger: 'change' }]
}

const columns = [
  { 
    prop: 'resultStatus', 
    label: '结果状态', 
    width: 100, 
    slot: 'resultStatus' 
  },
  { 
    prop: 'remark', 
    label: '结果备注', 
    minWidth: 150,
    showOverflowTooltip: true 
  },
  { 
    prop: 'instanceName', 
    label: '用例名称', 
    minWidth: 150,
    showOverflowTooltip: true 
  },
  { 
    prop: 'apiName', 
    label: 'API名称', 
    minWidth: 150,
    showOverflowTooltip: true 
  },
  { 
    prop: 'projectName', 
    label: '项目名称', 
    minWidth: 150,
    showOverflowTooltip: true 
  },
  { 
    prop: 'description', 
    label: '描述', 
    minWidth: 150,
    showOverflowTooltip: true 
  },
  { 
    prop: 'createTime', 
    label: '创建时间', 
    width: 180 
  }
]

const searchFields = [
  { type: 'input', prop: 'instanceName', label: '用例名称', placeholder: '请输入用例名称' },
  { type: 'input', prop: 'apiName', label: 'API名称', placeholder: '请输入API名称' },
  { type: 'select', prop: 'resultStatus', label: '结果状态', placeholder: '请选择状态',
    options: [
      { label: '正常', value: 1 },
      { label: '异常', value: 2 },
      { label: '偶现', value: 3 },
      { label: '待定', value: 4 }
    ]
  }
]

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

// 获取结果状态类型
const getResultStatusType = (status) => {
  const map = {
    1: 'success',
    2: 'danger',
    3: 'warning',
    4: 'info'
  }
  return map[status] || 'info'
}

// 获取结果状态文本
const getResultStatusText = (status) => {
  const map = {
    1: '正常',
    2: '异常',
    3: '偶现',
    4: '待定'
  }
  return map[status] || '未知'
}

// 查看详情
const handleViewDetail = (row) => {
  currentRow.value = row
  detailDialogVisible.value = true
}

// 编辑备注
const handleEditRemark = (row) => {
  remarkFormData.resultId = row.resultId
  remarkFormData.resultStatus = row.resultStatus || 1
  remarkFormData.remark = row.remark || ''
  remarkDialogVisible.value = true
}

// 提交备注
const handleRemarkSubmit = async () => {
  try {
    remarkSubmitLoading.value = true
    await apiResultApi.updateTestResult({
      resultId: remarkFormData.resultId,
      resultStatus: remarkFormData.resultStatus,
      remark: remarkFormData.remark
    })
    ElMessage.success('更新成功')
    remarkDialogVisible.value = false
    tableRef.value?.refresh()
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败')
  } finally {
    remarkSubmitLoading.value = false
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该测试结果吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await apiResultApi.deleteTestResult(row.resultId)
      ElMessage.success('删除成功')
      tableRef.value?.refresh()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleBatchDelete = async (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个测试结果吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.resultId)
      await apiResultApi.batchDeleteTestResult(ids)
      ElMessage.success('批量删除成功')
      tableRef.value?.refresh()
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {})
}
</script>

<style scoped>
.api-result {
  height: 100%;
}

.response-info-container {
  max-height: 60vh;
  overflow-y: auto;
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.response-content {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
}
</style>