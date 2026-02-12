<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchAllUsers } from '../data/fetch';

const router = useRouter();
const staffNumber = ref('');
const password = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const currentStep = ref('staffNumber'); // 'staffNumber', 'password', 'createPassword', 'changePassword'
const currentUser = ref(null);

const checkStaffNumber = async () => {
  if (!staffNumber.value) {
    errorMessage.value = 'Please enter your staff number';
    return;
  }

  try {
    isLoading.value = true;

    // Fetch the user from the backend
    const response = await fetch(`/admin-console/api/fetch/get-user?staffnumber=${staffNumber.value}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const user = await response.json();

    if (user) {
      currentUser.value = user;
      errorMessage.value = '';
      if (user.password) {
        currentStep.value = 'password';
      } else {
        currentStep.value = 'createPassword';
      }
    } else {
      errorMessage.value = 'Invalid staff number';
    }
  } catch (err) {
    console.error('Staff number check error:', err);
    errorMessage.value = 'An error occurred while checking staff number';
  } finally {
    isLoading.value = false;
  }
};

const handlePasswordSubmit = async () => {
  if (!password.value) {
    errorMessage.value = 'Please enter your password';
    return;
  }



  try {
    isLoading.value = true;

    const response = await fetch('/admin-console/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        staffnumber: currentUser.value.staffnumber,
        password: password.value,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to login');
    }

    const data = await response.json();
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', data.role);
    localStorage.setItem('staffnumber', data.staffnumber);
    errorMessage.value = '';

    if(data.status === true){
      errorMessage.value = 'You were suspended'
      return;
    }
    router.push('/view');
  } catch (err) {
    console.error('Login error:', err);
    errorMessage.value = err.message || 'An error occurred during login';
  } finally {
    isLoading.value = false;
  }
};

const handleCreatePassword = async () => {
  if (!newPassword.value || !confirmPassword.value) {
    errorMessage.value = 'Please fill in all password fields';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match';
    return;
  }

  if (newPassword.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long';
    return;
  }

  try {
    isLoading.value = true;

    // Call the API to update the password
    const response = await fetch('/admin-console/api/update/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        staffnumber: currentUser.value.staffnumber,
        newPassword: newPassword.value,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create password');
    }

    // Update the local state and redirect
    currentUser.value.password = newPassword.value;
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', currentUser.value.role);
    localStorage.setItem('staffnumber', currentUser.value.staffnumber);
    router.push('/view');
  } catch (err) {
    console.error('Password creation error:', err);
    errorMessage.value = err.message || 'An error occurred while creating password';
  } finally {
    isLoading.value = false;
  }
};

const switchToChangePassword = () => {
  currentStep.value = 'changePassword';
  password.value = '';
  errorMessage.value = '';
};

const handleChangePassword = async () => {
  if (!password.value || !newPassword.value || !confirmPassword.value) {
    errorMessage.value = 'Please fill in all password fields';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'New passwords do not match';
    return;
  }

  if (newPassword.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long';
    return;
  }

  try {
    isLoading.value = true;

    // Call the API to update the password
    const response = await fetch('/admin-console/api/update/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        staffnumber: currentUser.value.staffnumber,
        currentPassword: password.value,
        newPassword: newPassword.value,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to change password');
    }

    // Update the local state and clear fields
    currentUser.value.password = newPassword.value;
    password.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    errorMessage.value = 'Password successfully changed';
  } catch (err) {
    console.error('Password change error:', err);
    errorMessage.value = err.message || 'An error occurred while changing password';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-box">

      <div class="login-image">
        
        <img src="/mss-wits-logo.png" />

      </div>
	<h1 class='custom-heading'>Post Graduate Portal for TW Kambule</h1>      
      <!-- Staff Number Step -->
      <form v-if="currentStep === 'staffNumber'" @submit.prevent="checkStaffNumber">
        <div class="form-group">
          <input
            id="staff-number"
            type="text"
            required
            v-model="staffNumber"
            placeholder="Enter staff number"
            autofocus
          />
        </div>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Checking...' : 'Continue' }}
        </button>
      </form>

      <!-- Password Step -->
      <form v-if="currentStep === 'password'" @submit.prevent="handlePasswordSubmit">
        <div class="form-group">
          <input
            id="password"
            type="password"
            required
            v-model="password"
            placeholder="Enter password"
            autofocus
          />
        </div>
        <div class="password-actions">
          <button type="button" class="link-button" @click="switchToChangePassword">
            Change Password
          </button>
          <button type="button" class="link-button" @click="currentStep = 'staffNumber'">
            Back
          </button>
        </div>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <!-- Create Password Step -->
      <form v-if="currentStep === 'createPassword'" @submit.prevent="handleCreatePassword">
        <div class="form-group">
          <label for="new-password">Create Password</label>
          <input
            id="new-password"
            type="password"
            required
            v-model="newPassword"
            placeholder="Enter new password"
            autofocus
          />
        </div>
        <div class="form-group">
          <label for="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            type="password"
            required
            v-model="confirmPassword"
            placeholder="Confirm new password"
          />
        </div>
        <div class="password-requirements">
          Password must be at least 8 characters long
        </div>
        <div class="password-actions">
          <button type="button" class="link-button" @click="currentStep = 'staffNumber'">
            Back
          </button>
        </div>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Creating...' : 'Create Password' }}
        </button>
      </form>

      <!-- Change Password Step -->
      <form v-if="currentStep === 'changePassword'" @submit.prevent="handleChangePassword">
        <div class="form-group">
          <label for="current-password">Current Password</label>
          <input
            id="current-password"
            type="password"
            required
            v-model="password"
            placeholder="Enter current password"
            autofocus
          />
        </div>
        <div class="form-group">
          <label for="new-password">New Password</label>
          <input
            id="new-password"
            type="password"
            required
            v-model="newPassword"
            placeholder="Enter new password"
          />
        </div>
        <div class="form-group">
          <label for="confirm-password">Confirm New Password</label>
          <input
            id="confirm-password"
            type="password"
            required
            v-model="confirmPassword"
            placeholder="Confirm new password"
          />
        </div>
        <div class="password-requirements">
          Password must be at least 8 characters long
        </div>
        <div class="password-actions">
          <button type="button" class="link-button" @click="currentStep = 'password'">
            Back
          </button>
        </div>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Changing...' : 'Change Password' }}
        </button>
      </form>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-image {
  margin-bottom: 1.5rem;
}

.login-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #357abd;
}

.password-actions {
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
}

.link-button {
  background: none;
  border: none;
  color: #4a90e2;
  cursor: pointer;
  padding: 0;
  font-size: 0.875rem;
  width: auto;
  margin: 0;
}

.link-button:hover {
  text-decoration: underline;
  background: none;
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.password-requirements {
  color: #666;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.custom-heading {
  font-size: 1.875rem;    /* text-3xl */
  font-weight: 600;       /* font-semibold */
  text-align: center;     /* text-center */
  color: #6b7280;         /* text-gray-500 */
  margin-bottom: 1rem;    /* mb-4 */
}
</style>
