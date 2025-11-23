import { Route, Routes } from "react-router";
import HomePage from "@/pages/HomePage";
import SignInPage from "@/pages/SignIn";
import SignupPage from "@/pages/SignUp";
import CareerPage from "@/pages/CareerPage";
import { SemesterPlanning } from "@/pages/SemesterPlaning";
import  { CompletionPage } from "@/pages/CompletionPage";
import { useState } from "react";

import type { Course, Specialization, StudentProgress } from "@/types/types"
import { recommendCoursesForSemester, calculateUpdatedSkills } from "@/lib/ml-recomender"
import { WhatIfModal } from "./pages/WhatIfPage";
import { OnboardingPage } from "./pages/OnboardingPage";

type AppState = "onboarding" | "planning" | "completed"

function App() {
  /*   useEffect(() => {
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
  }, []); */

  const [appState, setAppState] = useState<AppState>("onboarding");
  const [progress, setProgress] = useState<StudentProgress>({
    currentSemester: 1,
    selectedSpecialization: null,
    currentSkills: {},
    semesterPlans: [],
    totalCredits: 0,
  });
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [showWhatIf, setShowWhatIf] = useState(false);

  const handleSelectSpecialization = (spec: Specialization) => {
    const newProgress = {
      ...progress,
      selectedSpecialization: spec,
      currentSemester: 1,
    };
    setProgress(newProgress);

    // Get initial course recommendations
    const courses = recommendCoursesForSemester(
      spec,
      {},
      [],
      1,
      6 // Show more courses in first semester
    );
    setRecommendedCourses(courses);
    setAppState("planning");
  };

  const handleConfirmCourses = (selectedCourses: Course[]) => {
    if (!progress.selectedSpecialization) return;

    // Update skills based on selected courses
    const updatedSkills = calculateUpdatedSkills(
      progress.currentSkills,
      selectedCourses
    );

    // Add this semester's plan
    const newSemesterPlan = {
      semester: progress.currentSemester,
      courses: selectedCourses,
      completed: true,
    };

    const totalCredits =
      progress.totalCredits +
      selectedCourses.reduce((sum, c) => sum + c.credits, 0);

    const newProgress = {
      ...progress,
      currentSkills: updatedSkills,
      semesterPlans: [...progress.semesterPlans, newSemesterPlan],
      currentSemester: progress.currentSemester + 1,
      totalCredits,
    };

    setProgress(newProgress);

    // Check if we've completed all semesters
    if (newProgress.currentSemester > 4) {
      setAppState("completed");
      return;
    }

    // Recommend courses for next semester
    const completedCourseIds = newProgress.semesterPlans.flatMap((sp) =>
      sp.courses.map((c) => c.id)
    );

    const nextCourses = recommendCoursesForSemester(
      progress.selectedSpecialization,
      updatedSkills,
      completedCourseIds,
      newProgress.currentSemester,
      5
    );

    setRecommendedCourses(nextCourses);
  };

  const handleSwitchSpecialization = (newSpec: Specialization) => {
    // Recalculate course recommendations for the new specialization
    const completedCourseIds = progress.semesterPlans.flatMap((sp) =>
      sp.courses.map((c) => c.id)
    );

    const courses = recommendCoursesForSemester(
      newSpec,
      progress.currentSkills,
      completedCourseIds,
      progress.currentSemester,
      5
    );

    setProgress({
      ...progress,
      selectedSpecialization: newSpec,
    });

    setRecommendedCourses(courses);
    setShowWhatIf(false);
  };

  const handleRestart = () => {
    setProgress({
      currentSemester: 1,
      selectedSpecialization: null,
      currentSkills: {},
      semesterPlans: [],
      totalCredits: 0,
    });
    setAppState("onboarding");
  };

  if (appState === "onboarding") {
    console.log('onboarding')
  }

  if (appState === "completed") {
    console.log('completed')
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />;
        <Route path="/onboarding" element={<OnboardingPage onComplete={handleSelectSpecialization} />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/career" element={<CareerPage />} />
        <Route
          path="/courses"
          element={
            <SemesterPlanning
              semester={progress.currentSemester}
              specialization={progress.selectedSpecialization}
              currentSkills={progress.currentSkills}
              recommendedCourses={recommendedCourses}
              onConfirm={handleConfirmCourses}
              onWhatIf={() => setShowWhatIf(true)}
            />
          }
        />
        <Route path="/what-if?" element={
          <WhatIfModal
            open={showWhatIf}
            onOpenChange={setShowWhatIf}
            currentProgress={progress}
            onSwitch={handleSwitchSpecialization}
          />} />
        <Route path="/completion" element={<CompletionPage progress={progress} onRestart={handleRestart} />} />
      </Routes>
    </>
  );
}

export default App;
