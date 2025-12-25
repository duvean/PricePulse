import { useState, useEffect } from "react";
import { apiFetch } from "../api";

const API_URL = "http://localhost:3000";

export default function Profile() {
  const [user, setUser] = useState<any>(null);

  const loadProfile = () => {
    apiFetch("/auth/me").then(res => res.json()).then(data => setUser(data));
  };

  useEffect(() => { loadProfile(); }, []);

  const handleUnlink = async () => {
    if (!confirm("Отключить уведомления в Telegram?")) return;
    const res = await apiFetch("/auth/unlink-telegram", { method: "POST" });
    if (res.ok) loadProfile();
  };

  if (!user) return <div>Загрузка...</div>;

  const botName = "PricePulseNotifierBot";
  const link = `https://t.me/${botName}?start=${user.id}`;
  const avatarSrc = user.telegramAvatar 
    ? (user.telegramAvatar.startsWith('http') 
        ? user.telegramAvatar 
        : `${API_URL}${user.telegramAvatar}`)
    : null;

  return (
    <div className="wrapper">
      <h1>Личный кабинет</h1>
      <div className="card profile-card">
        {avatarSrc && (
          <img 
            src={avatarSrc} 
            alt="Avatar" 
            className="tg-avatar"
            onError={(e) => console.error("Image failed to load:", avatarSrc)} 
          />
        )}
        <div className="profile-info">
            <p><strong>Email:</strong> {user.email}</p>
            {user.telegramName && <p><strong>Telegram:</strong> {user.telegramName}</p>}
        </div>
        
        <hr />

        {user.telegramId ? (
          <div className="status-success">
            <p>✅ Уведомления активны</p>
            <button className="btn btn-danger" onClick={handleUnlink}>Отвязать Telegram</button>
          </div>
        ) : (
          <div className="status-pending">
            <p>Уведомления не настроены</p>
            <a href={link} target="_blank" className="btn">Привязать бота</a>
          </div>
        )}
      </div>

      <style>{`
        .profile-card { display: flex; flex-direction: column; align-items: center; gap: 15px; padding: 20px; text-align: center; }
        .tg-avatar { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #0088cc; }
        .btn-danger { background: #ff4d4f; margin-top: 10px; }
        .status-success { color: #52c41a; }
      `}</style>
    </div>
  );
}