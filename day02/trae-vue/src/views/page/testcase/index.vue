<template>
  <div class="page-testcase">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="pageTestcaseApi.getPageTestCaseList"
      :pagination="pagination"
      :search-fields="searchFields"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
    >
      <template #status="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'danger'">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </el-tag>
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
      <el-form-item label="用例名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入用例名称" />
      </el-form-item>
      <el-form-item label="测试步骤" prop="steps">
        <el-input v-model="formData.steps" type="textarea" :rows="4" placeholder="请输入测试步骤" />
      </el-form-item>
      <el-form-item label="预期结果" prop="expectedResult">
        <el-input v-model="formData.expectedResult" type="textarea" :rows="3" placeholder="请输入预期结果" />
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
import { ref, reactive } from 'vue'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as pageTestcaseApi from '@/api/page/page-testcase'
import { handleApiResponse } from '@/utils/responseHandler'

const tableRef = ref(null)
const submitLoading = ref(false)

const columns = [
  { prop: 'name', label: '用例名称', minWidth: 200 },
  { prop: 'steps', label: '测试步骤', minWidth: 250, showOverflowTooltip: true },
  { prop: 'expectedResult', label: '预期结果', minWidth: 250, showOverflowTooltip: true },
  { prop: 'status', label: '状态', width: 80, slot: 'status' },
  { prop: 'createTime', label: '创建时间', width: 180 }
]

const searchFields = [
  { type: 'input', prop: 'name', label: '用例名称', placeholder: '请输入用例名称' },
  { type: 'select', prop: 'status', label: '状态', placeholder: '请选择状态',
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

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = reactive({
  id: null,
  name: '',
  steps: '',
  expectedResult: '',
  status: 1
})

const formRules = {
  name: [{ required: true, message: '请输入用例名称', trigger: 'blur' }]
}

const handleAdd = () => {
  dialogTitle.value = '新增用例'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑用例'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用例"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await pageTestcaseApi.deletePageTestcase(row.id)
      if (handleApiResponse(res, '删除成功', '删除失败')) {
        tableRef.value?.refresh()
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleBatchDelete = async (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个用例吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.id)
      const res = await pageTestcaseApi.batchDeletePageTestcase(ids)
      if (handleApiResponse(res, '批量删除成功', '批量删除失败')) {
        tableRef.value?.refresh()
      }
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  submitLoading.value = true
  try {
    let res
    if (formData.id) {
      res = await pageTestcaseApi.updatePageTestcase(formData)
    } else {
      res = await pageTestcaseApi.addPageTestcase(formData)
    }
    if (handleApiResponse(res, formData.id ? '编辑成功' : '新增成功', formData.id ? '编辑失败' : '新增失败')) {
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
    id: null,
    name: '',
    steps: '',
    expectedResult: '',
    status: 1
  })
}
</script>

<style scoped>
.page-testcase {
  height: 100%;
}
</style>