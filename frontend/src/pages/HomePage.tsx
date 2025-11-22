import Marquee from "react-fast-marquee";
import Footer from "../components/footer";
import Header from "../components/header";

const HomePage = () => {
  return (
    <div className="w-full h-screen">
      <Header />
      <main>
        <section className="py-15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-4 py-1 rounded-full mb-8">
                Инновационный подход к образованию
              </span>

              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                SkillSync: Ваш персональный{" "}
                <span className="block bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  навигатор магистратуры
                </span>
              </h1>

              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                Динамический планировщик обучения, который адаптируется под ваши
                успехи и строит индивидуальную образовательную траекторию
                семестр за семестром
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-15 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Как это работает
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                SkillSync превращает сложный процесс планирования магистратуры в
                интуитивный и увлекательный опыт
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: "🎓",
                  title: "Персональная траектория",
                  description:
                    "Индивидуальный план обучения, адаптирующийся под ваши цели и успехи",
                },
                {
                  icon: "📊",
                  title: "Визуализация навыков",
                  description:
                    "Radar-чарт показывает ваш прогресс и цели в реальном времени",
                },
                {
                  icon: "🔄",
                  title: "Гибкое планирование",
                  description:
                    "Меняйте специализацию - система пересчитает весь оставшийся путь",
                },
                {
                  icon: "🚀",
                  title: "Пошаговое развитие",
                  description:
                    "Планируйте обучение семестр за семестром с умными рекомендациями ИИ",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Specializations Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Популярные специализации
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Выберите карьерную цель - мы построим оптимальный путь её
                достижения
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Machine Learning Engineer",
                  demand: "Высокий спрос",
                  description: "Разработка и внедрение ML-моделей",
                },
                {
                  name: "Data Scientist",
                  demand: "Высокий спрос",
                  description: "Анализ данных и построение прогнозов",
                },
                {
                  name: "AI Research Engineer",
                  demand: "Средний спрос",
                  description:
                    "Исследования в области искусственного интеллекта",
                },
              ].map((spec, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-lg border-2 border-transparent hover:border-blue-200 hover:transform hover:-translate-y-1 transition-all duration-200"
                >
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full mb-4">
                    {spec.demand}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {spec.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{spec.description}</p>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                    Выбрать специализацию →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600 text-white">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-1">
                <Marquee
                  speed={50} // Скорость анимации
                  delay={0} // Задержка перед стартом
                  gradient={false} // Отключить градиенты
                  gradientWidth={50} // Ширина градиента
                  pauseOnHover={true} // Пауза при наведении
                  pauseOnClick={true} // Пауза при клике
                  direction="right" // Направление
                >
                  <p className="font-bold text-3xl">
                    Открой двери к престижной карьере! Глубокие знания и навыки
                    в магистратуре.
                  </p>
                  <p className="font-bold text-3xl"> Учись, работай, побеждай! </p>
                  <p className="font-bold text-3xl">
                     Углубленные знания, практический опыт, сильное комьюнити.
                  </p>
                </Marquee>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
