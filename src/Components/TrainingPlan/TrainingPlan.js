import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../config";
import { Button } from "react-bootstrap";
import NavBar from "../NavBar/NavBar";
import { getAuth } from "firebase/auth"; // Importowanie Firebase Auth
import "./TrainingPlan.css";

export default function TrainingPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const docRef = doc(db, "workouts", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const planData = docSnap.data();
          setPlan(planData);

          // Sprawdzenie, czy bieżący użytkownik jest autorem planu
          if (currentUser?.uid === planData.creatorUid) {
            setIsAuthor(true);
          }
        } else {
          console.log("Plan not found!");
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id, currentUser]);

  const deletePlan = async () => {
    const confirmed = window.confirm("Czy na pewno chcesz usunąć ten plan?");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "workouts", id));
      alert("Plan został usunięty.");
      navigate("/"); // Przekierowanie na stronę główną po usunięciu
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert("Wystąpił błąd przy usuwaniu planu.");
    }
  };

  if (loading) {
    return <p>Ładowanie szczegółów planu...</p>;
  }

  if (!plan) {
    return <p>Plan nie istnieje!</p>;
  }

  return (
    <div>
      <NavBar />
      <main id="training-plan-main">
        <HeaderTrainingPlan title={plan.name} />
        <ExerciseList exercises={plan.exercises} />
        <PlanDescription description={plan.description} />
      </main>
      <Buttons
        onEdit={() => navigate(`/edit-plan/${id}`)}
        onDelete={deletePlan}
        isAuthor={isAuthor}
      />
    </div>
  );
}

// Komponent wyświetlający nagłówek planu treningowego
function HeaderTrainingPlan({ title }) {
  return (
    <div id="header">
      <p>Podgląd szczegółowy planu treningowego</p>
      <p>
        Nazwa: <span>{title}</span>
      </p>
    </div>
  );
}

// Komponent wyświetlający listę ćwiczeń z seriami i powtórzeniami
function ExerciseList({ exercises }) {
  return (
    <div id="exercise-list-list">
      <h4>Lista ćwiczeń</h4>
      <ul>
        {exercises.map((exercise, index) => (
          <li
            key={index}
            className="exercise-item border"
            style={{ width: "50%" }}
          >
            <div className="exercise-details">
              <p>
                <strong>Nazwa:</strong> {exercise.name}
              </p>
              <p>
                <strong>Serie:</strong> {exercise.sets}
              </p>
              <p>
                <strong>Powtórzenia:</strong> {exercise.reps}
              </p>
              <p>
                <strong>Grupa mięśniowa: </strong> {exercise.muscle_group}
              </p>
            </div>
            <img
              className="img-fluid border rounded"
              style={{ width: "30%" }}
              src={exercise.img_url}
              alt={exercise.name}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

// Komponent wyświetlający opis planu treningowego
function PlanDescription({ description }) {
  return (
    <div id="plan-description">
      <h4>Opis planu</h4>
      <p>{description}</p>
    </div>
  );
}

// Komponent wyświetlający przyciski Edytuj, Usuń i Zamknij
function Buttons({ onEdit, onDelete, isAuthor }) {
  return (
    <div id="buttons">
      {isAuthor && (
        <>
          <Button id="btn" onClick={onEdit}>
            Edytuj
          </Button>
          <Button id="btn" variant="danger" onClick={onDelete}>
            Usuń
          </Button>
        </>
      )}
      <Button id="btn" onClick={() => window.history.back()}>
        Zamknij
      </Button>
    </div>
  );
}
