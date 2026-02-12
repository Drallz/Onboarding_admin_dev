<template>
  <div class="container">
    <!-- Column Headers -->
    <div class="header-row">
      <div class="column-header" 
           :class="{ active: selectedView === 'students' }"
           @click="selectedView = 'students'">
        Students
      </div>
      <div class="column-header" 
           :class="{ active: selectedView === 'rooms' }"
           @click="selectedView = 'rooms'">
        Rooms
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      Loading data...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Filter and Sort Controls -->
      <div class="controls">
        <!-- Students Filters -->
        <div v-if="selectedView === 'students'" class="filter-section">
          <div class="filter-options">
            <select v-model="filters.student.school">
              <option value="">All Schools</option>
              <option v-for="school in uniqueSchools" :key="school" :value="school">
                {{ school }}
              </option>
            </select>
            <select v-model="filters.student.room">
              <option value="">All Rooms</option>
              <option v-for="room in uniqueRooms" :key="room" :value="room">
                Room {{ room }}
              </option>
            </select>
          </div>
          <div class="sort-options">
            <select v-model="sorting.students">
              <option value="name">Sort by Name</option>
              <option value="studn">Sort by Student Number</option>
              <option value="room">Sort by Room</option>
              <option value="school">Sort by School</option>
            </select>
            <button @click="toggleSortDirection('students')" class="sort-direction">
              {{ sortDirection.students === 'asc' ? '↑' : '↓' }}
            </button>
          </div>
        </div>

        <!-- Rooms Filters -->
        <div v-if="selectedView === 'rooms'" class="filter-section">
          <div class="sort-options">
            <select v-model="sorting.rooms">
              <option value="number">Sort by Room Number</option>
              <option value="occupancy">Sort by Occupancy</option>
            </select>
            <button @click="toggleSortDirection('rooms')" class="sort-direction">
              {{ sortDirection.rooms === 'asc' ? '↑' : '↓' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="content-area">
        <!-- Students View -->
        <div v-if="selectedView === 'students'" class="data-cards">
          <div v-for="student in filteredAndSortedStudents" 
               :key="student.id" 
               class="card student-card">
               <h3>
                {{ student.name }} {{ student.lname }}
                <button 
                  @click="selectStudentForUpdate(student)" 
                  class="edit-btn"
                >
                  Edit
                </button>
              </h3>
            <div class="card-content">
              <p><strong>Year Of Use:</strong> {{ student.year_of_use }}</p>
              <p><strong>Student Number:</strong> {{ student.studn }}</p>
              <p><strong>Email:</strong> {{ student.email }}</p>
              <p><strong>School:</strong> {{ student.school }}</p>
              <p><strong>Supervisors:</strong> {{ student.supervisors }}</p>
              <p><strong>Thesis Title:</strong> {{ student.thesis }}</p>
              <div class="assignment-info">
                <p><strong>Room:</strong> {{ getTrackedStudentInfo(student.studn)?.roomn || getRoomInfo(getTrackedStudentInfo(student.studn)?.roomn)?.roomname || 'Not Assigned' }}</p>
                <p><strong>Desk:</strong> {{ getTrackedStudentInfo(student.studn)?.deskn || 'Not Assigned' }}</p>
                <p><strong>Last Update:</strong>{{ formatDate(getTrackedStudentInfo(student.studn)?.lastupdate) || 'Not Assigned' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Rooms View -->
        <div v-if="selectedView === 'rooms'" class="data-cards">
          <div v-for="room in filteredAndSortedRooms" 
               :key="room.id" 
               class="card room-card">
            <h3>Room {{ room.roomn }}</h3>
            <div class="card-content">
              <div class="room-occupants">
                <h4>Students:</h4>
                <ul>
                  <li v-for="student in getStudentsInRoom(room.roomn)" :key="student.id">
                    {{ getStudentInfo(student.studn)?.name }} {{ getStudentInfo(student.studn)?.lname }} - {{ student.studn }}
                    <span v-if="student.deskn != null">(Desk: {{ student.deskn }})</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedStudentForUpdate" class="update-modal">
    <div class="modal-content">
      <h3>Edit {{ selectedStudentForUpdate.name }}'s Assignment</h3>
      <div class="form-group">
        <div class="input-group">
          <label>Desk:</label>
          <select v-model="updateForm.deskn">
            <option value="">Select Desk</option>
            <option 
              v-for="desk in availableDesks" 
              :key="desk.deskn" 
              :value="desk.deskn"
            >
              Desk {{ desk.deskn }} (Room {{ desk.roomn }})
            </option>
          </select>
        </div>
        <div class="input-group">
          <label>Room:</label>
          <select v-model="updateForm.roomn">
            <option value="">Select Room</option>
            <option 
              v-for="room in rooms" 
              :key="room.roomn" 
              :value="room.roomn"
            >
              Room {{ room.roomn }}
            </option>
          </select>
        </div>
        <div class="modal-buttons">
          <button @click="handleCancel" class="cancel-btn">Cancel</button>
          <button @click="handleDeleteClick" class="delete-btn">Delete</button>
          <button @click="handleUpdate" class="submit-btn">Update</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showDeleteConfirmation" class="confirmation-modal">
    <div class="modal-content">
      <h3>Are you sure you want to delete {{ selectedStudentForUpdate.name }}?</h3>
      <div class="modal-buttons">
        <button @click="confirmDelete" class="delete-btn">Yes, Delete</button>
        <button @click="cancelDelete" class="cancel-btn">Cancel</button>
      </div>
    </div>
  </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, toRaw } from 'vue';
import { 
  fetchDesks, 
  fetchStudents, 
  fetchTrackedStudents, 
  fetchRooms,
  fetchSupervisors, 
} from '../data/fetch';
import { updateTrackedStudent } from '../data/update';
import { deleteStudent, deleteTrackedStudent } from '../data/delete';

// State Management
const students = ref([]);
const rooms = ref([]);
const desks = ref([]);
const trackedStudents = ref([]);
const supervisors = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedView = ref('students');

const selectedStudentForUpdate = ref(null);
const updateForm = reactive({
  deskn: '',
  roomn: '',
  studn: '',
});

const availableDesks = computed(() => {
  return desks.value.filter(desk => 
    !desk.studn || desk.studn === selectedStudentForUpdate.value?.studn
  );
});

const selectStudentForUpdate = (student) => {
  const rawStudent = toRaw(student);
  if (selectedStudentForUpdate.value?.studn === rawStudent.studn) return;
  console.log('Raw student data:', rawStudent);
  selectedStudentForUpdate.value = rawStudent;

  const trackedInfo = getTrackedStudentInfo(rawStudent.studn) || {
    studn: rawStudent.studn,
    deskn: '',
    roomn: '',
    lastupdate: new Date().toISOString()
  };

  updateForm.studn = rawStudent.studn;
  updateForm.deskn = trackedInfo?.deskn || '';
  updateForm.roomn = trackedInfo?.roomn || '';
};


const handleUpdate = async () => {
  try {

    if (updateForm.deskn === selectedStudentForUpdate.value.deskn && updateForm.roomn === selectedStudentForUpdate.value.roomn) {
      console.log('No changes detected.');
      return; // Exit early if no actual changes
    }

    
    // Create the update payload
    const updatePayload = {
      studn: updateForm.studn,
      deskn: updateForm.deskn,
      roomn: updateForm.roomn,
      lastupdate: new Date().toISOString()
    };

    // Find index in trackedStudents (if exists)
    const trackedIndex = trackedStudents.value.findIndex(
      ts => ts.studn === updateForm.studn
    );

    // Update or create entry
    if (trackedIndex !== -1) {
      // Update existing entry
      trackedStudents.value[trackedIndex] = {
        ...trackedStudents.value[trackedIndex],
        ...updatePayload
      };
    } else {
      // Create new entry
      trackedStudents.value.push(updatePayload);
    }
    const success = await updateTrackedStudent(
      updateForm.studn,
      updateForm.deskn,
      updateForm.roomn,
      updatePayload
    );

    if (success) {
      console.log('Update successful');
      selectedStudentForUpdate.value = null;
    }
  } catch (error) {
    console.error('Update failed:', error);
  }
};

const handleCancel = () => {
  selectedStudentForUpdate.value = null;
};

// Filters state
const filters = ref({
  student: {
    search: '',
    school: '',
    room: ''
  },
  room: {
    search: ''
  },
});

// Sorting state
const sorting = ref({
  students: 'name',
  rooms: 'number',
});

const sortDirection = ref({
  students: 'asc',
  rooms: 'asc',
});

// Data Fetching
const fetchData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const [studentsData, roomsData, desksData, trackedData, supervisorsData] = await Promise.all([
      fetchStudents(),
      fetchRooms(),
      fetchDesks(),
      fetchTrackedStudents(),
      fetchSupervisors()
    ]);

    students.value = studentsData;
    rooms.value = roomsData;
    desks.value = desksData;
    trackedStudents.value = trackedData;
    supervisors.value = supervisorsData;
  } catch (err) {
    error.value = 'Failed to fetch data. Please try again later.';
    console.error('Error fetching data:', err);
  } finally {
    loading.value = false;
  }
};

// Initialize data on component mount
onMounted(() => {
  fetchData();
});

// Toggle sort direction
const toggleSortDirection = (view) => {
  sortDirection.value[view] = sortDirection.value[view] === 'asc' ? 'desc' : 'asc';
};

// Computed properties for unique values
const uniqueSchools = computed(() => {
  return [...new Set(students.value.map(s => s.school))];
});

const uniqueRooms = computed(() => {
  return [...new Set(rooms.value.map(r => r.roomn))];
});

// Helper function to get tracked student information
const getTrackedStudentInfo = (studentNumber) => {
  return trackedStudents.value.find(ts => ts.studn === studentNumber);
};

const getRoomInfo = (roomn) => {
  return rooms.value.find(r => r.roomn === roomn);
}
// Add date formatting helper function
const formatDate = (dateString) => {
  if (!dateString) return 'Not Assigned';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    // Format: "January 15, 2024 at 14:30"
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    return date.toLocaleString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Helper function to ensure values are strings
const toStringSafe = (value) => value ? String(value) : '';

// Modified filtered and sorted students computed property
const filteredAndSortedStudents = computed(() => {
  let filtered = students.value;

  // Apply filters
  if (filters.value.student.search) {
    const search = filters.value.student.search.toLowerCase();
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(search) ||
      s.lname.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search) ||
      s.studn.toLowerCase().includes(search)
    );
  }

  if (filters.value.student.school) {
    filtered = filtered.filter(s => s.school === filters.value.student.school);
  }

  if (filters.value.student.room) {
    // Filter by room using tracked students data
    filtered = filtered.filter(s => {
      const trackedInfo = getTrackedStudentInfo(s.studn);
      return trackedInfo?.roomn?.toString() === filters.value.student.room;
    });
  }

  // Apply sorting
  return filtered.sort((a, b) => {
    const direction = sortDirection.value.students === 'asc' ? 1 : -1;
    switch (sorting.value.students) {
      case 'name':
        return (toStringSafe(a.name) + toStringSafe(a.surname)).localeCompare(toStringSafe(b.name) + toStringSafe(b.lname)) * direction;
      case 'studn':
        return a.studn.localeCompare(b.studn) * direction;
      case 'room':
        const aRoom = getTrackedStudentInfo(a.studn)?.roomn || '';
        const bRoom = getTrackedStudentInfo(b.studn)?.roomn || '';
        return aRoom.localeCompare(bRoom) * direction;
      case 'school':
        return a.school.localeCompare(b.school) * direction;
      default:
        return 0;
    }
  });
});

