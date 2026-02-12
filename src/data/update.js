export const updateDesk = async (deskn, roomn,desk) => {
    try {
      const response = await fetch(`/admin-console/api/update/desks/${deskn}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(desk),
      });
      if (response.ok) {
        console.log('Desk updated successfully');
        return true;
      } else {
        console.error('Failed to update desk:', response.statusText);
        return false;
      }
    } catch (err) {
      console.error('Error updating desk:', err);
      return false;
    }
  };

  export const updateStudent = async (studn, student) => {
    try {
      const response = await fetch(`/admin-console/api/update/students/${studn}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(student),
      });
      if (response.ok) {
        console.log('Student updated successfully');
        return true;
      } else {
        console.error('Failed to update student:', response.statusText);
        return false;
      }
    } catch (err) {
      console.error('Error updating student:', err);
      return false;
    }
  };

  export const updateTrackedStudent = async (studn, deskn, roomn, trackedStudent) => {
    const sanitizedDeskn = (deskn === null || deskn === "") ? 'null' : deskn;
    const sanitizedRoomn = (roomn === null || roomn === "") ? 'null' : roomn;

    try {
      const response = await fetch(`/admin-console/api/update/trackedstudents/${studn}/${sanitizedDeskn}/${sanitizedRoomn}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackedStudent),
      });
      if (response.ok) {
        console.log('Tracked student updated successfully');
        return true;
      } else {
        console.error('Failed to update tracked student:', response.statusText);
        return false;
      }
    } catch (err) {
      console.error('Error updating tracked student:', err);
      return false;
    }
  };

  export const updateRoom = async (roomn, room) => {
    try {
      const response = await fetch(`/admin-console/api/update/rooms/${roomn}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(room),
      });
      if (response.ok) {
        console.log('Room updated successfully');
        return true;
      } else {
        console.error('Failed to update room:', response.statusText);
        return false;
      }
    } catch (err) {
      console.error('Error updating room:', err);
      return false;
    }
  };

  export const suspendUsers = async (staffnumbers) => {
    try {
      const response = await fetch('/admin-console/api/update/users/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffnumbers }),
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to suspend users:', response.statusText);
        return null;
      }
    } catch (err) {
      console.error('Error suspending users:', err);
      return null;
    }
  };

  export const reactivateUsers = async (staffnumbers) => {
    try {
      const response = await fetch('/admin-console/api/update/users/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffnumbers }),
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to reactivate users:', response.statusText);
        return null;
      }
    } catch (err) {
      console.error('Error reactivating users:', err);
      return null;
    }
  };
  
