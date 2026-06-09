<template>
  <div class="api-testcase">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="apiTestcaseApi.getTestcaseList"
      :pagination="pagination"
      :search-fields="searchFields"
      :show-selection="true"
      row-key="instanceId"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      @selection-change="handleSelectionChange"
    >
      <template #status="{ row }">
        <el-tag :type="getStatusType(row.status)">
          {{ getStatusText(row.status) }}
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
      width="700px"
      @confirm="handleSubmit"
    >
      <el-form-item label="项目" prop="projectId">
        <el-select filterable
          v-model="formData.projectId"
          placeholder="请选择项目"
          style="width: 100%"
          @change="handleProjectChange"
        >
          <el-option
            v-for="item in projectOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="API" prop="apiId">
        <el-select filterable
          v-model="formData.apiId"
          placeholder="请选择API"
          style="width: 100%"
          :disabled="!formData.projectId"
        >
          <el-option
            v-for="item in apiOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="用例名称" prop="instanceName">
        <el-input v-model="formData.instanceName" placeholder="请输入用例名称" />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="formData.description" type="textarea" placeholder="请输入描述" />
      </el-form-item>

      <el-form-item label="期望结果" prop="expectResult">
        <el-input v-model="formData.expectResult" placeholder="请输入期望结果" />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>

      <el-form-item label="用例输入" prop="instanceJson">
        <el-input v-model="formData.instanceJson" type="textarea" placeholder="请输入用例参数(JSON格式)" />
      </el-form-item>
    </common-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as apiTestcaseApi from '@/api/api/api-testcase'
import * as projectApi from '@/api/project/project'
import * as apiListApi from '@/api/api/api'

const tableRef = ref(null)
const submitLoading = ref(false)

// 下拉框选项
const projectOptions = ref([])
const apiOptions = ref([])

// 列配置
const columns = [
  { prop: 'instanceName', label: '用例名称', minWidth: 150 },
  { prop: 'description', label: '描述', minWidth: 200, showOverflowTooltip: true },
  { prop: 'expectResult', label: '期望结果', minWidth: 150 },
  { prop: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true },
  {
    prop: 'status',
    label: '执行状态',
    minWidth: 100,
    slot: 'status'
  }
]

// 搜索字段配置
const searchFields = [
  { type: 'input', prop: 'instanceName', label: '用例名称', placeholder: '请输入用例名称' },
  { type: 'input', prop: 'description', label: '描述', placeholder: '请输入描述' }
]

// 分页配置
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

// 弹窗控制
const dialogVisible = ref(false)
const dialogTitle = ref('新增用例')
const isEdit = ref(false)

// 表单数据
const formData = reactive({
  instanceId: null,
  projectId: '',
  apiId: '',
  instanceName: '',
  description: '',
  expectResult: '',
  remark: '',
  instanceJson: ''
})

// 表单验证规则
const formRules = {
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  apiId: [{ required: true, message: '请选择API', trigger: 'change' }],
  instanceName: [{ required: true, message: '请输入用例名称', trigger: 'blur' }]
}

// 获取状态类型
const getStatusType = (status) => {
  const map = {
    0: 'info',
    1: 'success',
    2: 'danger'
  }
  return map[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const map = {
    0: '未执行',
    1: '成功',
    2: '失败'
  }
  return map[status] || '未知'
}

// 加载项目列表
const loadProjectList = async () => {
  try {
    const response = await projectApi.getProjectList()
    projectOptions.value = response.data.items.map(item => ({
      label: item.projectName,
      value: item.projectId
    }))
  } catch (error) {
    console.error('加载项目列表失败:', error)
  }
}

// 加载API列表
const loadApiList = async (projectId) => {
  try {
    const response = await apiListApi.getApiList({ projectId })
    apiOptions.value = response.data.items.map(item => ({
      label: item.apiName,
      value: item.apiId
    }))
  } catch (error) {
    console.error('加载API列表失败:', error)
  }
}

// 处理项目变化
const handleProjectChange = (projectId) => {
  formData.apiId = ''
  if (projectId) {
    loadApiList(projectId)
  } else {
    apiOptions.value = []
  }
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增用例'
  Object.assign(formData, {
    instanceId: null,
    projectId: '',
    apiId: '',
    instanceName: '',
    description: '',
    expectResult: '',
    remark: '',
    instanceJson: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑用例'
  Object.assign(formData, row)
  // 如果有项目ID，加载对应的API列表
  if (row.projectId) {
    loadApiList(row.projectId)
  }
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该用例吗?', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await apiTestcaseApi.deleteTestcase(row.instanceId)
      ElMessage.success('删除成功')
      tableRef.value.refresh()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 批量删除
const handleBatchDelete = (rows) => {
  if (rows.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  ElMessageBox.confirm(`确认删除选中的 ${rows.length} 条用例吗?`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(item => item.instanceId)
      await apiTestcaseApi.batchDeleteTestcase(ids)
      ElMessage.success('删除成功')
      tableRef.value.refresh()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    submitLoading.value = true
    if (isEdit.value) {
      await apiTestcaseApi.updateTestcase(formData)
      ElMessage.success('更新成功')
    } else {
      await apiTestcaseApi.addTestcase(formData)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    tableRef.value.refresh()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitLoading.value = false
  }
}

// 页面加载时初始化
onMounted(() => {
  loadProjectList()
  tableRef.value.refresh()
})
</script>
