import { useState, useEffect } from 'react';

function AdminDashboard({ onLogout }) {
  const [laporan, setLaporan] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null);
  
  // Radar otomatis untuk Backend
  const backendUrl = `http://${window.location.hostname}:8000`;

  const fetchSemuaLaporan = async () => {
    try {
      const response = await fetch(`${backendUrl}/laporan`);
      if (response.ok) {
        const data = await response.json();
        setLaporan(data);
      }
    } catch (error) {
      console.error("Gagal menarik data: " + error.message);
    }
  };

  useEffect(() => {
    // Ambil data saat halaman admin dibuka
    fetchSemuaLaporan();
    
    // Fitur canggih: Refresh data otomatis setiap 10 detik agar Admin melihat laporan real-time!
    const interval = setInterval(fetchSemuaLaporan, 10000);
    return () => clearInterval(interval);
  }, []);

  // Menghitung statistik untuk dasbor
  const totalLaporan = laporan.length;
  const totalKendala = laporan.filter(item => item.status === "Ada Kendala").length;

  return (
    <div style={adminContainerStyle}>
      {/* POP-UP ZOOM GAMBAR */}
      {zoomedImage && (
        <div style={modalOverlayStyle} onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} alt="Bukti" style={modalImageStyle} />
          <div style={{ color: 'white', marginTop: '15px', backgroundColor: '#ef4444', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' }}>
            Tutup
          </div>
        </div>
      )}

      {/* HEADER ADMIN */}
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0 }}>👑 Dasbor Administrator</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1' }}>Pusat Kontrol SIMASBER</p>
        </div>
        <button onClick={onLogout} style={logoutBtnStyle}>Keluar</button>
      </div>

      {/* STATISTIK CEPAT */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div style={{ ...statBox, backgroundColor: '#3b82f6' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalLaporan}</div>
          <div style={{ fontSize: '12px' }}>Total Laporan Masuk</div>
        </div>
        <div style={{ ...statBox, backgroundColor: '#ef4444' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalKendala}</div>
          <div style={{ fontSize: '12px' }}>Membutuhkan Perbaikan</div>
        </div>
      </div>

      {/* TABEL DATA LAPORAN */}
      <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
        <h3 style={{ marginTop: 0, color: '#1e3a8a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>Rekapitulasi Kebersihan</h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
              <th style={thStyle}>Waktu</th>
              <th style={thStyle}>Petugas</th>
              <th style={thStyle}>Ruangan</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Catatan</th>
              <th style={thStyle}>Bukti Foto</th>
            </tr>
          </thead>
          <tbody>
            {laporan.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={tdStyle}>{item.time}</td>
                <td style={{ ...tdStyle, fontWeight: 'bold', color: '#1e40af' }}>{item.username}</td>
                <td style={tdStyle}>{item.room}</td>
                <td style={tdStyle}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                    backgroundColor: item.status === "Selesai" ? '#d1fae5' : '#fee2e2', 
                    color: item.status === "Selesai" ? '#065f46' : '#991b1b' 
                  }}>
                    {item.status}
                  </span>
                </td>
                <td style={tdStyle}>{item.note || "-"}</td>
                <td style={tdStyle}>
                  {item.photoUrl ? (
                    <button onClick={() => setZoomedImage(item.photoUrl)} style={photoBtnStyle}>Lihat Foto</button>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>Tidak ada</span>
                  )}
                </td>
              </tr>
            ))}
            {laporan.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Belum ada laporan masuk.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Gaya CSS khusus halaman Admin
const adminContainerStyle = { padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', color: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px' };
const statBox = { flex: 1, padding: '20px', color: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
const thStyle = { padding: '12px 15px', borderBottom: '2px solid #cbd5e1' };
const tdStyle = { padding: '12px 15px', color: '#475569' };
const logoutBtnStyle = { padding: '8px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const photoBtnStyle = { padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalImageStyle = { maxWidth: '90%', maxHeight: '80vh', borderRadius: '8px', border: '2px solid white', objectFit: 'contain' };

export default AdminDashboard;