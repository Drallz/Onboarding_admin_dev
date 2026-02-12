<template>
  <div class="container">
    <div class="header-grid">
      <div class="section">
        <div class="title">Student</div>
        <button
          @click="toggleUserForm"
          :class="{ active: isUserFormActive }"
          class="add-button"
        >
          +
        </button>
      </div>
      <div class="section">
        <div class="title">Desk</div>
        <button
          @click="toggleDeskForm"
          :class="{ active: isDeskFormActive }"
          class="add-button"
        >
          +
        </button>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="form">
      <!-- Users Form -->
      <div v-if="showUserForm" class="form-section">
        <h3 class="section-title">Student</h3>
        <div v-for="(user, index) in users" :key="user.id" class="form-group">
          <div class="input-grid">
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
              placeholder="Student Number"
              v-model="user.studn"
              class="input-field"
            />
            <input
              type="email"
              placeholder="Email"
              v-model="user.email"
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
          </div>
        </div>
        <button
          type="button"
          @click="addNewUser"
          class="add-button"
        >
          +
        </button>
      </div>

      <!-- Desks Form -->
      <div v-if="showDeskForm" class="form-section">
        <h3 class="section-title">Desks</h3>
        <div v-for="(desk, index) in desks" :key="desk.id" class="form-group">
          <div class="input-grid">
            <input
              type="text"
              placeholder="Desk Number"
              v-model="desk.deskn"
              class="input-field"
            />
            <select
              v-model="desk.roomn"
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
          </div>
        </div>
        <button
          type="button"
          @click="addNewDesk"
          class="add-button"
        >
          +
        </button>
      </div>

      <!-- Submit Button -->
      <button
        v-if="showUserForm || showDeskForm"
        type="submit"
        class="submit-button"
      >
        Submit All
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { addDesk, addStudent } from '../data/add';
import { fetchDesks, fetchRooms } from '../data/fetch';

// Form visibility states
const showUserForm = ref(false);
const showDeskForm = ref(false);
const isUserFormActive = ref(false);
const isDeskFormActive = ref(false);

const toggleUserForm = () => {
  isUserFormActive.value = !isUserFormActive.value;
  showUserForm.value = !showUserForm.value;
};

const toggleDeskForm = () => {
  isDeskFormActive.value = !isDeskFormActive.value;
  showDeskForm.value = !showDeskForm.value;
};

const desklist = ref([]);
const roomlist = ref([]);

onMounted(async () => {
  try {
    desklist.value = await fetchDesks();
    roomlist.value = await fetchRooms();
  } catch (err) {
    console.error('Error fetching desks or rooms:', err);
  }
});

// Updated form data to match database schema
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

const desks = ref([{ 
  id: 0,
  deskn: '',
  roomn: '',
}]);

// Add new item functions
const addNewUser = () => {
  users.value.push({ 
    id: users.value.length,
    name: '',
    surname: '',
  email: '',
  school: '',
  supervisor: '',
  thesisTitle: '',
  deskn: '',
  roomn: '',
  studn: ''
  });
};

const addNewDesk = () => {
  desks.value.push({ 
    id: desks.value.length,
    deskn: '',
    roomn: '',
  });
};

// Handle desk selection
const handleDeskSelection = (user, deskn) => {
  user.deskn = deskn;
  // Find the associated room for the selected desk
  const selectedDesk = desklist.value.find(desk => desk.deskn === deskn);
  if (selectedDesk) {
    user.roomn = selectedDesk.roomn;
  }
};

// Compute unique rooms from roomlist
const uniqueRooms = computed(() => {
  const roomsMap = new Map();
  roomlist.value.forEach(room => {
    if (!roomsMap.has(room.roomn)) {
      roomsMap.set(room.roomn, room);
    }
  });
  return Array.from(roomsMap.values());
});

// Handle form submission
const handleSubmit = async () => {
  let success = true;

  // Only add users if their data is filled
  if (users.value.some(user => user.email && user.studn)) {
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
  }

  // Only add desks if their data is filled
  if (desks.value.some(desk => desk.deskn && desk.roomn)) {
    for (const desk of desks.value) {
      const deskData = {
        deskn: desk.deskn,
        roomn: desk.roomn,
      };
      success = success && await addDesk(deskData);
    }
  }

  if (success) {
    alert('All data added successfully!');
    window.location.reload();
  } else {
    alert('There was an error adding some data.');
  }
};
</script>

<style scoped>
.container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  text-align: center;
}

.title {
  font-family: 'Courier New', Courier, monospace;
  margin-bottom: 8px;
}

.add-button {
  width: 32px;
  height: 32px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s, transform 0.3s;
}

.add-button:hover {
  background-color: #0056b3;
}

.add-button.active {
  transform: rotate(45deg);
}

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

.section-title {
  font-weight: bold;
  margin-bottom: 16px;
}

.form-group {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 columns */
  gap: 16px; /* Space between grid items */
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .input-grid {
    grid-template-columns: 1fr;
  }
  
  .header-grid {
    grid-template-columns: 1fr;
  }
}
</style>
