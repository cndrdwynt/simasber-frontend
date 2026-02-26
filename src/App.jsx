import { useState } from 'react';
// Mengambil file yang baru kita buat
import Login from './components/Login';
import Tracker from './components/Tracker';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState("");

  // Fungsi ini dilempar ke file Login.jsx
  const handleLoginSuccess = (username) => {
    setLoggedInUser(username);
    setIsLoggedIn(true);
  };

  // Fungsi ini dilempar ke file Tracker.jsx
  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser("");
  };

  return (
    <div style={pageContainerStyle}>
      {/* Jika belum login, tampilkan komponen Login. Jika sudah, tampilkan komponen Tracker */}
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Tracker username={loggedInUser} onLogout={handleLogout} />
      )}
    </div>
  );
}

const pageContainerStyle = { maxWidth: '500px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#eff6ff', minHeight: '100vh', boxSizing: 'border-box' };

export default App;