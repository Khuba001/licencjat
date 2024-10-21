import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import MainPage from "./Components/MainPage/MainPage";
import ResetPassword from "./Components/ResetPassword/ResetPassword";
import Progress from "./Components/Progress/Progress";
import TrainingPlanCreate from "./Components/TrainingPlanCreate/TrainingPlanCreate";
import SearchTrainingPlans from "./Components/SearchTrainingPlans/SearchTrainingPlans";
import PrivateRoute from "./PrivateRoute"; // Import PrivateRoute
import Profile from "./Components/Profile/Profile";
import TrainingPlan from "./Components/TrainingPlan/TrainingPlan";
import Admin from "./Components/Admin/Admin";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Chronione trasy - dostęp tylko po zalogowaniu */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <PrivateRoute>
              <Progress />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-plan"
          element={
            <PrivateRoute>
              <TrainingPlanCreate />
            </PrivateRoute>
          }
        />
        <Route
          path="/plan/:id"
          element={
            <PrivateRoute>
              <TrainingPlan />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-plan/:id"
          element={
            <PrivateRoute>
              <TrainingPlanCreate />
            </PrivateRoute>
          }
        />
        <Route
          path="/search-plans"
          element={
            <PrivateRoute>
              <SearchTrainingPlans />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
