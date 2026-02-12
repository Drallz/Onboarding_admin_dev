<template>
  <div class="container">
    <!-- Type Selection Buttons -->
    <div class="type-row">
      <button 
        v-for="type in ['student', 'desk']"
        :key="type"
        :class="['type-btn', { active: selectedType === type }]"
        @click="handleTypeChange(type)"
      >
        {{ type.charAt(0).toUpperCase() + type.slice(1) }}s
      </button>
    </div>

      <!-- Search Input -->
      <div class="search-container">
        <input 
          type="text" 
          v-model="searchTerm" 
          placeholder="Search..." 
          class="search-input"
        />
      </div>

    <!-- Loading and Error States -->
    <div v-if="loading" class="status-message">
      Loading...
    </div>
    
    <div v-else-if="error" class="status-message error">
      {{ error }}
    </div>

    <!-- Items Grid -->
    <div v-else class="list-container">
      <div 
        v-for="item in filteredItemsList" 
        :key="item.id"
        :class="['list-item', { selected: selectedItems.includes(getItemId(item)) }]"
        @click="toggleItemSelection(getItemId(item))"
      >
        <div class="item-content">
          <input 
            type="checkbox" 
            :checked="selectedItems.includes(getItemId(item))"
            @change="toggleItemSelection(getItemId(item))"
            @click.stop
          >
          <span v-if="selectedType === 'student'">
            {{ item.studn }} - Room: {{ item.roomn }}
          </span>
          <span v-if="selectedType === 'desk'">
            Desk {{ item.deskn }} - Room {{ item.roomn }}
          </span>
        </div>
      </div>
    </div>


    <!-- Delete Button -->
    <div class="button-group" v-if="selectedItems.length > 0">
      <button @click="handleDelete" class="delete-btn">
        Delete Selected ({{ selectedItems.length }})
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { fetchTrackedStudents, fetchDesks } from '../data/fetch';
import { deleteDesk, deleteStudent, deleteTrackedStudent } from '../data/delete';

const loading = ref(true);
const error = ref(null);
const students = ref([]);
const desks = ref([]);
const selectedType = ref('student');
const selectedItems = ref([]);
const searchTerm = ref('');

const filteredItemsList = computed(() => {
  if (!searchTerm.value) return getItemsList.value;

  return getItemsList.value.filter(item => {
    if (selectedType.value === 'student') {
      return item.studn.toLowerCase().includes(searchTerm.value.toLowerCase());
    } else if (selectedType.value === 'desk') {
      return item.deskn.toString().includes(searchTerm.value.toLowerCase());
    }
    return false;
  });
});

const getItemsList = computed(() => {
  switch (selectedType.value) {
    case 'student':
      // Include students only if there's a student with a valid 'studn' property
      return students.value.filter(s => s.studn) // Filters out students without 'studn'
        .map(s => ({
          ...s
        }));
    case 'desk':
      return desks.value;
    default:
      return [];
  }
});

const handleTypeChange = (type) => {
  selectedType.value = type;
  selectedItems.value = [];
};

const toggleItemSelection = (itemId) => {
  const currentIndex = selectedItems.value.indexOf(itemId);
  if (currentIndex === -1) {
    selectedItems.value.push(itemId);
  } else {
    selectedItems.value.splice(currentIndex, 1);
  }
};

const getItemId = (item) => {
  if (selectedType.value === 'student') {
    return item.studn;
  } else if (selectedType.value === 'desk') {
    return item.deskn;
  }
  return item.id;
};


const handleDelete = async () => {
  try {
    if (selectedType.value === 'student') {
      // Delete students and tracked students
      for (let studentId of selectedItems.value) {
        await deleteTrackedStudent(studentId); // Also delete from tracked students
        await deleteStudent(studentId);  // Delete the student from the students list
      }

      // Remove the deleted students from the students list
      students.value = students.value.filter(student => !selectedItems.value.includes(student.id));
    } else if (selectedType.value === 'desk') {
      // Delete desks
      for (let deskId of selectedItems.value) {
        await deleteDesk(deskId);  // Call the deleteDesk function for each selected desk
      }
      // Remove the deleted desks from the desks list
      desks.value = desks.value.filter(desk => !selectedItems.value.includes(desk.id));
    }
    // Clear the selected items after deletion
    selectedItems.value = [];
    window.location.reload();
  } catch (err) {
    error.value = 'Failed to delete items. Please try again.';
  }
};

onMounted(async () => {
  try {
    loading.value = true;
    const [fetchedData, fetchedDesks] = await Promise.all([
      fetchTrackedStudents(),
      fetchDesks()
    ])
    
    students.value = fetchedData;
    desks.value = fetchedDesks;
  } catch (err) {
    error.value = 'Failed to load data. Please refresh the page.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Courier New', Courier, monospace;
}

.type-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.type-btn {
  padding: 15px;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  font-size: medium;
  font-family: 'Courier New', Courier, monospace;
  transition: all 0.3s;
  border: none;
}

.type-btn:hover {
  background-color: #e9ecef;
}

.type-btn.active {
  background-color: #007bff;
  color: white;
}

.status-message {
  text-align: center;
  padding: 20px;
}

.error {
  color: #dc3545;
}

.list-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
  cursor: pointer;
}

.list-item {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.list-item:hover {
  background-color: #f8f9fa;
}

.list-item.selected {
  background-color: #e8f4ff;
  border-color: #007bff;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
  .search-container {
    display: grid;
    justify-items: center;
    gap: 20px;
  }

.delete-btn {
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-btn:hover {
  background-color: #c82333;
}
</style>
