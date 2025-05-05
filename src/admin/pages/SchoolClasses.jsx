import React, { useEffect, useState, useRef } from 'react';
import Select from 'react-select';
import {
  Table, Button, Modal, Form, Pagination, Spinner, Row, Col, InputGroup, FormControl
} from 'react-bootstrap';
import Swal from 'sweetalert2';
import { Eye, PencilSquare, Trash, Files, Plus } from 'react-bootstrap-icons';
import api from '../../api/axios';

function SchoolClasses() {
  const [classes, setClasses] = useState([]);
  const [years, setYears] = useState([]);
  const [levels, setLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [formData, setFormData] = useState({ 
    school_year_id: '',
    school_level_id: '',
    employee_id: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [subjectRows, setSubjectRows] = useState([]);
  const [newRow, setNewRow] = useState({
    subject: null,
    timeFrom: '',
    timeTo: '',
    maxEnrolled: '',
    room_name: ''
  });
  const subjectRef = useRef(null);
  const roomRef = useRef(null);

  const fetchClasses = async (page = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/school-class/list?page=${page}&searchTerm=${searchTerm}`);
      setClasses(res.data.data);
      setFiltered(res.data.data); 
      setCurrentPage(res.data.currentPage || 1);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      Swal.fire('Error', 'Failed to load school classes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async () => {
    try {
      const res = await api.get(`/admin/school-level/list`);
      setLevels(res.data.data || []);
    } catch {
      Swal.fire('Error', 'Failed to load school levels.', 'error');
    }
  };

  const loadSections = (e) =>{
    const { name, value } = e.target;
    fetchSections(value);
  }

  const fetchSections = async (level_id) => {
    try {
      const res = await api.get(`/admin/school-section/list/${level_id}`);
      setSections(res.data.data || []);
    } catch {
      Swal.fire('Error', 'Failed to load school sections.', 'error');
    }
  };
 
  const fetchSubjects = async (level_id) => {
    try {
      const res = await api.get(`/admin/school-subject/list/${level_id}`);
      setSubjects(res.data.data || []);
    } catch {
      Swal.fire('Error', 'Failed to load subjects.', 'error');
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get(`/admin/school-room/list`);
      setRooms(res.data.data || []);
    } catch {
      Swal.fire('Error', 'Failed to load subjects.', 'error');
    }
  };

  const fetchClassSubjects = async () => {
    try {
      const res = await api.get(`/admin/school-class-subject/list/${selected._id}`);
      const data = res.data.data || [];

      const updatedRows = data.map((item, index) => ({
        idx: index + 1,
        _id: item._id,
        subject: { label: item.subject_id?.subject_name, value: item.subject_id?._id },
        timeFrom: item.time_from,
        timeTo: item.time_to,
        room: { label: item.room_id?.room_name, value: item.room_id?._id  },
        maxEnrolled: item.max_enrolled
      }));
  
      setSubjectRows(updatedRows);
    } catch {
      Swal.fire('Error', 'Failed to load class subjects.', 'error');
    }
  };

  const handleAddRow = () => {
    const { subject, timeFrom, timeTo, room, maxEnrolled } = newRow;

    if (!subject) {
      return Swal.fire('Error', 'Subject is required.', 'error');
    }
    if (!timeFrom) {
      return Swal.fire('Error', 'Time From is required.', 'error');
    }
    if (!timeTo) {
      return Swal.fire('Error', 'Time To is required.', 'error');
    }

    const fromMinutes = parseTimeToMinutes(timeFrom);
    const toMinutes = parseTimeToMinutes(timeTo);

    if (fromMinutes >= toMinutes) {
      return Swal.fire('Error', 'Time From must be earlier than Time To.', 'error');
    }

    if (!room) {
      return Swal.fire('Error', 'Room is required.', 'error');
    }
    if (!maxEnrolled) {
      return Swal.fire('Error', 'Maximum enrolled student is required.', 'error');
    }

    // Prevent duplicate subject
    const isDuplicateSubject = subjectRows.some(
      row => row.subject?.value === subject.value
    );
    if (isDuplicateSubject) {
      return Swal.fire('Error', 'This subject is already added.', 'error');
    }

    // Check overlap for same subject (optional: also include room)
    const isTimeOverlap = subjectRows.some(row => {
      if (row.subject?.value !== subject.value) return false;

      const existingFrom = parseTimeToMinutes(row.timeFrom);
      const existingTo = parseTimeToMinutes(row.timeTo);

      // Check for overlap
      return fromMinutes < existingTo && toMinutes > existingFrom;
    });

    if (isTimeOverlap) {
      return Swal.fire('Error', 'Time overlaps with another schedule for the same subject.', 'error');
    }

    // All checks passed — add row
    setSubjectRows([...subjectRows, newRow]);
    setNewRow({ subject: null, timeFrom: '', timeTo: '', room: null, maxEnrolled: '' });
    subjectRef.current?.clearValue();
    roomRef.current?.clearValue();
  };

  // Helper: Convert "HH:mm" to total minutes
  const parseTimeToMinutes = time => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };



  const handleDeleteRow = (index) => {
    const updated = subjectRows.filter((_, i) => i !== index);
    setSubjectRows(updated);
  };

  const handleEditRow = (index) => {
    setNewRow(subjectRows[index]);
    handleDeleteRow(index);
  };

  const fetchYears = async () => {
    try {
      const res = await api.get(`/admin/school-year/list`);
      setYears(res.data.data || []);
    } catch {
      Swal.fire('Error', 'Failed to load school years.', 'error');
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get(`/admin/employees/list`);
      setEmployees(res.data.data || []);
    } catch {
      Swal.fire('Error', 'Failed to load employees.', 'error');
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchLevels();
    fetchYears();
    fetchEmployees(); 
    fetchRooms();
  }, []);

  useEffect(() => {

    if ((modalMode === 'subjects' || modalMode === 'view') && selected?._id) {
      fetchClassSubjects();  
    }else{
      fetchClasses(currentPage, searchTerm);
    }
    
  }, [searchTerm, currentPage, selected, modalMode]);

  const handleShowModal = (mode, item = null) => {
    setModalMode(mode);
    setSelected(item);
    if (item) {
      setFormData({ 
        school_year_id: item.school_year_id?._id || item.school_year_id,
        school_level_id: item.school_level_id?._id || item.school_level_id,
        employee_id: item.employee_id?._id || item.employee_id
      }); 
      console.log('item',item.school_level_id._id);
      fetchSubjects(item.school_level_id?._id);

    } else {
      setFormData({ 
        school_year_id: '',
        school_level_id: '',
        employee_id: ''
      });
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (modalMode === 'add') {
        res = await api.post('/admin/school-class/add', formData);
      } else if (modalMode === 'edit' && selected) {
        res = await api.put(`/admin/school-class/edit/${selected._id}`, formData);
      } else if (modalMode === 'subjects') {
        formData.subjects = subjectRows;
        res = await api.post(`/admin/school-class-subject/add_many/${selected._id}`, formData);

        fetchClassSubjects();
      }

      if (res.data.success) {

        if (modalMode === 'subjects') {

          Swal.fire('Success', 'Class Subject successfuly saved!', 'success'); 

        } else{

          Swal.fire('Success', modalMode === 'add' ? 'Added successfully!' : 'Updated!', 'success');
          fetchClasses(currentPage);
          setShowModal(false);

        }

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
      text: 'This class will be deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      confirmButtonColor: '#d33',
    });

    if (confirm.isConfirmed) {
      setLoading(true);
      try {
        const res = await api.delete(`/admin/school-class/delete/${id}`);
        if (res.data.success) {
          Swal.fire('Deleted!', 'Class deleted.', 'success');
          fetchClasses(currentPage);
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

  const handleLevelChange = (e) => {
    handleInputChange(e);
    loadSections(e);
  };

  const closeModal = () => {
    
    setModalMode(null);
    setShowModal(false);

  }


  return (
    <div>
      <Row className="justify-content-between mb-3">
        <Col xs="auto"><h3>School Classes</h3></Col>
        <Col xs="auto">
          <div className="d-flex flex-wrap justify-content-md-end justify-content-center align-items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => handleShowModal('add')}>
              Add Class
            </Button>
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
              <th>Year</th>
              <th>Level</th>
              <th>Section</th>
              <th>Adviser</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(cls => (
              <tr key={cls._id}> 
                <td>{cls.school_year_id?.school_year || 'N/A'}</td>
                <td>{cls.school_level_id?.level_name || 'N/A'}</td>
                <td>{cls.school_section_id?.section_name || 'N/A'}</td>
                <td>{cls.employee_id?.first_name} {cls.employee_id?.last_name}</td>
                <td>
                  <span className="text-info me-2" style={{ cursor: 'pointer' }} onClick={() => handleShowModal('view', cls)}><Eye /></span>
                  <span className="text-warning me-2" style={{ cursor: 'pointer' }} onClick={() => handleShowModal('edit', cls)}><PencilSquare /></span>
                  <span className="text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDelete(cls._id)}><Trash /></span>
                  <span className="text-primary" style={{ cursor: 'pointer' }} onClick={() => handleShowModal('subjects',cls)}><Files />Manage Sucject & Class Schedule</span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Pagination className="justify-content-end mt-3">
        {[...Array(totalPages).keys()].map(p => (
          <Pagination.Item key={p + 1} active={currentPage === p + 1} onClick={() => fetchClasses(p + 1)}>
            {p + 1}
          </Pagination.Item>
        ))}
      </Pagination>

      <Modal className={`modal ${modalMode === 'subjects' || modalMode === 'view' ? 'modal-xl' : 'modal-md'}`} show={showModal} onHide={() => closeModal()}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{modalMode === 'add' ? 'Add Class' : modalMode === 'edit' ? 'Edit Class' : modalMode === 'view' ? 'View Class' : 'Manage Class Subjects '}</Modal.Title>
          </Modal.Header>
          <Modal.Body> 
            <div className="row mb-3">
              <div className={modalMode === 'subjects' || modalMode === 'view' ? 'col-md-3' : 'col-md-12'}>
              <Form.Group>
                <Form.Label>School Year</Form.Label>
                <Form.Control
                  as="select"
                  name="school_year_id"
                  value={formData.school_year_id}
                  onChange={handleInputChange}
                  disabled={modalMode === 'view' || modalMode === 'subjects' }
                >
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year._id} value={year._id}>{year.school_year}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              </div>
              <div className={modalMode === 'subjects' || modalMode === 'view' ? 'col-md-3' : 'col-md-12'}>
              <Form.Group>
                <Form.Label>School Level</Form.Label>
                <Form.Control
                  as="select"
                  name="school_level_id"
                  value={formData.school_level_id} 
                  disabled={modalMode === 'view' || modalMode === 'subjects' }
                  onChange={handleLevelChange}
                >
                  <option value="">Select Level</option>
                  {levels.map(level => (
                    <option key={level._id} value={level._id}>{level.level_name}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              </div>
              <div className={modalMode === 'subjects' || modalMode === 'view' ? 'col-md-3' : 'col-md-12'}>
              <Form.Group>
                <Form.Label>Section</Form.Label>
                <Form.Control
                  as="select"
                  name="school_section_id"
                  value={formData.school_section_id}
                  onChange={handleInputChange}
                  disabled={modalMode === 'view' || modalMode === 'subjects' }
                >
                  <option value="">Select Section</option>
                  {sections.map(section => (
                    <option key={section._id} value={section._id}>{section.section_name}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              </div>
              <div className={modalMode === 'subjects' || modalMode === 'view' ? 'col-md-3' : 'col-md-12'}>
              <Form.Group>
                <Form.Label>Adviser</Form.Label>
                <Form.Control
                  as="select"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleInputChange}
                  disabled={modalMode === 'view' || modalMode === 'subjects' }
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.first_name} {emp.last_name}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              </div>


              <div className="col-md-12">
               <p></p> 
                {modalMode === 'subjects' && (
                <Row className="mb-2">
                  <Col>
                    <Select
                      ref={subjectRef}
                      options={subjects.map(sub => ({ value: sub._id, label: sub.subject_name }))}
                      value={newRow.subject_name}
                      onChange={option => setNewRow(prev => ({ ...prev, subject: option }))}
                    />
                  </Col>
                  <Col><Form.Control type="time" value={newRow.timeFrom} onChange={e => setNewRow(prev => ({ ...prev, timeFrom: e.target.value }))} /></Col>
                  <Col><Form.Control type="time" value={newRow.timeTo} onChange={e => setNewRow(prev => ({ ...prev, timeTo: e.target.value }))} /></Col>
                  <Col>
                    <Select
                      ref={roomRef} 
                      options={rooms.map(sub => ({ value: sub._id, label: sub.room_name }))}
                      value={newRow.room_name}
                      onChange={option => setNewRow(prev => ({ ...prev, room: option }))}
                    />
                  </Col>
                  <Col><Form.Control type="number" placeholder="Max" value={newRow.maxEnrolled} onChange={e => setNewRow(prev => ({ ...prev, maxEnrolled: e.target.value }))} /></Col>
                  <Col><Button onClick={handleAddRow}>Add</Button></Col>
                </Row>
                )}
                
                {(modalMode === 'subjects' || modalMode === 'view') && (
                <Table bordered>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Time</th>
                      <th>Room</th>
                      <th>Max Enrolled</th>
                      {modalMode === 'subjects' && (
                      <th>Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {subjectRows.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.subject.label}</td>
                        <td>{row.timeFrom} - {row.timeTo}</td>
                        <td>{row.room.label}</td>
                        <td>{row.maxEnrolled}</td>
                        {modalMode === 'subjects' && (
                        <td>
                          <Button variant="warning" size="sm" onClick={() => handleEditRow(idx)}><PencilSquare /></Button>{' '}
                          <Button variant="danger" size="sm" onClick={() => handleDeleteRow(idx)}><Trash /></Button>
                        </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </Table>
                 )}
              </div>
            </div>
          </Modal.Body>
          {modalMode !== 'view' && (
            <Modal.Footer>
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </Modal.Footer>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export default SchoolClasses;
