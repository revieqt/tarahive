import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import VotePage from './pages/VotePage';
import DownloadPage from './pages/DownloadPage';
import './App.css';

function App() {
  // SET ROUTES
  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/vote" element={<VotePage />} />
          <Route path="/download" element={<DownloadPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
