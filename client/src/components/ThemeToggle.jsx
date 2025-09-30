import { useSelector, useDispatch } from 'react-redux';
import { setTheme } from '../slices/themeSlice';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.theme);

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };

  return (
    <button
      onClick={handleThemeToggle}
      className="text-xl text-white hover:text-gray-300"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} // Corrected: More descriptive aria-label
    >
      {theme === 'light' ? <FaMoon /> : <FaSun />}
    </button>
  );
};

export default ThemeToggle;