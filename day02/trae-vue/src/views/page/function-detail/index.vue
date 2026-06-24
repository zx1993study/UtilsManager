<template>
  <div class="page-function-detail">
    <el-card shadow="never" class="header-card">
      <div class="header-content">
        <div class="title-block">
          <h2 class="page-title">{{ pageInfo.pageName || '页面功能详情' }}</h2>
          <span class="url-text">{{ pageInfo.pageUrl || '-' }}</span>
        </div>
        <el-button @click="router.back()">
          <el-icon><Back /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
    </el-card>

    <div class="content-layout">
      <el-card shadow="never" class="left-panel">
        <el-tabs v-model="leftActiveTab" class="panel-tabs">
          <el-tab-pane label="参数/结果" name="paramsResult">
            <div v-if="selectedInstance" class="tab-content">
              <div class="section-block">
                <el-form label-width="70px" class="testcase-token-form">
                  <el-form-item label="Token">
                    <el-select
                      v-model="selectedInstance.tokenId"
                      placeholder="请选择Token"
                      style="width: 100%"
                      clearable
                      @change="handleSelectedTokenChange"
                    >
                      <el-option
                        v-for="item in pageTokenOptions"
                        :key="item.tokenId"
                        :label="buildTokenLabel(item)"
                        :value="item.tokenId"
                      />
                    </el-select>
                  </el-form-item>
                </el-form>
              </div>
              <div class="section-block">
                <div class="section-title">参数JSON</div>
                <pre class="json-content">{{ formatJson(selectedOperationJson) }}</pre>
              </div>
              <div class="section-block">
                <div class="section-title">结果详情</div>
              <el-descriptions v-if="latestResult" :column="1" border>
                <el-descriptions-item label="状态">
                  <el-tag :type="latestResult.resultStatus === 1 ? 'success' : 'danger'">
                    {{ latestResult.resultStatus === 1 ? '成功' : '失败' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="Code">
                  {{ latestResult.code || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="返回信息">
                  <pre class="json-content">{{ latestResult.responseInfo || '-' }}</pre>
                </el-descriptions-item>
              </el-descriptions>
                <el-empty v-else description="暂无执行结果" />
              </div>

              <div class="section-block">
                <div class="section-title">图片信息</div>
              <div v-if="screenshotList.length" class="screenshot-list">
                <el-image
                  v-for="name in screenshotList"
                  :key="name"
                  :src="buildScreenshotUrl(name)"
                  :preview-src-list="screenshotUrls"
                  fit="contain"
                  class="screenshot-image"
                />
              </div>
              <el-empty v-else description="暂无截图" />
              </div>
            </div>
            <el-empty v-else description="请选择实例" />
          </el-tab-pane>

          <el-tab-pane label="元素模板" name="elements">
            <div class="tab-content">
              <div class="table-actions">
                <el-button type="primary" @click="handleAddElement">
                  <el-icon><Plus /></el-icon>
                  <span>新增</span>
                </el-button>
              </div>

              <common-table
                :data="elementTemplates"
                :columns="elementColumns"
                :loading="elementLoading"
                :show-toolbar="false"
                :show-pagination="false"
                :show-operation="true"
                :show-edit="false"
                :show-delete="false"
                :show-index="false"
                :operation-width="150"
                row-key="elementId"
              >
                <template #locatorType="{ row }">
                  <el-tag effect="plain">{{ getOptionLabel(locatorTypeOptions, row.locatorType) }}</el-tag>
                </template>
                <template #elementType="{ row }">
                  <el-tag effect="plain">{{ getOptionLabel(elementTypeOptions, row.elementType) }}</el-tag>
                </template>
                <template #operation="{ row }">
                  <el-button type="primary" size="small" link @click="handleEditElement(row)">
                    <el-icon><Edit /></el-icon>
                    <span>编辑</span>
                  </el-button>
                  <el-button type="danger" size="small" link @click="handleDeleteElement(row)">
                    <el-icon><Delete /></el-icon>
                    <span>删除</span>
                  </el-button>
                </template>
              </common-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="下拉框" name="apiDropdown">
            <div class="tab-content">
              <div class="api-step-card">
                <div class="api-step-form">
                  <el-form-item label="API">
                    <el-select
                      v-model="apiDropdown.apiId"
                      filterable
                      clearable
                      placeholder="请选择API"
                      class="api-step-select"
                      @change="handleApiDropdownApiChange"
                    >
                      <el-option
                        v-for="api in apiDropdown.apiOptions"
                        :key="api.apiId"
                        :label="api.apiName"
                        :value="api.apiId"
                      />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="用例">
                    <el-select
                      v-model="apiDropdown.instanceId"
                      filterable
                      clearable
                      placeholder="请选择用例"
                      class="api-step-select"
                      :disabled="!apiDropdown.apiId"
                      @change="handleApiDropdownCaseChange"
                    >
                      <el-option
                        v-for="item in apiDropdown.caseOptions"
                        :key="item.instanceId"
                        :label="item.instanceName"
                        :value="item.instanceId"
                      />
                    </el-select>
                  </el-form-item>

                  <el-form-item>
                    <el-button
                      type="primary"
                      :loading="apiDropdown.running"
                      :disabled="!apiDropdown.instanceId || apiDropdown.running"
                      @click="handleRunApiDropdown"
                    >
                      <el-icon><VideoPlay /></el-icon>
                      <span>运行</span>
                    </el-button>
                  </el-form-item>
                </div>

                <el-input
                  v-model="apiDropdown.params"
                  type="textarea"
                  :rows="7"
                  placeholder="参数JSON"
                  class="api-step-json-input"
                />

                <div class="api-step-query">
                  <el-input
                    v-model="apiDropdown.queryKey"
                    placeholder="输入要搜索的参数 key，多个用中文顿号分隔，例如 token、data.id"
                    clearable
                    @keyup.enter="handleQueryApiDropdownParam"
                  />
                  <el-button type="primary" @click="handleQueryApiDropdownParam">
                    <el-icon><Search /></el-icon>
                    <span>搜索参数</span>
                  </el-button>
                </div>

                <div v-if="apiDropdown.queryResult" class="query-result">
                  <div class="response-label">搜索结果：</div>
                  <pre class="json-content">{{ apiDropdown.queryResult }}</pre>
                </div>

                <div v-if="apiDropdown.result" class="result-section">
                  <el-divider content-position="left">结果详情</el-divider>
                  <el-descriptions :column="1" border size="small">
                    <el-descriptions-item label="Code">
                      <el-tag :type="getCodeType(apiDropdown.result.code)">
                        {{ apiDropdown.result.code || '-' }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="耗时">
                      {{ apiDropdown.result.remark || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="响应信息">
                      <pre class="json-content">{{ formatJson(apiDropdown.result.responseInfo) }}</pre>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
                <el-empty v-else description="请选择用例并运行" />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <el-card shadow="never" class="right-panel">
        <el-tabs v-model="rightActiveTab" class="panel-tabs">
          <el-tab-pane label="实例列表" name="instances">
            <div class="table-actions">
              <el-button
                type="success"
                :loading="batchRunning"
                :disabled="!selectedRows.length || batchRunning || !!runningInstanceIds.length"
                @click="handleBatchRun"
              >
                <el-icon><VideoPlay /></el-icon>
                <span>批量运行 ({{ selectedRows.length }})</span>
              </el-button>
              <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
                <el-icon><Delete /></el-icon>
                <span>批量删除 ({{ selectedRows.length }})</span>
              </el-button>
              <el-button type="primary" @click="handleAddInstance">
                <el-icon><Plus /></el-icon>
                <span>添加</span>
              </el-button>
              <el-button type="warning" @click="handleOpenGenerateDialog">
                <el-icon><Plus /></el-icon>
                <span>自动生成</span>
              </el-button>
            </div>

            <common-table
              ref="instanceTableRef"
              :columns="instanceColumns"
              :api-method="getInstanceList"
              :pagination="pagination"
              :search-fields="[]"
              :show-add="false"
              :show-delete="false"
              :show-edit="false"
              :show-selection="true"
              :show-toolbar="false"
              :operation-width="280"
              row-key="pageInstanceId"
              @edit="handleEditInstance"
              @delete="handleDeleteInstance"
              @selection-change="handleSelectionChange"
              @row-click="handleViewInstance"
            >
              <template #status="{ row }">
                <el-tag :type="getInstanceStatusType(row.status)">
                  {{ getInstanceStatusText(row.status) }}
                  <span v-if="false">
                  {{ row.status === 1 ? '执行成功' : '执行失败' }}
                  </span>
                </el-tag>
              </template>

              <template #operation="{ row }">
                <el-button
                  type="success"
                  size="small"
                  link
                  :loading="isInstanceRunning(row.pageInstanceId)"
                  :disabled="isInstanceRunning(row.pageInstanceId)"
                  @click.stop="handleRunInstance(row)"
                >
                  <el-icon><VideoPlay /></el-icon>
                  <span>运行</span>
                </el-button>
                <el-dropdown trigger="click" @command="command => handleInstanceMoreCommand(command, row)">
                  <el-button type="primary" size="small" link @click.stop>
                    <span>更多</span>
                    <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">
                  <el-icon><Edit /></el-icon>
                  <span>编辑</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="copy">
                  <el-icon><Plus /></el-icon>
                  <span>复制</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="delete">
                  <el-icon><Delete /></el-icon>
                  <span>删除</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </common-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <common-dialog
      v-model="instanceDialogVisible"
      :title="instanceDialogTitle"
      :form-data="instanceForm"
      :rules="instanceRules"
      :loading="submitLoading"
      width="960px"
      @confirm="handleSubmitInstance"
    >
      <el-form-item label="实例名称" prop="instanceName">
        <el-input v-model="instanceForm.instanceName" placeholder="请输入实例名称" />
      </el-form-item>
      <el-form-item label="Token" prop="tokenId">
        <el-select v-model="instanceForm.tokenId" placeholder="请选择Token" style="width: 100%" clearable>
          <el-option
            v-for="item in pageTokenOptions"
            :key="item.tokenId"
            :label="buildTokenLabel(item)"
            :value="item.tokenId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="操作JSON" prop="operationJson">
        <div class="operation-json-editor">
          <div v-if="operationJsonItems.length" class="operation-list">
            <div
              v-for="item in operationJsonItems"
              :key="item.key"
              :class="['operation-item', { 'operation-item-deleted': item.deleted }]"
            >
              <div class="operation-meta">
                <el-tag size="small" effect="plain">#{{ item.elementId }}</el-tag>
                <input
                  v-if="item.nameEditable"
                  :value="getOperationDisplayName(item)"
                  class="operation-name operation-name-input"
                  @input="updateOperationName(item, $event.target.value)"
                />
                <span v-else class="operation-name">{{ item.elementName }}</span>
                <el-tag size="small" type="info" effect="plain">{{ item.elementTypeLabel }}</el-tag>
                <el-tag size="small" type="success" effect="plain">{{ item.operationLabel }}</el-tag>
                <el-tooltip content="步骤后截图" placement="top">
                  <el-button
                    :type="item.screenAfter ? 'primary' : 'default'"
                    size="small"
                    circle
                    @click="toggleOperationScreenAfter(item)"
                  >
                    <el-icon><Camera /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip
                  v-if="item.valueMode === 'textarea'"
                  content="值追加执行次数+1"
                  placement="top"
                >
                  <el-button
                    :type="item.execCountSuffix ? 'warning' : 'default'"
                    size="small"
                    circle
                    @click="toggleExecCountSuffix(item)"
                  >
                    +1
                  </el-button>
                </el-tooltip>
                <el-tooltip content="复制步骤" placement="top">
                  <el-button
                    type="success"
                    size="small"
                    circle
                    @click="copyOperationItem(item)"
                  >
                    x{{ item.repeatCount || 1 }}
                  </el-button>
                </el-tooltip>
                <el-tooltip v-if="!item.deleted" content="删除操作" placement="top">
                  <el-button
                    type="danger"
                    size="small"
                    circle
                    @click="removeOperationItem(item)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-button
                  v-else
                  type="primary"
                  size="small"
                  link
                  @click="restoreOperationItem(item)"
                >
                  恢复
                </el-button>
              </div>

              <input
                v-if="item.valueMode === 'array'"
                :value="formatArrayValue(item.value)"
                placeholder="请输入下拉值，多个值用逗号分隔"
                class="operation-control operation-array-input"
                @input="updateArrayValue(item, $event.target.value)"
              />
              <el-input
                v-else-if="item.valueMode === 'textarea'"
                v-model="item.value"
                type="textarea"
                :rows="3"
                placeholder="请输入参数值"
                class="operation-control"
                @input="syncOperationJsonFromItems"
              />
              <div v-if="item.valueMode === 'textarea'" class="operation-text-length">
                总长度：{{ getTextLength(item.value) }}
              </div>

              <el-input
                v-else-if="item.valueMode === 'path'"
                v-model="item.value"
                placeholder="请输入上传文件路径"
                class="operation-control"
                @input="syncOperationJsonFromItems"
              />

              <el-input-number
                v-else-if="item.valueMode === 'number'"
                v-model="item.nthValue"
                :min="0"
                controls-position="right"
                class="operation-control"
                @change="syncOperationJsonFromItems"
              />

            </div>
          </div>
          <el-empty v-else description="暂无元素模板" />
          <el-input
            v-model="instanceForm.operationJson"
            type="textarea"
            :rows="5"
            class="operation-json-raw"
            placeholder="操作JSON预览"
            @input="syncOperationItemsFromJson"
          />
        </div>
      </el-form-item>
      <el-form-item label="预期结果" prop="expectResult">
        <el-input v-model="instanceForm.expectResult" type="textarea" :rows="3" placeholder="请输入预期结果" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="instanceForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="instanceForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-show="false" v-model="instanceForm.status">
          <el-radio :label="1">执行成功</el-radio>
          <el-radio :label="0">执行失败</el-radio>
        </el-radio-group>
      </el-form-item>
    </common-dialog>

    <common-dialog
      v-model="elementDialogVisible"
      :title="elementDialogTitle"
      :form-data="elementForm"
      :rules="elementRules"
      :loading="elementSubmitLoading"
      width="860px"
      @confirm="handleSubmitElement"
    >
      <el-form-item label="元素名称" prop="elementName">
        <el-input v-model="elementForm.elementName" placeholder="请输入元素名称" clearable />
      </el-form-item>
      <el-form-item label="定位器类型" prop="locatorType">
        <el-select v-model="elementForm.locatorType" placeholder="请选择定位器类型" style="width: 100%">
          <el-option v-for="item in locatorTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="元素类型" prop="elementType">
        <el-select v-model="elementForm.elementType" placeholder="请选择元素类型" style="width: 100%">
          <el-option v-for="item in elementTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作" prop="operation">
        <el-select v-model="elementForm.operation" placeholder="请选择操作" style="width: 100%">
          <el-option v-for="item in operationOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="元素定位值" prop="elementValue">
        <el-input
          v-model="elementForm.elementValue"
          type="textarea"
          :rows="5"
          placeholder='例如 {"locatorType":5,"selector":"#submit","value":"#submit"}'
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="elementForm.remark"
          type="textarea"
          :rows="4"
          placeholder='可保存参数key，例如 {"paramKey":"username","defaultValue":"admin"}'
        />
      </el-form-item>
      <el-form-item label="默认值" prop="defaultValue">
        <el-input
          v-model="elementForm.defaultValue"
          type="textarea"
          :rows="3"
          placeholder="请输入默认值"
        />
      </el-form-item>
      <el-form-item label="父元素" prop="parentElement">
        <el-input
          v-model="elementForm.parentElement"
          type="textarea"
          :rows="4"
          placeholder='例如 {"parents":[],"nth":0}'
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="elementForm.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </common-dialog>

    <common-dialog
      v-model="generateDialogVisible"
      title="自动生成页面用例"
      :form-data="generateForm"
      :loading="generateSaving"
      width="900px"
      @confirm="handleSaveGeneratedCases"
    >
      <el-form-item label="识别类型">
        <el-select
          v-model="generateForm.operationType"
          clearable
          placeholder="自动识别"
          style="width: 180px"
          @change="clearGeneratePreview"
        >
          <el-option v-for="item in operationTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-checkbox v-model="generateForm.overwrite" class="generate-overwrite">覆盖同名用例</el-checkbox>
        <el-button type="primary" :loading="generateLoading" @click="handlePreviewGeneratedCases">
          预览生成
        </el-button>
      </el-form-item>
      <el-form-item label="元素名称">
        <el-select
          v-model="generateForm.templateIds"
          multiple
          collapse-tags
          collapse-tags-tooltip
          filterable
          clearable
          placeholder="默认全部元素"
          style="width: 100%"
          @change="clearGeneratePreview"
        >
          <el-option
            v-for="item in generateElementOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <span>{{ item.label }}</span>
            <span class="generate-option-extra">{{ item.typeLabel }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="异常类型">
        <el-select
          v-model="generateForm.exceptionIds"
          multiple
          collapse-tags
          collapse-tags-tooltip
          filterable
          clearable
          placeholder="默认按识别类型匹配"
          style="width: 100%"
          @change="clearGeneratePreview"
        >
          <el-option
            v-for="item in exceptionCaseOptions"
            :key="item.exceptionId"
            :label="buildExceptionLabel(item)"
            :value="item.exceptionId"
          />
        </el-select>
      </el-form-item>
      <el-alert
        v-if="generatePreview"
        :title="`识别结果：${generatePreview.operationTypeName}，共 ${generatePreview.total} 条，已存在 ${generatePreview.existsCount} 条`"
        type="info"
        show-icon
        :closable="false"
      />
      <el-table :data="generatePreviewItems" border stripe max-height="420" class="generate-preview-table">
        <el-table-column prop="caseName" label="用例名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="targetId" label="页面ID" width="80" />
        <el-table-column prop="templateId" label="元素ID" width="80" />
        <el-table-column prop="templateName" label="元素" min-width="130" show-overflow-tooltip />
        <el-table-column prop="exceptionId" label="异常ID" width="80" />
        <el-table-column prop="exceptionName" label="异常类型" min-width="150" show-overflow-tooltip />
        <el-table-column prop="operationTypeName" label="操作类型" width="100" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.exists ? 'warning' : 'success'">{{ row.exists ? '已存在' : '新增' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作JSON" min-width="220">
          <template #default="{ row }">
            <pre class="json-mini">{{ formatJson(row.payload) }}</pre>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row, $index }">
            <el-button type="primary" size="small" link @click="handleEditGeneratedCase(row, $index)">编辑</el-button>
            <el-button type="danger" size="small" link @click="handleDeleteGeneratedCase($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </common-dialog>

    <common-dialog
      v-model="generatedCaseDialogVisible"
      :title="generatedCaseDialogTitle"
      :form-data="generatedCaseForm"
      :rules="generatedCaseRules"
      width="760px"
      @confirm="handleGeneratedCaseSubmit"
    >
      <el-form-item label="用例名称" prop="caseName">
        <el-input v-model="generatedCaseForm.caseName" maxlength="50" show-word-limit placeholder="请输入用例名称" />
      </el-form-item>
      <el-form-item label="元素名称" prop="templateName">
        <el-input v-model="generatedCaseForm.templateName" placeholder="请输入元素名称" />
      </el-form-item>
      <el-form-item label="异常类型" prop="exceptionName">
        <el-input v-model="generatedCaseForm.exceptionName" placeholder="请输入异常类型名称" />
      </el-form-item>
      <el-form-item label="操作类型" prop="operationType">
        <el-select v-model="generatedCaseForm.operationType" placeholder="请选择操作类型" style="width: 100%" @change="handleGeneratedCaseOperationChange">
          <el-option v-for="item in operationTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作JSON" prop="payloadText">
        <el-input v-model="generatedCaseForm.payloadText" type="textarea" :rows="10" placeholder="请输入操作JSON" />
      </el-form-item>
    </common-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown, Back, Camera, Delete, Edit, Plus, Search, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonDialog from '@/components/CommonDialog.vue'
import CommonTable from '@/components/CommonTable.vue'
import { getPageFunctionDetail } from '@/api/page/page-function'
import {
  addPageTestCase,
  batchDeletePageTestCase,
  batchExecutePageTestCase,
  deletePageTestCase,
  executePageTestCase,
  getPageTestCaseList,
  updatePageTestCase
} from '@/api/page/page-testcase'
import {
  addPageTemplate,
  deletePageTemplate,
  getPageTemplateByPage,
  updatePageTemplate
} from '@/api/page/page-template'
import { getLatestPageResultByInstance } from '@/api/page/page-result'
import * as apiInfoApi from '@/api/api/api'
import * as apiTestcaseApi from '@/api/api/api-testcase'
import * as apiResultApi from '@/api/api/api-result'
import * as caseGenerateApi from '@/api/case-generate'
import * as exceptionCaseTypeApi from '@/api/system/exception-case-type'
import { handleApiResponse } from '@/utils/responseHandler'
import { normalizeJsonObject } from '@/utils/json'

const route = useRoute()
const router = useRouter()
const pageId = Number(route.params.pageId)
const instanceTableRef = ref(null)
const selectedRows = ref([])
const selectedInstance = ref(null)
const latestResult = ref(null)
const elementTemplates = ref([])
const elementLoading = ref(false)
const elementSubmitLoading = ref(false)
const runningInstanceIds = ref([])
const batchRunning = ref(false)
const leftActiveTab = ref('elements')
const rightActiveTab = ref('instances')
const submitLoading = ref(false)
const generateDialogVisible = ref(false)
const generateLoading = ref(false)
const generateSaving = ref(false)
const generatePreview = ref(null)
const generatePreviewItems = ref([])
const exceptionCaseOptions = ref([])
const generatedCaseDialogVisible = ref(false)
const generatedCaseDialogTitle = ref('')
const generatedCaseEditIndex = ref(-1)
const instanceDialogVisible = ref(false)
const instanceDialogTitle = ref('')
const instanceMode = ref('add')
const elementDialogVisible = ref(false)
const elementDialogTitle = ref('')
const elementMode = ref('add')
const operationJsonItems = ref([])
const apiDropdown = reactive({
  apiId: null,
  instanceId: null,
  params: '',
  queryKey: '',
  queryResult: '',
  result: null,
  running: false,
  apiOptions: [],
  caseOptions: []
})
const generateForm = reactive({
  operationType: null,
  templateIds: [],
  exceptionIds: [],
  overwrite: false
})

const generatedCaseForm = reactive({
  caseName: '',
  targetId: null,
  templateId: null,
  templateName: '',
  exceptionId: null,
  exceptionName: '',
  operationType: null,
  operationTypeName: '',
  payloadText: '',
  exists: false
})

const pageInfo = reactive({
  pageId,
  pageName: route.query.pageName || '',
  pageUrl: route.query.pageUrl || '',
  tokenId: null,
  tokenIds: [],
  tokenNames: []
})
const pageTokenOptions = ref([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const instanceForm = reactive({
  pageInstanceId: null,
  pageId,
  tokenId: null,
  instanceName: '',
  operationJson: '',
  expectResult: '',
  description: '',
  remark: '',
  status: 0
})

const instanceRules = {
  instanceName: [{ required: true, message: '请输入实例名称', trigger: 'blur' }],
  operationJson: [{ required: true, message: '请输入操作JSON', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const generatedCaseRules = {
  caseName: [{ required: true, message: '请输入用例名称', trigger: 'blur' }],
  payloadText: [{ required: true, message: '请输入操作JSON', trigger: 'blur' }]
}

const elementForm = reactive({
  elementId: null,
  elementName: '',
  pageId,
  locatorType: 5,
  elementValue: '',
  defaultValue: '',
  parentElement: '',
  elementType: 1,
  operation: 1,
  remark: '',
  status: 1
})

const elementRules = {
  elementName: [{ required: true, message: '请输入元素名称', trigger: 'blur' }],
  locatorType: [{ required: true, message: '请选择定位器类型', trigger: 'change' }],
  elementValue: [{ required: true, message: '请输入元素定位值', trigger: 'blur' }],
  elementType: [{ required: true, message: '请选择元素类型', trigger: 'change' }],
  operation: [{ required: true, message: '请选择操作', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const instanceColumns = [
  { prop: 'instanceName', label: '实例名称', minWidth: 150 },
  { prop: 'expectResult', label: '预期结果', minWidth: 150 },
  { prop: 'description', label: '描述', minWidth: 180 },
  { prop: 'remark', label: '备注', minWidth: 160 },
  { prop: 'execCount', label: '执行次数', width: 100 },
  { prop: 'status', label: '状态', width: 90, slot: 'status' }
]

const getInstanceStatusType = (status) => {
  const map = { 0: 'info', 1: 'success', 2: 'danger' }
  return map[Number(status)] || 'info'
}

const getInstanceStatusText = (status) => {
  const map = { 0: '未执行', 1: '执行成功', 2: '执行失败' }
  return map[Number(status)] || '未知'
}

const locatorTypeOptions = [
  { label: 'role', value: 1 },
  { label: 'placeholder', value: 2 },
  { label: 'text', value: 3 },
  { label: 'listitem_text', value: 4 },
  { label: 'CSS', value: 5 },
  { label: 'label', value: 6 }
]

const elementTypeOptions = [
  { label: '文本框', value: 1 },
  { label: '下拉框', value: 2 },
  { label: '按钮', value: 3 },
  { label: '文本/选项', value: 4 }
]

const operationOptions = [
  { label: '点击', value: 1 },
  { label: '填写', value: 2 },
  { label: '选择', value: 3 },
  { label: '上传文件', value: 4 }
]

const operationTypeOptions = [
  { label: '添加', value: 1 },
  { label: '编辑', value: 2 },
  { label: '删除', value: 3 },
  { label: '登录', value: 4 },
  { label: '搜索', value: 5 }
]

const elementColumns = [
  { prop: 'elementId', label: '序号', width: 90 },
  { prop: 'elementName', label: '元素名称', minWidth: 120 },
  { prop: 'locatorType', label: '定位器', width: 120, slot: 'locatorType' },
  { prop: 'elementType', label: '元素类型', width: 110, slot: 'elementType' },
  { prop: 'elementValue', label: '定位值', minWidth: 220, showOverflowTooltip: true },
  { prop: 'defaultValue', label: '默认值', minWidth: 140, showOverflowTooltip: true },
  { prop: 'parentElement', label: '父元素', minWidth: 180, showOverflowTooltip: true },
  { prop: 'remark', label: '备注', minWidth: 160, showOverflowTooltip: true }
]

const getOptionLabel = (options, value) => {
  return options.find(item => item.value === value)?.label || value || '-'
}

const getOperationTypeName = (value) => {
  const numberValue = Number(value)
  if (numberValue === 0) return '通用'
  return operationTypeOptions.find(item => item.value === numberValue)?.label || '未知'
}

const screenshotList = computed(() => latestResult.value?.screenshotPath || [])
const screenshotUrls = computed(() => screenshotList.value.map(buildScreenshotUrl))
const selectedOperationJson = computed(() => {
  return selectedInstance.value?.operationJson ?? selectedInstance.value?.operation_json ?? ''
})

const buildTokenLabel = (token) => {
  const fileName = token.token ? ` / ${token.token}` : ''
  return `${token.name || token.tokenName || token.tokenId}${fileName}`
}

const getDefaultTokenId = () => pageTokenOptions.value[0]?.tokenId || null

const normalizeInstanceTokenId = (row = {}) => row.tokenId || getDefaultTokenId()

const isInstanceRunning = (id) => runningInstanceIds.value.includes(id)

const setInstanceRunning = (id, running) => {
  runningInstanceIds.value = running
    ? [...new Set([...runningInstanceIds.value, id])]
    : runningInstanceIds.value.filter(item => item !== id)
}

const formatInstanceJson = (jsonValue) => {
  if (!jsonValue) return ''
  try {
    const parsed = typeof jsonValue === 'string' ? JSON.parse(jsonValue) : jsonValue
    return JSON.stringify(parsed, null, 2)
  } catch (error) {
    return jsonValue
  }
}

const getCodeType = (code) => {
  if (!code) return 'info'
  const codeNumber = Number(code)
  if (codeNumber >= 200 && codeNumber < 300) return 'success'
  if (codeNumber >= 400 && codeNumber < 500) return 'warning'
  if (codeNumber >= 500) return 'danger'
  return 'info'
}

const findAllValuesByKey = (obj, key) => {
  const results = []
  if (!key) return results
  if (key.includes('.')) {
    let current = obj
    let matched = true
    key.split('.').forEach(part => {
      if (!matched) return
      if (current && typeof current === 'object' && Object.prototype.hasOwnProperty.call(current, part)) {
        current = current[part]
      } else {
        matched = false
      }
    })
    if (matched && current !== undefined) {
      results.push(current)
    }
    return results
  }

  const walk = (node) => {
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    if (!node || typeof node !== 'object') return
    Object.keys(node).forEach(itemKey => {
      if (itemKey === key) {
        results.push(node[itemKey])
      }
      walk(node[itemKey])
    })
  }
  walk(obj)
  return results
}

const stringifyParamValue = (value) => {
  if (value === null) return 'null'
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch (error) {
      return String(value)
    }
  }
  return String(value)
}

const pickResponseList = (data) => {
  if (Array.isArray(data)) return data
  return data?.list || data?.records || data?.items || []
}

const loadApiDropdownApis = async () => {
  try {
    const res = await apiInfoApi.getApiOptions()
    if (res.success) {
      apiDropdown.apiOptions = pickResponseList(res.data)
    }
  } catch (error) {
    console.error('加载API列表失败:', error)
    ElMessage.error('加载API列表失败')
  }
}

const loadApiDropdownCases = async (apiId) => {
  apiDropdown.caseOptions = []
  if (!apiId) return
  try {
    const res = await apiTestcaseApi.getTestcaseList({ apiId, pageNum: 1, pageSize: 100 })
    if (res.success) {
      apiDropdown.caseOptions = pickResponseList(res.data)
    }
  } catch (error) {
    console.error('加载用例列表失败:', error)
    ElMessage.error('加载用例列表失败')
  }
}

const handleApiDropdownApiChange = async () => {
  apiDropdown.instanceId = null
  apiDropdown.params = ''
  apiDropdown.queryKey = ''
  apiDropdown.queryResult = ''
  apiDropdown.result = null
  await loadApiDropdownCases(apiDropdown.apiId)
}

const handleApiDropdownCaseChange = () => {
  const selectedCase = apiDropdown.caseOptions.find(item => item.instanceId === apiDropdown.instanceId)
  apiDropdown.params = selectedCase ? formatInstanceJson(selectedCase.instanceJson) : ''
  apiDropdown.queryResult = ''
  apiDropdown.result = null
}

const handleRunApiDropdown = async () => {
  if (!apiDropdown.instanceId) {
    ElMessage.warning('请先选择用例')
    return
  }
  apiDropdown.running = true
  try {
    if (apiDropdown.params) {
      await apiTestcaseApi.updateTestcase({
        instanceId: apiDropdown.instanceId,
        instanceJson: apiDropdown.params
      })
    }
    await apiResultApi.executeApi(apiDropdown.instanceId)
    const res = await apiResultApi.getLatestResultByInstanceId(apiDropdown.instanceId)
    if (handleApiResponse(res, '运行成功', '运行失败')) {
      apiDropdown.result = res.data || null
      apiDropdown.queryResult = ''
    }
  } catch (error) {
    console.error('运行API用例失败:', error)
    ElMessage.error('运行API用例失败')
  } finally {
    apiDropdown.running = false
  }
}

const handleQueryApiDropdownParam = () => {
  const input = (apiDropdown.queryKey || '').trim()
  if (!input) {
    ElMessage.warning('请输入要搜索的参数')
    return
  }
  const responseInfo = apiDropdown.result?.responseInfo
  if (!responseInfo) {
    ElMessage.warning('请先运行用例获取响应信息')
    return
  }
  let data
  try {
    data = typeof responseInfo === 'string' ? JSON.parse(responseInfo) : responseInfo
  } catch (error) {
    ElMessage.error('响应信息不是有效JSON，无法搜索')
    return
  }
  const keys = input.split(/[、,，]/).map(item => item.trim()).filter(Boolean)
  const lines = []
  let found = false
  keys.forEach(key => {
    const values = findAllValuesByKey(data, key)
    if (!values.length) {
      lines.push(`${key}:未找到`)
      return
    }
    found = true
    values.forEach(value => {
      lines.push(`${key}:${stringifyParamValue(value)}`)
    })
  })
  apiDropdown.queryResult = lines.join('\n')
  if (!found) {
    ElMessage.warning('未在响应中找到对应参数')
  }
}

const getInstanceList = (params) => {
  return getPageTestCaseList({
    ...params,
    pageId
  })
}

const parseRemark = (value) => {
  if (!value) return null
  try {
    return typeof value === 'string' ? JSON.parse(value) : value
  } catch (error) {
    return null
  }
}

const hasNthRemark = (remark) => {
  if (Array.isArray(remark)) {
    return remark.some(item => item && Object.prototype.hasOwnProperty.call(item, 'nth'))
  }
  return !!remark && typeof remark === 'object' && Object.prototype.hasOwnProperty.call(remark, 'nth')
}

const getTemplateParentElement = (item) => {
  return item.parentElement || item.parent_element || ''
}

const getTemplateParentMeta = (item) => {
  const parentElement = getTemplateParentElement(item)
  if (!parentElement) {
    return null
  }
  try {
    return typeof parentElement === 'string' ? JSON.parse(parentElement) : parentElement
  } catch (error) {
    return null
  }
}

const hasTemplateNth = (item, remark) => {
  const parentMeta = getTemplateParentMeta(item)
  if (parentMeta && typeof parentMeta === 'object' && Object.prototype.hasOwnProperty.call(parentMeta, 'nth')) {
    return true
  }
  return hasNthRemark(remark)
}

const getTemplateNthValue = (item, remark) => {
  const parentMeta = getTemplateParentMeta(item)
  if (parentMeta && typeof parentMeta === 'object' && Object.prototype.hasOwnProperty.call(parentMeta, 'nth')) {
    return parentMeta.nth
  }
  return getNthRemarkValue(remark)
}

const getNthRemarkValue = (remark) => {
  if (Array.isArray(remark)) {
    const item = remark.find(row => row && Object.prototype.hasOwnProperty.call(row, 'nth'))
    return item ? item.nth : ''
  }
  if (remark && typeof remark === 'object' && Object.prototype.hasOwnProperty.call(remark, 'nth')) {
    return remark.nth
  }
  return ''
}

const getTemplateId = (item) => item.elementId || item.element_id

const getTemplateName = (item) => item.elementName || item.element_name || `element_${getTemplateId(item) || ''}`

const getTemplateOperation = (item) => Number(item.operation || 0)

const getTemplateElementType = (item) => Number(item.elementType || item.element_type || 0)

const getTemplateLocatorType = (item) => Number(item.locatorType || item.locator_type || 0)

const getTemplateElementValue = (item) => item.elementValue || item.element_value || ''

const isButtonTemplate = (item) => {
  return String(getTemplateElementValue(item)).toLowerCase().includes('button')
}

const getTemplateDefaultValue = (item) => {
  const defaultValue = item.defaultValue ?? item.default_value
  if (defaultValue !== undefined && defaultValue !== null && defaultValue !== '') {
    return defaultValue
  }
  const remark = parseRemark(item.remark)
  if (remark && typeof remark === 'object' && !Array.isArray(remark)) {
    return remark.defaultValue ?? ''
  }
  return ''
}

const isEditableOperation = (item) => {
  return [1, 2, 3, 4].includes(getTemplateOperation(item))
}

const generateElementOptions = computed(() => {
  return (elementTemplates.value || [])
    .filter(item => getTemplateId(item) && isEditableOperation(item))
    .map(item => ({
      label: `${getTemplateName(item)}#${getTemplateId(item)}`,
      value: getTemplateId(item),
      typeLabel: getOptionLabel(elementTypeOptions, getTemplateElementType(item))
    }))
})

const isSelectOptionTemplate = (item) => {
  const operation = getTemplateOperation(item)
  return operation === 1 && !isButtonTemplate(item) && getTemplateLocatorType(item) === 4
}

const buildOperationItemKey = (item) => {
  const elementId = getTemplateId(item)
  return `${getTemplateName(item)}#${elementId || ''}`
}

const uniqueValues = (values) => {
  const result = []
  const seen = new Set()
  ;(Array.isArray(values) ? values : []).forEach(value => {
    if (value === null || value === undefined) return
    const text = String(value).trim()
    if (!text || seen.has(text)) return
    seen.add(text)
    result.push(value)
  })
  return result
}

const hasOwnValue = (source, key) => {
  return !!key && Object.prototype.hasOwnProperty.call(source, key)
}

const normalizeArraySourceValue = (value, fallbackValues = []) => {
  if (Array.isArray(value)) {
    return uniqueValues(value)
  }
  if (value !== null && value !== undefined && String(value).trim() !== '') {
    return uniqueValues([value])
  }
  return uniqueValues(fallbackValues)
}

const formatArrayValue = (value) => {
  return (Array.isArray(value) ? value : [value].filter(Boolean)).join('，')
}

const parseArrayValue = (value) => {
  return uniqueValues(String(value || '')
    .split(/\r?\n|,|，/)
    .map(item => item.trim())
    .filter(Boolean))
}

const updateArrayValue = (item, value) => {
  item.value = parseArrayValue(value)
  syncOperationJsonFromItems()
}

const getOperationDisplayName = (item) => {
  const value = item.value === null || item.value === undefined ? '' : String(item.value)
  return value || item.elementName || ''
}

const updateOperationName = (item, value) => {
  const text = String(value || '').trim()
  item.value = text && text !== item.elementName ? text : ''
  syncOperationJsonFromItems()
}

const getTextLength = (value) => {
  if (value === null || value === undefined) return 0
  return String(value).length
}

const buildOperationJsonFromItems = () => {
  const result = {}
  const screenAfter = []
  const skipElements = []
  const valueMarks = {}
  const repeatElements = {}
  const nthElements = {}
  operationJsonItems.value.forEach(item => {
    if (item.deleted) {
      skipElements.push(...item.elementIds)
      return
    }
    if (item.screenAfter) {
      screenAfter.push(...item.elementIds)
    }
    const hasCustomEditableName = item.nameEditable &&
      item.value !== null &&
      item.value !== undefined &&
      String(item.value).trim() !== ''
    const shouldWriteValue = item.paramKey && (item.valueMode !== 'none' || hasCustomEditableName) && (
      item.valueMode !== 'text' || hasCustomEditableName
    )
    if (shouldWriteValue) {
      result[item.paramKey] = Array.isArray(item.value)
        ? uniqueValues(item.value)
        : item.value
      if (item.execCountSuffix) {
        valueMarks[item.paramKey] = 'execCountSuffix'
      }
    }
    if ((item.repeatCount || 1) > 1) {
      item.elementIds.forEach(elementId => {
        repeatElements[String(elementId)] = item.repeatCount
      })
    }
    if (item.nthValue !== null && item.nthValue !== undefined && String(item.nthValue).trim() !== '') {
      item.elementIds.forEach(elementId => {
        nthElements[String(elementId)] = Number(item.nthValue)
      })
    }
  })
  if (screenAfter.length) {
    result.screenAfter = screenAfter.map(value => {
      const numberValue = Number(value)
      return Number.isNaN(numberValue) ? value : numberValue
    })
  }
  if (skipElements.length) {
    result.skipElements = skipElements.map(value => {
      const numberValue = Number(value)
      return Number.isNaN(numberValue) ? value : numberValue
    })
  }
  if (Object.keys(valueMarks).length) {
    result.valueMarks = valueMarks
  }
  if (Object.keys(repeatElements).length) {
    result.repeatElements = repeatElements
  }
  if (Object.keys(nthElements).length) {
    result.nthElements = nthElements
  }
  return JSON.stringify(result, null, 2)
}

const syncOperationJsonFromItems = () => {
  instanceForm.operationJson = buildOperationJsonFromItems()
}

const syncOperationItemsFromJson = () => {
  let parsed = {}
  try {
    parsed = JSON.parse(instanceForm.operationJson || '{}')
  } catch (error) {
    return
  }
  operationJsonItems.value.forEach(item => {
    const screenAfter = new Set((parsed.screenAfter || []).map(value => String(value)))
    const skipElements = new Set((parsed.skipElements || []).map(value => String(value)))
    const valueMarks = parsed.valueMarks || {}
    const repeatElements = parsed.repeatElements || {}
    const nthElements = parsed.nthElements || {}
    item.screenAfter = item.elementIds.some(elementId => screenAfter.has(String(elementId)))
    item.deleted = item.elementIds.every(elementId => skipElements.has(String(elementId)))
    item.execCountSuffix = item.paramKey ? valueMarks[item.paramKey] === 'execCountSuffix' : false
    item.repeatCount = Number(item.elementIds.map(elementId => repeatElements[String(elementId)]).find(Boolean) || 1)
    item.nthValue = item.elementIds.map(elementId => nthElements[String(elementId)]).find(value => value !== undefined)
    if (item.nthValue === undefined) {
      item.nthValue = item.defaultNthValue
    }
    if (item.paramKey && Object.prototype.hasOwnProperty.call(parsed, item.paramKey)) {
      item.value = item.valueMode === 'array'
        ? uniqueValues(Array.isArray(parsed[item.paramKey]) ? parsed[item.paramKey] : [parsed[item.paramKey]].filter(Boolean))
        : parsed[item.paramKey]
    }
  })
}

const toggleOperationScreenAfter = (item) => {
  item.screenAfter = !item.screenAfter
  syncOperationJsonFromItems()
}

const toggleExecCountSuffix = (item) => {
  item.execCountSuffix = !item.execCountSuffix
  syncOperationJsonFromItems()
}

const removeOperationItem = (item) => {
  item.deleted = true
  syncOperationJsonFromItems()
}

const restoreOperationItem = (item) => {
  item.deleted = false
  syncOperationJsonFromItems()
}

const copyOperationItem = (item) => {
  item.repeatCount = (Number(item.repeatCount) || 1) + 1
  syncOperationJsonFromItems()
}

const buildOperationJsonItems = (sourceJson = '') => {
  let source = {}
  try {
    source = sourceJson ? JSON.parse(sourceJson) : {}
  } catch (error) {
    source = {}
  }

  const items = []
  const screenAfter = new Set((source.screenAfter || []).map(value => String(value)))
  const skipElements = new Set((source.skipElements || []).map(value => String(value)))
  const valueMarks = source.valueMarks || {}
  const repeatElements = source.repeatElements || {}
  const nthElements = source.nthElements || {}
  const editableTemplates = elementTemplates.value.filter(isEditableOperation)
  for (let index = 0; index < editableTemplates.length; index += 1) {
    const template = editableTemplates[index]
    const remark = parseRemark(template.remark)
    const elementId = getTemplateId(template)
    const elementName = getTemplateName(template)
    const operation = getTemplateOperation(template)
    const elementType = getTemplateElementType(template)
    const paramKey = buildOperationItemKey(template)

    if (isSelectOptionTemplate(template)) {
      const previous = items[items.length - 1]
      if (previous?.valueMode === 'array' && previous.groupOpen) {
        previous.options = uniqueValues([...previous.options, elementName])
        if (hasOwnValue(source, previous.paramKey)) {
          previous.value = normalizeArraySourceValue(source[previous.paramKey], previous.value)
        } else {
          previous.value = uniqueValues([...previous.value, elementName])
        }
        previous.elementIds.push(elementId)
        previous.screenAfter = previous.elementIds.some(id => screenAfter.has(String(id)))
        previous.deleted = previous.elementIds.every(id => skipElements.has(String(id)))
        previous.execCountSuffix = valueMarks[previous.paramKey] === 'execCountSuffix'
        previous.repeatCount = Number(previous.elementIds.map(id => repeatElements[String(id)]).find(Boolean) || 1)
      } else if (previous) {
        const rawValue = source[previous.paramKey]
        previous.elementTypeLabel = '下拉框'
        previous.operationLabel = '选择'
        previous.valueMode = 'array'
        previous.value = normalizeArraySourceValue(rawValue, [elementName])
        previous.options = uniqueValues([elementName])
        previous.elementIds = [...new Set([...previous.elementIds, elementId])]
        previous.groupOpen = true
        previous.screenAfter = previous.elementIds.some(id => screenAfter.has(String(id)))
        previous.deleted = previous.elementIds.every(id => skipElements.has(String(id)))
        previous.execCountSuffix = valueMarks[previous.paramKey] === 'execCountSuffix'
        previous.repeatCount = Number(previous.elementIds.map(id => repeatElements[String(id)]).find(Boolean) || 1)
      } else {
        const previousTemplate = editableTemplates[index - 1]
        const previousName = previousTemplate ? getTemplateName(previousTemplate) : elementName
        const previousId = previousTemplate ? getTemplateId(previousTemplate) : elementId
        const groupKey = `${previousName}#${previousId || elementId || ''}`
        const rawValue = source[groupKey]
        items.push({
          key: `select_group_${elementId}`,
          paramKey: groupKey,
          elementId: previousId || elementId,
          elementIds: [elementId],
          elementName: previousName,
          elementTypeLabel: '下拉框',
          operationLabel: '选择',
          valueMode: 'array',
          value: normalizeArraySourceValue(rawValue, [elementName]),
          options: uniqueValues([elementName]),
          screenAfter: screenAfter.has(String(elementId)),
          deleted: skipElements.has(String(elementId)),
          execCountSuffix: valueMarks[groupKey] === 'execCountSuffix',
          repeatCount: Number(repeatElements[String(elementId)] || 1),
          groupOpen: true
        })
      }
      continue
    }

    if (items.length) {
      items[items.length - 1].groupOpen = false
    }

    const rawValue = source[paramKey] ?? source[elementName] ?? source[String(elementId)]
    const hasNth = hasTemplateNth(template, remark)
    const nthValue = hasNth ? getTemplateNthValue(template, remark) : ''
    const legacyNthValue = hasNth && rawValue !== undefined && rawValue !== null && String(rawValue).trim() !== '' && !Number.isNaN(Number(rawValue))
    const buttonTemplate = isButtonTemplate(template)
    const nameEditable = operation === 1
    const valueMode = operation === 2
      ? 'textarea'
      : (operation === 4 ? 'path' : (hasNth ? 'number' : (buttonTemplate ? 'text' : 'none')))
    const defaultValue = operation === 4 ? getTemplateDefaultValue(template) : ''
    items.push({
      key: `template_${elementId}`,
      paramKey,
      elementId,
      elementIds: [elementId],
      elementName,
      elementTypeLabel: buttonTemplate ? '按钮' : getOptionLabel(elementTypeOptions, elementType),
      operationLabel: getOptionLabel(operationOptions, operation),
      valueMode,
      nameEditable,
      value: legacyNthValue ? defaultValue : (rawValue ?? defaultValue),
      nthValue: nthElements[String(elementId)] ?? (legacyNthValue ? Number(rawValue) : (hasNth ? nthValue : '')),
      defaultNthValue: hasNth ? nthValue : '',
      options: [],
      screenAfter: screenAfter.has(String(elementId)),
      deleted: skipElements.has(String(elementId)),
      execCountSuffix: valueMarks[paramKey] === 'execCountSuffix',
      repeatCount: Number(repeatElements[String(elementId)] || 1),
      groupOpen: false
    })
  }

  operationJsonItems.value = items
  syncOperationJsonFromItems()
}

const buildAutoOperationJson = () => {
  buildOperationJsonItems()
  return instanceForm.operationJson
}

const loadPageInfo = async () => {
  try {
    const res = await getPageFunctionDetail(pageId)
    if (res.success && res.data) {
      Object.assign(pageInfo, {
        pageId: res.data.pageId,
        pageName: res.data.pageName || pageInfo.pageName,
        pageUrl: res.data.pageUrl || pageInfo.pageUrl,
        tokenId: res.data.tokenId || null,
        tokenIds: Array.isArray(res.data.tokenIds) ? res.data.tokenIds : (res.data.tokenId ? [res.data.tokenId] : []),
        tokenNames: Array.isArray(res.data.tokenNames) ? res.data.tokenNames : []
      })
      pageTokenOptions.value = pageInfo.tokenIds.map((tokenId, index) => ({
        tokenId,
        name: pageInfo.tokenNames[index] || (index === 0 ? res.data.tokenName : `Token ${tokenId}`)
      }))
    }
  } catch (error) {
      console.error('加载页面功能详情失败:', error)
  }
}

const loadLatestResult = async () => {
  latestResult.value = null
  if (!selectedInstance.value?.pageInstanceId) {
    return
  }
  try {
    const res = await getLatestPageResultByInstance(selectedInstance.value.pageInstanceId)
    latestResult.value = res.success ? res.data : null
  } catch (error) {
    console.error('加载最新结果失败:', error)
  }
}

const loadElementTemplates = async () => {
  elementLoading.value = true
  try {
    const res = await getPageTemplateByPage(pageId)
    elementTemplates.value = res.success ? (res.data || []) : []
  } catch (error) {
    elementTemplates.value = []
    console.error('加载元素模板失败:', error)
  } finally {
    elementLoading.value = false
  }
}

const normalizeListData = (data) => {
  if (Array.isArray(data)) return data
  return data?.items || data?.list || data?.records || []
}

const loadAllPagedOptions = async (apiMethod, params = {}) => {
  const pageSize = 100
  let pageNum = 1
  const result = []
  while (true) {
    const res = await apiMethod({ ...params, pageNum, pageSize })
    const data = res.data || {}
    const rows = normalizeListData(data)
    result.push(...rows)
    const total = Number(data.total || result.length)
    if (result.length >= total || rows.length < pageSize) {
      break
    }
    pageNum += 1
  }
  return result
}

const loadExceptionCaseOptions = async () => {
  try {
    exceptionCaseOptions.value = await loadAllPagedOptions(exceptionCaseTypeApi.getExceptionCaseTypeList)
  } catch (error) {
    exceptionCaseOptions.value = []
    console.error('加载异常类型失败:', error)
  }
}

const clearGeneratePreview = () => {
  generatePreview.value = null
  generatePreviewItems.value = []
}

const buildExceptionLabel = (item = {}) => {
  const exceptionName = item.exceptionName || item.exception_name || item.exceptionId
  const operationType = item.operationType ?? item.operation_type ?? 0
  return `${exceptionName}（${getOperationTypeName(operationType)}）`
}

const buildGeneratePayload = () => ({
  targetId: pageId,
  operationType: generateForm.operationType,
  templateIds: generateForm.templateIds,
  exceptionIds: generateForm.exceptionIds,
  includeCommon: true,
  overwrite: generateForm.overwrite
})

const handleOpenGenerateDialog = async () => {
  generateDialogVisible.value = true
  clearGeneratePreview()
  generateForm.operationType = null
  generateForm.templateIds = []
  generateForm.exceptionIds = []
  generateForm.overwrite = false
  if (!elementTemplates.value.length) {
    await loadElementTemplates()
  }
  if (!exceptionCaseOptions.value.length) {
    await loadExceptionCaseOptions()
  }
}

const handlePreviewGeneratedCases = async () => {
  generateLoading.value = true
  try {
    const res = await caseGenerateApi.previewPageCases(buildGeneratePayload())
    if (handleApiResponse(res, '预览成功', '预览失败')) {
      generatePreview.value = res.data
      generatePreviewItems.value = res.data?.items || []
    }
  } finally {
    generateLoading.value = false
  }
}

const handleGeneratedCaseOperationChange = (value) => {
  generatedCaseForm.operationTypeName = getOperationTypeName(value)
}

const handleEditGeneratedCase = (row, index) => {
  generatedCaseEditIndex.value = index
  generatedCaseDialogTitle.value = '编辑预览用例'
  Object.assign(generatedCaseForm, {
    caseName: row.caseName || '',
    targetId: row.targetId || pageId,
    templateId: row.templateId || null,
    templateName: row.templateName || '',
    exceptionId: row.exceptionId || null,
    exceptionName: row.exceptionName || '',
    operationType: row.operationType || generatePreview.value?.operationType || 1,
    operationTypeName: row.operationTypeName || getOperationTypeName(row.operationType || 1),
    payloadText: formatJson(row.payload),
    exists: !!row.exists
  })
  generatedCaseDialogVisible.value = true
}

const handleDeleteGeneratedCase = (index) => {
  generatePreviewItems.value.splice(index, 1)
  refreshGeneratePreviewStats()
}

const refreshGeneratePreviewStats = () => {
  if (!generatePreview.value) {
    return
  }
  generatePreview.value.total = generatePreviewItems.value.length
  generatePreview.value.existsCount = generatePreviewItems.value.filter(item => item.exists).length
}

const handleGeneratedCaseSubmit = () => {
  let payload
  try {
    payload = JSON.parse(generatedCaseForm.payloadText)
  } catch (error) {
    ElMessage.error('操作JSON格式错误')
    return
  }
  const item = {
    caseName: generatedCaseForm.caseName,
    targetId: generatedCaseForm.targetId || pageId,
    templateId: generatedCaseForm.templateId || 0,
    templateName: generatedCaseForm.templateName || '-',
    exceptionId: generatedCaseForm.exceptionId || 0,
    exceptionName: generatedCaseForm.exceptionName || '-',
    operationType: generatedCaseForm.operationType || generatePreview.value?.operationType || 1,
    operationTypeName: generatedCaseForm.operationTypeName || getOperationTypeName(generatedCaseForm.operationType),
    payload,
    exists: generatedCaseForm.exists
  }
  if (generatedCaseEditIndex.value >= 0) {
    generatePreviewItems.value.splice(generatedCaseEditIndex.value, 1, item)
  } else {
    generatePreviewItems.value.push(item)
  }
  refreshGeneratePreviewStats()
  generatedCaseDialogVisible.value = false
}

const handleSaveGeneratedCases = async () => {
  if (!generatePreviewItems.value.length) {
    ElMessage.warning('请先预览生成用例')
    return
  }
  generateSaving.value = true
  try {
    const res = await caseGenerateApi.savePageCases({
      ...buildGeneratePayload(),
      items: generatePreviewItems.value
    })
    if (handleApiResponse(res, '保存成功', '保存失败')) {
      generateDialogVisible.value = false
      instanceTableRef.value?.refresh()
    }
  } finally {
    generateSaving.value = false
  }
}

const resetElementForm = () => {
  Object.assign(elementForm, {
    elementId: null,
    elementName: '',
    pageId,
    locatorType: 5,
    elementValue: '',
    defaultValue: '',
    parentElement: '',
    elementType: 1,
    operation: 1,
    remark: '',
    status: 0
  })
}

const fillElementForm = (row) => {
  Object.assign(elementForm, {
    elementId: row.elementId,
    elementName: row.elementName || '',
    pageId,
    locatorType: row.locatorType ?? 5,
    elementValue: row.elementValue || '',
    defaultValue: row.defaultValue || '',
    parentElement: row.parentElement || '',
    elementType: row.elementType ?? 1,
    operation: row.operation ?? 1,
    remark: row.remark || '',
    status: row.status ?? 0
  })
}

const buildElementPayload = () => ({
  elementName: elementForm.elementName,
  pageId,
  locatorType: elementForm.locatorType,
  elementValue: elementForm.elementValue,
  defaultValue: elementForm.defaultValue,
  parentElement: elementForm.parentElement,
  elementType: elementForm.elementType,
  operation: elementForm.operation,
  remark: elementForm.remark,
  status: elementForm.status
})

const handleAddElement = () => {
  elementMode.value = 'add'
  elementDialogTitle.value = '新增元素模板'
  resetElementForm()
  elementDialogVisible.value = true
}

const handleEditElement = (row) => {
  elementMode.value = 'edit'
  elementDialogTitle.value = '编辑元素模板'
  resetElementForm()
  fillElementForm(row)
  elementDialogVisible.value = true
}

const handleDeleteElement = (row) => {
  ElMessageBox.confirm(`确定要删除元素模板「${row.elementName}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deletePageTemplate(row.elementId)
    if (handleApiResponse(res, '删除成功', '删除失败')) {
      await loadElementTemplates()
    }
  }).catch(() => {})
}

const handleSubmitElement = async () => {
  elementSubmitLoading.value = true
  try {
    const res = elementMode.value === 'edit'
      ? await updatePageTemplate({ elementId: elementForm.elementId, ...buildElementPayload() })
      : await addPageTemplate(buildElementPayload())

    if (handleApiResponse(res, elementMode.value === 'edit' ? '编辑成功' : '新增成功', '提交失败')) {
      elementDialogVisible.value = false
      await loadElementTemplates()
    }
  } catch (error) {
    console.error('提交元素模板失败:', error)
  } finally {
    elementSubmitLoading.value = false
  }
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleViewInstance = (row) => {
  selectedInstance.value = {
    ...row,
    tokenId: normalizeInstanceTokenId(row)
  }
  leftActiveTab.value = 'paramsResult'
}

const handleSelectedTokenChange = (tokenId) => {
  if (selectedInstance.value) {
    selectedInstance.value.tokenId = tokenId || null
  }
}

const getRunTokenId = (row = {}) => {
  if (selectedInstance.value?.pageInstanceId === row.pageInstanceId) {
    return selectedInstance.value.tokenId || null
  }
  return normalizeInstanceTokenId(row)
}

const handleRunInstance = (row) => {
  if (isInstanceRunning(row.pageInstanceId) || batchRunning.value) {
    return
  }
  setInstanceRunning(row.pageInstanceId, true)
  const tokenId = getRunTokenId(row)
  executePageTestCase(pageId, row.pageInstanceId, tokenId)
    .then(async (res) => {
      if (handleApiResponse(res, '运行成功', '运行失败')) {
        selectedInstance.value = {
          ...row,
          tokenId
        }
        leftActiveTab.value = 'paramsResult'
        await loadLatestResult()
        instanceTableRef.value?.refresh()
      }
    })
    .finally(() => {
      setInstanceRunning(row.pageInstanceId, false)
    })
}

const handleBatchRun = () => {
  if (batchRunning.value || runningInstanceIds.value.length) {
    return
  }
  if (!selectedRows.value.length) {
    ElMessage.warning('请选择要运行的实例')
    return
  }
  batchRunning.value = true
  const ids = selectedRows.value.map(row => row.pageInstanceId)
  runningInstanceIds.value = ids
  ElMessageBox.confirm(`确定要运行选中的 ${selectedRows.value.length} 个实例吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      const res = await batchExecutePageTestCase(pageId, ids)
      if (handleApiResponse(res, '批量运行成功', '批量运行失败')) {
        instanceTableRef.value?.refresh()
        instanceTableRef.value?.clearSelection()
        selectedRows.value = []
        if (selectedInstance.value) {
          await loadLatestResult()
        }
      }
    } finally {
      batchRunning.value = false
      runningInstanceIds.value = []
    }
  }).catch(() => {
    batchRunning.value = false
    runningInstanceIds.value = []
  })
}

const resetInstanceForm = () => {
  Object.assign(instanceForm, {
    pageInstanceId: null,
    pageId,
    tokenId: getDefaultTokenId(),
    instanceName: '',
    operationJson: '',
    expectResult: '',
    description: '',
    remark: '',
    status: 0
  })
}

const handleAddInstance = async () => {
  instanceMode.value = 'add'
  instanceDialogTitle.value = '新增实例'
  resetInstanceForm()
  if (!elementTemplates.value.length) {
    await loadElementTemplates()
  }
  instanceForm.operationJson = buildAutoOperationJson()
  buildOperationJsonItems(instanceForm.operationJson)
  instanceDialogVisible.value = true
}

const handleEditInstance = (row) => {
  instanceMode.value = 'edit'
  instanceDialogTitle.value = '编辑实例'
  resetInstanceForm()
  Object.assign(instanceForm, {
    pageInstanceId: row.pageInstanceId,
    pageId,
    tokenId: normalizeInstanceTokenId(row),
    instanceName: row.instanceName || '',
    operationJson: row.operationJson ?? row.operation_json ?? '',
    expectResult: row.expectResult || '',
    description: row.description || '',
    remark: row.remark || '',
    status: 0
  })
  buildOperationJsonItems(instanceForm.operationJson)
  instanceDialogVisible.value = true
}

const handleInstanceMoreCommand = (command, row) => {
  const actions = {
    edit: handleEditInstance,
    copy: handleCopyInstance,
    delete: handleDeleteInstance
  }
  actions[command]?.(row)
}

const handleCopyInstance = (row) => {
  instanceMode.value = 'copy'
  instanceDialogTitle.value = '复制实例'
  resetInstanceForm()
  Object.assign(instanceForm, {
    pageInstanceId: null,
    pageId,
    tokenId: normalizeInstanceTokenId(row),
    instanceName: `${row.instanceName || ''}_复制`,
    operationJson: row.operationJson ?? row.operation_json ?? '',
    expectResult: row.expectResult || '',
    description: row.description || '',
    remark: row.remark || '',
    status: row.status ?? 1
  })
  buildOperationJsonItems(instanceForm.operationJson)
  instanceDialogVisible.value = true
}

const handleDeleteInstance = (row) => {
  ElMessageBox.confirm(`确定要删除实例「${row.instanceName}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deletePageTestCase(row.pageInstanceId)
    if (handleApiResponse(res, '删除成功', '删除失败')) {
      if (selectedInstance.value?.pageInstanceId === row.pageInstanceId) {
        selectedInstance.value = null
        latestResult.value = null
      }
      instanceTableRef.value?.refresh()
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请选择要删除的实例')
    return
  }
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个实例吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const ids = selectedRows.value.map(row => row.pageInstanceId)
    const res = await batchDeletePageTestCase(ids)
    if (handleApiResponse(res, '批量删除成功', '批量删除失败')) {
      if (selectedInstance.value && ids.includes(selectedInstance.value.pageInstanceId)) {
        selectedInstance.value = null
        latestResult.value = null
      }
      instanceTableRef.value?.refresh()
      instanceTableRef.value?.clearSelection()
      selectedRows.value = []
    }
  }).catch(() => {})
}

const handleSubmitInstance = async () => {
  submitLoading.value = true
  try {
    const payload = {
      pageId,
      tokenId: instanceForm.tokenId,
      instanceName: instanceForm.instanceName,
      operationJson: normalizeJsonObject(instanceForm.operationJson),
      expectResult: instanceForm.expectResult,
      description: instanceForm.description,
      remark: instanceForm.remark
    }
    const isEdit = instanceMode.value === 'edit'
    const res = isEdit
      ? await updatePageTestCase({ ...payload, pageInstanceId: instanceForm.pageInstanceId })
      : await addPageTestCase(payload)

    const successMessage = isEdit ? '编辑成功' : (instanceMode.value === 'copy' ? '复制成功' : '新增成功')
    if (handleApiResponse(res, successMessage, '提交失败')) {
      instanceDialogVisible.value = false
      instanceTableRef.value?.refresh()
    }
  } catch (error) {
    console.error('提交实例失败:', error)
    ElMessage.error(error.message || '提交实例失败')
  } finally {
    submitLoading.value = false
  }
}

const formatJson = (value) => {
  if (!value) return ''
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    return JSON.stringify(parsed, null, 2)
  } catch (error) {
    return value
  }
}

function buildScreenshotUrl(name) {
  const base = import.meta.env.VITE_API_BASE_URL || '/api'
  return `${base}/static/screenshots/${encodeURIComponent(name)}`
}

watch(selectedInstance, () => {
  loadLatestResult()
})

watch(leftActiveTab, (tabName) => {
  if (tabName === 'elements') {
    loadElementTemplates()
  }
  if (tabName === 'apiDropdown' && !apiDropdown.apiOptions.length) {
    loadApiDropdownApis()
  }
})

onMounted(async () => {
  await loadPageInfo()
  await loadElementTemplates()
  await loadApiDropdownApis()
  instanceTableRef.value?.refresh()
})
</script>

<style scoped>
.page-function-detail {
  height: 100%;
}

.header-card {
  margin-bottom: 10px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.title-block {
  min-width: 0;
}

.page-title {
  margin: 0 0 8px;
  font-size: 22px;
  color: #303133;
}

.url-text {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #606266;
  font-family: Consolas, 'Courier New', monospace;
}

.content-layout {
  display: flex;
  gap: 10px;
  height: calc(100% - 88px);
}

.left-panel {
  flex: 0 0 42%;
  min-width: 420px;
  overflow: hidden;
}

.right-panel {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.panel-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
}

.tab-content {
  padding: 10px 0;
}

.section-block + .section-block {
  margin-top: 16px;
}

.section-title {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.json-content {
  margin: 0;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  color: #303133;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.screenshot-list {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.screenshot-image {
  width: 100%;
  min-height: 180px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #f5f7fa;
}

.api-step-card {
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
}

.api-step-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.api-step-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 0;
}

.api-step-select {
  width: 220px;
  max-width: 100%;
}

.api-step-json-input {
  width: 100%;
}

.api-step-json-input :deep(.el-textarea__inner) {
  font-family: Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
}

.api-step-query {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.query-result,
.result-section {
  margin-top: 12px;
}

.response-label {
  margin-bottom: 5px;
  color: #909399;
  font-size: 12px;
}

.table-actions,
.script-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 12px;
}

.operation-json-editor {
  width: 100%;
  min-width: 0;
}

:deep(.el-form-item:has(.el-radio-group[style*="display: none"])) {
  display: none;
}

.operation-list {
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
}

.operation-item {
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
  min-width: 0;
}

.operation-item-deleted {
  opacity: 0.58;
  background: #f5f7fa;
}

.operation-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  min-width: 0;
}

.operation-name {
  flex: 1;
  min-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #303133;
}

.operation-name-input {
  box-sizing: border-box;
  height: 24px;
  padding: 0 6px;
  border: 1px solid transparent;
  border-radius: 4px;
  outline: none;
  background: transparent;
  font-size: 13px;
  line-height: 22px;
}

.operation-name-input:hover,
.operation-name-input:focus {
  border-color: #409eff;
  background: #fff;
}

.operation-control,
.operation-json-raw {
  width: 100%;
  min-width: 0;
}

.operation-text-length {
  margin-top: 4px;
  text-align: right;
  color: #909399;
  font-size: 12px;
  line-height: 18px;
}

.operation-array-input {
  box-sizing: border-box;
  height: 32px;
  padding: 1px 11px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
  color: #606266;
  font-size: 12px;
  line-height: 30px;
  transition: border-color 0.2s;
}

.operation-array-input:focus {
  border-color: #409eff;
}

.script-editor {
  font-family: Consolas, 'Courier New', monospace;
}

.generate-option-extra {
  float: right;
  color: #909399;
  font-size: 12px;
}
</style>

