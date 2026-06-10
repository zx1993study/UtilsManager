<template>
  <div class="dept-management">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="deptApi.getDeptList"
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
      @confirm="handleSubmit"
    >
      <el-form-item label="部门名称" prop="deptName">
        <el-input v-model="formData.deptName" placeholder="请输入部门名称" />
      </el-form-item>
      
      <el-form-item label="上级部门" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="deptTree"
          props="label"
          check-strictly
          placeholder="请选择上级部门"
          style="width: 100%"
        />
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
    </common-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as deptApi from '@/api/system/dept'
import { handleApiResponse } from '@/utils/responseHandler'

const tableRef = ref(null)
const submitLoading = ref(false)
const deptTree = ref([])

// 列配置
const columns = [
  { prop: 'deptName', label: '部门名称', minWidth: 200 },
  { prop: 'parentName', label: '上级部门', width: 150 },
  { prop: 'sort', label: '排序', width: 80 },
  { prop: 'status', label: '状态', width: 80, slot: 'status' },
  { prop: 'createTime', label: '创建时间', width: 180 }
]

// 搜索字段配置
const searchFields = [
  { type: 'input', prop: 'deptName', label: '部门名称', placeholder: '请输入部门名称' },
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
  deptName: '',
  parentId: '',
  sort: 0,
  status: 1
})

const formRules = {
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
}

// 获取部门树
const fetchDeptTree = async () => {
  try {
    const res = await deptApi.getDeptTree()
    deptTree.value = res.data || []
  } catch (error) {
    console.error('获取部门树失败:', error)
  }
}

// 处理新增
const handleAdd = () => {
  dialogTitle.value = '新增部门'
  resetForm()
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑部门'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除部门"${row.deptName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deptApi.deleteDept(row.id)
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
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个部门吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.id)
      const res = await deptApi.batchDeleteDept(ids)
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
      res = await deptApi.updateDept(formData)
      okMsg = '编辑成功'
      failMsg = '编辑失败'
    } else {
      res = await deptApi.addDept(formData)
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
    deptName: '',
    parentId: '',
    sort: 0,
    status: 1
  })
}

onMounted(() => {
  fetchDeptTree()
})
</script>

<style scoped>
.dept-management {
  height: 100%;
}
</style>
