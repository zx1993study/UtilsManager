<template>
  <div class="user-management">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="userApi.getUserList"
      :pagination="pagination"
      :search-fields="searchFields"
      show-selection
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
      
      <el-form-item label="姓名" prop="realName">
        <el-input v-model="formData.realName" placeholder="请输入姓名" />
      </el-form-item>
      
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>
      
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>
      
      <el-form-item label="部门" prop="deptId">
        <el-select filterable v-model="formData.deptId" placeholder="请选择部门" style="width: 100%">
          <el-option label="技术部" value="1" />
          <el-option label="产品部" value="2" />
          <el-option label="运营部" value="3" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="角色" prop="roleIds">
        <el-select filterable v-model="formData.roleIds" multiple placeholder="请选择角色" style="width: 100%">
          <el-option label="管理员" value="1" />
          <el-option label="普通用户" value="2" />
          <el-option label="访客" value="3" />
        </el-select>
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

const tableRef = ref(null)
const submitLoading = ref(false)

// 表格数据由 CommonTable 内部管理，这里保留引用以防需要直接访问（虽然通常不需要）
const tableData = ref([])

// 列配置
const columns = [
  { prop: 'username', label: '用户名', width: 120 },
  { prop: 'realName', label: '姓名', width: 120 },
  { prop: 'email', label: '邮箱', minWidth: 180 },
  { prop: 'phone', label: '手机号', width: 130 },
  { prop: 'deptName', label: '部门', width: 120 },
  { prop: 'roleName', label: '角色', width: 120 },
  { prop: 'status', label: '状态', width: 80, slot: 'status' },
  { prop: 'createTime', label: '创建时间', width: 180 }
]

// 搜索字段配置
const searchFields = [
  { type: 'input', prop: 'username', label: '用户名', placeholder: '请输入用户名' },
  { type: 'input', prop: 'realName', label: '姓名', placeholder: '请输入姓名' },
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
  username: '',
  realName: '',
  email: '',
  phone: '',
  deptId: '',
  roleIds: [],
  status: 1
})

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 处理新增
const handleAdd = () => {
  dialogTitle.value = '新增用户'
  resetForm()
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑用户'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 处理复制
const handleCopy = (row) => {
  dialogTitle.value = '复制用户'
  resetForm()
  Object.assign(formData, { ...row, id: null })
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
      await userApi.deleteUser(row.id)
      ElMessage.success('删除成功')
      tableRef.value?.refresh() // 刷新列表
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
      const ids = rows.map(row => row.id)
      await userApi.batchDeleteUser(ids)
      ElMessage.success('批量删除成功')
      tableRef.value?.refresh() // 刷新列表
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
      await userApi.resetPassword(row.id, value)
      ElMessage.success('密码重置成功')
    } catch (error) {
      console.error('重置密码失败:', error)
    }
  }).catch(() => {})
}

// 处理提交
const handleSubmit = async () => {
  submitLoading.value = true
  try {
    if (formData.id) {
      // 编辑
      await userApi.updateUser(formData)
      ElMessage.success('编辑成功')
    } else {
      // 新增
      await userApi.addUser(formData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    tableRef.value?.refresh() // 刷新列表
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
    username: '',
    realName: '',
    email: '',
    phone: '',
    deptId: '',
    roleIds: [],
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
