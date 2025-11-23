import type { Specialization } from "@/types/types";

export const specializations: Specialization[] = [
  {
    id: "ml-engineer",
    name: "Инженер машинного обучения",
    description: "Создавайте и развертывайте ML-модели в масштабе. Работайте с передовыми AI-системами и продакшен-инфраструктурой.",
    marketabilityScore: 95,
    avgSalary: "$130k - $180k",
    requiredSkills: {
      Python: 90,
      "Machine Learning": 85,
      "Deep Learning": 80,
      MLOps: 75,
      Statistics: 70,
      "Cloud Computing": 70,
      "Software Engineering": 75,
    },
    icon: "🤖",
  },
  {
    id: "data-scientist",
    name: "Аналитик данных",
    description:
      "Извлекайте инсайты из данных для принятия бизнес-решений. Освойте статистический анализ и предиктивное моделирование.",
    marketabilityScore: 92,
    avgSalary: "$120k - $170k",
    requiredSkills: {
      Python: 85,
      Statistics: 90,
      "Data Analysis": 85,
      "Machine Learning": 75,
      SQL: 80,
      "Data Visualization": 80,
      "Business Intelligence": 70,
    },
    icon: "📊",
  },
]