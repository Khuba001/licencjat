import { useState } from "react";
import "./Auth.css";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  FormControl,
  FormGroup,
  Row,
} from "react-bootstrap";
import { Navbar, NavbarBrand, NavLink, Nav } from "react-bootstrap";
import { auth } from "../../config"; // Firebase Auth
import { signInWithEmailAndPassword } from "firebase/auth"; // Logowanie Firebase
import { useNavigate } from "react-router-dom";
import Footer from "../Footer/Footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Zalogowano pomyślnie!");
      navigate("/"); // Przekierowanie po zalogowaniu
    } catch (error) {
      setError("Nieprawidłowy email lub hasło. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <NavBar />
        <div id="login">
          <h2>Witaj!</h2>
          <p>Zaloguj się, aby skorzystać z aplikacji</p>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleLogin}>
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
              <FormGroup className="mb-3">
                <FormControl
                  type="password"
                  placeholder="Hasło..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FormGroup>
              <div id="align">
                <div>
                  <Button type="submit" id="btn" disabled={loading}>
                    {loading ? "Logowanie..." : "Zaloguj się"}
                  </Button>
                </div>
                <Col>
                  <NavLink href="/reset-password" id="login-forgot">
                    Chcesz odzyskać hasło?
                  </NavLink>
                </Col>
              </div>
            </Col>
          </Form>
        </div>
      </div>
      <Footer />
    </>
  );
}

function NavBar() {
  return (
    <div>
      <Navbar bg="light" data-bs-theme="light" id="nav">
        <NavbarBrand id="nav-heading">Workout Planner</NavbarBrand>
        <Nav>
          <NavLink href="/register" id="nav-link">
            Zarejestruj się
          </NavLink>
        </Nav>
      </Navbar>
    </div>
  );
}
