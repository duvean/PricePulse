import { memo } from 'react';
import { motion } from 'framer-motion';
import PriceEditor from './PriceEditor';

interface ProductCardProps {
  item: any;
  onDelete: (id: number) => void;
  onUpdatePrice: (id: number, newPrice: number) => void;
  onShowHistory: (item: any) => void;
}

const ProductCard = memo(({ item, onDelete, onUpdatePrice, onShowHistory }: ProductCardProps) => {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <article className="product">
        <div className="product-image">
          <img src={item.imageUrl} alt={item.name} />
        </div>
        <div className="product-content">
          <h3 className="product-title">{item.name}</h3>
          <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '5px', padding: '2px 6px' }}>
            Art: {item.article}
          </div>

          <div className="threshold-info">
            <PriceEditor
              id={item.id}
              initialPrice={item.targetPrice}
              onUpdate={onUpdatePrice}
              isReached={item.lastNotifiedPrice !== null}
            />
          </div>
          <div className="product-info">
            <span className="product-price">{item.currentPrice} ₽</span>
            
            {/* Кнопка Истории */}
            <button
              className="action-btn"
              title="История цены"
              onClick={() => onShowHistory(item)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </button>

            {/* Кнопка Удаления */}
            <button className="product-btn product-btn--delete" onClick={() => onDelete(item.id)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </article>
    </motion.article>
  );
});
export default ProductCard;
