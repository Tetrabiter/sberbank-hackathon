import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignIn";
import SignupPage from "./pages/SignUp";
import { useEffect } from "react";


function App() {
 useEffect(() => {
    const testWithFetch = async () => {
      try {
        console.log("🔄 Тестирую через fetch...");

        const response = await fetch("http://10.216.2.231:8090/health", {
          method: "GET",
          // явно указываем режим CORS
        });

        if (response.ok) {
          const data = await response.text();
          console.log("✅ Fetch успешен:", data);
        } else {
          console.log("❌ Fetch ошибка:", response.status);
        }
      } catch (error) {
        console.error("❌ Fetch ошибка:", error);
      }
    };

    testWithFetch();
  }, []);

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
