import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignIn";
import SignupPage from "./pages/SignUp";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SignInPage />} />
      </Routes>
    </>
  );
}

export default App;
