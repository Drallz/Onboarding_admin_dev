<template>
  <nav class="sidebar">
    <div class="sidebar-content">
      <div class="top-section">
        <a href="#" class="sidebar-logo">
          <img src="/mss-wits-logo.png" class="logo" alt="Admin Logo" />
        </a>
        <ul class="menu">
          <li v-if="userRole === 'Admin'">
            <router-link to="/Users">Manage Admins</router-link>
          </li>
          <li class="has-submenu">
            <div
              class="menu-item"
              @click="isAddOpen = !isAddOpen"
            >
              <span>Add</span>
              <span class="arrow" :class="{ 'arrow-down': isAddOpen }">▸</span>
            </div>
            <ul class="submenu" v-show="isAddOpen">
              <li><router-link to="/add/student">Student</router-link></li>
              <li><router-link to="/add/desk">Desk</router-link></li>
            </ul>
          </li>
          <li><router-link to="/view">View</router-link></li>
        </ul>
      </div>
      <div class="logout-container">
        <a href="#" @click.prevent="handleLogout" class="logout-link">
          Logout
        </a>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isAddOpen = ref(false);

// Get the user role from localStorage
const userRole = computed(() => localStorage.getItem('userRole'));

// Logout function
const handleLogout = () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userRole');
  localStorage.removeItem('staffNumber');
  router.push('/');
};
</script>

<style scoped>
.sidebar {
  width: 200px;
  height: 100vh;
  background: #f4f4f4;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sidebar-logo {
  display: block;
  text-align: center;
}

.sidebar-logo .logo {
  height: 5em;
  margin-bottom: 2rem;
  transition: transform 300ms;
}

.sidebar-logo .logo:hover {
  transform: scale(1.1);
}

.menu {
  list-style: none;
  padding: 0;
  width: 100%;
}

.menu li {
  margin: 1rem 0;
}

.menu a {
  text-decoration: none;
  color: #333;
  padding: 0.5rem;
  display: block;
  text-align: left;
  transition: background 300ms, color 300ms;
}

.menu a:hover {
  background: #07b0da;
  color: white;
  border-radius: 4px;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  color: #333;
  cursor: pointer;
  text-align: center;
  transition: background 300ms, color 300ms;
}

.menu-item:hover {
  background: #07b0da;
  color: white;
  border-radius: 4px;
}

.arrow {
  transition: transform 300ms;
  margin-left: 0.5rem;
}

.arrow-down {
  transform: rotate(90deg);
}

.submenu {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
  width: 100%;
}

.submenu li {
  margin: 0.5rem 0;
}

.submenu a {
  padding-left: 1rem;
  font-size: 0.9em;
}

.has-submenu {
  margin: 1rem 0;
}

.top-section {
  flex-grow: 1;
}

.logout-container {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-link {
  color: #ff3333;
  text-decoration: none;
  padding: 10px;
  display: block;
  text-align: left;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.logout-link:hover {
  background-color: rgba(255, 51, 51, 0.1);
  border-radius: 4px;
}
</style>
