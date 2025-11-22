import { Link } from 'react-router';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900 font-sans">SkillSync</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link 
              to="/signin" 
              className="text-gray-600 hover:text-gray-900 font-medium font-sans transition-colors"
            >
              Войти
            </Link>
            <Link 
              to="/signup" 
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md font-medium font-sans transition-colors"
            >
              Начать бесплатно
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;