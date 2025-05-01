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

const photo_url = `${import.meta.env.VITE_API_URL}/uploads/employees/pictures/`; 

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    employee_title: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    gender: '',
    birth_date: '',
    contact: '',
    address: '',
    teaching: '',
    email: '',
    employee_picture: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEmployees = async (page = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/employees/list?page=${page}&searchTerm=${searchTerm}`);
      setEmployees(response.data.data);
      setFilteredEmployees(response.data.data);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch employees.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Trigger on load 
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Trigger on chenge filter  
  useEffect(() => {
    fetchEmployees(currentPage, searchTerm);
  }, [searchTerm, currentPage]);

  const handleShowModal = (mode, employee = null) => {
    setModalMode(mode);
    setSelectedEmployee(employee);
    if (employee) {
      setFormData({
        employee_id: employee.employee_id || '',
        employee_title: employee.employee_title || '',
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        middle_name: employee.middle_name || '',
        gender: employee.gender || '',
        birth_date: employee.birth_date ? employee.birth_date.split('T')[0] : '',
        contact: employee.contact || '',
        address: employee.address || '',
        teaching: employee.teaching || false,
        email: employee.email || '',
        employee_picture: null,
      });
    } else {
      setFormData({
        employee_id: '',
        employee_title: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        gender: '',
        birth_date: '',
        contact: '',
        address: '',
        teaching: true,
        email: '',
        employee_picture: null,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (modalMode === 'add' || modalMode === 'edit') {
        setSelectedEmployee(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'employee_picture') {
      setFormData((prev) => ({ ...prev, employee_picture: files[0] }));
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
        response = await api.post('/admin/employees/add', data);
      } else if (modalMode === 'edit' && selectedEmployee) {
        response = await api.put(`/admin/employees/edit/${selectedEmployee._id}`, data);
      }

      var api_respond = response?.data;

      if (api_respond?.success === true) {
        Swal.fire('Success', modalMode === 'add' ? 'Employee added successfully!' : 'Employee updated successfully!', 'success');
        fetchEmployees(currentPage);
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
      text: 'You are about to delete this employee.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await api.delete(`/admin/employees/delete/${id}`);
        const api_respond = response?.data;

        if (api_respond?.success === true) {
          Swal.fire('Deleted!', 'Employee has been deleted.', 'success');
          fetchEmployees(currentPage);
        } else {
          Swal.fire('Error', api_respond?.message || 'Failed to delete employee.', 'error');
        }

      } catch (err) {
        Swal.fire('Error', 'Something went wrong while deleting.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="employee-container">
      <Row className="align-items-center justify-content-between mb-3">
        <Col xs={12} md="auto">
          <h3 className="mb-0">Employees</h3>
        </Col>
        <Col xs={12} md="auto">
          <div className="d-flex flex-wrap justify-content-md-end justify-content-center align-items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => handleShowModal('add')}>
              Add Employee
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
                <th>Employee ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Teaching</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp._id}>
                  <td style={{ maxWidth: '25px', align: 'text-center' }}>
	              	
	                  <img
	                    src={
	                        emp.employee_picture
	                          ? `${photo_url}thumbnails/${emp.employee_picture}`
	                          : emp.gender == 'female' ? `/default-female.png` : `/default-male.png`
	                    }
	                    alt="Employee"
	                    className="img-thumbnail"
	                    style={{
	                      width: '100%',
	                      height: 'auto',
	                      maxWidth: '40px', // Ensure the image doesn't get too large
	                      maxHeight: '40px', // Prevent the image from becoming too tall
	                    }}
	                  />
	          
	              </td>
                  <td>{emp.employee_id}</td>
                  <td>{`${emp.first_name} ${emp.middle_name} ${emp.last_name}`}</td>
                  <td>{emp.email}</td>
                  <td>{emp.contact}</td>
                  <td>{emp.teaching ? 'Yes' : 'No'}</td>
                  <td>
                    <span className="text-info me-2" style={{ cursor: 'pointer' }} onClick={() => handleShowModal('view', emp)}><Eye /></span>
                    <span className="text-warning me-2" style={{ cursor: 'pointer' }} onClick={() => handleShowModal('edit', emp)}><PencilSquare /></span>
                    <span className="text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDelete(emp._id)}><Trash /></span>
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
              onClick={() => fetchEmployees(num + 1)}
            >
              {num + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === 'add' ? 'Add' : modalMode === 'edit' ? 'Edit' : 'View'} Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalMode === 'view' ? (
            <div>
              <p><strong>Employee ID:</strong> {selectedEmployee.employee_id}</p>
              <p><strong>Name:</strong> {selectedEmployee.first_name} {selectedEmployee.middle_name} {selectedEmployee.last_name}</p>
              <p><strong>Gender:</strong> {selectedEmployee.gender}</p>
              <p><strong>Email:</strong> {selectedEmployee.email}</p>
              <p><strong>Contact:</strong> {selectedEmployee.contact}</p>
              <p><strong>Address:</strong> {selectedEmployee.address}</p>
              <p><strong>Teaching:</strong> {selectedEmployee.teaching ? 'Yes' : 'No'}</p>
              <p><strong>Birth Date:</strong> {selectedEmployee.birth_date?.split('T')[0]}</p>
              {selectedEmployee.employee_picture && (
                <img
                  src={`${photo_url}${selectedEmployee.employee_picture}`}
                  alt="Employee"
                  className="img-thumbnail"
                  style={{ maxWidth: '200px' }}
                />
              )}
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              {['employee_id', 'employee_title', 'first_name', 'middle_name', 'last_name', 'birth_date', 'contact', 'address', 'email'].map((field) => (
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

              {/* Teaching field as select box */}
              <Form.Group className="mb-3">
                <Form.Label>GENDER</Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Form.Select>
              </Form.Group>
              {/* Teaching field as select box */}
              <Form.Group className="mb-3">
                <Form.Label>TEACHING</Form.Label>
                <Form.Select
                  name="teaching"
                  value={formData.teaching}
                  onChange={handleInputChange}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Picture</Form.Label>
                <Form.Control type="file" name="employee_picture" onChange={handleInputChange} />
              </Form.Group>

              <Button type="submit" variant="success">Save</Button>
            </Form>

          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Employees;
