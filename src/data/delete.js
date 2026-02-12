  export const deleteDesk = async (deskn) => {
    try {
      const response = await fetch(`/admin-console/api/delete/desks/${deskn}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        console.log('Desk deleted successfully');
        return true;
      } else {
        console.error('Failed to delete desk:', response.statusText);
        return false;
      }
    } catch (err) {
      console.error('Error deleting desk:', err);
      return false;
    }
  };

  export const deleteStudent = async (studn) => {
    try {
      const response = await fetch(`/admin-console/api/delete/students/${studn}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        console.log('Student deleted successfully');
        return true;
      } else {
        console.error('Failed to delete student:', response.statusText);
        return false;
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      return false;
    }
  };
  
  export const deleteTrackedStudent = async (studn) => {
    try {
      const response = await fetch(`/admin-console/api/delete/trackedstudents/${studn}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        console.log('Tracked student deleted successfully');
        return true;
      } else {
        console.error('Failed to delete tracked student:', response.statusText);
        return false;
      }
    } catch (err) {
      console.error('Error deleting tracked student:', err);
      return false;
    }
  };

  export const deleteUser = async (staffNumber) => {
    try {
      const response = await fetch(`/admin-console/api/users/${staffNumber}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to delete user:', response.statusText);
        return null;
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      return null;
    }
  };

export const deleteUsers = async (staffnumbers) => {
    // Convert reactive Proxy array to a plain array
    const plainArray = [...staffnumbers]; // or Array.from(staffnumbers)

    try {
        const response = await fetch('/admin-console/api/delete/users/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ staffnumbers: plainArray }),
        });
  
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to delete users:', response.statusText);
        return null;
      }
    } catch (err) {
      console.error('Error deleting users:', err);
      return null;
    }
  };
