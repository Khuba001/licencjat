import { Button, Col, Row } from "react-bootstrap";
import NavBar from "../NavBar/NavBar";
import "./TrainingPlanCreate.css";
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../config";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth"; // Pobieranie aktualnego użytkownika

export default function TrainingPlanCreate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = getAuth(); // Firebase Authentication
  const currentUser = auth.currentUser;

  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [creatorUid, setCreatorUid] = useState(null); // Przechowywanie UID autora

  useEffect(() => {
    if (id) {
      const fetchPlan = async () => {
        try {
          const docRef = doc(db, "workouts", id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const planData = docSnap.data();
            setPlanName(planData.name);
            setPlanDescription(planData.description);
            setSelectedExercises(planData.exercises || []);
            setCreatorUid(planData.creatorUid); // Pobranie UID autora

            // Sprawdzenie, czy aktualny użytkownik jest autorem
            if (planData.creatorUid !== currentUser?.uid) {
              alert("Nie masz uprawnień do edycji tego planu.");
              navigate("/");
            }
          } else {
            alert("Plan nie istnieje.");
            navigate("/");
          }
        } catch (error) {
          console.error("Błąd podczas pobierania planu:", error);
        }
      };
      fetchPlan();
    }
  }, [id, navigate, currentUser]);

  const handleSavePlan = async () => {
    if (!planName || selectedExercises.length === 0) {
      alert("Wprowadź nazwę planu i dodaj przynajmniej jedno ćwiczenie.");
      return;
    }

    const newPlan = {
      name: planName,
      description: planDescription,
      exercises: selectedExercises,
      createdAt: new Date(),
      creatorUid: currentUser.uid, // Zapisanie autora
    };

    try {
      if (id) {
        const docRef = doc(db, "workouts", id);
        await updateDoc(docRef, newPlan);
        alert("Plan treningowy został zaktualizowany!");
      } else {
        await addDoc(collection(db, "workouts"), newPlan);
        alert("Plan treningowy został zapisany!");
      }
      navigate("/");
    } catch (error) {
      console.error("Błąd podczas zapisywania planu:", error);
      alert("Wystąpił błąd. Spróbuj ponownie.");
    }
  };

  return (
    <div>
      <NavBar />
      <Main
        planName={planName}
        setPlanName={setPlanName}
        planDescription={planDescription}
        setPlanDescription={setPlanDescription}
        selectedExercises={selectedExercises}
        setSelectedExercises={setSelectedExercises}
      />
      <Buttons onSavePlan={handleSavePlan} />
    </div>
  );
}
function Main({
  planName,
  setPlanName,
  planDescription,
  setPlanDescription,
  selectedExercises,
  setSelectedExercises,
}) {
  return (
    <main id="training-plan-main">
      <ExerciseList
        planName={planName}
        setPlanName={setPlanName}
        planDescription={planDescription}
        setPlanDescription={setPlanDescription}
        selectedExercises={selectedExercises}
        setSelectedExercises={setSelectedExercises}
      />
    </main>
  );
}

function HeaderTrainingPlan({
  planName,
  setPlanName,
  planDescription,
  setPlanDescription,
}) {
  return (
    <div id="header" className="d-flex flex-column align-items-center mb-4">
      <p>Tworzenie i edycja planu treningowego</p>
      <input
        value={planName}
        onChange={(e) => setPlanName(e.target.value)}
        placeholder="Nazwa planu treningowego..."
        className="mb-2"
        style={{ width: "20%" }}
      />
      <textarea
        value={planDescription}
        onChange={(e) => setPlanDescription(e.target.value)}
        placeholder="Opis planu treningowego..."
        rows={3}
        className="mb-2"
        style={{ width: "40%" }}
      />
    </div>
  );
}

