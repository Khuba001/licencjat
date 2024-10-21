import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./config";
import { Spinner } from "react-bootstrap";

export default function PrivateRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login"); // Przekierowanie na logowanie, jeśli brak użytkownika
      }
      setLoading(false); // Zakończ ładowanie po sprawdzeniu
    });

    return unsubscribe; // Czyszczenie nasłuchu przy unmount
  }, [navigate]);

  if (loading) {
    return <Spinner animation="border" />; // Pokazuje spinner, gdy stan jest sprawdzany
  }

  return user ? children : null; // Renderuje stronę tylko, jeśli użytkownik istnieje
}