const filteredAndSortedRooms = computed(() => {
  let filtered = rooms.value;

  // Apply filters
  if (filters.value.room.search) {
    const search = filters.value.room.search.toLowerCase();
    filtered = filtered.filter(room => 
      room.roomn.toString().toLowerCase().includes(search)
    );
  }

  // Apply sorting
  return filtered.sort((a, b) => {
    const direction = sortDirection.value.rooms === 'asc' ? 1 : -1;
    if (sorting.value.rooms === 'occupancy') {
      const aCount = getStudentsInRoom(a.roomn).length;
      const bCount = getStudentsInRoom(b.roomn).length;
      return (aCount - bCount) * direction;
    }
    return a.roomn.localeCompare(b.roomn) * direction;
  });
});

const getStudentsInRoom = (roomNumber) => {
  return trackedStudents.value.filter(student => student.roomn === roomNumber);
};

const getStudentInfo = (studentNumber) => {
  const student = students.value.find(s => s.studn === studentNumber);
  return student
};

const showDeleteConfirmation = ref(false);

const handleDeleteClick = () => {
  showDeleteConfirmation.value = true;  // Show the confirmation modal
};
// Confirm deletion of the student
const confirmDelete = async () => {
  try {
    if (!selectedStudentForUpdate.value) return;

    const studentToDelete = selectedStudentForUpdate.value;

    // Call the function to delete the student and their tracked information
    await deleteTrackedStudent(studentToDelete.studn);  // Delete from tracked data
    await deleteStudent(studentToDelete.studn);  // Delete the student from students list

    // Remove the student from the students list
    students.value = students.value.filter(student => student.studn !== studentToDelete.studn);

    // Close the update modal
    selectedStudentForUpdate.value = null;

    console.log('Student deleted successfully');
    showDeleteConfirmation.value = false;  // Close the confirmation modal after deletion
  } catch (error) {
    error.value = 'Failed to delete student. Please try again.';
    console.error('Delete failed:', error);
  }
};

