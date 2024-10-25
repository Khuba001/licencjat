import { useEffect, useState } from "react";
import { Button, Card, CardGroup, Col, Dropdown, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../config";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import "./SearchTrainingPlans.css";
import NavBar from "../NavBar/NavBar";
import Footer from "../Footer/Footer";

export default function SearchTrainingPlans() {
  return (
    <>
      <NavBar />
      <Main />
      <Footer />
    </>
  );
}

function Main() {
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState(""); // Dodajemy stan do zapytania wyszukiwania

  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  return (
    <div className="text-center" id="search-training-plans">
      <Search onSortChange={handleSortChange} setSearchQuery={setSearchQuery} />
      <Plans sortOrder={sortOrder} searchQuery={searchQuery} />
    </div>
  );
}

function Search({ onSortChange, setSearchQuery }) {
  const handleSearchChange = (e) => setSearchQuery(e.target.value); // Obsługa zmian w polu wyszukiwania

  return (
    <div className="d-flex">
      <input
        id="search-plans"
        placeholder="Wyszukaj..."
        onChange={handleSearchChange} // Rejestrujemy zmiany
      />
      <Dropdown className="height-50">
        <Dropdown.Toggle variant="primary">Sortuj</Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => onSortChange("asc")}>a-z</Dropdown.Item>
          <Dropdown.Item onClick={() => onSortChange("desc")}>
            z-a
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}

function Plans({ sortOrder, searchQuery }) {
  const [workouts, setWorkouts] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const workoutsCollection = collection(db, "workouts");
        const workoutsSnapshot = await getDocs(workoutsCollection);
        const workoutsList = workoutsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWorkouts(workoutsList);

        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();
          setFavourites(userData?.favourites || []);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania planów:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [user]);

  const formatDate = (timestamp) => {
    if (timestamp?.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString();
    }
    return "Nieznana data";
  };

  const truncateDescription = (text) => {
    const words = text.split(" ");
    return words.length > 6 ? `${words.slice(0, 6).join(" ")}...` : text;
  };

  const toggleFavourite = async (workoutId) => {
    if (!user) {
      alert("Musisz być zalogowany, aby dodawać do ulubionych!");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const isFavourite = favourites.includes(workoutId);

      await updateDoc(userRef, {
        favourites: isFavourite
          ? arrayRemove(workoutId)
          : arrayUnion(workoutId),
      });

      setFavourites((prev) =>
        isFavourite
          ? prev.filter((id) => id !== workoutId)
          : [...prev, workoutId]
      );
    } catch (error) {
      console.error("Błąd podczas aktualizacji ulubionych:", error);
      alert("Wystąpił błąd podczas aktualizacji ulubionych.");
    }
  };

  const filteredWorkouts = workouts.filter((workout) =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedWorkouts = [...filteredWorkouts].sort((a, b) => {
    if (sortOrder === "asc") return a.name.localeCompare(b.name);
    return b.name.localeCompare(a.name);
  });

  if (loading) {
    return <p>Ładowanie planów treningowych...</p>;
  }

  return (
    <>
      <CardGroup className="mb-4 d-flex">
        <Row>
          {sortedWorkouts.length > 0 ? (
            sortedWorkouts.map((workout) => (
              <Col key={workout.id}>
                <Card id="card">
                  <Card.Body onClick={() => navigate(`/plan/${workout.id}`)}>
                    <div className="d-flex justify-content-between">
                      <button
                        className="btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavourite(workout.id);
                        }}
                      >
                        {favourites.includes(workout.id) ? "⭐" : "☆"}
                      </button>
                    </div>
                    <Card.Title>{workout.name}</Card.Title>
                    <Card.Text>
                      {truncateDescription(workout.description)}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <small className="text-muted">
                      Plan utworzono: {formatDate(workout.createdAt)}
                    </small>
                  </Card.Footer>
                </Card>
              </Col>
            ))
          ) : (
            <Col>
              <Card>
                <Card.Body>
                  <Card.Text>
                    Brak planów treningowych do wyświetlenia.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </CardGroup>
      <div className="text-center mt-5">
        <Button onClick={() => navigate("/create-plan")} className="btn ">
          Stwórz plan
        </Button>
      </div>
    </>
  );
}
