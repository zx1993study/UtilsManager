<template>
  <div class="common-table-container">
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
          <slot
            v-if="field.type === 'custom' && field.slot"
            :name="field.slot"
          ></slot>

          <el-input
            v-else-if="field.type === 'input'"
            v-model="searchForm[field.prop]"
            :placeholder="field.placeholder || `请输入${field.label}`"
            clearable
            style="width: 200px"
          />
          <el-select
            v-else-if="field.type === 'select'"
            v-model="searchForm[field.prop]"
            :placeholder="field.placeholder || `请选择${field.label}`"
            clearable
            filterable
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

    <el-card shadow="never" class="table-card">
      <el-table
        ref="tableRef"
        v-loading="loading || internalLoading"
        :data="tableData"
        border
        stripe
        :row-key="rowKey"
        highlight-current-row
        @row-click="handleRowClick"
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
              <slot
                v-if="column.slot"
                :name="column.slot"
                :row="row"
                :column="column"
              ></slot>

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
  data: {
    type: Array,
    default: () => []
  },
  apiMethod: {
    type: Function,
    default: null
  },
  apiParams: {
    type: Object,
    default: () => ({})
  },
  autoLoad: {
    type: Boolean,
    default: true
  },
  columns: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  rowKey: {
    type: String,
    default: 'id'
  },
  searchFields: {
    type: Array,
    default: () => []
  },
  showSelection: {
    type: Boolean,
    default: false
  },
  showIndex: {
    type: Boolean,
    default: true
  },
  showAdd: {
    type: Boolean,
    default: true
  },
  showEdit: {
    type: Boolean,
    default: true
  },
  showCopy: {
    type: Boolean,
    default: false
  },
  showDelete: {
    type: Boolean,
    default: true
  },
  showOperation: {
    type: Boolean,
    default: true
  },
  operationWidth: {
    type: Number,
    default: 200
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  showToolbar: {
    type: Boolean,
    default: true
  },
  pagination: {
    type: Object,
    default: () => ({
      page: 1,
      pageSize: 10,
      total: 0
    })
  },
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
  'row-click',
  'data-loaded'
])

const tableRef = ref(null)
const searchForm = reactive({})
const selectedRows = ref([])
const internalLoading = ref(false)
const tableData = ref([])
const cellRefs = new Map()

const setCellRef = (el, prop, row) => {
  if (el) {
    const key = `${prop}-${row.id || row[prop]}`
    cellRefs.set(key, el)
  }
}

const buildRequestParams = () => {
  const params = {
    pageNum: props.pagination.page,
    pageSize: props.pagination.pageSize,
    ...props.apiParams,
    ...searchForm
  }

  Object.keys(params).forEach(key => {
    if (params[key] === '' || params[key] === null || params[key] === undefined) {
      delete params[key]
    }
  })

  return params
}

const normalizeResponse = (res) => {
  if (res?.data?.items && Array.isArray(res.data.items)) {
    return {
      list: res.data.items,
      total: res.data.total || res.data.items.length
    }
  }

  if (res?.data?.list && Array.isArray(res.data.list)) {
    return {
      list: res.data.list,
      total: res.data.total || res.data.list.length
    }
  }

  if (Array.isArray(res?.data)) {
    return {
      list: res.data,
      total: res.data.length
    }
  }

  return {
    list: [],
    total: 0
  }
}

const fetchData = async () => {
  if (!props.apiMethod) {
    tableData.value = props.data || []
    return {
      list: tableData.value,
      total: tableData.value.length
    }
  }

  internalLoading.value = true

  try {
    const params = buildRequestParams()
    const res = await props.apiMethod(params)
    const { list, total } = normalizeResponse(res)

    tableData.value = list

    if (props.pagination) {
      props.pagination.total = total
    }

    emit('data-loaded', { list, total, res })

    return { list, total }
  } catch (error) {
    console.error('CommonTable: Failed to fetch data', error)
    throw error
  } finally {
    internalLoading.value = false
  }
}

const refresh = async () => {
  return await fetchData()
}

const reload = async () => {
  if (props.pagination) {
    props.pagination.page = 1
  }
  return await fetchData()
}

watch(
  () => props.data,
  (value) => {
    if (!props.apiMethod) {
      tableData.value = value || []
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => [props.pagination?.page, props.pagination?.pageSize],
  () => {
    if (props.apiMethod && props.autoLoad) {
      fetchData()
    }
  },
  { deep: true }
)

onMounted(() => {
  if (props.apiMethod && props.autoLoad) {
    fetchData()
  }
})

const handleSearch = () => {
  if (props.apiMethod) {
    if (props.pagination) {
      props.pagination.page = 1
    }
    fetchData()
  } else {
    emit('search', searchForm)
  }
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })

  if (props.apiMethod) {
    if (props.pagination) {
      props.pagination.page = 1
    }
    fetchData()
  } else {
    emit('reset')
  }
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
  emit('selection-change', selection)
}

const handleRowClick = (row, column, event) => {
  emit('row-click', row, column, event)
}

const handleSortChange = ({ column, prop, order }) => {
  emit('sort-change', { column, prop, order })
}

const handleSizeChange = (val) => {
  if (props.apiMethod) {
    fetchData()
  } else {
    emit('size-change', val)
  }
}

const handleCurrentChange = (val) => {
  if (props.apiMethod) {
    fetchData()
  } else {
    emit('current-change', val)
  }
}

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

.table-cell-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.5;
  padding: 0 4px;
}

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
