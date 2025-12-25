import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { WbItem } from "../interfaces";

export default function WbDashboard() {
  const [items, setItems] = useState<WbItem[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [targetPrice, setTargetPrice] = useState(""); 
  const [loading, setLoading] = useState(false);

  const loadItems = async () => {
    const res = await apiFetch("/items");
    if (res.ok) setItems(await res.json());
  };

  useEffect(() => { loadItems(); }, []);

  const handleAdd = async () => {
    if (!urlInput) return;
    setLoading(true);
    try {
      const res = await apiFetch("/items", {
        method: "POST",
        body: JSON.stringify({ 
            url: urlInput, 
            targetPrice: targetPrice ? Number(targetPrice) : null 
        }),
      });
      
      if (res.ok) {
        setUrlInput("");
        setTargetPrice("");
        loadItems();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (e) {
      alert("Ошибка сети при парсинге");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await apiFetch(`/items/${id}`, { method: "DELETE" });
    if (res.ok) {
        setItems(items.filter(item => item.id !== id));
    }
  };

  return (
    <div className="wrapper" style={{ maxWidth: '800px' }}>
      <h1>PRICE PULSE</h1>
      
      <div className="search-box" style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
        <input 
          className="input" 
          placeholder="Вставьте ссылку на товар или артикул..." 
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
        />
        
        <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              className="input" 
              type="number"
              placeholder="Уведомить, если цена станет ниже..." 
              value={targetPrice}
              style={{ flex: 1 }}
              onChange={e => setTargetPrice(e.target.value)}
            />
            <button className="btn" onClick={handleAdd} disabled={loading}>
              {loading ? "Загрузка..." : "Спарсить"}
            </button>
        </div>
      </div>

      <div className="items-grid">
        {items.map(item => (
          <div className="item-card" key={item.id}>
            <img src={item.imageUrl} alt={item.name} />
            <div className="info">
                <h3>{item.name}</h3>
                <div className="price-container">
                    <span className="current-price">{item.currentPrice} ₽</span>
                    {item.oldPrice > 0 && (
                        <span className="old-price">{item.oldPrice} ₽</span>
                    )}
                </div>
        
                {item.targetPrice && (
                    <p className="target-info">
                        Цель: <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{item.targetPrice} ₽</span>
                    </p>
                )}

                <p className="meta">Артикул: {item.article}</p>
                <button className="delete" onClick={() => handleDelete(item.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}