function ExerciseList({
  selectedExercises,
  setSelectedExercises,
  planName,
  setPlanName,
  planDescription,
  setPlanDescription,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddExercise = (exercise) => {
    setSelectedExercises((prev) => [
      ...prev,
      { ...exercise, sets: 0, reps: 0 },
    ]);
    setIsOpen(false);
  };

  const handleUpdateExercise = (updatedExercise) => {
    setSelectedExercises((prev) =>
      prev.map((ex) => (ex.id === updatedExercise.id ? updatedExercise : ex))
    );
  };

  const handleRemoveExercise = (exerciseId) => {
    setSelectedExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  return (
    <div id="exercise-list-list">
      <HeaderTrainingPlan
        planName={planName}
        setPlanName={setPlanName}
        planDescription={planDescription}
        setPlanDescription={setPlanDescription}
      />
      <div>
        <Row>
          <Col>
            <h4>Lista ćwiczeń</h4>
          </Col>
        </Row>
        <ul className="list-group mb-3">
          {selectedExercises.map((exercise) => (
            <Exercise
              key={exercise.id}
              exercise={exercise}
              onUpdateExercise={handleUpdateExercise}
              onRemoveExercise={handleRemoveExercise}
            />
          ))}
        </ul>
        <Button className="mb-4" onClick={() => setIsOpen(!isOpen)}>
          Dodaj ćwiczenie
        </Button>
      </div>
      {isOpen && <AddExercise onAddExercise={handleAddExercise} />}
    </div>
  );
}

function Exercise({ exercise, onUpdateExercise, onRemoveExercise }) {
  const [sets, setSets] = useState(exercise.sets || 0);
  const [reps, setReps] = useState(exercise.reps || 0);

  const handleSetsChange = (e) => setSets(Number(e.target.value) || 0);
  const handleRepsChange = (e) => setReps(Number(e.target.value) || 0);

  useEffect(() => {
    if (exercise.sets !== sets || exercise.reps !== reps) {
      onUpdateExercise({ ...exercise, sets, reps });
    }
  }, [sets, reps, exercise, onUpdateExercise]);

  return (
    <li
      id="exercise-list-item"
      className="border rounded mb-1"
      style={{ width: "30%" }}
    >
      <div id="exercise-details" className="d-flex align-items-center">
        <div className="d-flex flex-column gap-2">
          <strong>{exercise.name}</strong>
          <div className="d-flex gap-2 align-items-center">
            <label>Serie: </label>
            <input
              style={{ width: "10%" }}
              value={sets}
              onChange={handleSetsChange}
              placeholder="Serie..."
            />
          </div>
          <div className="d-flex gap-2 align-items-center">
            <label>Powtórzenia: </label>
            <input
              style={{ width: "10%" }}
              value={reps}
              onChange={handleRepsChange}
              placeholder="Powtórzenia..."
            />
          </div>
        </div>
        <img
          className="img-fluid border rounded"
          style={{ width: "30%" }}
          src={exercise.img_url || "imgs/placeholder.jpg"}
          alt={exercise.name}
        />
        <Button
          variant="danger"
          onClick={() => onRemoveExercise(exercise.id)}
          className="ms-3"
        >
          Usuń
        </Button>
      </div>
    </li>
  );
}

function AddExercise({ onAddExercise }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "excercises"));
        const exercisesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExercises(exercisesData);
      } catch (error) {
        console.error("Błąd podczas pobierania ćwiczeń:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  if (loading) return <p>Ładowanie ćwiczeń...</p>;

  return (
    <ul>
      {exercises.map((exercise) => (
        <li key={exercise.id}>
          <span>{exercise.name}</span>
          <Button onClick={() => onAddExercise(exercise)}>Dodaj</Button>
        </li>
      ))}
    </ul>
  );
}

function Buttons({ onSavePlan }) {
  return (
    <div className="d-flex gap-4 justify-content-center">
      <Button onClick={onSavePlan}>Zapisz plan</Button>
      <Button onClick={() => window.history.back()}>Powrót</Button>
    </div>
  );
}
