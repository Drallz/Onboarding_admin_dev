export const fetchDesks = async () => {
    try {
      const response = await fetch('/admin-console/api/fetch/desks');
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to fetch desks:', response.statusText);
        return [];
      }
    } catch (err) {
      console.error('Error fetching desks:', err);
      return [];
    }
  };

  export const fetchStudents = async () => {
    try {
      const response = await fetch('/admin-console/api/fetch/students');
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to fetch students:', response.statusText);
        return [];
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      return [];
    }
  };

  export const fetchTrackedStudents = async () => {
    try {
      const response = await fetch('/admin-console/api/fetch/trackedstudents');
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to fetch tracked students:', response.statusText);
        return [];
      }
    } catch (err) {
      console.error('Error fetching tracked students:', err);
      return [];
    }
  };

  export const fetchRooms = async () => {
    try {
      const response = await fetch('/admin-console/api/fetch/rooms');
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to fetch rooms:', response.statusText);
        return [];
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      return [];
    }
  };

  export const fetchSupervisors = async () => {
    try {
      const response = await fetch('/admin-console/api/fetch/supervisors');
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to fetch rooms:', response.statusText);
        return [];
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      return [];
    }
  };

  export const fetchAllUsers = async () => {
    try {
      const response = await fetch('/admin-console/api/fetch/users');
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to fetch users:', response.statusText);
        return [];
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      return [];
    }
  };

  export const fetchforDelete = async () => {
    try {
      const response = await fetch('/admin-console/api/fetch/studfordel');
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to fetch tracked students:', response.statusText);
        return [];
      }
    } catch (err) {
      console.error('Error fetching tracked students:', err);
      return [];
    }
  };

  export const fetchUsersByStatus = async (status) => {
    try {
      const response = await fetch(`/admin-console/api/fetch/users/${status}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to fetch users by status:', response.statusText);
        return [];
      }
    } catch (err) {
      console.error('Error fetching users by status:', err);
      return [];
    }
  };
  
