import { useState,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleLogin } from '../controllers/Login';
import { Container, Row, Col, Card, Image, Button, Form, Alert } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';
import './css/Login.css';

function LoginForm() {
  const usernameRef = useRef();
  const [password, setPassword] = useState('testQ@123456789');
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await handleLogin(usernameRef.current.value, password, setAlert);
    setIsLoading(false);

    if (success) {
      navigate('/admin/account');
    }
  };

  return (
    
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Row className="w-100 justify-content-center">
          <Col xs={10} sm={8} md={6} lg={4}>
            <Card className="shadow">
              <Card.Body>

                <div className="banner-container">
                  <img src="/school-banner.png" alt="banner" className="banner-image" />
                  <div className="banner-title">School Management System 
                    <div className="banner-sub-title">(MERN Stack)</div> 
                  </div>
                </div>

                {alert.message && (
                  <Alert variant={alert.type} onClose={() => setAlert({ message: '', type: '' })} dismissible>
                    {alert.message}
                  </Alert>
                )}

                {isLoading ? (
                  <div className="text-center my-4">
                    <ClipLoader color="#007bff" loading={isLoading} size={50} />
                  </div>
                ) : (
                  <Form onSubmit={onSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        ref={usernameRef}
                        defaultValue="test2025"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </Form.Group>

                    <Button variant="flat" type="submit" className="w-100">
                      Login
                    </Button>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
   
  );
}

export default LoginForm;
