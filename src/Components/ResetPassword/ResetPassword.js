import { useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  FormControl,
  FormGroup,
  Row,
  Alert,
} from "react-bootstrap";
import { Navbar, NavbarBrand, NavLink, Nav } from "react-bootstrap";
import { auth } from "../../config"; // Import instancji Firebase
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(""); // Resetowanie błędów

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      setEmail(""); // Czyszczenie pola email po wysłaniu
    } catch (error) {
      setError(error.message); // Ustawianie komunikatu błędu
    }
  };

  return (
    <div>
      <NavBar />
      <Container id="login">
        <h2 className="mb-3">Resetowanie hasła</h2>
        <p className="mb-3">
          Na twój adres email zostanie wysłana wiadomość, dzięki której
          dostaniesz możliwość zresetowania hasła.
        </p>

        {success && (
          <Alert variant="success">
            Sprawdź swój e-mail, aby zresetować hasło!
          </Alert>
        )}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleResetPassword}>
          <Col xs={3}>
            <FormGroup className="mb-3">
              <FormControl
                type="email"
                placeholder="Email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormGroup>

            <Row>
              <Col>
                <Button id="btn" type="submit">
                  Wyślij
                </Button>
              </Col>
            </Row>
          </Col>
        </Form>
      </Container>
    </div>
  );
}

function NavBar() {
  const navigate = useNavigate();
  return (
    <div>
      <Navbar bg="light" data-bs-theme="light" id="nav">
        <NavbarBrand id="nav-heading">Workout Planner</NavbarBrand>
        <Nav className="flex-d gap-4">
          <NavLink onClick={() => navigate("/login")} id="nav-link">
            Zaloguj się
          </NavLink>
          <NavLink id="nav-link" onClick={() => navigate("/register")}>
            Zarejestruj się
          </NavLink>
        </Nav>
      </Navbar>
    </div>
  );
}
