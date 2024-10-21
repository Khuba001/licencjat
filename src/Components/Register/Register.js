import { useState } from "react";
import { auth, db } from "../../config"; // Firebase instance
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // Firestore functions
import {
  Button,
  Col,
  Form,
  FormControl,
  FormGroup,
  Nav,
  Navbar,
  NavbarBrand,
  NavLink,
  Row,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(""); // Store error messages
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Save additional user data to Firestore with uid as document ID
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid, // Store uid explicitly
        email: user.email,
        name: name,
        role: "user",
        favorites: [],
        createdAt: serverTimestamp(),
      });

      // Clear fields on successful registration
      setEmail("");
      setPassword("");
      setName("");
      setError("");
      alert("Konto zostało utworzone!");
      navigate("/login");
    } catch (error) {
      setError(error.message); // Display error if registration fails
    }
  };

  return (
    <div className="register">
      <NavBar navigate={navigate} />
      <div id="register">
        <h2 className="mb-3">Utwórz nowe konto</h2>

        <Form onSubmit={handleRegister}>
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
                type="text"
                placeholder="Nazwa użytkownika..."
                value={name}
                onChange={(e) => setName(e.target.value)}
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
            {error && <p style={{ color: "red" }}>{error}</p>}
            <Row id="align">
              <Col>
                <Button id="btn" type="submit">
                  Zarejestruj się
                </Button>
              </Col>
            </Row>
          </Col>
        </Form>
      </div>
    </div>
  );
}

function NavBar({ navigate }) {
  return (
    <nav>
      <Navbar bg="light" data-bs-theme="light" className="nav" id="nav">
        <NavbarBrand id="nav-heading">Workout Planner</NavbarBrand>
        <Nav>
          <NavLink onClick={() => navigate("/login")} id="nav-link">
            Zaloguj się
          </NavLink>
        </Nav>
      </Navbar>
    </nav>
  );
}
