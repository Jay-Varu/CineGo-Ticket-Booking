import { Routes, Route } from 'react-router-dom'; // Import Routes and Route
import Header from './components/Header';
import MovieListPage from './pages/MovieListPage'; 
import MovieDetailPage from './pages/MovieDetailPage';
import RegisterPage from './pages/RegisterPage'; 
import LoginPage from './pages/LoginPage';
import MyBookingsPage from './pages/MyBookingsPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />  {/* Add the Header here so it's on every page */}
      <main>
        <Routes> {/* The Routes component defines our page routes */}
          <Route path="/" element={<MovieListPage />} /> {/* Show list on the main page */}
          <Route path="/movie/:id" element={<MovieDetailPage />} /> 
          <Route path="/register" element={<RegisterPage />} /> 
          <Route path="/login" element={<LoginPage />} /> 
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;