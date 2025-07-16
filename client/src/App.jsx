// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Component and Screen imports
import Header from './components/Header';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CourseScreen from './screens/CourseScreen'; // <-- IMPORT

function App() {
  return (
    <Router>
      <Header />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <main className="py-8">
        <div className="container mx-auto px-4">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            {/* --- ADD THIS NEW DYNAMIC ROUTE --- */}
            <Route path="/course/:id" element={<CourseScreen />} />
          </Routes>
        </div>
      </main>
    </Router>
  );
}

export default App;