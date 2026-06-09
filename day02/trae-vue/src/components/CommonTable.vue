<template>
  <div class="common-table-container">
    <!-- 搜索区域 -->
    <el-card v-if="searchFields && searchFields.length > 0" shadow="never" class="search-card">
      <el-form
        :model="searchForm"
        inline
        class="search-form"
      >
        <el-form-item
          v-for="field in searchFields"
          :key="field.prop || field.slot"
          :label="field.label"
        >
          <!-- 自定义插槽 -->
          <slot
            v-if="field.type === 'custom' && field.slot"
            :name="field.slot"
          ></slot>
          
          <!-- 默认输入框 -->
          <el-input
            v-else-if="field.type === 'input'"
            v-model="searchForm[field.prop]"
            :placeholder="field.placeholder || `请输入${field.label}`"
            clearable
            style="width: 200px"
          />
          <el-select filterable
            v-else-if="field.type === 'select'"
            v-model="searchForm[field.prop]"
            :placeholder="field.placeholder || `请选择${field.label}`"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="option in field.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-date-picker
            v-else-if="field.type === 'date'"
            v-model="searchForm[field.prop]"
            type="date"
            :placeholder="field.placeholder || `请选择${field.label}`"
            value-format="YYYY-MM-DD"
            style="width: 200px"
          />
          <el-date-picker
            v-else-if="field.type === 'daterange'"
            v-model="searchForm[field.prop]"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            <span>查询</span>
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            <span>重置</span>
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card v-if="showToolbar" shadow="never" class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button
            v-if="showAdd"
            type="primary"
            @click="$emit('add')"
          >
            <el-icon><Plus /></el-icon>
            <span>新增</span>
          </el-button>
          <el-button
            v-if="showDelete"
            type="danger"
            :disabled="!selectedRows || selectedRows.length === 0"
            @click="$emit('batch-delete', selectedRows)"
          >
            <el-icon><Delete /></el-icon>
            <span>批量删除</span>
          </el-button>
          <slot name="toolbar-left"></slot>
        </div>
        <div class="toolbar-right">
          <slot name="toolbar-right"></slot>
        </div>
      </div>
    </el-card>

    <!-- 表格区域 -->
    <el-card shadow="never" class="table-card">
      <el-table
        ref="tableRef"
        v-loading="loading || internalLoading"
        :data="tableData"
        border
        stripe
        :row-key="rowKey"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column
          v-if="showSelection"
          type="selection"
          width="55"
          align="center"
        />
        
        <el-table-column
          v-if="showIndex"
          type="index"
          label="序号"
          width="60"
          align="center"
        />
        
        <template v-for="column in columns" :key="column.prop">
          <el-table-column
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth"
            :align="column.align || 'center'"
            :sortable="column.sortable"
            :fixed="column.fixed"
          >
            <template #default="{ row }">
              <!-- 自定义插槽 -->
              <slot
                v-if="column.slot"
                :name="column.slot"
                :row="row"
                :column="column"
              ></slot>
              
              <!-- 默认渲染 -->
              <template v-else>
                <div>
                  <div 
                    class="table-cell-content"
                    :ref="el => setCellRef(el, column.prop, row)"
                  >
                    {{ column.formatter ? column.formatter(row) : row[column.prop] }}
                  </div>
                </div>
              </template>
            </template>
          </el-table-column>
        </template>
        
        <!-- 操作列 -->
        <el-table-column
          v-if="showOperation"
          label="操作"
          :width="operationWidth"
          fixed="right"
          align="center"
        >
          <template #default="{ row }">
            <el-button
              v-if="showEdit"
              type="primary"
              size="small"
              link
              @click="$emit('edit', row)"
            >
              <el-icon><Edit /></el-icon>
              <span>编辑</span>
            </el-button>
            
            <el-button
              v-if="showCopy"
              type="success"
              size="small"
              link
              @click="$emit('copy', row)"
            >
              <el-icon><CopyDocument /></el-icon>
              <span>复制</span>
            </el-button>
            
            <el-button
              v-if="showDelete"
              type="danger"
              size="small"
              link
              @click="$emit('delete', row)"
            >
              <el-icon><Delete /></el-icon>
              <span>删除</span>
            </el-button>
            
            <slot name="operation" :row="row"></slot>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="showPagination"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="pageSizes"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { Search, Refresh, Plus, Delete, Edit, CopyDocument } from '@element-plus/icons-vue'

const props = defineProps({
  // 表格数据（支持直接传入或通过apiMethod获取）
  data: {
    type: Array,
    default: () => []
  },
  // API方法（用于自动获取数据）
  apiMethod: {
    type: Function,
    default: null
  },
  // API请求参数
  apiParams: {
    type: Object,
    default: () => ({})
  },
  // 是否自动加载数据
  autoLoad: {
    type: Boolean,
    default: true
  },
  // 列配置
  columns: {
    type: Array,
    required: true
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 行唯一标识
  rowKey: {
    type: String,
    default: 'id'
  },
  // 搜索字段配置
  searchFields: {
    type: Array,
    default: () => []
  },
  // 是否显示选择框
  showSelection: {
    type: Boolean,
    default: false
  },
  // 是否显示序号
  showIndex: {
    type: Boolean,
    default: true
  },
  // 是否显示新增按钮
  showAdd: {
    type: Boolean,
    default: true
  },
  // 是否显示编辑按钮
  showEdit: {
    type: Boolean,
    default: true
  },
  // 是否显示复制按钮
  showCopy: {
    type: Boolean,
    default: false
  },
  // 是否显示删除按钮
  showDelete: {
    type: Boolean,
    default: true
  },
  // 是否显示操作列
  showOperation: {
    type: Boolean,
    default: true
  },
  // 操作列宽度
  operationWidth: {
    type: Number,
    default: 200
  },
  // 是否显示分页
  showPagination: {
    type: Boolean,
    default: true
  },
  // 是否显示工具栏
  showToolbar: {
    type: Boolean,
    default: true
  },
  // 分页配置
  pagination: {
    type: Object,
    default: () => ({
      page: 1,
      pageSize: 10,
      total: 0
    })
  },
  // 每页条数选项
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  }
})

