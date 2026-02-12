<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './components/Sidebar.vue';
import AdminHeader from './components/AdminHeader.vue';

const route = useRoute();
const isLoginPage = computed(() => route.name === 'Login');

const navigate = (view) => {
  // Optionally use this to highlight active menu items in Sidebar
};
</script>

<template>
  <div class="admin-panel">
    <template v-if="!isLoginPage">
      <Sidebar @navigate="navigate" />
      <div class="content">
        <AdminHeader
          :title="$route.name ? $route.name.charAt(0).toUpperCase() + $route.name.slice(1) : 'Admin Panel'"
        />
        <main>
          <router-view />
        </main>
      </div>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<style>
.admin-panel {
  display: flex;
  min-height: 100vh;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
}

/* Add these styles if you want the login page to take full width when rendered */
.admin-panel:has(> .login-container) {
  display: block;
}
</style>
