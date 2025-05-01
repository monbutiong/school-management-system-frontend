import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleLogin } from '../controllers/Login';
import { Container, Row, Col, Card, Image, Button, Form, Alert } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';

function LoginForm() {
  const [username, setUsername] = useState('test2025');
  const [password, setPassword] = useState('testQ@123456789');
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await handleLogin(username, password, setAlert);
    setIsLoading(false);

    if (success) {
      navigate('/admin/account');
    }
  };

  return (
    <>
      <style type="text/css">
        {`
          .btn-flat {
            background-color: #495057 !important;
            color: white !important;
            border: none !important;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
          }

          .btn-flat::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0);
            transition: all 0.3s ease;
            z-index: 1;
          }

          .btn-flat:hover::before {
            background-color: rgba(255, 255, 255, 0.1);
          }

          .btn-flat:active::before {
            background-color: rgba(255, 255, 255, 0.2);
          }

          .btn-flat > * {
            position: relative;
            z-index: 2;
          }

          .banner-container {
            position: relative;
            text-align: center;
            margin-bottom: 1rem;
          }

          .banner-image {
            display: block;
            width: 100%;
            height: auto;
            filter: brightness(60%);
          }

          .banner-title {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-weight: bold;
            font-size: 1.5rem;
          }

          .banner-sub-title {
            font-size: 1.0rem; 
          }
        `}
      </style>

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
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
    </>
  );
}

export default LoginForm;