const cancelDelete = () => {
  showDeleteConfirmation.value = false;  // Close the confirmation modal
  selectedStudentForUpdate.value = null;  // Optionally reset the form
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Courier New', Courier, monospace;
}

.header-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.column-header {
  padding: 15px;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.column-header:hover {
  background-color: #e9ecef;
}

.column-header.active {
  background-color: #007bff;
  color: white;
}

.data-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
}

.card h3 {
  display: flex;
  margin: 0 0 15px 0;
  color: #007bff;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-content p {
  margin: 0;
}

.assignment-info {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

.room-occupants{
  margin-top: 15px;
}

.room-occupants h4 {
  margin: 0 0 10px 0;
  color: #495057;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 5px 0;
}

.controls {
  display: grid;
  justify-items: center;
  gap: 20px;
}

.assigned-student {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

.edit-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
  font-size: 0.8em;
}

.update-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.input-group {
  margin: 1rem 0;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.input-group select {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.submit-btn {
  background: #28a745;
  color: white;
  padding: 0.5rem 1rem;
}

.cancel-btn {
  background: #dc3545;
  color: white;
  padding: 0.5rem 1rem;
}

.confirmation-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.confirmation-modal .modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  text-align: center;
}

.modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-btn {
    padding: 8px 16px;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .submit-btn {
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .delete-btn {
    padding: 8px 16px;
    background-color: #c40a0a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

</style>
