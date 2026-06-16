import { ElMessage, ElMessageBox } from 'element-plus'

export const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]

export const platformOptions = [
  { label: 'Android', value: 'Android' },
  { label: 'iOS', value: 'iOS' }
]

export const locatorOptions = [
  { label: 'id', value: 'id' },
  { label: 'xpath', value: 'xpath' },
  { label: 'accessibility_id', value: 'accessibility_id' },
  { label: 'class_name', value: 'class_name' },
  { label: 'android_uiautomator', value: 'android_uiautomator' },
  { label: 'ios_predicate', value: 'ios_predicate' }
]

export const actionOptions = [
  { label: '点击', value: 'click' },
  { label: '输入', value: 'input' },
  { label: '清空', value: 'clear' },
  { label: '等待', value: 'wait' },
  { label: '断言文本', value: 'assert_text' },
  { label: '返回', value: 'back' }
]

export const elementOptions = [
  { label: '输入框', value: 'input' },
  { label: '按钮', value: 'button' },
  { label: '文本', value: 'text' },
  { label: '选择器', value: 'select' }
]

export function handleApi(res, ok = '操作成功', fail = '操作失败') {
  if (res?.success) {
    ElMessage.success(res.msg || ok)
    return true
  }
  ElMessage.error(res?.msg || res?.error || fail)
  return false
}

export function confirmDelete(text, cb) {
  return ElMessageBox.confirm(text, '提示', { type: 'warning' }).then(cb).catch(() => {})
}

export function prettyJson(value) {
  if (!value) return ''
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}
