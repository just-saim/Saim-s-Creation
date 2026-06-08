import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchModal({ isOpen, setIsOpen }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && products.length === 0) {
            fetch('/api/products')
                .then(res => res.json())
                .then(data => setProducts(data))
                .catch(err => console.error(err));
        }
    }, [isOpen, products.length]);

    if (!isOpen) return null;

    const filteredProducts = searchTerm 
        ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    return (
        <div className="search-dropdown-card" style={{
            position: 'absolute',
            top: '40px',
            right: 0,
            background: 'var(--bg-light)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            width: '320px',
            zIndex: 1000,
            padding: '15px',
            borderRadius: '4px'
        }}>
            <input 
                type="text" 
                autoFocus
                placeholder="Search products by name..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                    width: '100%',
                    padding: '10px 15px',
                    background: 'var(--bg-color)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    borderRadius: '2px',
                    marginBottom: '10px',
                    boxSizing: 'border-box'
                }}
            />
            
            {searchTerm && (
                <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                            <div 
                                key={product.id} 
                                onClick={() => {
                                    setIsOpen(false);
                                    setSearchTerm('');
                                    navigate(`/product/${product.id}`);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    transition: 'background 0.2s',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    if(document.body.classList.contains('light-theme')) {
                                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                                    }
                                }}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <img src={product.images && product.images.length > 0 ? product.images[0] : (product.image || 'https://via.placeholder.com/50')} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                <div>
                                    <div style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.2 }}>{product.name}</div>
                                    <div style={{ color: 'var(--gold)', fontSize: '0.75rem', marginTop: '4px' }}>Rs. {product.price.toLocaleString()}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '15px 0' }}>No products match your search.</div>
                    )}
                </div>
            )}
        </div>
    );
}
