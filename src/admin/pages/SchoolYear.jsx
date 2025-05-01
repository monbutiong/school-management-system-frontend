import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Pagination, Spinner, Row, Col, InputGroup, FormControl
} from 'react-bootstrap';
import Swal from 'sweetalert2';
import { Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import api from '../../api/axios';

function SchoolYears() {
  const [schoolYears, setSchoolYears] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [formData, setFormData] = useState({
    school_year: '',
    date_from: '',
    date_to: '',
    date_close: '',
    status: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/school-year/list?page=${page}`);
      setSchoolYears(res.data.data);
      setFiltered(res.data.data);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      Swal.fire('Error', 'Failed to load school years.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    const f = schoolYears.filter(yr =>
      yr.school_year.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFiltered(f);
  }, [searchTerm, schoolYears]);

  const handleShowModal = (mode, item = null) => {
    setModalMode(mode);
    setSelected(item);
    if (item) {
      setFormData({
        school_year: item.school_year,
        date_from: item.date_from?.split('T')[0],
        date_to: item.date_to?.split('T')[0],
        date_close: item.date_close?.split('T')[0] || '',
        status: item.status
      });
    } else {
      setFormData({
        school_year: '',
        date_from: '',
        date_to: '',
        date_close: '',
        status: true
      });
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        status: formData.status ?? true
      };

      let res;
      if (modalMode === 'add') {
        res = await api.post('/admin/school-year/add', data);
      } else if (modalMode === 'edit' && selected) {
        res = await api.put(`/admin/school-year/edit/${selected._id}`, data);
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
      text: 'This school year will be deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      confirmButtonColor: '#d33',
    });

    if (confirm.isConfirmed) {
      setLoading(true);
      try {
        const res = await api.delete(`/admin/school-year/delete/${id}`);
        if (res.data.success) {
          Swal.fire('Deleted!', 'School year deleted.', 'success');
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

  return (
    <div>
      <Row className="justify-content-between mb-3">
        <Col xs="auto"><h3>School Years</h3></Col>
        <Col xs="auto">
          <div className="d-flex flex-wrap justify-content-md-end justify-content-center align-items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => handleShowModal('add')}>
              Add School Year
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
              <th>School Year</th>
              <th>From</th>
              <th>To</th>
              <th>Close Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(yr => (
              <tr key={yr._id}>
                <td>{yr.school_year}</td>
                <td>{yr.date_from?.split('T')[0]}</td>
                <td>{yr.date_to?.split('T')[0]}</td>
                <td>{yr.date_close?.split('T')[0] || '-'}</td>
                <td>{yr.status ? 'Active' : 'Inactive'}</td>
                <td>
                  <span className="text-info me-2" style={{ cursor: 'pointer' }} onClick={() => handleShowModal('view', yr)}><Eye /></span>
                  <span className="text-warning me-2" style={{ cursor: 'pointer' }} onClick={() => handleShowModal('edit', yr)}><PencilSquare /></span>
                  <span className="text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDelete(yr._id)}><Trash /></span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Pagination className="justify-content-end mt-3">
        {[...Array(totalPages).keys()].map(p => (
          <Pagination.Item key={p + 1} active={currentPage === p + 1} onClick={() => fetchData(p + 1)}>
            {p + 1}
          </Pagination.Item>
        ))}
      </Pagination>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{modalMode === 'add' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} School Year</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>School Year</Form.Label>
              <Form.Control name="school_year" value={formData.school_year} onChange={handleInputChange} disabled={modalMode === 'view'} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Date From</Form.Label>
              <Form.Control type="date" name="date_from" value={formData.date_from} onChange={handleInputChange} disabled={modalMode === 'view'} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Date To</Form.Label>
              <Form.Control type="date" name="date_to" value={formData.date_to} onChange={handleInputChange} disabled={modalMode === 'view'} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Close Date</Form.Label>
              <Form.Control type="date" name="date_close" value={formData.date_close} onChange={handleInputChange} disabled={modalMode === 'view'} />
            </Form.Group>
            <Form.Check
              type="checkbox"
              label="Active"
              name="status"
              checked={formData.status}
              onChange={handleInputChange}
              disabled={modalMode === 'view'}
            />
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

export default SchoolYears;
