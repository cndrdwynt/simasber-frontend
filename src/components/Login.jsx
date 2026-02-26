import { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [nama, setNama] = useState("");
  const [nip, setNip] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // RADAR OTOMATIS: Mendeteksi IP laptop secara otomatis
    const backendUrl = `http://${window.location.hostname}:8000`;

    if (isLoginMode) {
      if (username !== "" && password !== "") {
        try {
          const response = await fetch(`${backendUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            onLoginSuccess(data.nama); 
          } else {
            alert(data.detail); 
          }
        } catch (error) {
          alert("Gagal Login: " + error.message);
        }
      } else {
        alert("Mohon lengkapi Username dan Password Anda.");
      }
    } else {
      if (nama !== "" && nip !== "" && username !== "" && password !== "") {
        try {
          const response = await fetch(`${backendUrl}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama: nama, nip: nip, username: username, password: password })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            alert(`Pendaftaran berhasil untuk ${nama}! Silakan Masuk.`);
            setIsLoginMode(true); 
            setPassword(""); 
          } else {
            alert(data.detail); 
          }
        } catch (error) {
          alert("Gagal Daftar: " + error.message);
        }
      } else {
        alert("Mohon lengkapi seluruh data pendaftaran.");
      }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#1e3a8a', margin: '0 0 5px 0', fontSize: '22px' }}>🏛️ SIMASBER</h2>
          <p style={{ color: '#4b5563', margin: 0, fontSize: '13px', fontWeight: '500' }}>
            Sistem Informasi Manajemen Kebersihan Terpadu
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {!isLoginMode && (
            <>
              <label style={labelStyle}>Nama Lengkap</label>
              <input type="text" style={inputStyle} placeholder="Sesuai KTP..." value={nama} onChange={(e) => setNama(e.target.value)} />

              <label style={labelStyle}>NIP / ID Petugas</label>
              <input type="text" style={inputStyle} placeholder="Masukkan Nomor Induk..." value={nip} onChange={(e) => setNip(e.target.value)} />
            </>
          )}

          <label style={labelStyle}>Username</label>
          <input type="text" style={inputStyle} placeholder="Masukkan username..." value={username} onChange={(e) => setUsername(e.target.value)} />

          <label style={labelStyle}>Password</label>
          <input type="password" style={inputStyle} placeholder="Masukkan password..." value={password} onChange={(e) => setPassword(e.target.value)} />

          <button type="submit" style={buttonStyle}>
            {isLoginMode ? "Masuk ke Sistem" : "Daftarkan Akun"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#4b5563' }}>
          {isLoginMode ? "Belum memiliki akun petugas? " : "Sudah memiliki akun? "}
          <span onClick={() => setIsLoginMode(!isLoginMode)} style={toggleLinkStyle}>
            {isLoginMode ? "Daftar di sini" : "Masuk di sini"}
          </span>
        </div>
      </div>
      <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', marginTop: '20px' }}>
        &copy; 2026 Hak Cipta Dilindungi. <br /> Dikembangkan untuk Keperluan Internal.
      </div>
    </div>
  );
}

const containerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' };
const cardStyle = { backgroundColor: 'white', padding: '30px 25px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.1), 0 4px 6px -2px rgba(37, 99, 235, 0.05)', width: '100%', maxWidth: '400px', boxSizing: 'border-box' };
const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#1e3a8a' };
const inputStyle = { width: '100%', padding: '10px 12px', marginBottom: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#f8fafc', fontSize: '14px', color: '#111827', outlineColor: '#3b82f6' };
const buttonStyle = { width: '100%', padding: '12px', backgroundColor: '#1d4ed8', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', marginTop: '10px', boxShadow: '0 4px 6px rgba(29, 78, 216, 0.2)' };
const toggleLinkStyle = { color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' };

export default Login;