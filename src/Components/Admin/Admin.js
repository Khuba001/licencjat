import { useEffect, useState } from "react";
import { storage, db } from "../../config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { Button, Form, Container, Row, Col, Table } from "react-bootstrap";
import NavBar from "../NavBar/NavBar";
import { useNavigate, useParams } from "react-router-dom";

export default function AddExercise() {
  const [exercise, setExercise] = useState({
    name: "",
    description: "",
    difficulty: "",
    muscle_group: "",
    img_url: "",
  });

  const [image, setImage] = useState(null); // Przechowuje wybrany obrazek
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExercise((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]); // Ustaw obrazek
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let img_url = "";
      if (image) {
        // Tworzymy unikalne ID dla nazwy pliku
        const uniqueImageId = crypto.randomUUID();
        const imageRef = ref(storage, `images/${uniqueImageId}`);

        // Prześlij obrazek do Storage
        await uploadBytes(imageRef, image);

        // Pobierz URL przesłanego obrazka
        img_url = await getDownloadURL(imageRef);
      }

      // Zapisz ćwiczenie w Firestore
      await addDoc(collection(db, "excercises"), { ...exercise, img_url });

      alert("Ćwiczenie zostało dodane!");
      setExercise({
        name: "",
        description: "",
        difficulty: "",
        muscle_group: "",
        img_url: "",
      });
      setImage(null); // Resetuj stan obrazka
    } catch (error) {
      console.error("Błąd podczas dodawania ćwiczenia:", error);
      alert("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <Container className="mt-5">
        <h2 className="text-center mb-4">Dodaj nowe ćwiczenie</h2>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="name">
                <Form.Label>Nazwa</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Wprowadź nazwę ćwiczenia"
                  name="name"
                  value={exercise.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="difficulty">
                <Form.Label>Trudność</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Wprowadź poziom trudności"
                  name="difficulty"
                  value={exercise.difficulty}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Group controlId="muscle_group">
                <Form.Label>Grupa mięśniowa</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Wprowadź grupę mięśniową"
                  name="muscle_group"
                  value={exercise.muscle_group}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="image">
                <Form.Label>Wybierz obrazek</Form.Label>
                <Form.Control type="file" onChange={handleImageChange} />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="description" className="mb-3">
            <Form.Label>Opis</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Wprowadź opis ćwiczenia"
              name="description"
              value={exercise.description}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button variant="success" type="submit" disabled={loading}>
            {loading ? "Dodawanie..." : "Dodaj ćwiczenie"}
          </Button>
        </Form>
        <EditExercise />
        <ManageUsers />
      </Container>
    </>
  );
}

function EditExercise() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]); // Lista wszystkich ćwiczeń
  const [selectedExerciseId, setSelectedExerciseId] = useState(""); // Wybrane ćwiczenie
  const [exercise, setExercise] = useState({
    name: "",
    description: "",
    difficulty: "",
    muscle_group: "",
    img_url: "",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pobieramy wszystkie ćwiczenia z Firestore przy pierwszym renderze
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const exercisesSnapshot = await getDocs(collection(db, "excercises"));
        const exercisesList = exercisesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExercises(exercisesList);
      } catch (error) {
        console.error("Błąd podczas pobierania ćwiczeń:", error);
      }
    };
    fetchExercises();
  }, []);

  // Wczytujemy dane wybranego ćwiczenia
  const handleExerciseSelect = async (id) => {
    setSelectedExerciseId(id);
    try {
      const exerciseRef = doc(db, "excercises", id);
      const exerciseSnap = await getDoc(exerciseRef);

      if (exerciseSnap.exists()) {
        setExercise(exerciseSnap.data());
      } else {
        alert("Nie znaleziono ćwiczenia.");
      }
    } catch (error) {
      console.error("Błąd podczas wczytywania ćwiczenia:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExercise((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let img_url = exercise.img_url;

      if (image) {
        const uniqueImageId = crypto.randomUUID();
        const imageRef = ref(storage, `images/${uniqueImageId}`);
        await uploadBytes(imageRef, image);
        img_url = await getDownloadURL(imageRef);
      }

      const exerciseRef = doc(db, "excercises", selectedExerciseId);
      await updateDoc(exerciseRef, { ...exercise, img_url });

      alert("Ćwiczenie zostało zaktualizowane!");
      navigate("/"); // Powrót na stronę główną
    } catch (error) {
      console.error("Błąd podczas aktualizacji ćwiczenia:", error);
      alert("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do usuwania ćwiczeń
  const handleDeleteExercise = async () => {
    const confirmDelete = window.confirm(
      "Czy na pewno chcesz usunąć to ćwiczenie?"
    );
    if (!confirmDelete) return;

    try {
      const exerciseRef = doc(db, "excercises", selectedExerciseId);
      await deleteDoc(exerciseRef);
      setExercises((prev) =>
        prev.filter((exercise) => exercise.id !== selectedExerciseId)
      );
      setSelectedExerciseId(""); // Resetuj wybór
      setExercise({
        name: "",
        description: "",
        difficulty: "",
        muscle_group: "",
        img_url: "",
      });

      alert("Ćwiczenie zostało usunięte.");
    } catch (error) {
      console.error("Błąd podczas usuwania ćwiczenia:", error);
      alert("Wystąpił błąd. Spróbuj ponownie.");
    }
  };

  return (
    <>
      <Container className="mt-5">
        <h2 className="text-center mb-4">Edytuj ćwiczenie</h2>

        {/* Dropdown do wyboru ćwiczenia */}
        <Form.Group controlId="exerciseSelect" className="mb-3">
          <Form.Label>Wybierz ćwiczenie</Form.Label>
          <Form.Select
            value={selectedExerciseId}
            onChange={(e) => handleExerciseSelect(e.target.value)}
          >
            <option value="">Wybierz ćwiczenie...</option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Formularz edycji */}
        {selectedExerciseId && (
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col>
                <Form.Group controlId="name">
                  <Form.Label>Nazwa</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Wprowadź nazwę ćwiczenia"
                    name="name"
                    value={exercise.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="difficulty">
                  <Form.Label>Trudność</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Wprowadź poziom trudności"
                    name="difficulty"
                    value={exercise.difficulty}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Group controlId="muscle_group">
                  <Form.Label>Grupa mięśniowa</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Wprowadź grupę mięśniową"
                    name="muscle_group"
                    value={exercise.muscle_group}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="image">
                  <Form.Label>Zmień obrazek (opcjonalnie)</Form.Label>
                  <Form.Control type="file" onChange={handleImageChange} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="description" className="mb-3">
              <Form.Label>Opis</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Wprowadź opis ćwiczenia"
                name="description"
                value={exercise.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button variant="success" type="submit" disabled={loading}>
              {loading ? "Aktualizowanie..." : "Zaktualizuj ćwiczenie"}
            </Button>

            <Button
              variant="danger"
              className="ms-3"
              onClick={handleDeleteExercise}
              disabled={loading}
            >
              Usuń ćwiczenie
            </Button>
          </Form>
        )}
      </Container>
    </>
  );
}

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Błąd podczas pobierania użytkowników:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm(
      "Czy na pewno chcesz usunąć tego użytkownika?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      alert("Użytkownik został usunięty.");
    } catch (error) {
      console.error("Błąd podczas usuwania użytkownika:", error);
      alert("Wystąpił błąd. Spróbuj ponownie.");
    }
  };

  if (loading) {
    return <p>Ładowanie listy użytkowników...</p>;
  }

  return (
    <>
      <Container className="mt-5">
        <h2 className="text-center mb-4">Zarządzaj użytkownikami</h2>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nazwa użytkownika</th>
              <th>Email</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name || "Brak nazwy"}</td>
                <td>{user.email}</td>
                <td>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(user.id)}
                  >
                    Usuń
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </>
  );
}
