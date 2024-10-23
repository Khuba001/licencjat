import { useState, useEffect } from "react";
import { auth, db } from "../../config";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { Button, Table, Form } from "react-bootstrap";
import { onAuthStateChanged } from "firebase/auth";
import NavBar from "../NavBar/NavBar";

export default function Progress() {
  const [logs, setLogs] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <NavBar />
      {user ? (
        <Main logs={logs} setLogs={setLogs} user={user} />
      ) : (
        <p>Musisz się zalogować, aby zobaczyć swoje logi.</p>
      )}
    </div>
  );
}

function Main({ logs, setLogs, user }) {
  useEffect(() => {
    if (user) {
      fetchLogs(user.uid, setLogs);
    }
  }, [user]);

  return (
    <div id="main">
      <Heading />
      <LogTable logs={logs} />
      <AddLog setLogs={setLogs} logs={logs} user={user} />
    </div>
  );
}

function Heading() {
  return <h3>Progresja treningów</h3>;
}

function LogTable({ logs }) {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Ćwiczenie</th>
          <th>Wcześniejszy ciężar (kg)</th>
          <th>Obecny ciężar (kg)</th>
          <th>Liczba powtórzeń</th>
          <th>Wzrost (%)</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <tr key={index}>
              <td>{log.exercise}</td>
              <td>{log.previousWeight}</td>
              <td>{log.currentWeight}</td>
              <td>{log.repetitions}</td>
              <td>{log.increase}%</td>
              <td>{log.date}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6">Brak logów do wyświetlenia</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

function AddLog({ setLogs, logs, user }) {
  const [exercise, setExercise] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [repetitions, setRepetitions] = useState("");
  const [isBodyweight, setIsBodyweight] = useState(false); // Nowe pole do zaznaczenia bodyweight
  const [exercises, setExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchExercises = async () => {
      const querySnapshot = await getDocs(collection(db, "excercises"));
      const exercisesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExercises(exercisesData);
    };

    fetchExercises();
  }, []);

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addOrUpdateLog = async () => {
    const existingLog = logs.find((log) => log.exercise === exercise);

    const newVolumeLoad = isBodyweight
      ? parseInt(repetitions)
      : parseFloat(currentWeight) * parseInt(repetitions);

    if (existingLog) {
      const previousVolumeLoad = isBodyweight
        ? parseInt(existingLog.repetitions)
        : parseFloat(existingLog.currentWeight) *
          parseInt(existingLog.repetitions);

      const increase = (
        ((newVolumeLoad - previousVolumeLoad) / previousVolumeLoad) *
        100
      ).toFixed(2);

      const updatedLog = {
        ...existingLog,
        previousWeight: isBodyweight ? 0 : existingLog.currentWeight,
        currentWeight: isBodyweight ? "Bodyweight" : parseFloat(currentWeight),
        repetitions: parseInt(repetitions),
        increase,
        date: new Date().toLocaleDateString(),
      };

      setLogs((prevLogs) =>
        prevLogs.map((log) => (log.exercise === exercise ? updatedLog : log))
      );
      resetForm();
    } else {
      const newLog = {
        uid: user.uid,
        exercise,
        previousWeight: 0,
        currentWeight: isBodyweight ? "Bodyweight" : parseFloat(currentWeight),
        repetitions: parseInt(repetitions),
        increase: "100.00", // Przyrost dla pierwszego wpisu
        date: new Date().toLocaleDateString(),
      };

      try {
        await addDoc(collection(db, "progress"), newLog);
        setLogs((prevLogs) => [...prevLogs, newLog]);
        resetForm();
      } catch (error) {
        console.error("Błąd przy dodawaniu logu: ", error.message);
      }
    }
  };

  const resetForm = () => {
    setExercise("");
    setCurrentWeight("");
    setRepetitions("");
    setIsBodyweight(false); // Reset opcji bodyweight
  };

  return (
    <Form>
      <Form.Group>
        <Form.Label>Wybierz ćwiczenie</Form.Label>
        <Form.Select
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
        >
          <option value="">Wybierz ćwiczenie</option>
          {filteredExercises.map((ex) => (
            <option key={ex.id} value={ex.name}>
              {ex.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Obecny ciężar</Form.Label>
        <Form.Check
          type="radio"
          label="Bodyweight"
          checked={isBodyweight}
          onChange={() => setIsBodyweight(true)}
        />
        <Form.Check
          type="radio"
          label="Wpisz ciężar"
          checked={!isBodyweight}
          onChange={() => setIsBodyweight(false)}
        />
        <Form.Control
          type="number"
          value={currentWeight}
          onChange={(e) => setCurrentWeight(e.target.value)}
          placeholder="Obecny ciężar (kg)"
          disabled={isBodyweight} // Zablokowanie pola, jeśli zaznaczone jest Bodyweight
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <Form.Label>Liczba powtórzeń</Form.Label>
        <Form.Control
          type="number"
          value={repetitions}
          onChange={(e) => setRepetitions(e.target.value)}
          placeholder="Liczba powtórzeń"
        />
      </Form.Group>
      <Button id="btn" onClick={addOrUpdateLog}>
        {logs.find((log) => log.exercise === exercise)
          ? "Zaktualizuj log"
          : "Dodaj log"}
      </Button>
    </Form>
  );
}

async function fetchLogs(uid, setLogs) {
  const q = query(collection(db, "progress"), where("uid", "==", uid));
  const querySnapshot = await getDocs(q);
  const logsData = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  setLogs(logsData);
}
