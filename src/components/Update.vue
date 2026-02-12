<template>
  <div class="container">
    <div class="type-row">
      <button 
        :class="['type-btn', { active: selectedType === 'student' }]"
        @click="handleTypeSelect('student')"
      >
        Students
      </button>
      <button 
        :class="['type-btn', { active: selectedType === 'desk' }]"
        @click="handleTypeSelect('desk')"
      >
        Desks
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

    <!-- Student and Desk List -->
    <div v-if="!selectedItemForUpdate" class="selection-list">
      <div class="list-container">
        <div 
          v-for="item in filteredItemsList" 
          :key="item.id"
          class="list-item"
          @click="selectItemForUpdate(item)"
        >
          <template v-if="selectedType === 'student'">
            {{ item.studn }} - Room: {{ item.roomn }} - Desk: {{ item.deskn || "None" }}
          </template>
          <template v-if="selectedType === 'desk'">
            Desk {{ item.deskn }} - Room {{ item.roomn }}
          </template>
        </div>
      </div>
    </div>
  
      <!-- Update Form -->
      <div v-else class="update-form">
        <div v-if="selectedType === 'student'" class="form-group">
          <h3>Update Student Assignment</h3>
          <div class="input-group">
            <label>Desk:</label>
            <select v-model="updateForm.deskn">
              <option v-for="desk in availableDesks" 
                      :key="desk.deskn" 
                      :value="desk.deskn">
                Desk: {{ desk.deskn }}
              </option>
            </select>
          </div>
          <div class="input-group">
            <label>Room:</label>
            <select v-model="updateForm.roomn">
              <option v-for="room in rooms" 
                      :key="room.roomn" 
                      :value="room.roomn">
                Room: {{ room.roomn }}
              </option>
            </select>
          </div>
        </div>
  
        <div v-if="selectedType === 'desk'" class="form-group">
          <h3>Update Desk Location</h3>
          <div class="input-group">
            <label>Room Number:</label>
            <select v-model="updateForm.roomn">
              <option v-for="room in rooms" 
                      :key="room.roomn" 
                      :value="room.roomn">
                Room: {{ room.roomn }}
              </option>
            </select>
          </div>
        </div>
        <div class="button-group">
          <button @click="handleUpdate" class="submit-btn">Update</button>
          <button @click="handleCancel" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
    import { ref, reactive, computed, onMounted } from 'vue';
    import { fetchDesks, fetchStudents, fetchRooms, fetchTrackedStudents } from '../data/fetch';
    import { updateTrackedStudent, updateDesk } from '../data/update';

    // Dummy Data
    const students = ref([]);
    const desks = ref([]);
    const rooms = ref([]);
    const trackedstudents = ref([]);
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

    onMounted(async () => {
    const fetchedStudents = await fetchStudents();
    const fetchedDesks = await fetchDesks();
    const fetchedRooms = await fetchRooms();
    const fetchedTracked = await fetchTrackedStudents();
    students.value = fetchedStudents;
    desks.value = fetchedDesks;
    rooms.value = fetchedRooms;
    trackedstudents.value = fetchedTracked;
    });

    const selectedType = ref('student');
    const selectedItemForUpdate = ref(null);

    const availableDesks = computed(() => {
    return desks.value.filter(desk => 
        !desk.studn || desk.studn === selectedItemForUpdate.value?.studn
    );
    });

    const getItemsList = computed(() => {
    switch (selectedType.value) {
        case 'student':
        return trackedstudents.value;
        case 'desk':
        return desks.value;
        default:
        return [];
    }
    });

    const updateForm = reactive({
    deskn: '',
    roomn: '',
    studn: '',
    });

    const selectItemForUpdate = (item) => {
    selectedItemForUpdate.value = item;

    if (selectedType.value === 'student') {
        updateForm.deskn = item.deskn;
        updateForm.roomn = item.roomn;
    } else if (selectedType.value === 'desk') {
        updateForm.roomn = item.roomn;
    }
    };

    const handleUpdate = async () => {
    const itemsList = getItemsList.value;
    const index = itemsList.findIndex(item => item.id === selectedItemForUpdate.value.id);
    
    if (index !== -1) {
        if (selectedType.value === 'student') {
        const student = { ...selectedItemForUpdate.value };
        
        // Update student's desk and room
        student.deskn = updateForm.deskn;
        student.roomn = updateForm.roomn;

        // Update tracked student on server
        const success = await updateTrackedStudent(
            student.studn,
            updateForm.deskn,
            updateForm.roomn,
            student
        );
        
        if (success) {
            // Update local state only after successful server update
            const trackedIndex = trackedstudents.value.findIndex(
            ts => ts.studn === student.studn
            );
            if (trackedIndex !== -1) {
            trackedstudents.value[trackedIndex] = student;
            }
            console.log('Tracked student updated successfully');
        } else {
            console.error('Failed to update tracked student');
        }
        
        } else if (selectedType.value === 'desk') {
        const desk = { ...desks.value[index] };
        desk.roomn = updateForm.roomn;
        
        const success = await updateDesk(
            desk.deskn,
            desk.roomn,
            desk
        );
        
        if (success) {
            desks.value[index] = desk;
            console.log('Desk updated successfully');
        } else {
            console.error('Failed to update desk');
        }
        }
    }
    
    selectedItemForUpdate.value = null;
    };

    const handleTypeSelect = (type) => {
      // Reset the selected item when changing types
      selectedItemForUpdate.value = null;
      // Reset the update form
      Object.assign(updateForm, {
        deskn: '',
        roomn: ''
      });
      // Set the new type
      selectedType.value = type;
    };

    const handleCancel = () => {
    selectedItemForUpdate.value = null;
    };
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
    border-color: transparent;
  }

  .type-btn:hover{
    background-color: #e9ecef;
  }
  
  .type-btn.active {
    background-color: #007bff;
    color: white;
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
    border: none;
  }
  
  .list-item:hover {
    background-color: #f8f9fa;
  }
  
  .update-form {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .form-group h3 {
    margin: 0 0 15px 0;
    color: #007bff;
    padding-bottom: 10px;
  }
  
  .input-group {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #e9ecef;
  }

  .search-container {
    display: grid;
    justify-items: center;
    gap: 20px;
  }
  
  .input-group label {
    font-weight: 500;
    color: #333;
  }
  
  select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
  }
  .button-group {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
  
  .submit-btn, .cancel-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .submit-btn {
    background-color: #28a745;
    color: white;
  }
  
  .cancel-btn {
    background-color: #6c757d;
    color: white;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  th, td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
  }
  
  .submit-btn:hover {
    background-color: #218838;
  }
  
  .cancel-btn:hover {
    background-color: #5a6268;
  }
  </style>
