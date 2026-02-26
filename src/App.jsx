import { useState } from 'react';
import Login from './components/Login';
import Tracker from './components/Tracker';
import AdminDashboard from './components/AdminDashboard'; // Import komponen Admin yang baru

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Detektor Admin

  // Fungsi ini dipanggil dari Login.jsx saat berhasil masuk
  const handleLoginSuccess = (namaPetugas) => {
    setCurrentUser(namaPetugas);
    setIsLoggedIn(true);
    
    // CEK JALUR RAHASIA: Jika nama/username-nya mengandung kata "admin" (huruf besar/kecil)
    if (namaPetugas.toLowerCase().includes("admin")) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser("");
    setIsAdmin(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '20px' }}>
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : isAdmin ? (
        // Masuk ke meja VIP Admin
        <AdminDashboard onLogout={handleLogout} /> 
      ) : (
        // Masuk ke meja Petugas Kebersihan biasa
        <Tracker username={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;