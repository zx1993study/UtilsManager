<template>
  <div class="page-template">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="pageTemplateApi.getPageTemplateList"
      :pagination="pagination"
      :search-fields="searchFields"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
    />

    <common-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :form-data="formData"
      :rules="formRules"
      :loading="submitLoading"
      width="600px"
      @confirm="handleSubmit"
    >
      <el-form-item label="模板名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入模板名称" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
      </el-form-item>
    </common-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as pageTemplateApi from '@/api/page/page-template'

const tableRef = ref(null)
const submitLoading = ref(false)

const columns = [
  { prop: 'name', label: '模板名称', minWidth: 200 },
  { prop: 'description', label: '描述', minWidth: 250, showOverflowTooltip: true },
  { prop: 'createTime', label: '创建时间', width: 180 }
]

const searchFields = [
  { type: 'input', prop: 'name', label: '模板名称', placeholder: '请输入模板名称' }
]

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = reactive({
  id: null,
  name: '',
  description: ''
})

const formRules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }]
}

const handleAdd = () => {
  dialogTitle.value = '新增模板'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑模板'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除模板"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await pageTemplateApi.deletePageTemplate(row.id)
      ElMessage.success('删除成功')
      tableRef.value?.refresh()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleBatchDelete = async (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个模板吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.id)
      await pageTemplateApi.batchDeletePageTemplate(ids)
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
    if (formData.id) {
      await pageTemplateApi.updatePageTemplate(formData)
      ElMessage.success('编辑成功')
    } else {
      await pageTemplateApi.addPageTemplate(formData)
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
    id: null,
    name: '',
    description: ''
  })
}
</script>

<style scoped>
.page-template {
  height: 100%;
}
</style>