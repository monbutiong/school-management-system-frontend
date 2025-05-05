import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Pagination, Spinner, Row, Col, InputGroup, FormControl
} from 'react-bootstrap';
import Swal from 'sweetalert2';
import { Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import api from '../../api/axios';

function SchoolRooms() {
  const [rooms, setRooms] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [formData, setFormData] = useState({
    building_id: '',
    room_name: '',
    room_description: ''
  });
  const [buildings, setBuildings] = useState([]);
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
      const res = await api.get(`/admin/school-room/list?page=${page}&searchTerm=${searchTerm}`);
      setRooms(res.data.data);
      setFiltered(res.data.data);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      Swal.fire('Error', 'Failed to load school rooms.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBuildings = async () => {
    try {
      const res = await api.get('/admin/school-building/list');
      setBuildings(res.data.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to load buildings.', 'error');
    }
  };

  useEffect(() => {
    fetchData();
    fetchBuildings();
  }, []);

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [searchTerm, currentPage]);

  const handleShowModal = (mode, item = null) => {
    setModalMode(mode);
    setSelected(item);
    if (item) {
      setFormData({
        building_id: item.building_id?._id || '',
        room_name: item.room_name,
        room_description: item.room_description || ''
      });
    } else {
      setFormData({
        building_id: '',
        room_name: '',
        room_description: ''
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
        res = await api.post('/admin/school-room/add', formData);
      } else if (modalMode === 'edit' && selected) {
        res = await api.put(`/admin/school-room/edit/${selected._id}`, formData);
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
      text: 'This school room will be deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      confirmButtonColor: '#d33',
    });

    if (confirm.isConfirmed) {
      setLoading(true);
      try {
        const res = await api.delete(`/admin/school-room/delete/${id}`);
        if (res.data.success) {
          Swal.fire('Deleted!', 'School room deleted.', 'success');
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
        <Col xs="auto"><h3>School Rooms</h3></Col>
        <Col xs="auto">
          <div className="d-flex flex-wrap justify-content-md-end justify-content-center align-items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => handleShowModal('add')}>
              Add School Room
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
              <th>Building</th>
              <th>Room Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(room => (
              <tr key={room._id}>
                <td>{room.building_id?.building_name || 'N/A'}</td>
                <td>{room.room_name}</td>
                <td>{room.room_description || '-'}</td>
                <td>
                  <span className="text-info me-2" style={{ cursor: 'pointer' }} onClick={() => handleShowModal('view', room)}><Eye /></span>
                  <span className="text-warning me-2" style={{ cursor: 'pointer' }} onClick={() => handleShowModal('edit', room)}><PencilSquare /></span>
                  <span className="text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDelete(room._id)}><Trash /></span>
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
            <Modal.Title>{modalMode === 'add' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} School Room</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Building</Form.Label>
              <Form.Select name="building_id" value={formData.building_id} onChange={handleInputChange} disabled={modalMode === 'view'}>
                <option value="">Select Building</option>
                {buildings.map(b => (
                  <option key={b._id} value={b._id}>{b.building_name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Room Name</Form.Label>
              <Form.Control name="room_name" value={formData.room_name} onChange={handleInputChange} disabled={modalMode === 'view'} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" name="room_description" value={formData.room_description} onChange={handleInputChange} disabled={modalMode === 'view'} />
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

export default SchoolRooms;
