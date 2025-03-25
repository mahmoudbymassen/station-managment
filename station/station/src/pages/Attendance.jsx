import React, { useState, useEffect } from 'react';

const Attendance = ({ userRole, userStationId, onLogout }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    present: 0,
    onLeave: 0,
    absent: 0,
  });
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5000/api/attendance', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const text = await response.text();
        if (text.includes('Token is not valid')) onLogout();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }
      const data = await response.json();
      console.log('Fetched attendance:', data);
      setAttendanceData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceData([]);
      if (error.message === 'No token found') onLogout();
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5000/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const text = await response.text();
        if (text.includes('Token is not valid')) onLogout();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }
      const data = await response.json();
      console.log('Fetched employees:', data);
      let filteredEmployees = Array.isArray(data) ? data : [];
      if (userRole === 'manager') {
        filteredEmployees = filteredEmployees.filter(
          emp => emp.stationId === userStationId
        );
      }
      setEmployees(filteredEmployees);
      updateStats(filteredEmployees, attendanceData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
      if (error.message === 'No token found') onLogout();
    }
  };

  const updateStats = (employeesList, attendanceList) => {
    const present = attendanceList.filter(record => record.status === 'Present').length;
    const onLeave = employeesList.filter(employee => employee.StatutEmploye === 'On Leave').length;
    const absent = employeesList.length - present - onLeave;
    setStats({ present, onLeave, absent });
  };

  useEffect(() => {
    if (employees.length > 0) {
      updateStats(employees, attendanceData);
    }
  }, [attendanceData, employees]);

  const handleCheckIn = async (employeeId, employeeName) => {
    try {
      if (!employeeId || !employeeName) {
        throw new Error('Employee ID or Name is missing');
      }

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5000/api/attendance/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: String(employeeId),
          employeeName,
          checkInTime: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'Token is not valid') onLogout();
        throw new Error('Failed to check in: ' + errorData.message);
      }

      await fetchAttendance();
      alert(`Checked in ${employeeName} successfully!`);
      setShowCheckInModal(false);
    } catch (error) {
      console.error('Error checking in:', error);
      alert(error.message || 'An error occurred while checking in');
    }
  };

  const handleCheckOut = async (employeeId) => {
    try {
      if (!employeeId) {
        throw new Error('Employee ID is missing');
      }

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5000/api/attendance/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: String(employeeId),
          checkOutTime: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'Token is not valid') onLogout();
        throw new Error('Failed to check out: ' + errorData.message);
      }

      await fetchAttendance();
      alert('Checked out successfully!');
    } catch (error) {
      console.error('Error checking out:', error);
      alert(error.message || 'An error occurred while checking out');
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const openDetailsModal = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const getAbsentEmployees = () => {
    const presentIds = attendanceData
      .filter(record => record.status === 'Present')
      .map(record => record.employeeId);
    const onLeaveIds = employees
      .filter(employee => employee.StatutEmploye === 'On Leave')
      .map(employee => String(employee.IdEmploye));
    return employees.filter(
      employee => !presentIds.includes(String(employee.IdEmploye)) && !onLeaveIds.includes(String(employee.IdEmploye))
    );
  };

  const getOnLeaveEmployees = () => {
    return employees.filter(employee => employee.StatutEmploye === 'On Leave');
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Attendance</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowCheckInModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Check In
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Present Today</h3>
          <p className="text-3xl font-bold">{stats.present}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">On Leave</h3>
          <p className="text-3xl font-bold">{stats.onLeave}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Absent</h3>
          <p className="text-3xl font-bold">{stats.absent}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Attendance Log</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  attendanceData.map((record) => (
                    <tr key={record._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{record.employeeName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatTime(record.checkIn)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatTime(record.checkOut)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === 'Present'
                              ? 'bg-green-100 text-green-800'
                              : record.status === 'On Leave'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {!record.checkOut && record.checkIn && (
                          <button
                            onClick={() => handleCheckOut(record.employeeId)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Check Out
                          </button>
                        )}
                        <button
                          onClick={() => openDetailsModal(record)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Absent Employees</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getAbsentEmployees().length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                      No absent employees
                    </td>
                  </tr>
                ) : (
                  getAbsentEmployees().map((employee) => (
                    <tr key={employee._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{`${employee.NomEmploye} ${employee.PrenomEmploye}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{employee.CINEmploye}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Employees On Leave</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getOnLeaveEmployees().length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                      No employees on leave
                    </td>
                  </tr>
                ) : (
                  getOnLeaveEmployees().map((employee) => (
                    <tr key={employee._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{`${employee.NomEmploye} ${employee.PrenomEmploye}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{employee.CINEmploye}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCheckInModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/2 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Select Employee to Check In</h2>
            {employees.length === 0 ? (
              <p className="text-gray-500">No employees found</p>
            ) : (
              <ul className="space-y-2">
                {employees
                  .filter(employee => employee.StatutEmploye !== 'On Leave') 
                  .map((employee) => {
                    const isCheckedIn = attendanceData.some(
                      (record) => record.employeeId === String(employee.IdEmploye) && record.checkIn
                    );
                    return (
                      <li key={employee._id} className="flex justify-between items-center p-2 border-b">
                        <span>{`${employee.NomEmploye} ${employee.PrenomEmploye} (CIN: ${employee.CINEmploye})`}</span>
                        {!isCheckedIn ? (
                          <button
                            onClick={() => handleCheckIn(employee.IdEmploye, `${employee.NomEmploye} ${employee.PrenomEmploye}`)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                          >
                            Check In
                          </button>
                        ) : (
                          <span className="text-green-600">Already Checked In</span>
                        )}
                      </li>
                    );
                  })}
              </ul>
            )}
            <button
              onClick={() => setShowCheckInModal(false)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Attendance Details</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee Name</label>
                <input
                  type="text"
                  value={selectedRecord.employeeName}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Check In</label>
                <input
                  type="text"
                  value={formatTime(selectedRecord.checkIn)}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Check Out</label>
                <input
                  type="text"
                  value={formatTime(selectedRecord.checkOut)}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <input
                  type="text"
                  value={selectedRecord.status}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
            </form>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;