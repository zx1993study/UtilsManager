<template>
  <div class="project-list">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="projectApi.getProjectList"
      :pagination="pagination"
      :search-fields="searchFields"
      :show-selection="true"
      row-key="projectId"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
    >
      <template #operation="{ row }">
        <el-button
          type="primary"
          size="small"
          link
          :disabled="!hasSwagger(row)"
          @click="handleParseSwagger(row)"
        >
          <el-icon><Document /></el-icon>
          <span>解析Swagger</span>
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
import { handleApiResponse } from '@/utils/responseHandler'
import * as projectApi from '@/api/project/project'

const tableRef = ref(null)
const submitLoading = ref(false)

const columns = [
  { prop: 'projectName', label: '项目名称', minWidth: 200 },
  { prop: 'projectAddress', label: '项目地址', minWidth: 200, showOverflowTooltip: true },
  { prop: 'projectSwagger', label: 'Swagger地址', minWidth: 200, showOverflowTooltip: true },
  { prop: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true },
  { prop: 'createTime', label: '创建时间', width: 180 }
]

const searchFields = [
  { type: 'input', prop: 'projectName', label: '项目名称', placeholder: '请输入项目名称' }
]

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

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

const hasSwagger = (row) => {
  return Boolean(String(row?.projectSwagger || '').trim())
}

const handleAdd = () => {
  dialogTitle.value = '新增项目'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑项目'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除项目「${row.projectName}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await projectApi.deleteProject(row.projectId)
      if (handleApiResponse(res, '删除成功', '删除失败')) {
        tableRef.value?.refresh()
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleBatchDelete = async (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个项目吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.projectId)
      const res = await projectApi.batchDeleteProject(ids)
      if (handleApiResponse(res, '批量删除成功', '批量删除失败')) {
        tableRef.value?.refresh()
      }
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {})
}

const handleParseSwagger = (row) => {
  if (!hasSwagger(row)) {
    return
  }

  ElMessageBox.confirm(
    `确定要解析项目「${row.projectName}」的Swagger文档吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(async () => {
    try {
      const res = await projectApi.parseSwagger({
        projectId: row.projectId,
        projectSwagger: row.projectSwagger
      })
      if (handleApiResponse(res, 'Swagger解析成功', 'Swagger解析失败')) {
        tableRef.value?.refresh()
      }
    } catch (error) {
      console.error('Swagger解析失败:', error)
      ElMessage.error('Swagger解析失败')
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  submitLoading.value = true
  try {
    const res = formData.projectId
      ? await projectApi.updateProject(formData)
      : await projectApi.addProject(formData)
    if (handleApiResponse(res, formData.projectId ? '编辑成功' : '新增成功', '提交失败')) {
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
