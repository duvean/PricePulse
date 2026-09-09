import { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
    });
};

const formatTooltipDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ru-RU', {
        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
    });
};

const HistoryModal = ({ itemId, itemName, onClose, apiFetch }: any) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await apiFetch(`/items/${itemId}/history`);
                if (res.ok) {
                    const history = await res.json();
                    setData(history);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [itemId]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>История цены: {itemName}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="chart-container">
                    {loading ? (
                        <div className="chart-loading">Загрузка данных...</div>
                    ) : data.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis
                                    dataKey="createdAt"
                                    tickFormatter={formatDate}
                                    tick={{ fontSize: 12 }}
                                    minTickGap={30}
                                />
                                <YAxis
                                    domain={['auto', 'auto']}
                                    tick={{ fontSize: 12 }}
                                    width={40}
                                />
                                <Tooltip
                                    labelFormatter={formatTooltipDate}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#8884d8"
                                    fillOpacity={1}
                                    fill="url(#colorPrice)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-history">
                            <p>История пока пуста. Подождите изменения цены.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default HistoryModal;
