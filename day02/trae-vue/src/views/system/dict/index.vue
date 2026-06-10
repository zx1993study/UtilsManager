<template>
  <div class="dict-management">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="dictApi.getDictList"
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

    <!-- 新增/编辑弹窗 -->
    <common-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :form-data="formData"
      :rules="formRules"
      :loading="submitLoading"
      width="600px"
      @confirm="handleSubmit"
    >
      <el-form-item label="字典名称" prop="dictName">
        <el-input v-model="formData.dictName" placeholder="请输入字典名称" />
      </el-form-item>
      
      <el-form-item label="字典类型" prop="dictType">
        <el-input v-model="formData.dictType" placeholder="请输入字典类型" />
      </el-form-item>
      
      <el-form-item label="字典值" prop="dictValue">
        <el-input v-model="formData.dictValue" placeholder="请输入字典值" />
      </el-form-item>
      
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" style="width: 100%" />
      </el-form-item>
      
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入字典描述"
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
import * as dictApi from '@/api/system/dict'
import { handleApiResponse } from '@/utils/responseHandler'

const tableRef = ref(null)
const submitLoading = ref(false)

// 列配置
const columns = [
  { prop: 'dictName', label: '字典名称', minWidth: 150 },
  { prop: 'dictType', label: '字典类型', width: 150 },
  { prop: 'dictValue', label: '字典值', width: 150 },
  { prop: 'sort', label: '排序', width: 80 },
  { prop: 'status', label: '状态', width: 80, slot: 'status' },
  { prop: 'description', label: '描述', minWidth: 200, showOverflowTooltip: true },
  { prop: 'createTime', label: '创建时间', width: 180 }
]

// 搜索字段配置
const searchFields = [
  { type: 'input', prop: 'dictName', label: '字典名称', placeholder: '请输入字典名称' },
  { type: 'input', prop: 'dictType', label: '字典类型', placeholder: '请输入字典类型' },
  { type: 'select', prop: 'status', label: '状态', placeholder: '请选择状态',
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ]
  }
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
  id: null,
  dictName: '',
  dictType: '',
  dictValue: '',
  description: '',
  sort: 0,
  status: 1
})

const formRules = {
  dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  dictType: [{ required: true, message: '请输入字典类型', trigger: 'blur' }],
  dictValue: [{ required: true, message: '请输入字典值', trigger: 'blur' }]
}

// 处理新增
const handleAdd = () => {
  dialogTitle.value = '新增字典'
  resetForm()
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑字典'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除字典"${row.dictName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await dictApi.deleteDict(row.id)
      if (handleApiResponse(res, '删除成功', '删除失败')) {
        tableRef.value?.refresh()
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

// 处理批量删除
const handleBatchDelete = async (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个字典吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.id)
      const res = await dictApi.batchDeleteDict(ids)
      if (handleApiResponse(res, '批量删除成功', '批量删除失败')) {
        tableRef.value?.refresh()
      }
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {})
}

// 处理提交
const handleSubmit = async () => {
  submitLoading.value = true
  try {
    let res
    let okMsg
    let failMsg
    if (formData.id) {
      res = await dictApi.updateDict(formData)
      okMsg = '编辑成功'
      failMsg = '编辑失败'
    } else {
      res = await dictApi.addDict(formData)
      okMsg = '新增成功'
      failMsg = '新增失败'
    }
    if (handleApiResponse(res, okMsg, failMsg)) {
      dialogVisible.value = false
      tableRef.value?.refresh()
    }
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: null,
    dictName: '',
    dictType: '',
    dictValue: '',
    description: '',
    sort: 0,
    status: 1
  })
}
</script>

<style scoped>
.dict-management {
  height: 100%;
}
</style>
