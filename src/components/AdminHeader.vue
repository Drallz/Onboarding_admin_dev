<template>
  <header class="admin-header">
    <h1>{{ title }}</h1>
  </header>
</template>

<script setup>
defineProps(['title']);
</script>

<style scoped>
.admin-header {
  background: #07afda;
  color: white;
  padding: 1rem;
  text-align: center;
}
</style>
