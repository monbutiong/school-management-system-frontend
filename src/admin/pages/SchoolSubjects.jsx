import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Pagination, Spinner, Row, Col, InputGroup, FormControl
} from 'react-bootstrap';
import Swal from 'sweetalert2';
import { Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import api from '../../api/axios';

function SchoolSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [formData, setFormData] = useState({
    subject_name: '',
    subject_description: '',
    school_level_id: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLevels = async () => {
    try {
      const res = await api.get('/admin/school-level/list');
      setLevels(res.data.data);
    } catch {
      Swal.fire('Error', 'Failed to load school levels.', 'error');
    }
  };

  const fetchSubjects = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/school-subject/list?page=${page}`);
      setSubjects(res.data.data);
      setFiltered(res.data.data);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch {
      Swal.fire('Error', 'Failed to load subjects.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
    fetchSubjects();
  }, []);

  useEffect(() => {
    const f = subjects.filter(s =>
      s.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFiltered(f);
  }, [searchTerm, subjects]);

  const handleShowModal = (mode, item = null) => {
    setModalMode(mode);
    setSelected(item);
    if (item) {
      setFormData({
        subject_name: item.subject_name,
        subject_description: item.subject_description,
        school_level_id: item.school_level_id?._id || item.school_level_id
      });
    } else {
      setFormData({
        subject_name: '',
        subject_description: '',
        school_level_id: ''
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
        res = await api.post('/admin/school-subject/add', formData);
      } else if (modalMode === 'edit' && selected) {
        res = await api.put(`/admin/school-subject/edit/${selected._id}`, formData);
      }

      if (res.data.success) {
        Swal.fire('Success', modalMode === 'add' ? 'Added successfully!' : 'Updated!', 'success');
        fetchSubjects(currentPage);
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
      text: 'This subject will be deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      confirmButtonColor: '#d33',
    });

    if (confirm.isConfirmed) {
      setLoading(true);
      try {
        const res = await api.delete(`/admin/school-subject/delete/${id}`);
        if (res.data.success) {
          Swal.fire('Deleted!', 'Subject deleted.', 'success');
          fetchSubjects(currentPage);
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
        <Col xs="auto"><h3>School Subjects</h3></Col>
        <Col xs="auto">
          <div className="d-flex flex-wrap justify-content-md-end justify-content-center align-items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => handleShowModal('add')}>
              Add Subject
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
              <th>Subject Name</th>
              <th>Description</th>
              <th>Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(subject => (
              <tr key={subject._id}>
                <td>{subject.subject_name}</td>
                <td>{subject.subject_description}</td>
                <td>{subject.school_level_id?.level_name || '-'}</td>
                <td>
                  <span className="text-info me-2" style={{ cursor: 'pointer' }} onClick={() => handleShowModal('view', subject)}><Eye /></span>
                  <span className="text-warning me-2" style={{ cursor: 'pointer' }} onClick={() => handleShowModal('edit', subject)}><PencilSquare /></span>
                  <span className="text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDelete(subject._id)}><Trash /></span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Pagination className="justify-content-end mt-3">
        {[...Array(totalPages).keys()].map(p => (
          <Pagination.Item key={p + 1} active={currentPage === p + 1} onClick={() => fetchSubjects(p + 1)}>
            {p + 1}
          </Pagination.Item>
        ))}
      </Pagination>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{modalMode === 'add' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Subject</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Subject Name</Form.Label>
              <Form.Control name="subject_name" value={formData.subject_name} onChange={handleInputChange} disabled={modalMode === 'view'} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Subject Description</Form.Label>
              <Form.Control as="textarea" name="subject_description" value={formData.subject_description} onChange={handleInputChange} disabled={modalMode === 'view'} />
            </Form.Group>
            <Form.Group>
              <Form.Label>School Level</Form.Label>
              <Form.Select name="school_level_id" value={formData.school_level_id} onChange={handleInputChange} disabled={modalMode === 'view'}>
                <option value="">-- Select Level --</option>
                {levels.map(level => (
                  <option key={level._id} value={level._id}>{level.level_name}</option>
                ))}
              </Form.Select>
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

export default SchoolSubjects;
