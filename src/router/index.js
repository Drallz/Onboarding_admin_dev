import { createRouter, createWebHistory } from 'vue-router';
import AddPage from '../components/AddPage.vue';
import ViewPage from '../components/ViewPage.vue';
import Update from '../components/Update.vue';
import Delete from '../components/Delete.vue';
import LoginPage from '../components/LoginPage.vue';
import UsersPage from '../components/UsersPage.vue';
import AddStudent from '../components/AddStudent.vue';
import AddDesk from '../components/AddDesk.vue';

const routes = [
  { path: '/', name: 'Login', component: LoginPage },
  { path: '/add', name: 'Add', component: AddPage },
  { path: '/view', name: 'View', component: ViewPage },
  { path: '/manage/update', name: 'Update', component: Update },
  { path: '/manage/delete', name: 'Delete', component: Delete },
  { path: '/users', name: 'Users', component: UsersPage },
  { path: '/add/student', name: 'AddStudent', component: AddStudent },
  { path: '/add/desk', name: 'AddDesk', component: AddDesk },
  { 
    path: '/logout', 
    name: 'Logout',
    component: {
      template: '<div></div>',
      beforeRouteEnter(to, from, next) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('staffnumber');
        next('/');
      }
    }
  }
];

const router = createRouter({
  history: createWebHistory('/admin-console/'),
  routes,
});

// Global inactivity timer
let inactivityTimeout;

// Function to reset the inactivity timer
const resetInactivityTimer = () => {
  if (inactivityTimeout) {
    clearTimeout(inactivityTimeout);
  }
  inactivityTimeout = setTimeout(logoutUser, 15 * 60 * 1000); // 15 minutes
};

// Function to log out the user
const logoutUser = () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userRole');
  localStorage.removeItem('staffnumber');
  router.push({ name: 'Login' });
};

// Track user activity globally
const trackActivity = () => {
  resetInactivityTimer();
};

// Add event listeners for user activity
window.addEventListener('mousemove', trackActivity);
window.addEventListener('keydown', trackActivity);
window.addEventListener('click', trackActivity);

// Navigation guard to reset the inactivity timer on route changes
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  // Redirect to login if not authenticated
  if (to.name !== 'Login' && !isLoggedIn) {
    next({ name: 'Login' });
  } 
  // Redirect to the view page if already logged in and trying to access the login page
  else if (to.name === 'Login' && isLoggedIn) {
    next({ name: 'View' });
  } 
  // Otherwise, proceed and reset the inactivity timer
  else {
    resetInactivityTimer(); // Reset the timer on every navigation
    next();
  }
});

export default router;
