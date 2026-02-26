import { useState, useEffect } from 'react';

function Tracker({ username, onLogout }) {
  const [history, setHistory] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [status, setStatus] = useState("Selesai");
  const [note, setNote] = useState("");
  const [waktuSekarang, setWaktuSekarang] = useState("");
  const [photo, setPhoto] = useState(null); 
  const [zoomedImage, setZoomedImage] = useState(null);

  const backendUrl = `http://${window.location.hostname}:8000`;

  const fetchLaporanDB = async () => {
    try {
      const response = await fetch(`${backendUrl}/laporan`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Gagal menarik histori: " + error.message);
    }
  };

  useEffect(() => {
    fetchLaporanDB();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setWaktuSekarang(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " WIB");
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // FUNGSI BARU: KOMPRESOR FOTO (Mengecilkan Ukuran)
  // ==========================================
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Batasi ukuran maksimal gambar jadi 800 pixel saja
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Ubah ke JPEG dengan kualitas 70% (ukuran file akan turun drastis!)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleKirimLaporan = async () => {
    if (selectedRoom === "") { alert("Pilih ruangan terlebih dahulu!"); return; }
    if (status === "Ada Kendala" && !photo) { alert("Mohon lampirkan foto bukti!"); return; }

    let fotoBase64 = null;
    if (photo) {
      // Gunakan fungsi kompresi yang baru!
      fotoBase64 = await compressImage(photo);
    }

    const payloadData = {
      username: username, 
      room: selectedRoom,
      status: status,
      note: note,
      time: waktuSekarang,
      photoUrl: fotoBase64
    };

    try {
      const response = await fetch(`${backendUrl}/laporan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadData)
      });

      if (response.ok) {
        alert("Laporan dan Foto berhasil tersimpan!");
        fetchLaporanDB();
        
        setSelectedRoom("");
        setNote("");
        setStatus("Selesai");
        setPhoto(null);
        document.getElementById("fileInput").value = ""; 
      } else {
        alert("Gagal menyimpan ke database.");
      }
    } catch (error) {
      alert("ERROR ASLI: " + error.message);
    }
  };

  const totalLaporan = history.length;
  const totalSelesai = history.filter(item => item.status === "Selesai").length;
  const totalKendala = history.filter(item => item.status === "Ada Kendala").length;

  return (
    <div>
      {/* POP-UP ZOOM GAMBAR */}
      {zoomedImage && (
        <div style={modalOverlayStyle} onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} alt="Zoomed" style={modalImageStyle} />
          <div style={{ color: 'white', marginTop: '15px', backgroundColor: '#ef4444', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Kembali
          </div>
        </div>
      )}

      {/* Header & Jam */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#1e3a8a', padding: '15px 20px', borderRadius: '10px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Halo, Petugas {username}!</h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#bfdbfe', marginTop: '4px' }}>SIMASBER - Area Tugas Anda</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace' }}>{waktuSekarang}</div>
          <button onClick={onLogout} style={logoutButtonStyle}>Keluar Sistem</button>
        </div>
      </div>

      {/* Dashboard */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <div style={{ ...statCardStyle, borderTop: '4px solid #3b82f6' }}>
          <div style={statLabelStyle}>Total Laporan</div>
          <div style={statValueStyle}>{totalLaporan}</div>
        </div>
        <div style={{ ...statCardStyle, borderTop: '4px solid #10b981' }}>
          <div style={statLabelStyle}>Selesai</div>
          <div style={{ ...statValueStyle, color: '#10b981' }}>{totalSelesai}</div>
        </div>
        <div style={{ ...statCardStyle, borderTop: '4px solid #ef4444' }}>
          <div style={statLabelStyle}>Kendala</div>
          <div style={{ ...statValueStyle, color: '#ef4444' }}>{totalKendala}</div>
        </div>
      </div>

      {/* FORM LAPORAN */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, color: '#1e40af', borderBottom: '2px solid #bfdbfe', paddingBottom: '10px' }}>
          Input Laporan Kebersihan
        </h3>
        
        <label style={labelStyle}>Pilih Ruangan:</label>
        <select style={inputStyle} value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
          <option value="">-- Pilih Ruangan --</option>
          <option value="Lobby Utama">Lobby Utama</option>
          <option value="Ruang Rapat A">Ruang Rapat A</option>
          <option value="Toilet Lantai 1">Toilet Lantai 1</option>
        </select>

        <label style={labelStyle}>Kondisi / Status:</label>
        <select style={inputStyle} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Selesai">✅ Selesai & Bersih</option>
          <option value="Ada Kendala">⚠️ Ada Kendala / Kerusakan</option>
        </select>

        <label style={labelStyle}>Bukti Foto (Wajib jika ada kendala):</label>
        <input 
          id="fileInput"
          type="file" 
          accept="image/*" 
          capture="environment"
          style={{...inputStyle, padding: '8px', backgroundColor: 'white'}}
          onChange={(e) => setPhoto(e.target.files[0])}
        />

        <label style={labelStyle}>Catatan Tambahan (Opsional):</label>
        <textarea 
          placeholder="Misal: Lampu mati, tisu habis..." 
          style={{ ...inputStyle, height: '70px', resize: 'vertical' }}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        ></textarea>

        <button style={buttonStyle} onClick={handleKirimLaporan}>Kirim Laporan</button>
      </div>

      {/* HISTORI */}
      <h3 style={{ color: '#1e3a8a', marginBottom: '15px' }}>Histori Seluruh Laporan (Dari Database)</h3>
      
      {history.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280', backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>Belum ada data di database.</p>
      ) : (
        history.map((item) => (
          <div key={item.id} style={{ ...historyCardStyle, borderLeft: item.status === "Selesai" ? '5px solid #10b981' : '5px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong style={{ color: '#1e40af', fontSize: '15px' }}>{item.room}</strong>
              <span style={{ color: '#6b7280', fontSize: '12px' }}>{item.time}</span>
            </div>
            
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
               Dilaporkan oleh: <strong>{item.username}</strong>
            </div>

            <div style={{ 
              display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', 
              backgroundColor: item.status === "Selesai" ? '#d1fae5' : '#fee2e2', color: item.status === "Selesai" ? '#065f46' : '#991b1b', marginBottom: '8px'
            }}>
              {item.status}
            </div>
            
            <p style={{ margin: 0, color: '#4b5563', fontSize: '13px', lineHeight: '1.5', marginBottom: '8px' }}>
              {item.note || "Tidak ada catatan."}
            </p>

            {item.photoUrl && (
              <div style={{ textAlign: 'center' }}>
                <img 
                  src={item.photoUrl} 
                  alt="Bukti Laporan" 
                  onClick={() => setZoomedImage(item.photoUrl)}
                  style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', marginTop: '5px', border: '1px solid #cbd5e1', cursor: 'pointer' }} 
                />
                <span style={{ fontSize: '11px', color: '#3b82f6' }}>🔍 Klik gambar untuk melihat penuh</span>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// Gaya CSS
const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.05)', marginBottom: '25px' };
const historyCardStyle = { backgroundColor: 'white', padding: '15px', borderRadius: '10px', marginBottom: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const statCardStyle = { flex: 1, backgroundColor: 'white', padding: '15px 10px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const statLabelStyle = { fontSize: '11px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' };
const statValueStyle = { fontSize: '20px', fontWeight: 'bold', color: '#1e3a8a' };
const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#1e3a8a' };
const inputStyle = { width: '100%', padding: '10px 12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#f8fafc', fontSize: '14px', color: '#111827' };
const buttonStyle = { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' };
const logoutButtonStyle = { padding: '6px 10px', backgroundColor: 'transparent', color: '#fca5a5', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', marginTop: '8px', transition: '0.2s' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalImageStyle = { maxWidth: '90%', maxHeight: '80vh', borderRadius: '8px', border: '2px solid white', objectFit: 'contain' };

export default Tracker;