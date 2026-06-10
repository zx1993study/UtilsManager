<template>
  <div class="app-wrapper">
    <!-- 左侧导航栏 -->
    <el-aside :width="sidebarWidth" class="sidebar">
      <div class="logo-container">
        <h2 v-if="!isCollapse" class="logo-title">管理平台</h2>
        <h2 v-else class="logo-title-short">MP</h2>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        router
        class="sidebar-menu"
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <!-- 无子菜单或只有一个子菜单项（显示为一级菜单） -->
          <el-menu-item 
            v-if="!route.children || route.children.length === 0 || (route.children && route.children.length === 1)" 
            :index="route.children && route.children.length === 1 && route.children[0].path ? route.children[0].path : route.path"
          >
            <el-icon><component :is="route.meta?.icon || 'Menu'" /></el-icon>
            <template #title>{{ route.meta?.title }}</template>
          </el-menu-item>
          
          <!-- 有多个子菜单项（显示为折叠菜单） -->
          <el-sub-menu v-else :index="route.path">
            <template #title>
              <el-icon><component :is="route.meta?.icon || 'Menu'" /></el-icon>
              <span>{{ route.meta?.title }}</span>
            </template>
            <el-menu-item
              v-for="child in route.children.filter(c => !c.meta?.hidden)"
              :key="child.path"
              :index="child.path"
            >
              <el-icon><component :is="child.meta?.icon || 'Document'" /></el-icon>
              <template #title>{{ child.meta?.title }}</template>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
      
      <!-- 退出登录按钮 -->
      <div class="logout-container">
        <div 
          class="logout-item"
          @click="handleLogout"
        >
          <el-icon><SwitchButton /></el-icon>
          <span v-if="!isCollapse" class="logout-text">退出登录</span>
        </div>
      </div>
    </el-aside>

    <!-- 右侧内容区 -->
    <el-container class="main-container">
      <!-- 顶部头部 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon 
            class="collapse-icon" 
            @click="toggleSidebar"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="36" :src="userInfo?.avatar || defaultAvatar" />
              <span class="username">{{ userInfo?.username || '管理员' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="settings">设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主要内容区 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-transform" mode="out-in" appear>
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Fold, Expand, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const isCollapse = computed(() => appStore.isCollapse)
const activeMenu = computed(() => route.path)
const sidebarWidth = computed(() => isCollapse.value ? '64px' : '200px')
const userInfo = computed(() => userStore.userInfo)

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 获取菜单路由
const menuRoutes = computed(() => {
  return router.options.routes.filter(route => {
    // 排除登录页、根路径重定向和隐藏的路由
    return route.path !== '/login' && route.path !== '/' && !route.meta?.hidden
  })
})

// 切换侧边栏
const toggleSidebar = () => {
  appStore.toggleSidebar()
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人中心功能开发中')
      break
    case 'settings':
      ElMessage.info('设置功能开发中')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userStore.logout()
        router.push('/login')
        ElMessage.success('已退出登录')
      }).catch(() => {})
      break
  }
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  }).catch(() => {})
}

</script>

<style scoped>
.app-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
}

/* 侧边栏样式 */
.sidebar {
  background: #304156;
  transition: width 0.3s;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2b3a4d;
  color: #fff;
}

.logo-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.logo-title-short {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.sidebar-menu {
  border-right: none;
  background: #304156;
  flex: 1;
  overflow-y: auto;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  color: #bfcbd9;
  font-size: 12px;
  font-weight: bold;
  height: 48px;
  line-height: 48px;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background: #263445 !important;
  color: #fff;
}

:deep(.el-menu-item.is-active) {
  background: #409eff !important;
  color: #fff;
}

/* 强制覆盖二级菜单的背景色，使其与一级菜单保持一致 */
:deep(.el-sub-menu .el-menu) {
  background-color: transparent !important;
}

:deep(.el-sub-menu .el-menu-item) {
  background-color: transparent !important;
  color: #bfcbd9;
}

:deep(.el-sub-menu .el-menu-item:hover) {
  background: #263445 !important;
  color: #fff;
}

:deep(.el-sub-menu .el-menu-item.is-active) {
  background: #409eff !important;
  color: #fff;
}

/* 退出登录按钮容器 */
.logout-container {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.logout-item {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  cursor: pointer;
  color: #bfcbd9;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.3s;
  user-select: none;
}

.logout-item:hover {
  background: #263445;
  color: #fff;
}

.logout-item .el-icon {
  font-size: 18px;
  margin-right: 12px;
}

.logout-text {
  font-size: 14px;
  white-space: nowrap;
}

/* 主容器 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 头部 */
.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s;
}

.collapse-icon:hover {
  color: #409eff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.username {
  font-size: 14px;
}

/* 主内容区 */
.main-content {
  background: #f0f2f5;
  padding: 20px;
  overflow: auto;
}

/* 过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
