import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Pagination, Spinner, Row, Col, InputGroup, FormControl
} from 'react-bootstrap';
import Swal from 'sweetalert2';
import { Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import api from '../../api/axios';

function SchoolClasses() {
  const [classes, setClasses] = useState([]);
  const [years, setYears] = useState([]);
  const [levels, setLevels] = useState([]);
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
  }, []);

  useEffect(() => {
    fetchClasses(currentPage, searchTerm);
  }, [searchTerm, currentPage]);

  const handleShowModal = (mode, item = null) => {
    setModalMode(mode);
    setSelected(item);
    if (item) {
      setFormData({ 
        school_year_id: item.school_year_id?._id || item.school_year_id,
        school_level_id: item.school_level_id?._id || item.school_level_id,
        employee_id: item.employee_id?._id || item.employee_id
      });
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
      }

      if (res.data.success) {
        Swal.fire('Success', modalMode === 'add' ? 'Added successfully!' : 'Updated!', 'success');
        fetchClasses(currentPage);
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
              <th>Adviser</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(cls => (
              <tr key={cls._id}> 
                <td>{cls.school_year_id?.school_year || 'N/A'}</td>
                <td>{cls.school_level_id?.level_name || 'N/A'}</td>
                <td>{cls.employee_id?.first_name} {cls.employee_id?.last_name}</td>
                <td>
                  <span className="text-info me-2" style={{ cursor: 'pointer' }} onClick={() => handleShowModal('view', cls)}><Eye /></span>
                  <span className="text-warning me-2" style={{ cursor: 'pointer' }} onClick={() => handleShowModal('edit', cls)}><PencilSquare /></span>
                  <span className="text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDelete(cls._id)}><Trash /></span>
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

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{modalMode === 'add' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Class</Modal.Title>
          </Modal.Header>
          <Modal.Body> 
            <Form.Group>
              <Form.Label>School Year</Form.Label>
              <Form.Control
                as="select"
                name="school_year_id"
                value={formData.school_year_id}
                onChange={handleInputChange}
                disabled={modalMode === 'view'}
              >
                <option value="">Select Year</option>
                {years.map(year => (
                  <option key={year._id} value={year._id}>{year.school_year}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>School Level</Form.Label>
              <Form.Control
                as="select"
                name="school_level_id"
                value={formData.school_level_id}
                onChange={handleInputChange}
                disabled={modalMode === 'view'}
              >
                <option value="">Select Level</option>
                {levels.map(level => (
                  <option key={level._id} value={level._id}>{level.level_name}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Adviser</Form.Label>
              <Form.Control
                as="select"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                disabled={modalMode === 'view'}
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.first_name} {emp.last_name}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Modal.Body>
          {modalMode !== 'view' && (
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
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
