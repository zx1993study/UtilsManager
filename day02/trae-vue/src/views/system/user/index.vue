<template>
  <div class="user-management">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="userApi.getUserList"
      :pagination="pagination"
      :search-fields="searchFields"
      :show-selection="true"
      row-key="userId"
      show-copy
      @add="handleAdd"
      @edit="handleEdit"
      @copy="handleCopy"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
    >
      <!-- 状态列 -->
      <template #status="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'danger'">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </el-tag>
      </template>
      
      <!-- 操作列扩展 -->
      <template #operation="{ row }">
        <el-button
          type="warning"
          size="small"
          link
          @click="handleResetPassword(row)"
        >
          <el-icon><Key /></el-icon>
          <span>重置密码</span>
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
      width="600px"
      @confirm="handleSubmit"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" placeholder="请输入用户名" />
      </el-form-item>
      
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="formData.nickname" placeholder="请输入昵称" />
      </el-form-item>
      
      <el-form-item label="密码" prop="password">
        <el-input v-model="formData.password" placeholder="请输入密码" />
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
import { Key } from '@element-plus/icons-vue'
import * as userApi from '@/api/system/user'
import { handleApiResponse } from '@/utils/responseHandler'

const tableRef = ref(null)
const submitLoading = ref(false)

// 表格数据由 CommonTable 内部管理，这里保留引用以防需要直接访问（虽然通常不需要）
const tableData = ref([])

// 列配置
const columns = [
  { prop: 'username', label: '用户名', width: 120 },
  { prop: 'nickname', label: '昵称', width: 120 },
  { prop: 'status', label: '状态', width: 80, slot: 'status' },
  { prop: 'createTime', label: '创建时间', width: 180 }
]

// 搜索字段配置
const searchFields = [
  { type: 'input', prop: 'username', label: '用户名', placeholder: '请输入用户名' },
  { type: 'input', prop: 'nickname', label: '昵称', placeholder: '请输入昵称' },
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
// 弹窗操作模式：add 新增 / edit 编辑 / copy 复制（copy 与 add 一样走新增，避免误用更新接口）
const dialogMode = ref('add')
const formData = reactive({
  userId: null,
  username: '',
  nickname: '',
  password: '',
  status: 1
})

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在6-20个字符之间', trigger: 'blur' }
  ]
}

// 处理新增
const handleAdd = () => {
  dialogMode.value = 'add'
  dialogTitle.value = '新增用户'
  resetForm()
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogMode.value = 'edit'
  dialogTitle.value = '编辑用户'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 处理复制
const handleCopy = (row) => {
  dialogMode.value = 'copy'
  dialogTitle.value = '复制用户'
  resetForm()
  Object.assign(formData, { ...row, userId: null })
  dialogVisible.value = true
  ElMessage.info('已复制用户信息，请修改后保存')
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用户"${row.username}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await userApi.deleteUser(row.userId)
      if (handleApiResponse(res, '删除成功', '删除失败')) {
        tableRef.value?.refresh() // 刷新列表
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

// 处理批量删除
const handleBatchDelete = async (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个用户吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.userId)
      const res = await userApi.batchDeleteUser(ids)
      if (handleApiResponse(res, '批量删除成功', '批量删除失败')) {
        tableRef.value?.refresh() // 刷新列表
      }
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {})
}

// 处理重置密码
const handleResetPassword = (row) => {
  ElMessageBox.prompt('请输入新密码', `重置用户"${row.username}"的密码`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^.{6,20}$/,
    inputErrorMessage: '密码长度必须在6-20位之间'
  }).then(async ({ value }) => {
    try {
      const res = await userApi.resetPassword(row.userId, value)
      handleApiResponse(res, '密码重置成功', '密码重置失败')
    } catch (error) {
      console.error('重置密码失败:', error)
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
    if (dialogMode.value === 'edit') {
      // 编辑：调用更新接口(PUT)
      res = await userApi.updateUser(formData)
      okMsg = '编辑成功'
      failMsg = '编辑失败'
    } else {
      // 新增 / 复制：均调用新增接口(POST)
      res = await userApi.addUser(formData)
      okMsg = dialogMode.value === 'copy' ? '复制成功' : '新增成功'
      failMsg = dialogMode.value === 'copy' ? '复制失败' : '新增失败'
    }
    if (handleApiResponse(res, okMsg, failMsg)) {
      dialogVisible.value = false
      tableRef.value?.refresh() // 刷新列表
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
    userId: null,
    username: '',
    nickname: '',
    password: '',
    status: 1
  })
}

onMounted(() => {
  // 初始化加载数据
})
</script>

<style scoped>
.user-management {
  height: 100%;
}
</style>