const emit = defineEmits([
  'search',
  'reset',
  'add',
  'edit',
  'copy',
  'delete',
  'batch-delete',
  'size-change',
  'current-change',
  'selection-change',
  'sort-change',
  'data-loaded'
])

const tableRef = ref(null)
const searchForm = reactive({})
const selectedRows = ref([])
const internalLoading = ref(false)
const tableData = ref([])

// 单元格引用管理
const cellRefs = new Map()

// 设置单元格引用
const setCellRef = (el, prop, row) => {
  if (el) {
    const key = `${prop}-${row.id || row[prop]}`
    cellRefs.set(key, el)
  }
}

// 检测文本是否溢出
const isTextOverflow = (prop) => {
  // 默认返回true，始终显示tooltip
  return true
}

/**
 * 构建请求参数
 */
const buildRequestParams = () => {
  const params = {
    pageNum: props.pagination.page,
    pageSize: props.pagination.pageSize,
    ...props.apiParams,
    ...searchForm
  }
  
  // 过滤空值
  Object.keys(params).forEach(key => {
    if (params[key] === '' || params[key] === null || params[key] === undefined) {
      delete params[key]
    }
  })
  
  return params
}

/**
 * 获取列表数据（核心方法）
 */
const fetchData = async () => {
  // 如果没有提供API方法，直接返回
  if (!props.apiMethod) {
    console.warn('CommonTable: apiMethod is not provided')
    return
  }
  
  internalLoading.value = true
  
  try {
    const params = buildRequestParams()
    const res = await props.apiMethod(params)
    
    // 处理响应数据
    // 处理响应数据 - 支持多种数据格式
    let list = []
    let total = 0

    if (res.data) {
      // 优先使用 items 字段（项目列表API返回格式）
      if (Array.isArray(res.data.items)) {
        list = res.data.items
        total = res.data.total || list.length
      } 
      // 其次使用 list 字段
      else if (Array.isArray(res.data.list)) {
        list = res.data.list
        total = res.data.total || list.length
      }
      // 如果 data 本身是数组
      else if (Array.isArray(res.data)) {
        list = res.data
        total = list.length
      }
    }

    // 更新内部数据
    tableData.value = list
    
    // 更新分页信息
    if (props.pagination) {
      props.pagination.total = total
    }
    
    // 触发数据加载完成事件
    emit('data-loaded', { list, total, res })
    
    return { list, total }
  } catch (error) {
    console.error('CommonTable: Failed to fetch data', error)
    throw error
  } finally {
    internalLoading.value = false
  }
}

/**
 * 刷新数据（保持当前页）
 */
const refresh = async () => {
  return await fetchData()
}

/**
 * 重新加载数据（重置到第一页）
 */
const reload = async () => {
  if (props.pagination) {
    props.pagination.page = 1
  }
  return await fetchData()
}

// 监听分页变化，自动获取数据
watch(
  () => [props.pagination?.page, props.pagination?.pageSize],
  () => {
    if (props.apiMethod && props.autoLoad) {
      fetchData()
    }
  },
  { deep: true }
)

// 组件挂载时自动加载数据
onMounted(() => {
  if (props.apiMethod && props.autoLoad) {
    fetchData()
  }
})

// 处理搜索
const handleSearch = () => {
  if (props.apiMethod) {
    // 如果有API方法，重置到第一页并重新获取数据
    if (props.pagination) {
      props.pagination.page = 1
    }
    fetchData()
  } else {
    // 否则触发搜索事件，由父组件处理
    emit('search', searchForm)
  }
}

// 处理重置
const handleReset = () => {
  // 清空搜索表单
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  
  if (props.apiMethod) {
    // 如果有API方法，重置到第一页并重新获取数据
    if (props.pagination) {
      props.pagination.page = 1
    }
    fetchData()
  } else {
    // 否则触发重置事件，由父组件处理
    emit('reset')
  }
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
  emit('selection-change', selection)
}

// 处理排序变化
const handleSortChange = ({ column, prop, order }) => {
  emit('sort-change', { column, prop, order })
}

// 处理每页条数变化
const handleSizeChange = (val) => {
  if (props.apiMethod) {
    // 如果有API方法，自动获取数据
    fetchData()
  } else {
    // 否则触发事件，由父组件处理
    emit('size-change', val)
  }
}

// 处理页码变化
const handleCurrentChange = (val) => {
  if (props.apiMethod) {
    // 如果有API方法，自动获取数据
    fetchData()
  } else {
    // 否则触发事件，由父组件处理
    emit('current-change', val)
  }
}

// 暴露方法给父组件
defineExpose({
  tableRef,
  searchForm,
  selectedRows,
  fetchData,
  refresh,
  reload,
  clearSelection: () => tableRef.value?.clearSelection()
})
</script>

<style scoped>
.common-table-container {
  background: #fff;
}

.search-card {
  margin-bottom: 10px;
}

.search-form {
  padding: 10px 0;
}

.toolbar-card {
  margin-bottom: 10px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 10px;
}

.table-card {
  margin-top: 10px;
}

/* 表格单元格内容样式 */
.table-cell-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.5;
  padding: 0 4px;
}

/* 统一表格行高 */
:deep(.el-table .el-table__row) {
  height: 48px;
}

:deep(.el-table .el-table__cell) {
  padding: 8px 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
