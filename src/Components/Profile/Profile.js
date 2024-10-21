import {
  Button,
  Col,
  Form,
  FormControl,
  FormGroup,
  Row,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import NavBar from "../NavBar/NavBar";
import { useUser } from "../../UserContext"; // Import kontekstu użytkownika
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../config";

export default function Profile() {
  return (
    <div>
      <NavBar />
      <Main />
    </div>
  );
}

function Main() {
  const user = useUser(); // Pobranie użytkownika z kontekstu

  return (
    <div id="profile-main">
      {user ? (
        <>
          <UserDescription user={user} />
          <EditProfile user={user} />
        </>
      ) : (
        <p>Ładowanie danych użytkownika...</p>
      )}
    </div>
  );
}

function UserDescription({ user }) {
  const [favouritesCount, setFavouritesCount] = useState(0);

  useEffect(() => {
    const fetchFavouritesCount = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const favourites = userData.favourites || [];
          setFavouritesCount(favourites.length); // Ustaw liczbę ulubionych
        }
      } catch (error) {
        console.error("Błąd podczas pobierania ulubionych planów:", error);
      }
    };

    fetchFavouritesCount();
  }, [user]);

  return (
    <div>
      <h3 className="mb-3">{user.name || "Nieznany użytkownik"}</h3>
      <p>Email: {user.email}</p>
      <p>
        <span>❤</span> <span> Ulubione plany: </span>
        <span>{favouritesCount}</span> {/* Liczba ulubionych planów */}
      </p>
    </div>
  );
}

function EditProfile({ user }) {
  const navigate = useNavigate();
  const [name, setName] = useState(user.name || ""); // Zmieniono na `name`

  const handleSave = async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { name }, { merge: true }); // Zapisz pod kluczem `name`
      alert("Profil zaktualizowany!");
    } catch (error) {
      console.error("Błąd przy zapisywaniu profilu:", error);
    }
  };

  return (
    <Form>
      <h3 className="mb-4">Edytowanie Profilu</h3>
      <Col xs={3}>
        <FormGroup className="mb-3">
          <FormControl
            type="text"
            placeholder="Nazwa użytkownika..."
            value={name} // Zmieniono na `name`
            onChange={(e) => setName(e.target.value)}
          />
        </FormGroup>
        <Row id="align">
          <Col>
            <Button id="btn" onClick={handleSave}>
              Zapisz
            </Button>
          </Col>
          <Col>
            <Button onClick={() => navigate("/reset-password")} id="btn">
              Zmień hasło
            </Button>
          </Col>
        </Row>
      </Col>
    </Form>
  );
}
