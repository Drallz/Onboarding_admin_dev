<template>
    <div class="container">
      <!-- Action Selection Buttons -->
      <div class="type-row">
        <button
          v-for="action in ['active', 'suspended', 'pending']"
          :key="action"
          :class="['type-btn', { active: selectedStatus === action }]"
          @click="handleStatusChange(action)"
        >
          {{ action.charAt(0).toUpperCase() + action.slice(1) }} Admins
        </button>
      </div>
  
      <!-- Add User Button -->
      <div class="add-user-section">
        <button @click="showAddUserModal = true" class="add-btn">
          Add New Admin
        </button>
      </div>
  
      <!-- Loading and Error States -->
      <div v-if="loading" class="status-message">
        Loading...
      </div>
      <div v-else-if="error" class="status-message error">
        {{ error }}
      </div>
  
      <!-- Users Grid -->
      <div v-else class="list-container">
        <div
          v-for="user in filteredUsers"
          :key="user.staffnumber"
          :class="['list-item', { selected: selectedUsers.includes(user.staffnumber) }]"
          @click="toggleUserSelection(user.staffnumber)"
        >
          <div class="item-content">
            <input
              type="checkbox"
              :checked="selectedUsers.includes(user.staffnumber)"
              @change="toggleUserSelection(user.staffnumber)"
              @click.stop
            >
            <div class="user-info">
              <div class="user-name">{{ user.name }} {{ user.lname }}</div>
	      <div class="user-email">
	       {{ user.role === 'Admin' ? 'Manager' : (user.role === 'Assistant' ? 'TLA' : user.role) }}
	      </div>	
              <div class="user-status" :class="{ active: !user.suspended && user.password, suspended: user.suspended, pending: !user.password }">
                {{ user.suspended ? 'Suspended' : user.password ? 'Active' : 'Pending' }}
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Action Buttons -->
      <div class="button-group" v-if="selectedUsers.length > 0">
        <button 
          v-if="selectedStatus !== 'suspended'"
          @click="handleSuspend" 
          class="suspend-btn"
        >
          Suspend Selected ({{ selectedUsers.length }})
        </button>
        <button 
          v-if="selectedStatus === 'suspended'"
          @click="handleReactivate" 
          class="activate-btn"
        >
          Reactivate Selected ({{ selectedUsers.length }})
        </button>
        <button @click="handleDelete" class="delete-btn">
          Delete Selected ({{ selectedUsers.length }})
        </button>
      </div>
  
      <!-- Add User Modal -->
      <div v-if="showAddUserModal" class="modal">
        <div class="modal-content">
          <h2>Add New Admin</h2>
          <form @submit.prevent="handleAddUser">
            <div class="form-group">
              <label>Name</label>
              <input v-model="newUser.name" type="text" required>
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input v-model="newUser.lname" type="text" required>
            </div>
            <div class="form-group">
              <label>Staff Number</label>
              <input v-model="newUser.staffnumber" type="text" required>
            </div>
            <div class="form-group">
              <label>Role</label>
              <select v-model="newUser.role">
                <option value="Admin">Manager</option>
                <option value="Assistant">TLA</option>
              </select>
            </div>
            <div class="modal-buttons">
              <button type="button" @click="showAddUserModal = false" class="cancel-btn">
                Cancel
              </button>
              <button type="submit" class="submit-btn">
                Add Admin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { fetchAllUsers } from '../data/fetch';
  import { suspendUsers, reactivateUsers } from '../data/update';
  import { deleteUsers } from '../data/delete';
  import { addAppUser } from '../data/add';
  
  // Reactive state
  const selectedStatus = ref('active');
  const selectedUsers = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const showAddUserModal = ref(false);
  const newUser = ref({
    name: '',
    lname: '',
    staffnumber: '',
    password: '',
    role: 'user',
  });
  const users = ref([]);
  
  // Computed properties
  const filteredUsers = computed(() => {
    return users.value.filter(user => {
      if (selectedStatus.value === 'active') {
        return !user.suspended && user.password; // Active users have a password
      } else if (selectedStatus.value === 'suspended') {
        return user.suspended; // Suspended users
      } else if (selectedStatus.value === 'pending') {
        return !user.password || user.password.trim() === ''; 
      }
      return false;
    });
  });
  
  // Fetch users on component mount or status change
  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const data = await fetchAllUsers(); // Fetch all users
      const loggedInStaffNumber = computed(() => localStorage.getItem('staffnumber'));
      users.value = data.filter(user => user.staffnumber !== loggedInStaffNumber.value);
    } catch (err) {
      error.value = 'Failed to fetch users';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };
  
  // Handle status change
  const handleStatusChange = (status) => {
    selectedStatus.value = status;
    selectedUsers.value = [];
  };
  
  // Toggle user selection
  const toggleUserSelection = (staffnumber) => {
    const index = selectedUsers.value.indexOf(staffnumber);
    if (index === -1) {
      selectedUsers.value.push(staffnumber);
    } else {
      selectedUsers.value.splice(index, 1);
    }
  };
  
  // Suspend selected users
  const handleSuspend = async () => {
    const pendingUsers = selectedUsers.value.filter(staffnumber => {
        const user = users.value.find(u => u.staffnumber === staffnumber);
        return !user.password; // Check if the user is pending
    });

    if (pendingUsers.length > 0) {
        error.value = 'Pending users cannot be suspended.';
        return;
    }
    try {
      await suspendUsers(selectedUsers.value);
      await fetchUsers();
      selectedUsers.value = [];
      window.location.reload();
    } catch (err) {
      error.value = 'Failed to suspend users';
      console.error(err);
    }
  };
  
  // Reactivate selected users
  const handleReactivate = async () => {
    try {
      await reactivateUsers(selectedUsers.value);
      await fetchUsers();
      selectedUsers.value = [];
      window.location.reload();
    } catch (err) {
      error.value = 'Failed to reactivate users';
      console.error(err);
    }
  };
  
  // Delete selected users
  const handleDelete = async () => {
    try {
      await deleteUsers(selectedUsers.value);
      await fetchUsers();
      selectedUsers.value = [];
      window.location.reload();
    } catch (err) {
      error.value = 'Failed to delete users';
      console.error(err);
    }
  };
  
  // Add a new user
  const handleAddUser = async () => {
    try {
      await addAppUser(newUser.value);
      showAddUserModal.value = false;
      newUser.value = {
        name: '',
        lname: '',
        staffnumber: '',
        password: '',
        role: 'user',
      };
      await fetchUsers();
    } catch (err) {
      error.value = 'Failed to add user';
      console.error(err);
    }
  };
  
  // Fetch users on component mount
  onMounted(fetchUsers);
  </script>
  
  <style scoped>
  /* Styles remain the same as in the original component */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Courier New', Courier, monospace;
  }
  
  .type-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
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

  .user-status.pending {
    background-color: #ffc107;
    color: black;
    }
  
  .type-btn.active {
    background-color: #007bff;
    color: white;
  }
  
  .add-user-section {
    margin: 20px 0;
  }
  
  .add-btn {
    padding: 10px 20px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .add-btn:hover {
    background-color: #218838;
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
    align-items: flex-start;
    gap: 10px;
  }
  
  .user-info {
    flex: 1;
  }
  
  .user-name {
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  .user-email {
    color: #666;
    font-size: 0.9em;
    margin-bottom: 4px;
  }
  
  .user-status {
    font-size: 0.8em;
    padding: 2px 8px;
    border-radius: 12px;
    display: inline-block;
  }
  
  .user-status.active {
    background-color: #28a745;
    color: white;
  }
  
  .user-status.suspended {
    background-color: #dc3545;
    color: white;
  }
  
  .user-status.pending {
    background-color: #ffc107;
    color: black;
  }
  
  .button-group {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  
  .suspend-btn {
    padding: 10px 20px;
    background-color: #ffc107;
    color: black;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .suspend-btn:hover {
    background-color: #e0a800;
  }
  
  .activate-btn {
    padding: 10px 20px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .activate-btn:hover {
    background-color: #218838;
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
  
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-content {
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    width: 100%;
    max-width: 500px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .form-group input,
  .form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
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
  </style>
