<template>
  <div class="log-management">
    <common-table
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :search-fields="searchFields"
      :show-add="false"
      :show-edit="false"
      @reset="handleReset"
      @delete="handleDelete"
    >
      <template #type="{ row }">
        <el-tag :type="row.type === 'info' ? 'primary' : row.type === 'error' ? 'danger' : 'warning'">
          {{ row.type === 'info' ? '信息' : row.type === 'error' ? '错误' : '警告' }}
        </el-tag>
      </template>
    </common-table>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="日志详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="操作时间">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="操作人员">{{ currentRow?.username }}</el-descriptions-item>
        <el-descriptions-item label="操作模块">{{ currentRow?.module }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">{{ currentRow?.action }}</el-descriptions-item>
        <el-descriptions-item label="IP地址" :span="2">{{ currentRow?.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作内容" :span="2">
          {{ currentRow?.content }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import CommonTable from '@/components/CommonTable.vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const tableData = ref([
  {
    id: 1,
    username: 'admin',
    module: '用户管理',
    action: '新增用户',
    type: 'info',
    ip: '192.168.1.100',
    content: '创建了新用户张三',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    username: 'user1',
    module: '接口管理',
    action: '执行测试',
    type: 'error',
    ip: '192.168.1.101',
    content: '接口测试失败，超时5秒',
    createTime: '2024-01-15 09:20:00'
  }
])

const columns = [
  { prop: 'username', label: '操作人员', width: 120 },
  { prop: 'module', label: '操作模块', width: 150 },
  { prop: 'action', label: '操作类型', width: 150 },
  { prop: 'type', label: '日志级别', width: 100, slot: 'type' },
  { prop: 'ip', label: 'IP地址', width: 150 },
  { prop: 'content', label: '操作内容', minWidth: 200 },
  { prop: 'createTime', label: '操作时间', width: 180 }
]

const searchFields = [
  { type: 'input', prop: 'username', label: '操作人员' },
  { type: 'input', prop: 'module', label: '操作模块' },
  { type: 'daterange', prop: 'dateRange', label: '操作时间' }
]

const dialogVisible = ref(false)
const currentRow = ref(null)

const handleReset = () => {
  ElMessage.success('查询条件已重置')
}

const handleDelete = (row) => {
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.log-management {
  height: 100%;
}
</style>
