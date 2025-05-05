import React, { useEffect, useState, useRef } from 'react';
import Select from 'react-select';
import {
  Table, Button, Modal, Form, Pagination, Spinner, Row, Col, InputGroup, FormControl
} from 'react-bootstrap';
import Swal from 'sweetalert2';
import { Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import api from '../../api/axios';

function SchoolEnrollment() {
  const [enrollments, setEnrollments] = useState([]); 
  const [formDataStudent, setFormDataStudent] = useState({
    student_id: '' 
  });
  const [formDataClass, setFormDataClass] = useState({ 
    class_id: ''
  });
  const [students, setStudents] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeSy, setActiveSy] = useState([]);
  const [classSubjectRows, setClassSubjectRows] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [classSubjectsAdded, setClassSubjectsAdded] = useState([]);
  const [newRow, setNewRow] = useState({
    subject: null,
    timeFrom: '',
    timeTo: '',
    maxEnrolled: '',
    room_name: ''
  });

  const classSubjectRef = useRef(null);

  const fetchData = async (page = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/school-enrolled-subject/list?page=${page}&searchTerm=${searchTerm}`);
      setEnrollments(res.data.data);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      Swal.fire('Error', 'Failed to load enrollments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSy = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/school-year/view/active`);
      setActiveSy(res.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to load enrollments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/students/list');
      setStudents(res.data.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to load students.', 'error');
    }
  };

  const fetchClassSubjects = async (class_id) => {
    try {
      const res = await api.get('/admin/school-class-subject/list/'+class_id);
      setClassSubjects(res.data.data);
      console.log('subjects selection',res.data.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to load class subjects.', 'error');
    }
  };

  const fetchClasses = async () => {
    try { 
      const res = await api.get('/admin/school-class/list/'+activeSy._id);
      setClasses(res.data.data);
      console.log('current classes',res.data.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to load class subjects.', 'error');
    }
  };

  useEffect(() => {
    fetchData();
    fetchActiveSy();
  }, []);

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [searchTerm, currentPage]);
 
  const handleShowModal = (mode, item = null) => {
    fetchStudents(); 
    fetchClasses();

    setModalMode(mode);
    setSelected(item);
    if (item) {
      setFormDataStudent({
        student_id: item.student_id?._id || '' 
      });
    } else {
      setFormDataStudent({
        student_id: '' 
      });
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDataStudent(prev => ({ ...prev, [name]: value }));
    setFormDataClass(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (modalMode === 'add') {

        formDataStudent.subjects = classSubjectRows;

        res = await api.post('/admin/school-enrollment/add', formDataStudent);
      } else if (modalMode === 'edit' && selected) {
        res = await api.put(`/admin/school-enrollment/edit/${selected._id}`, formDataStudent);
      }

      if (res.data.success) {
        Swal.fire('Success', modalMode === 'add' ? 'Added successfully!' : 'Updated!', 'success');
        fetchData(currentPage);
        setShowModal(false);
      } else {
        Swal.fire('Error', res.data.message || 'Failed to save.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Something went wrong.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This enrollment will be deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      confirmButtonColor: '#d33',
    });

    if (confirm.isConfirmed) {
      setLoading(true);
      try {
        const res = await api.delete(`/admin/enrollment/delete/${id}`);
        if (res.data.success) {
          Swal.fire('Deleted!', 'Enrollment deleted.', 'success');
          fetchData(currentPage);
        } else {
          Swal.fire('Error', res.data.message || 'Delete failed.', 'error');
        }
      } catch {
        Swal.fire('Error', 'Something went wrong.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const updateSubjects = (class_id) => {
     fetchClassSubjects(class_id);
  };

  
  const handleAddRow = () => {
    if (!newRow.subject) {
      Swal.fire('Error', 'Subject Required!', 'error');
      return;
    }

    const newEntry = {
      id: newRow.subject.value,
      subject: newRow.subject.label.split(' | ')[0],
      timeFrom: newRow.subject.label.split(' | ')[1]?.trim().split(' - ')[0],
      timeTo: newRow.subject.label.split(' | ')[1]?.trim().split(' - ')[1],
      room: { label: newRow.subject.label.split(' | ')[2]?.trim() },
      teacher: { label: newRow.subject.label.split(' | ')[3]?.trim() },
      remarks: newRow.remarks || '',
    };

    // Prevent duplicates
    const isDuplicate = classSubjectRows.some(row => row.id === newEntry.id);
    if (isDuplicate) {
      Swal.fire('Error', 'This subject has already been added.', 'error');
      return;
    }

    if (editIndex !== null) {
      // Update existing
      const updatedRows = [...classSubjectRows];
      updatedRows[editIndex] = newEntry;
      setClassSubjectRows(updatedRows);
      setEditIndex(null);
    } else {
      // Add new
      setClassSubjectRows(prev => [...prev, newEntry]);

      // Remove added subject from dropdown
      setClassSubjects(prev => prev.filter(subj => subj._id !== newRow.subject.value));
      setClassSubjectsAdded(prev => [...prev, newRow.subject]);
    }

    // Reset form
    setNewRow({ subject: null, maxEnrolled: '', timeFrom: '', timeTo: '', room_name: '', remarks: '' }); 
  };
 
  const handleDeleteRow = (index) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This subject will be removed from the list.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        const updatedRows = [...classSubjectRows];
        updatedRows.splice(index, 1);
        setClassSubjectRows(updatedRows);
      }
    });
  };


  return (
    <div>
      <Row className="justify-content-between mb-3">
        <Col xs="auto"><h3>Enrollments</h3></Col>
        <Col xs="auto">
          <div className="d-flex flex-wrap justify-content-md-end justify-content-center align-items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => handleShowModal('add')}>Add Enrollment</Button>
            <InputGroup size="sm">
              <FormControl
                type="search"
                placeholder="Search..."
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
            </InputGroup>
          </div>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student</th>
              <th>Grade</th>
              <th>Subject</th>
              <th>Schedule</th>
              <th>Room</th>
              <th>Teacher</th>
              <th>Enrollment Date</th> 
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map(enrollment => (
              <tr key={enrollment._id}>
                <td>{enrollment.student_id?.student_id || 'N/A'}</td>
                <td>{enrollment.student_id?.first_name} {enrollment.student_id?.last_name}</td>
                <td>{enrollment.class_subject_id?.class_id?.school_level_id?.level_name || 'N/A'}</td>
                <td>{enrollment.class_subject_id?.subject_id?.subject_name || 'N/A'}</td>
                <td>
                  {enrollment.class_subject_id?.time_from} - {enrollment.class_subject_id?.time_to}
                </td>
                <td>{enrollment.class_subject_id?.room_id?.room_name || 'N/A'}</td>
                <td>{enrollment.class_subject_id?.employee_id?.first_name} {enrollment.class_subject_id?.employee_id?.last_name}</td>
                <td>{new Date(enrollment.created_datetime).toLocaleDateString()}</td> 
                <td>
                  <Button variant="warning" size="sm" onClick={() => handleShowModal('edit', enrollment)}>
                    <PencilSquare />
                  </Button>{' '}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(enrollment._id)}>
                    <Trash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Pagination className="justify-content-end mt-3">
        {[...Array(totalPages)].map((_, idx) => (
          <Pagination.Item
            key={idx + 1}
            active={idx + 1 === currentPage}
            onClick={() => setCurrentPage(idx + 1)}
          >
            {idx + 1}
          </Pagination.Item>
        ))}
      </Pagination>

      <Modal className="modal modal-xl" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === 'add' ? 'Add Enrollment' : 'Edit Enrollment'}&nbsp;{activeSy.school_year}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="row mb-3">
              <div className="col-md-6">
                <Form.Group controlId="student_id">
                  <Form.Label>Student</Form.Label>
                  <Select
                        className="w-100"
                        isSearchable={true}
                        options={students.map(s => ({
                          value: s._id,
                          label: `${s.student_id} | ${s.first_name} ${s.last_name}`
                        }))}
                        value={students.find(s => s._id === formDataStudent.student_id) ? {
                          value: formDataStudent.student_id,
                          label: students.find(s => s._id === formDataStudent.student_id).student_id + ' ' +
                                 students.find(s => s._id === formDataStudent.student_id).first_name + ' ' +
                                 students.find(s => s._id === formDataStudent.student_id).last_name
                        } : null}
                        onChange={option => handleInputChange({
                          target: {
                            name: 'student_id',
                            value: option ? option.value : ''
                          }
                        })}
                        required
                      />
                </Form.Group>
              </div> 
              <div className="col-md-6">

                <Form.Group controlId="student_id">
                  <Form.Label>Open Classes</Form.Label>
                  <Select
                    className="w-100"
                    isSearchable={true}
                    options={classes.map(s => ({
                      value: s._id,
                      label: `${s.school_level_id?.level_name} | ${s.school_section_id?.section_name} | ${s.employee_id?.employee_title} ${s.employee_id?.first_name} ${s.employee_id?.last_name}`
                    }))}
                    value={classes.find(s => s._id === formDataClass.class_id) ? {
                      value: formDataClass.class_id,
                      label: classes.find(s => s._id === formDataClass.class_id).school_level_id?.level_name + ' | ' +
                             classes.find(s => s._id === formDataClass.class_id).school_section_id?.section_name + ' | ' +
                             classes.find(s => s._id === formDataClass.class_id).employee_id?.employee_title + ' ' +
                             classes.find(s => s._id === formDataClass.class_id).employee_id?.first_name + ' ' +
                             classes.find(s => s._id === formDataClass.class_id).employee_id?.last_name
                    } : null}
                    onChange={option => {
                      handleInputChange({
                        target: {
                          name: 'class_id',
                          value: option ? option.value : ''
                        }
                      });
                      updateSubjects(option?.value); // optionally pass selected class ID if needed
                    }}
                  />

                </Form.Group>

              </div>
              <div className="col-md-12">

                <p></p>

                  <Row className="mb-2">
                    <div className="col-8"> 
                    <Select
                      value={newRow.subject}
                      onChange={(selectedOption) =>
                        setNewRow((prev) => ({ ...prev, subject: selectedOption }))
                      }
                      options={classSubjects.map((sub) => ({
                        value: sub._id,
                        label: sub.subject_id?.subject_name + ' | ' + sub.time_from + ' - ' + sub.time_to  + ' | ' + sub.room_id?.room_name  + ' | ' + sub.employee_id?.employee_title + ' ' + sub.employee_id?.first_name + ' ' + sub.employee_id?.last_name

                      }))}
                    />

                    </div>
                    <div className="col-3">
                      <Form.Control
                        type="text"
                        placeholder="Remarks"
                        value={newRow.remarks}
                        onChange={e => setNewRow(prev => ({ ...prev, remarks: e.target.value }))}
                      />
                    </div>
                    <div className="col-1">
                      <Button className="w-100" onClick={handleAddRow}>Add</Button>
                    </div>
                  </Row>


                  <Table bordered>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Time</th>
                        <th>Room</th>
                        <th>Teacher</th> 
                        <th>Remarks</th> 
                        <th>Actions</th> 
                      </tr>
                    </thead>
                    <tbody>
                      {classSubjectRows.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.subject}</td>
                          <td>{row.timeFrom} - {row.timeTo}</td>
                          <td>{row.room.label}</td>
                          <td>{row.teacher?.label || '-'}</td> 
                          <td>{row.remarks}</td> {/* This is the remarks column */}
                          <td> 
                            <Button variant="danger" size="sm" onClick={() => handleDeleteRow(idx)}><Trash /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>


              </div>
            </div> 
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{modalMode === 'add' ? 'Save' : 'Update'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default SchoolEnrollment;
