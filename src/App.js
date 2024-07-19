import React, { useState, useEffect } from 'react';

const initialStudentData = [
  { 
    id: 's000001', 
    name: 'Zhang San', 
    class: '3A', 
    classNumber: '1', 
    grades: { Math: 85, English: 90, Science: 88 }, 
    strengths: ['Critical thinking', 'Leadership'], 
    weaknesses: ['Time management'], 
    medicalRecords: [
      { pic: 'Dr. Li', time: '2023-05-15', hospital: 'City Hospital', treatment: 'Annual checkup', remark: 'All clear' }
    ],
    remark: 'Excellent student',
    academicResults: []
  },
  // ... (other student data)
];

const subjects = [
  'English Language', 'Chinese Language', 'Mathematics', 'Liberal Studies',
  'Physics', 'Chemistry', 'Biology', 'Economics', 'Business, Accounting and Financial Studies',
  'History', 'Chinese History', 'Geography', 'Information and Communication Technology',
  'Music', 'Visual Arts', 'Physical Education'
];

const StudentManagementSystem = () => {
  const [students, setStudents] = useState(() => {
    const savedStudents = localStorage.getItem('students');
    return savedStudents ? JSON.parse(savedStudents) : initialStudentData;
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [newMedicalRecord, setNewMedicalRecord] = useState({ 
    pic: '', time: '', hospital: '', treatment: '', remark: '' 
  });
  const [newAcademicResult, setNewAcademicResult] = useState({
    form: 'F1', term: 'First Term', subject: subjects[0], marks: ''
  });
  const [confirmAction, setConfirmAction] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.classNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });


  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const validateStudent = (student) => {
    const errors = {};
    if (!student.id) errors.id = "Student ID is required";
    if (!student.name) errors.name = "Name is required";
    if (!student.class) {
      errors.class = "Class is required";
    } else if (!/^[1-6][A-F]$/.test(student.class)) {
      errors.class = "Class must be in format [1-6][A-F]";
    }
    if (!student.classNumber) {
      errors.classNumber = "Class number is required";
    } else {
      const num = parseInt(student.classNumber);
      if (isNaN(num) || num < 1 || num > 39) {
        errors.classNumber = "Class number must be between 1 and 39";
      }
    }
    return errors;
  };

  const handleAddStudent = (newStudent) => {
    const errors = validateStudent(newStudent);
    if (Object.keys(errors).length === 0) {
      const newStudentWithId = { ...newStudent, id: `s${String(students.length + 1).padStart(6, '0')}` };
      setStudents([...students, newStudentWithId]);
      setSelectedStudent(newStudentWithId);  // Keep the new student selected
      setValidationErrors({});
    } else {
      setValidationErrors(errors);
    }
  };

  const handleDeleteStudent = () => {
    setConfirmAction({
      message: 'Are you sure you want to delete this student? This action cannot be undone.',
      onConfirm: () => {
        setStudents(students.filter(student => student.id !== selectedStudent.id));
        setSelectedStudent(null);
        setConfirmAction(null);
      }
    });
  };

  const handleUpdateStudent = (updatedStudent) => {
    const errors = validateStudent(updatedStudent);
    if (Object.keys(errors).length === 0) {
      setStudents(students.map(student => student.id === updatedStudent.id ? updatedStudent : student));
      setSelectedStudent(updatedStudent);
      setValidationErrors({});
    } else {
      setValidationErrors(errors);
    }
  };

  const handleAddMedicalRecord = () => {
    if (selectedStudent && newMedicalRecord.pic && newMedicalRecord.time && newMedicalRecord.hospital && newMedicalRecord.treatment) {
      const updatedStudent = {
        ...selectedStudent,
        medicalRecords: [...(selectedStudent.medicalRecords || []), newMedicalRecord]
      };
      if (selectedStudent.id) {
        // Existing student: update
        handleUpdateStudent(updatedStudent);
      } else {
        // New student: update local state only
        setSelectedStudent(updatedStudent);
      }
      setNewMedicalRecord({ pic: '', time: '', hospital: '', treatment: '', remark: '' });
    }
  };

  const handleDeleteMedicalRecord = (index) => {
    setConfirmAction({
      message: 'Are you sure you want to delete this medical record? This action cannot be undone.',
      onConfirm: () => {
        const updatedMedicalRecords = selectedStudent.medicalRecords.filter((_, i) => i !== index);
        const updatedStudent = {
          ...selectedStudent,
          medicalRecords: updatedMedicalRecords
        };
        handleUpdateStudent(updatedStudent);
        setConfirmAction(null);
      }
    });
  };

  const handleAddAcademicResult = () => {
    if (selectedStudent && newAcademicResult.marks.trim() !== '') {
      const updatedStudent = {
        ...selectedStudent,
        academicResults: [...(selectedStudent.academicResults || []), newAcademicResult]
      };
      handleUpdateStudent(updatedStudent);
      setNewAcademicResult({
        form: 'F1', term: 'First Term', subject: subjects[0], marks: ''
      });
    }
  };

  const handleDeleteAcademicResult = (index) => {
    setConfirmAction({
      message: 'Are you sure you want to delete this academic result? This action cannot be undone.',
      onConfirm: () => {
        const updatedAcademicResults = selectedStudent.academicResults.filter((_, i) => i !== index);
        const updatedStudent = {
          ...selectedStudent,
          academicResults: updatedAcademicResults
        };
        handleUpdateStudent(updatedStudent);
        setConfirmAction(null);
      }
    });
  };

  const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded-lg">Confirm</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-100 min-h-screen">
      {confirmAction && (
        <ConfirmationModal
          message={confirmAction.message}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Student Management System</h1>
      <div className="flex justify-between mb-6">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={() => setSelectedStudent({ id: '', name: '', class: '', classNumber: '', grades: {}, strengths: [], weaknesses: [], medicalRecords: [], remark: '', academicResults: [] })}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
        >
          Add New Student
        </button>
      </div>
      <div className="flex gap-6">
        <div className="w-1/3 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Student List</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 font-bold mb-2">
              <span onClick={() => handleSort('name')} className="cursor-pointer">Name {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}</span>
              <span onClick={() => handleSort('class')} className="cursor-pointer">Class {sortField === 'class' && (sortDirection === 'asc' ? '▲' : '▼')}</span>
              <span onClick={() => handleSort('classNumber')} className="cursor-pointer">Number {sortField === 'classNumber' && (sortDirection === 'asc' ? '▲' : '▼')}</span>
            </div>
            {filteredStudents.map(student => (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`p-3 rounded-md cursor-pointer transition duration-300 ease-in-out ${
                  selectedStudent === student ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                }`}
              >
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-medium">{student.name}</span>
                  <span>{student.class}</span>
                  <span>{student.classNumber}</span>
                </div>
                <span className="text-sm text-gray-500">{student.id}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="w-2/3">
          {selectedStudent ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                {selectedStudent.id ? `${selectedStudent.name}'s Profile` : 'New Student'}
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Student ID</p>
                  <input
                    value={selectedStudent.id}
                    onChange={(e) => setSelectedStudent({...selectedStudent, id: e.target.value})}
                    className={`w-full border rounded p-1 ${validationErrors.id ? 'border-red-500' : ''}`}
                    placeholder="s000000"
                  />
                  {validationErrors.id && <p className="text-red-500 text-xs mt-1">{validationErrors.id}</p>}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <input
                    value={selectedStudent.name}
                    onChange={(e) => setSelectedStudent({...selectedStudent, name: e.target.value})}
                    className={`w-full border rounded p-1 ${validationErrors.name ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Class</p>
                  <input
                    value={selectedStudent.class}
                    onChange={(e) => setSelectedStudent({...selectedStudent, class: e.target.value})}
                    className={`w-full border rounded p-1 ${validationErrors.class ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.class && <p className="text-red-500 text-xs mt-1">{validationErrors.class}</p>}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Class Number</p>
                  <input
                    value={selectedStudent.classNumber}
                    onChange={(e) => setSelectedStudent({...selectedStudent, classNumber: e.target.value})}
                    className={`w-full border rounded p-1 ${validationErrors.classNumber ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.classNumber && <p className="text-red-500 text-xs mt-1">{validationErrors.classNumber}</p>}
                </div>
              </div>
              <div>
              <p className="text-sm text-gray-600">Strengths</p>
              <input
                value={selectedStudent.strengths.join(', ')}
                onChange={(e) => setSelectedStudent({...selectedStudent, strengths: e.target.value.split(', ')})}
                className="w-full border rounded p-1"
                placeholder="Separate strengths with commas"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">Weaknesses</p>
              <input
                value={selectedStudent.weaknesses.join(', ')}
                onChange={(e) => setSelectedStudent({...selectedStudent, weaknesses: e.target.value.split(', ')})}
                className="w-full border rounded p-1"
                placeholder="Separate weaknesses with commas"
              />
            </div>
              <div className="space-y-6">
                {/* Grades, Strengths, and Weaknesses sections remain unchanged */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">Medical Records</h3>
                  {selectedStudent.medicalRecords.map((record, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md mb-2 flex justify-between items-start">
                      <div>
                        <p><strong>PIC:</strong> {record.pic}</p>
                        <p><strong>Date:</strong> {record.time}</p>
                        <p><strong>Hospital:</strong> {record.hospital}</p>
                        <p><strong>Treatment:</strong> {record.treatment}</p>
                        <p><strong>Remark:</strong> {record.remark}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteMedicalRecord(index)}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded-lg transition duration-300 ease-in-out"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  <div className="mt-4 space-y-2">
                    <input
                      value={newMedicalRecord.pic}
                      onChange={(e) => setNewMedicalRecord({...newMedicalRecord, pic: e.target.value})}
                      placeholder="PIC"
                      className="w-full border rounded p-1"
                      required
                    />
                    <input
                      type="date"
                      value={newMedicalRecord.time}
                      onChange={(e) => setNewMedicalRecord({...newMedicalRecord, time: e.target.value})}
                      className="w-full border rounded p-1"
                      required
                    />
                    <input
                      value={newMedicalRecord.hospital}
                      onChange={(e) => setNewMedicalRecord({...newMedicalRecord, hospital: e.target.value})}
                      placeholder="Hospital"
                      className="w-full border rounded p-1"
                      required
                    />
                    <input
                      value={newMedicalRecord.treatment}
                      onChange={(e) => setNewMedicalRecord({...newMedicalRecord, treatment: e.target.value})}
                      placeholder="Treatment"
                      className="w-full border rounded p-1"
                      required
                    />
                    <input
                      value={newMedicalRecord.remark}
                      onChange={(e) => setNewMedicalRecord({...newMedicalRecord, remark: e.target.value})}
                      placeholder="Remark (optional)"
                      className="w-full border rounded p-1"
                    />
                    <button 
                      onClick={handleAddMedicalRecord}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded-lg transition duration-300 ease-in-out"
                      disabled={!newMedicalRecord.pic || !newMedicalRecord.time || !newMedicalRecord.hospital || !newMedicalRecord.treatment}
                    >
                      Add Medical Record
                    </button>
                  </div>
                </div>
                
                {/* Academic Results section remains unchanged */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">Remark</h3>
                  <textarea
                    value={selectedStudent.remark}
                    onChange={(e) => setSelectedStudent({...selectedStudent, remark: e.target.value})}
                    className="w-full border rounded p-2"
                    rows="3"
                  />
                </div>
              </div>
              <div className="mt-6 space-x-2">
              {students.some(student => student.id === selectedStudent.id) ? (
  <>
    <button 
      onClick={() => handleUpdateStudent(selectedStudent)}
      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
    >
      Update Student
    </button>
    <button
      onClick={handleDeleteStudent}
      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
    >
      Delete Student
    </button>
  </>
) : (
  <button 
    onClick={() => handleAddStudent(selectedStudent)}
    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
  >
    Add Student
  </button>
)}
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg">Please select a student to view their details or click "Add New Student" to create a new record.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentManagementSystem;