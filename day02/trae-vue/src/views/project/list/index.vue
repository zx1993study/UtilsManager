<template>
  <div class="project-list">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="projectApi.getProjectList"
      :pagination="pagination"
      :search-fields="searchFields"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
    >
      <!-- 自定义操作列 -->
      <template #operation="{ row }">
        <el-button
          v-if="row.projectSwagger"
          type="primary"
          size="small"
          link
          @click="handleParseSwagger(row)"
        >
          <el-icon><Document /></el-icon>
          <span>解析Swagger</span>
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
      <el-form-item label="项目名称" prop="projectName">
        <el-input v-model="formData.projectName" placeholder="请输入项目名称" />
      </el-form-item>

      <el-form-item label="项目地址" prop="projectAddress">
        <el-input v-model="formData.projectAddress" placeholder="请输入项目地址" />
      </el-form-item>

      <el-form-item label="Swagger地址" prop="projectSwagger">
        <el-input v-model="formData.projectSwagger" placeholder="请输入Swagger地址" />
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
import { ref, reactive } from 'vue'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import * as projectApi from '@/api/project/project'

const tableRef = ref(null)
const submitLoading = ref(false)

// 列配置
const columns = [
  { prop: 'projectName', label: '项目名称', minWidth: 200 },
  { prop: 'projectAddress', label: '项目地址', minWidth: 200, showOverflowTooltip: true },
  { prop: 'projectSwagger', label: 'Swagger地址', minWidth: 200, showOverflowTooltip: true },
  { prop: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true },
  { prop: 'createTime', label: '创建时间', width: 180 }
]

// 搜索字段配置
const searchFields = [
  { type: 'input', prop: 'projectName', label: '项目名称', placeholder: '请输入项目名称' }
]

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 弹窗配置
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = reactive({
  projectId: null,
  projectName: '',
  projectAddress: '',
  projectSwagger: '',
  remark: ''
})

const formRules = {
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }]
}

// 处理新增
const handleAdd = () => {
  dialogTitle.value = '新增项目'
  resetForm()
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑项目'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除项目"${row.projectName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await projectApi.deleteProject(row.projectId)
      ElMessage.success('删除成功')
      tableRef.value?.refresh()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

// 处理批量删除
const handleBatchDelete = async (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个项目吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.projectId)
      await projectApi.batchDeleteProject(ids)
      ElMessage.success('批量删除成功')
      tableRef.value?.refresh()
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {})
}

// 处理解析Swagger
const handleParseSwagger = (row) => {
  ElMessageBox.confirm(
    `确定要解析项目"${row.projectName}"的Swagger文档吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(async () => {
    try {
      await projectApi.parseSwagger({
        projectId: row.projectId,
        projectSwagger: row.projectSwagger
      })
      ElMessage.success('Swagger解析成功')
      tableRef.value?.refresh()
    } catch (error) {
      console.error('Swagger解析失败:', error)
      ElMessage.error('Swagger解析失败')
    }
  }).catch(() => {})
}

// 处理提交
const handleSubmit = async () => {
  submitLoading.value = true
  try {
    if (formData.projectId) {
      await projectApi.updateProject(formData)
      ElMessage.success('编辑成功')
    } else {
      await projectApi.addProject(formData)
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
    projectId: null,
    projectName: '',
    projectAddress: '',
    projectSwagger: '',
    remark: ''
  })
}
</script>

<style scoped>
.project-list {
  height: 100%;
}
</style>
