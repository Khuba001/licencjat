import { Nav, Navbar, NavbarBrand, NavLink } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../config"; // Import Firestore
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore"; // Firestore imports

export default function NavBar() {
  const navigate = useNavigate(); // Hook do nawigacji
  const [isAdmin, setIsAdmin] = useState(false); // Stan do przechowywania roli użytkownika

  // Pobranie roli użytkownika z Firestore
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "users", user.uid); // Pobierz dokument użytkownika
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setIsAdmin(userData.role === "admin"); // Ustawienie roli użytkownika
          }
        }
      } catch (error) {
        console.error("Błąd podczas pobierania roli użytkownika:", error);
      }
    };

    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Wylogowanie
      navigate("/login"); // Przekierowanie na stronę główną po wylogowaniu
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
    }
  };

  return (
    <nav>
      <Navbar bg="light" data-bs-theme="light" className="nav" id="nav">
        <NavbarBrand id="nav-heading" onClick={() => navigate("/")}>
          Workout Planner
        </NavbarBrand>
        <Nav id="mainpage-nav">
          <NavLink id="nav-link" onClick={() => navigate("/search-plans")}>
            Plany treningowe
          </NavLink>
          <NavLink id="nav-link" onClick={() => navigate("/")}>
            Strona Główna
          </NavLink>
          <NavLink id="nav-link" onClick={() => navigate("/profile")}>
            Profil
          </NavLink>
          {isAdmin && ( // Renderuj tylko dla admina
            <NavLink id="nav-link" onClick={() => navigate("/admin")}>
              Admin
            </NavLink>
          )}
          <NavLink id="nav-link" onClick={handleLogout}>
            Wyloguj się
          </NavLink>
        </Nav>
      </Navbar>
    </nav>
  );
}
