<template>
  <div class="container">
    <div class="header-grid">
      <div class="section">
        <div class="button-group">
          <!-- Ellipsis button that toggles controls -->
          <button
            @click="showAddControls = !showAddControls"
            class="ellipsis-button"
            aria-label="Show desk controls"
          >
            ...
            <span class="tooltip">Add multiple desks at once</span>
          </button>
          
          <!-- Add/Delete controls -->
          <div v-if="showAddControls" class="add-controls">
            <button @click="addNewDesk" class="add-button">+</button>
            <button 
              v-if="desks.length > 1" 
              @click="deleteLastDesk" 
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
        <div v-for="(desk, index) in desks" :key="desk.id" class="form-group">
          <div class="input-grid">
            <input
              type="text"
              placeholder="Desk Number"
              v-model="desk.deskn"
              class="input-field"
	      required
            />
            <select
              v-model="desk.roomn"
              class="input-field"
            >
              <option value="">Select Room</option>
              <option
                v-for="room in roomlist"
                :key="room.roomn"
                :value="room.roomn"
              >
                {{ room.roomn }} - <span class="room-name">{{ room.roomname }}</span>
              </option>
            </select>
            <button
              v-if="index > 0"
              @click="deleteDesk(index)"
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
          Submit Desks
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { addDesk } from '../data/add';
import { fetchRooms } from '../data/fetch';

const desks = ref([{ 
  id: 0,
  deskn: '',
  roomn: '',
}]);

const roomlist = ref([]);
const showAddControls = ref(false);

onMounted(async () => {
  try {
    roomlist.value = await fetchRooms();
  } catch (err) {
    console.error('Error fetching rooms:', err);
  }
});

const addNewDesk = () => {
  desks.value.push({ 
    id: desks.value.length,
    deskn: '',
    roomn: '',
  });
};

const deleteLastDesk = () => {
  if (desks.value.length > 1) {
    desks.value.pop();
  }
};

const deleteDesk = (index) => {
  if (desks.value.length > 1) {
    desks.value.splice(index, 1);
  }
};

const handleSubmit = async () => {
  let success = true;
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
    alert('Desks added successfully!');
    desks.value = [{ ...desks.value[0], id: 0 }];
    window.location.reload();
  }
};
</script>
  
<style scoped>
/* Container and base styles */
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

/* Button group styling */
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

/* Add/Delete controls */
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

/* Desk-specific input grid */
.input-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .input-grid {
    grid-template-columns: 1fr;
  }
}
</style>
