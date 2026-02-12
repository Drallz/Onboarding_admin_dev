export const addDesk = async (desk) => {
  try {
    const response = await fetch('/admin-console/api/add/desks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(desk),
    });
    if (response.ok) {
      console.log('Desk added successfully');
      return true;
    } else {
      console.error('Failed to add desk:', response.statusText);
      return false;
    }
  } catch (err) {
    console.error('Error adding desk:', err);
    return false;
  }
};

export const addStudent = async (student) => {
  try {
    const response = await fetch('/admin-console/api/add/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(student),
    });
    if (response.ok) {
      console.log('Student added successfully');
      addTrackedStudent(student);
      return true;
    } else {
      console.error('Failed to add student:', response.statusText);
      return false;
    }
  } catch (err) {
    console.error('Error adding student:', err);
    return false;
  }
};

export const addTrackedStudent = async (trackedStudent) => {
  try {
    const response = await fetch('/admin-console/api/add/trackedstudents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackedStudent),
    });
    if (response.ok) {
      console.log('Tracked student added successfully');
      return true;
    } else {
      console.error('Failed to add tracked student:', response.statusText);
      return false;
    }
  } catch (err) {
    console.error('Error adding tracked student:', err);
    return false;
  }
};

export const addUser = async (userData) => {
  try {
    const response = await fetch('/admin-console/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Failed to add user:', response.statusText);
      return null;
    }
  } catch (err) {
    console.error('Error adding user:', err);
    return null;
  }
};

export const addAppUser = async (userData) => {
  try {
    const response = await fetch('/admin-console/api/add/users/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Failed to add user:', response.statusText);
      return null;
    }
  } catch (err) {
    console.error('Error adding user:', err);
    return null;
  }
};
