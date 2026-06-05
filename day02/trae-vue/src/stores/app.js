import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 侧边栏折叠状态
  const isCollapse = ref(false)
  
  // 当前激活的菜单
  const activeMenu = ref('')

  function toggleSidebar() {
    isCollapse.value = !isCollapse.value
  }

  function setActiveMenu(menu) {
    activeMenu.value = menu
  }

  return {
    isCollapse,
    activeMenu,
    toggleSidebar,
    setActiveMenu
  }
})
