import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "../api";
import { WbItem } from "../interfaces";

export default function WbDashboard() {
  const [items, setItems] = useState<WbItem[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false); // Для плейсхолдера
  const [sortBy, setSortBy] = useState("newest");  // Состояние фильтра

  const loadItems = async () => {
      const res = await apiFetch("/items");
      if (res.ok) {
        let data = await res.json();
        setItems(data);
      }
  };

  useEffect(() => { loadItems(); }, []);

  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === "newest") return b.id - a.id;
    if (sortBy === "oldest") return a.id - b.id;
    return 0;
  });

  const handleAdd = async () => {
    if (!urlInput.trim()) {
      alert("Please enter a link or article");
      return;
    }
    
    if (!targetPrice || Number(targetPrice) <= 0) {
      alert("Please set a valid Target Price to start tracking");
      return;
    }

    setLoading(true);
    setIsAdding(true);
    
    try {
      const res = await apiFetch("/items", {
        method: "POST",
        body: JSON.stringify({ 
          url: urlInput, 
          targetPrice: Number(targetPrice) 
        }),
      });

      if (res.ok) {
        setUrlInput("");
        setTargetPrice("");
        await loadItems();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Error adding item");
      }
    } catch (e) {
      alert("Connection error");
    } finally {
      setLoading(false);
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить?")) return;
    const res = await apiFetch(`/items/${id}`, { method: "DELETE" });
    if (res.ok) setItems(items.filter(i => i.id !== id));
  };

  return (
    <>
      {/* Search Section */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Add New</h2>
        </div>
        <div className="search-wrapper">
          <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
             <input 
                className="modern-input" 
                placeholder="Link or Article..." 
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
             />
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
             <input 
                className="modern-input" 
                type="number"
                placeholder="Target Price" 
                value={targetPrice}
                onChange={e => setTargetPrice(e.target.value)}
             />
             <button 
                className="app-header-btn app-header-btn--active" 
                onClick={handleAdd}
                style={{background: 'white', borderRadius: '15px', width: '50px', height: 'auto'}}
             >
                {loading ? "..." : "+"}
             </button>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Tracking ({items.length})</h2>
          
          <select 
            className="filter-select" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        <div className="product-grid">
          {/* Плейсхолдер во время добавления */}
          {isAdding && (
            <article className="product skeleton-card">
              <div className="skeleton-shimmer"></div>
            </article>
          )}

          {sortedItems.map(item => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={item.id}
            >
              <article className="product">
                <div className="product-image">
                  <img src={item.imageUrl} alt={item.name} />
                </div>
                <div className="product-content">
                  <h3 className="product-title">{item.name}</h3>
                  <div style={{fontSize: '0.75rem', color: '#999', marginBottom: '5px', padding: '2px 6px'}}>
                      Art: {item.article}
                  </div>
                
                  {item.targetPrice && (
                      <div style={{fontSize: '0.7rem', color: '#10b981', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', width: 'fit-content'}}>
                          Target: {item.targetPrice} ₽
                      </div>
                  )}
                  <div className="product-info">
                    <span className="product-price">{item.currentPrice} ₽</span>
                    <button className="product-btn" onClick={() => window.open(`https://www.wildberries.ru/catalog/${item.article}/detail.aspx`, '_blank')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </button>
                    <button className="product-btn product-btn--delete" onClick={() => handleDelete(item.id)}>
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                </div>
              </article>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}