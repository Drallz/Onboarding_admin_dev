<template>
  <div class="container">
    <div class="header-grid">
      <div class="section">
        <div class="button-group">
          <!-- Ellipsis button that toggles controls -->
          <button
            @click="showAddControls = !showAddControls"
            class="ellipsis-button"
            aria-label="Show student controls"
          >
            ...
            <span class="tooltip">Add multiple students at once</span>
          </button>
          
          <!-- Add/Delete controls -->
          <div v-if="showAddControls" class="add-controls">
            <button @click="addNewUser" class="add-button">+</button>
            <button 
              v-if="users.length > 1" 
              @click="deleteLastUser" 
              class="delete-button"
            >
              -
            </button>
          </div>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-section">
        <div v-for="(user, index) in users" :key="user.id" class="form-group">
          <div class="input-grid">
              <!-- All student input fields -->
              <input
                type="text"
                placeholder="Student Number"
                v-model="user.studn"
                class="input-field"
		required
              />
              <input
                type="email"
                placeholder="Email"
                v-model="user.email"
                class="input-field"
	        required
              />
              <input
                type="text"
                placeholder="Name"
                v-model="user.name"
                class="input-field"
              />
              <input
                type="text"
                placeholder="Surname"
                v-model="user.surname"
                class="input-field"
              />
              <input
                type="text"
                placeholder="School"
                v-model="user.school"
                class="input-field"
              />
              <input
                type="text"
                placeholder="Supervisor"
                v-model="user.supervisor"
                class="input-field"
              />
              <input
                type="text"
                placeholder="Thesis Title"
                v-model="user.thesisTitle"
                class="input-field"
              />
              <select
                v-model="user.deskn"
                @change="handleDeskSelection(user, $event.target.value)"
                class="input-field"
              >
                <option value="">Select Desk</option>
                <option v-for="desk in desklist" :key="desk.deskn" :value="desk.deskn">
                  {{ desk.deskn }}
                </option>
              </select>
              <select
                v-model="user.roomn"
                :disabled="user.deskn !== ''"
                class="input-field"
              >
                <option value="">Select Room</option>
                <option
                  v-for="room in uniqueRooms"
                  :key="room.roomn"
                  :value="room.roomn"
                >
                  {{ room.roomn }} - <span class="room-name">{{ room.roomname }}</span>
                </option>
              </select>
            <button
              v-if="index > 0"
              @click="deleteUser(index)"
              class="delete-row-button"
              type="button"
            >
              ×
            </button>
          </div>
        </div>
        <button
          type="submit"
          class="submit-button"
        >
          Submit Students
        </button>
      </div>
    </form>
  </div>
</template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { addStudent } from '../data/add';
  import { fetchDesks, fetchRooms } from '../data/fetch';
  
  const users = ref([{ 
    id: 0,
    name: '',
    surname: '',
    email: '',
    school: '',
    supervisor: '',
    thesisTitle: '',
    deskn: '',
    roomn: '',
    studn: ''
  }]);
  
  const desklist = ref([]);
  const roomlist = ref([]);
  const showAddControls = ref(false);
  
  onMounted(async () => {
    try {
      desklist.value = await fetchDesks();
      roomlist.value = await fetchRooms();
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  });
  
  const addNewUser = () => {
    users.value.push({ 
      id: users.value.length,
      ...JSON.parse(JSON.stringify(users.value[0]))
    });
  };
  
  // Add these delete functions
  const deleteLastUser = () => {
    if (users.value.length > 1) {
      users.value.pop();
    }
  };
  
  const deleteUser = (index) => {
    if (users.value.length > 1) {
      users.value.splice(index, 1);
    }
  };
  
  const uniqueRooms = computed(() => {
    const roomsMap = new Map();
    roomlist.value.forEach(room => {
      if (!roomsMap.has(room.roomn)) {
        roomsMap.set(room.roomn, room);
      }
    });
    return Array.from(roomsMap.values());
  });
  
  const handleDeskSelection = (user, deskn) => {
    user.deskn = deskn;
    const selectedDesk = desklist.value.find(desk => desk.deskn === deskn);
    if (selectedDesk) user.roomn = selectedDesk.roomn;
  };
  
  const handleSubmit = async () => {
    let success = true;
    for (const user of users.value) {
      const studentData = {
        name: user.name,
        surname: user.surname,
        email: user.email,
        school: user.school,
        supervisor: user.supervisor,
        thesisTitle: user.thesisTitle,
        deskn: user.deskn,
        roomn: user.roomn,
        studn: user.studn
      };
      success = success && await addStudent(studentData);
    }
    
    if (success) {
      alert('Students added successfully!');
      users.value = [{ ...users.value[0], id: 0 }];
      window.location.reload();
    }
  };
  </script>
  
  <style scoped>
  /* Consolidated and organized styles */
  .container {
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .header-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 24px;
    text-align: center;
  }
  
  .title {
    font-family: 'Courier New', Courier, monospace;
    margin-bottom: 8px;
  }
  
  .button-group {
    position: relative;
    display: inline-block;
  }
  
  /* Ellipsis button styling */
  .ellipsis-button {
    width: 32px;
    height: 32px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    position: relative;
    transition: background-color 0.3s;
  }
  
  .ellipsis-button:hover {
    background-color: #0056b3;
  }
  
  .add-controls {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    display: inline-flex;
    flex-direction: row;
    gap: 8px;
    margin-top: 8px;
    z-index: 10;
    background: white;
    padding: 4px;
    border-radius: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .add-button, .delete-button {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s;
  }
  
  .add-button {
    background-color: #007bff;
    color: white;
  }
  
  .add-button:hover {
    background-color: #0056b3;
    transform: scale(1.1);
  }
  
  .delete-button {
    background-color: #dc3545;
    color: white;
  }
  
  .delete-button:hover {
    background-color: #bb2d3b;
    transform: scale(1.1);
  }
  
  /* Tooltip styling */
  .tooltip {
    visibility: hidden;
    width: 160px;
    background-color: #555;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 8px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .ellipsis-button:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
  
  .tooltip::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
  }
  
  /* Form styling */
  .form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .form-section {
    border: 1px solid #ddd;
    padding: 16px;
    border-radius: 8px;
  }
  
  .form-group {
    background-color: #f8f9fa;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    position: relative;
  }
  
  .input-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    column-gap: 32px;
  }
  
  .input-field {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 100%;
  }
  
  .input-field:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
  
  .submit-button {
    width: 100%;
    padding: 12px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }
  
  .submit-button:hover {
    background-color: #0056b3;
  }
  
  .delete-row-button {
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    color: #dc3545;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 4px;
  }
  
  .delete-row-button:hover {
    color: #bb2d3b;
  }
  
  @media (max-width: 768px) {
    .input-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>
