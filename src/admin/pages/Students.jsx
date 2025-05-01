import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import {
  Table,
  Button,
  Modal,
  Form,
  Pagination,
  Spinner,
  Row,
  Col,
  InputGroup,
  FormControl,
} from 'react-bootstrap';
import api from '../../api/axios';
import '../../css/Account.css';

const photo_url = `${import.meta.env.VITE_API_URL}/uploads/students/`; 

function Students() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    gender: '',
    birth_date: '',
    contact: '',
    address: '',
    email: '',
    students_picture: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStudents = async (page = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/students/list?page=${page}&searchTerm=${searchTerm}`);
      setStudents(response.data.data);
      setFilteredStudents(response.data.data);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch students.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Trigger on load 
  useEffect(() => {
    fetchStudents();
  }, []);

  // Trigger on change filter  
  useEffect(() => {
    fetchStudents(currentPage, searchTerm);
  }, [searchTerm, currentPage]);

  const handleShowModal = (mode, student = null) => {
    setModalMode(mode);
    setSelectedStudent(student);
    if (student) {
      setFormData({
        student_id: student.student_id || '',
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        middle_name: student.middle_name || '',
        gender: student.gender || '',
        birth_date: student.birth_date ? student.birth_date.split('T')[0] : '',
        contact: student.contact || '',
        address: student.address || '',
        email: student.email || '',
        students_picture: null,
      });
    } else {
      setFormData({
        student_id: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        gender: '',
        birth_date: '',
        contact: '',
        address: '',
        email: '',
        students_picture: null,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (modalMode === 'add' || modalMode === 'edit') {
      setSelectedStudent(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'students_picture') {
      setFormData((prev) => ({ ...prev, students_picture: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      let response;

      if (modalMode === 'add') {
        response = await api.post('/admin/students/add', data);
      } else if (modalMode === 'edit' && selectedStudent) {
        response = await api.put(`/admin/students/edit/${selectedStudent._id}`, data);
      }

      var api_respond = response?.data;

      if (api_respond?.success === true) {
        Swal.fire('Success', modalMode === 'add' ? 'Student added successfully!' : 'Student updated successfully!', 'success');
        fetchStudents(currentPage);
        handleCloseModal(); // only close modal if successful
      } else {
        Swal.fire('Error', api_respond?.message || 'Operation failed.', 'error');
        // modal remains open
      }

    } catch (err) {
      Swal.fire('Error', 'Something went wrong during the operation.', 'error');
      // modal remains open
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this student.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await api.delete(`/admin/students/delete/${id}`);
        const api_respond = response?.data;

        if (api_respond?.success === true) {
          Swal.fire('Deleted!', 'Student has been deleted.', 'success');
          fetchStudents(currentPage);
        } else {
          Swal.fire('Error', api_respond?.message || 'Failed to delete student.', 'error');
        }

      } catch (err) {
        Swal.fire('Error', 'Something went wrong while deleting.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="student-container">
      <Row className="align-items-center justify-content-between mb-3">
        <Col xs={12} md="auto">
          <h3 className="mb-0">Students</h3>
        </Col>
        <Col xs={12} md="auto">
          <div className="d-flex flex-wrap justify-content-md-end justify-content-center align-items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => handleShowModal('add')}>
              Add Student
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
        <div className="table-wrapper">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th></th>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Gender</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td style={{ maxWidth: '25px', align: 'text-center' }}>
                    <img
                      src={
                        student.students_picture
                          ? `${photo_url}thumbnails/${student.students_picture}`
                          : student.gender === 'female' ? `/default-female.png` : `/default-male.png`
                      }
                      alt="Student"
                      className="img-thumbnail"
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxWidth: '40px', // Ensure the image doesn't get too large
                        maxHeight: '40px', // Prevent the image from becoming too tall
                      }}
                    />
                  </td>
                  <td>{student.student_id}</td>
                  <td>{`${student.first_name} ${student.middle_name} ${student.last_name}`}</td>
                  <td>{student.email}</td>
                  <td>{student.contact}</td>
                  <td>{student.gender == 'male' ? 'Male' : 'Female'}</td>
                  <td>
                    <span className="text-info me-2" style={{ cursor: 'pointer' }} onClick={() => handleShowModal('view', student)}><Eye /></span>
                    <span className="text-warning me-2" style={{ cursor: 'pointer' }} onClick={() => handleShowModal('edit', student)}><PencilSquare /></span>
                    <span className="text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDelete(student._id)}><Trash /></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <div className="d-flex justify-content-end mt-3">
        <Pagination>
          {[...Array(totalPages).keys()].map((num) => (
            <Pagination.Item
              key={num + 1}
              active={currentPage === num + 1}
              onClick={() => fetchStudents(num + 1)}
            >
              {num + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>

      {/* Modal for add/edit/view */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === 'view' ? 'View Student' : modalMode === 'add' ? 'Add Student' : 'Edit Student'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalMode !== 'view' && (
            <Form onSubmit={handleSubmit}>
              {['student_id', 'first_name', 'middle_name', 'last_name', 'birth_date', 'contact', 'address', 'email'].map((field) => (
                <Form.Group key={field} className="mb-3">
                  <Form.Label>{field.replace('_', ' ').toUpperCase()}</Form.Label>
                  <Form.Control
                    type={field === 'birth_date' ? 'date' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    required={['employee_id', 'first_name', 'last_name', 'birth_date', 'email', 'contact', 'address'].includes(field)}
                  />
                </Form.Group>
              ))}

              <Form.Group className="mb-3">
                <Form.Label>GENDER</Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Form.Select>
              </Form.Group> 

              <Form.Group className="mb-3">
                <Form.Label>Picture</Form.Label>
                <Form.Control type="file" name="student_picture" onChange={handleInputChange} />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" variant="success" className="ms-2">
                  {loading ? 'Saving...' : modalMode === 'add' ? 'Add' : 'Save'}
                </Button>
              </div>
            </Form>

          )}
          {modalMode === 'view' && selectedStudent && (
            <div>
              <div><strong>Student ID:</strong> {selectedStudent.student_id}</div>
              <div><strong>Full Name:</strong> {`${selectedStudent.first_name} ${selectedStudent.middle_name} ${selectedStudent.last_name}`}</div>
              <div><strong>Email:</strong> {selectedStudent.email}</div>
              <div><strong>Contact:</strong> {selectedStudent.contact}</div>
              <div><strong>Gender:</strong> {selectedStudent.gender}</div>
              <div><strong>Birth Date:</strong> {selectedStudent.birth_date}</div>
              <div><strong>Address:</strong> {selectedStudent.address}</div>
              {selectedStudent.students_picture && (
                <div>
                  <strong>Photo:</strong><br />
                  <img
                    src={`${photo_url}${selectedStudent.students_picture}`}
                    alt="Student"
                    className="img-thumbnail"
                    style={{ maxWidth: '150px' }}
                  />
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Students;
