import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          {/* Brand */}
          <div className="flex items-center mb-4 md:mb-0">
            <span className="ml-2 text-xl font-bold font-sans">SkillSync</span>
          </div>

          {/* Links */}
          <div className="flex space-x-6">
            <Link 
              to="/privacy" 
              className="text-gray-400 hover:text-white transition-colors font-sans"
            >
              Политика
            </Link>
            <Link 
              to="/terms" 
              className="text-gray-400 hover:text-white transition-colors font-sans"
            >
              Условия
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-400 hover:text-white transition-colors font-sans"
            >
              Контакты
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-400 font-sans">
            &copy; 2024 SkillSync. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;