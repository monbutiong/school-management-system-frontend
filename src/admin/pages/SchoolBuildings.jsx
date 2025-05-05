import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Pagination, Spinner, Row, Col, InputGroup, FormControl
} from 'react-bootstrap';
import Swal from 'sweetalert2';
import { Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import api from '../../api/axios';

function SchoolBuildings() {
  const [buildings, setBuildings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [formData, setFormData] = useState({ building_name: '', building_description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (page = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/school-building/list?page=${page}&searchTerm=${searchTerm}`);
      setBuildings(res.data.data || []);
      setFiltered(res.data.data || []);
      setCurrentPage(res.data.currentPage || 1);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      Swal.fire('Error', 'Failed to load school buildings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); 

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [searchTerm, currentPage]);

  const handleShowModal = (mode, item = null) => {
    setModalMode(mode);
    setSelected(item);
    if (item) {
      setFormData({
        building_name: item.building_name,
        building_description: item.building_description || ''
      });
    } else {
      setFormData({ building_name: '', building_description: '' });
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
        res = await api.post('/admin/school-building/add', formData);
      } else if (modalMode === 'edit' && selected) {
        res = await api.put(`/admin/school-building/edit/${selected._id}`, formData);
      }

      if (res.data.success) {
        Swal.fire('Success', modalMode === 'add' ? 'Added successfully!' : 'Updated!', 'success');
        fetchData(currentPage);
        setShowModal(false);
      } else {
        Swal.fire('Error', res.data.message || 'Failed to save.', 'error');
      }
    } catch {
      Swal.fire('Error', 'Something went wrong.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This building will be deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      confirmButtonColor: '#d33',
    });

    if (confirm.isConfirmed) {
      setLoading(true);
      try {
        const res = await api.delete(`/admin/school-building/delete/${id}`);
        if (res.data.success) {
          Swal.fire('Deleted!', 'Building deleted.', 'success');
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
        <Col xs="auto"><h3>School Buildings</h3></Col>
        <Col xs="auto">
          <div className="d-flex flex-wrap justify-content-md-end justify-content-center align-items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => handleShowModal('add')}>
              Add Building
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
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b._id}>
                <td>{b.building_name}</td>
                <td>{b.building_description || '-'}</td>
                <td>
                  <span className="text-info me-2" style={{ cursor: 'pointer' }} onClick={() => handleShowModal('view', b)}><Eye /></span>
                  <span className="text-warning me-2" style={{ cursor: 'pointer' }} onClick={() => handleShowModal('edit', b)}><PencilSquare /></span>
                  <span className="text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDelete(b._id)}><Trash /></span>
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
            <Modal.Title>{modalMode === 'add' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Building</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Building Name</Form.Label>
              <Form.Control
                name="building_name"
                value={formData.building_name}
                onChange={handleInputChange}
                disabled={modalMode === 'view'}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="building_description"
                value={formData.building_description}
                onChange={handleInputChange}
                disabled={modalMode === 'view'}
              />
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

export default SchoolBuildings;
