import { useState, useEffect } from "react";

const PriceEditor = ({ id, initialPrice, onUpdate, isReached }: any) => {
  const [price, setPrice] = useState(initialPrice || "");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setPrice(initialPrice || "");
  }, [initialPrice]);

  const handleCommit = () => {
    const numericPrice = Number(price);
    if (numericPrice !== initialPrice && !isNaN(numericPrice)) {
      onUpdate(id, numericPrice);
    }
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div
        className={`price-display ${isReached ? 'status-reached' : 'status-waiting'}`}
        onClick={() => setIsEditing(true)}
      >
        <span className="status-icon">
          {isReached ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          )}
        </span>
        Цель: <span className="target-val">{initialPrice ? `${initialPrice.toLocaleString()} ₽` : "Не задано"}</span>
        <p style={{ color: "GrayText" }}>✎</p>
      </div>
    );
  }

  return (
    <input
      type="number"
      className="price-edit-input"
      autoFocus
      value={price}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setPrice(e.target.value)}
      onBlur={handleCommit}
      onKeyDown={(e) => e.key === "Enter" && handleCommit()}
    />
  );
};
export default PriceEditor;
