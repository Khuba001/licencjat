import { Button, Card, CardGroup, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../UserContext.js";
import { useEffect, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../config"; // Firebase config
import "./MainPage.css";
import NavBar from "../NavBar/NavBar";

export default function MainPage() {
  const user = useUser();

  return (
    <div>
      <NavBar />
      <Main user={user} />
    </div>
  );
}

function Main({ user }) {
  const navigate = useNavigate();

  return (
    <Row id="main">
      <Col>
        <Actions navigate={navigate} user={user} />
      </Col>
      <Col>
        <FavouritePlans navigate={navigate} user={user} />
      </Col>
    </Row>
  );
}

function Actions({ navigate, user }) {
  return (
    <div>
      <h2 className="mb-5">
        Witaj, {user ? user.name || "Użytkowniku" : "Użytkowniku"}
      </h2>
      <h3 className="mb-5">Na co masz ochotę?</h3>
      <ActionsList navigate={navigate} />
    </div>
  );
}

function ActionsList({ navigate }) {
  return (
    <ul id="actions-list">
      <ActionsListItem onClick={() => navigate("/search-plans")}>
        Przeglądaj Plany
      </ActionsListItem>
      <ActionsListItem onClick={() => navigate("/create-plan")}>
        Utwórz Plan Treningowy
      </ActionsListItem>
      <ActionsListItem onClick={() => navigate("/progress")}>
        Wprowadź Wyniki
      </ActionsListItem>
    </ul>
  );
}

function ActionsListItem({ children, onClick }) {
  return (
    <li>
      <a id="actions-link" href="#" onClick={onClick}>
        {children}
      </a>
    </li>
  );
}

function FavouritePlans({ navigate, user }) {
  const [favouritePlans, setFavouritePlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavouritePlans = async () => {
      if (user && user.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const favouriteIds = userData.favourites || [];

            if (favouriteIds.length > 0) {
              const plansPromises = favouriteIds.map(async (id) => {
                const planDoc = await getDoc(doc(db, "workouts", id));
                return planDoc.exists()
                  ? { id: planDoc.id, ...planDoc.data() }
                  : null;
              });

              const plans = await Promise.all(plansPromises);
              setFavouritePlans(plans.filter((plan) => plan !== null));
            }
          } else {
            console.warn("Nie znaleziono danych użytkownika.");
          }
        } catch (error) {
          console.error("Błąd podczas pobierania ulubionych planów:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchFavouritePlans();
  }, [user]);

  return (
    <>
      <h3 className="text-center mb-3">Ulubione plany</h3>
      {loading ? (
        <p>Ładowanie ulubionych planów...</p>
      ) : favouritePlans.length > 0 ? (
        <CardGroup className="mb-4">
          {favouritePlans.map((plan) => (
            <TrainingPlanCard
              key={plan.id}
              planId={plan.id}
              title={plan.name}
              text={plan.description}
            />
          ))}
        </CardGroup>
      ) : (
        <p className="text-center">Brak ulubionych planów do wyświetlenia.</p>
      )}
      <div id="align">
        <Button id="btn-showall" onClick={() => navigate("/search-plans")}>
          Pokaż wszystkie
        </Button>
      </div>
    </>
  );
}

function TrainingPlanCard({ planId, title, text }) {
  const navigate = useNavigate();

  const truncateDescription = (text) => {
    const words = text.split(" ");
    return words.length > 6 ? `${words.slice(0, 6).join(" ")}...` : text;
  };

  const handleClick = () => {
    navigate(`/plan/${planId}`); // Przekierowanie na stronę planu z odpowiednim ID
  };

  return (
    <Card onClick={handleClick} style={{ cursor: "pointer", height: "150px" }}>
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>{truncateDescription(text)}</Card.Text>
      </Card.Body>
    </Card>
  );
}
