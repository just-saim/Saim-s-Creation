import React, { useState, useEffect } from 'react';

export default function Admin() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('sc_admin_auth') === 'true');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [clock, setClock] = useState('');

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [editOrderModalOpen, setEditOrderModalOpen] = useState(false);
    const [editOrder, setEditOrder] = useState(null);

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: 0, category: 'Sarees', image: '', images: [], stock: 10, colors: ['Gold'], sizes: ['Onesize'], occasion: 'Casual' });

    const [isUploading, setIsUploading] = useState(false);

    const [availableSizes, setAvailableSizes] = useState(['Onesize', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '6', '7', '8', '9', '10', '11']);
    const [customSizeInput, setCustomSizeInput] = useState('');

    const handleImageUpload = async (e, callback) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach(f => formData.append('images', f));

        setIsUploading(true);
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                callback(data.imageUrls);
            } else {
                alert('Failed to upload images');
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Error uploading images');
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => setClock(new Date().toLocaleString()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (localStorage.getItem('sc_admin_auth') === 'true') {
            fetchData();
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: username, pass: password })
            });
            if (res.ok) {
                localStorage.setItem('sc_admin_auth', 'true');
                setIsLoggedIn(true);
                fetchData();
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError('Login failed');
        }
    };

    const fetchData = async () => {
        try {
            const [prodRes, ordRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/orders')
            ]);
            setProducts(await prodRes.json());
            setOrders(await ordRes.json());
        } catch (err) {
            console.error('Failed to load data', err);
        }
    };

    const handleAddProduct = async () => {
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });
            if (res.ok) {
                const addedProd = await res.json();
                setProducts([addedProd, ...products]);
                setAddModalOpen(false);
                setNewProduct({ name: '', price: 0, category: 'Sarees', image: '', images: [], stock: 10, colors: ['Gold'], sizes: ['Onesize'], occasion: 'Casual' });
            } else {
                alert('Failed to add product');
            }
        } catch (err) {
            alert('Error adding product');
        }
    };

    const handleSaveProduct = async () => {
        try {
            const res = await fetch(`/api/products/${editProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editProduct)
            });
            if (res.ok) {
                const updatedProd = await res.json();
                setProducts(products.map(p => p.id === updatedProd.id ? updatedProd : p));
                setEditModalOpen(false);
                setHasUnsavedChanges(false);
                setShowCloseConfirm(false);
            } else {
                alert('Failed to update product');
            }
        } catch (err) {
            alert('Error updating product');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                const res = await fetch(`/api/products/${id}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    setProducts(products.filter(p => p.id !== id));
                } else {
                    alert('Failed to delete product');
                }
            } catch (err) {
                alert('Error deleting product');
            }
        }
    };

    const handleSaveOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${editOrder.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editOrder)
            });
            if (res.ok) {
                const updatedOrd = await res.json();
                setOrders(orders.map(o => o.id === updatedOrd.id ? updatedOrd : o));
                setEditOrderModalOpen(false);
            } else {
                alert('Failed to update order');
            }
        } catch (err) {
            alert('Error updating order');
        }
    };

    if (!isLoggedIn) {
        return (
            <div id="admin-login-screen" style={{ position: 'fixed', inset: 0, background: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="login-box" style={{ background: 'var(--bg-light)', padding: '40px', borderRadius: '8px', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                    <h2 style={{ fontFamily: 'var(--font-head)', color: 'var(--gold)', marginBottom: '24px' }}>Admin Portal</h2>
                    <form onSubmit={handleLogin}>
                        <input
                            type="text"
                            placeholder="Username (admin)"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            style={{ width: '100%', marginBottom: '20px', padding: '12px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', boxSizing: 'border-box' }}
                        />
                        <input
                            type="password"
                            placeholder="Password (admin123)"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%', marginBottom: '20px', padding: '12px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', boxSizing: 'border-box' }}
                        />
                        <button type="submit" className="btn btn-primary btn-block">Login</button>
                        <div style={{ marginTop: '15px' }}>
                            <a href="#" onClick={(e) => { e.preventDefault(); alert("Please contact the main administrator at admin@saimscreation.com to reset your password."); }} style={{ color: 'var(--gold)', fontSize: '0.85rem', textDecoration: 'none' }}>Forget Password?</a>
                        </div>
                        {error && <p className="text-sm" style={{ color: 'var(--danger)', marginTop: '12px' }}>{error}</p>}
                    </form>
                </div>
            </div>
        );
    }

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status !== 'Delivered').length;

    return (
        <div id="admin-view" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-main)' }}>
            <aside className="admin-sidebar" style={{ width: '250px', background: 'var(--bg-light)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <div className="admin-logo" style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <img src="/Img/logo-transparent.png" alt="Saim's Admin Logo" style={{ height: '30px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '1rem', color: 'var(--gold)' }}>×</span>
                    <img src="/Img/upscalemedia-transformed.png" alt="Partner Logo" style={{ height: '30px', objectFit: 'contain', position: 'relative', top: '4px' }} />
                </div>
                <ul className="admin-menu" style={{ listStyle: 'none', padding: '20px 0', flex: 1 }}>
                    {['dashboard', 'orders', 'products', 'payments'].map(tab => (
                        <li key={tab}>
                            <button
                                onClick={() => setActiveTab(tab)}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: activeTab === tab ? 'var(--gold)' : 'var(--text-muted)', background: activeTab === tab ? 'rgba(201,168,76,0.1)' : 'transparent', borderLeft: activeTab === tab ? '3px solid var(--gold)' : '3px solid transparent', width: '100%', textAlign: 'left', borderTop: 'none', borderRight: 'none', borderBottom: 'none', cursor: 'pointer', textTransform: 'capitalize' }}
                            >
                                {tab}
                            </button>
                        </li>
                    ))}
                    <li>
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: 'var(--text-muted)', textDecoration: 'none', width: '100%', boxSizing: 'border-box' }}
                        >
                            View Website ↗
                        </a>
                    </li>
                </ul>
                <div style={{ padding: '20px' }}>
                    <button className="btn btn-outline btn-block text-sm" onClick={() => { localStorage.removeItem('sc_admin_auth'); setIsLoggedIn(false); }}>Logout</button>
                </div>
            </aside>

            <main className="admin-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div className="admin-header" style={{ height: '70px', background: 'var(--bg-light)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
                    <div>Welcome, <span className="text-gold">Admin</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="text-muted text-sm">{clock}</div>
                        <span onClick={() => {
                            document.body.classList.toggle('light-theme');
                            localStorage.setItem('sc_theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
                        }} style={{ cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }} title="Toggle Theme">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                        </span>
                    </div>
                </div>

                <div className="admin-main" style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                    {activeTab === 'dashboard' && (
                        <div className="admin-section active">
                            <h2 style={{ marginBottom: '24px' }}>Overview</h2>
                            <div className="stats-grid">
                                <div className="stat-card"><h3>Total Orders</h3><div className="value">{orders.length}</div></div>
                                <div className="stat-card"><h3>Revenue (PKR)</h3><div className="value">₨ {totalRevenue.toLocaleString()}</div></div>
                                <div className="stat-card"><h3>Pending Orders</h3><div className="value">{pendingOrders}</div></div>
                                <div className="stat-card"><h3>Products</h3><div className="value">{products.length}</div></div>
                            </div>
                            <h3 style={{ marginTop: '32px', marginBottom: '16px' }}>Recent Orders</h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="admin-table">
                                    <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {orders.slice(0, 5).map(o => (
                                            <tr key={o.id}>
                                                <td className="text-gold">{o.id}</td>
                                                <td>{o.customer}</td>
                                                <td>₨ {o.total.toLocaleString()}</td>
                                                <td><span className="badge" style={{ background: 'var(--gold)', color: '#000' }}>{o.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="admin-section active">
                            <h2 style={{ marginBottom: '24px' }}>Manage Orders</h2>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="admin-table">
                                    <thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Method</th><th>Total</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {orders.map(o => (
                                            <tr key={o.id}>
                                                <td className="text-gold">{o.id}</td>
                                                <td>{o.customer}</td>
                                                <td>{o.date}</td>
                                                <td>{o.method}</td>
                                                <td>₨ {o.total.toLocaleString()}</td>
                                                <td>{o.status}</td>
                                                <td>{o.payStatus || 'Pending'}</td>
                                                <td>
                                                    <button className="text-gold" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => { setEditOrder({ ...o }); setEditOrderModalOpen(true); }}>Edit</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="admin-section active">
                            <div className="d-flex justify-between align-center" style={{ marginTop: '0.83em', marginBottom: '24px' }}>
                                <h2 style={{ margin: 0 }}>Manage Products</h2>
                                <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>+ Add Product</button>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="admin-table">
                                    <colgroup>
                                        <col style={{ width: '60px' }} />
                                        <col style={{ width: '60px' }} />
                                        <col />
                                        <col style={{ width: '120px' }} />
                                        <col style={{ width: '120px' }} />
                                        <col style={{ width: '80px' }} />
                                        <col style={{ width: '130px' }} />
                                    </colgroup>
                                    <thead><tr><th>ID</th><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {products.map(p => (
                                            <tr key={p.id}>
                                                <td className="text-muted">{p.id}</td>
                                                <td>
                                                    <div style={{ width: '40px', height: '40px', overflow: 'hidden', borderRadius: '4px', background: 'var(--bg-light)' }}>
                                                        <img src={p.image || `https://via.placeholder.com/40x40/2a161e/c9a84c?text=${p.name.charAt(0)}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                                    </div>
                                                </td>
                                                <td>{p.name}</td>
                                                <td>{p.category}</td>
                                                <td>₨ {p.price.toLocaleString()}</td>
                                                <td><span className={p.stock === 0 ? "badge badge-out" : (p.stock < 5 ? "badge badge-low" : "badge badge-stock")} style={p.stock === 0 ? { background: 'var(--danger)', color: 'white' } : p.stock < 5 ? { background: 'var(--gold)', color: 'black' } : { background: 'var(--success)', color: 'white' }}>{p.stock}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button 
                                                            className="text-gold" 
                                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} 
                                                            onClick={() => { 
                                                                setEditProduct({ ...p }); 
                                                                setEditModalOpen(true); 
                                                                if (p.sizes && p.sizes.length > 0) {
                                                                    const missing = p.sizes.filter(s => !availableSizes.includes(s));
                                                                    if (missing.length > 0) {
                                                                        setAvailableSizes([...availableSizes, ...missing]);
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => handleDeleteProduct(p.id)}>Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="admin-section active">
                            <h2 style={{ marginBottom: '24px' }}>Payment Records</h2>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="admin-table">
                                    <thead><tr><th>Order ID</th><th>Customer</th><th>Method</th><th>Amount</th><th>Pay Status</th></tr></thead>
                                    <tbody>
                                        {orders.map(o => (
                                            <tr key={o.id}>
                                                <td className="text-gold">{o.id}</td>
                                                <td>{o.customer}</td>
                                                <td>{o.method}</td>
                                                <td>₨ {o.total.toLocaleString()}</td>
                                                <td><span className="badge">{o.payStatus}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {addModalOpen && (
                <div className="modal-overlay" style={{ display: 'flex', opacity: 1, visibility: 'visible', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content" style={{ background: 'var(--bg-light)', border: '1px solid var(--gold)', padding: '30px', borderRadius: '4px', position: 'relative', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', transform: 'translateY(0)' }}>
                        <button className="close-modal" onClick={() => setAddModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        <h2 style={{ marginBottom: '20px' }}>Add New Product</h2>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Name</label>
                            <input type="text" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: 'white', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Price (PKR)</label>
                            <input type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: 'white', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Category</label>
                            <input type="text" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: 'white', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Stock Quantity</label>
                            <input type="number" value={newProduct.stock !== undefined ? newProduct.stock : 0} onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: 'white', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Select Sizes</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                                {availableSizes.map(size => {
                                    const isSelected = newProduct.sizes && newProduct.sizes.includes(size);
                                    return (
                                        <div 
                                            key={size} 
                                            style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                border: '1px solid var(--gold)', 
                                                borderRadius: '4px',
                                                background: isSelected ? 'var(--gold)' : 'transparent',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const currentSizes = newProduct.sizes || [];
                                                    if (isSelected) {
                                                        setNewProduct({ ...newProduct, sizes: currentSizes.filter(s => s !== size) });
                                                    } else {
                                                        setNewProduct({ ...newProduct, sizes: [...currentSizes, size] });
                                                    }
                                                }}
                                                style={{
                                                    padding: '6px 12px', background: 'transparent',
                                                    color: isSelected ? '#000' : 'var(--text-main)', border: 'none',
                                                    cursor: 'pointer', fontSize: '0.85rem', fontWeight: isSelected ? 'bold' : 'normal'
                                                }}
                                            >
                                                {size}
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setAvailableSizes(availableSizes.filter(s => s !== size));
                                                    setNewProduct({ ...newProduct, sizes: (newProduct.sizes || []).filter(s => s !== size) });
                                                }}
                                                style={{
                                                    background: 'transparent', border: 'none', 
                                                    color: isSelected ? '#000' : 'var(--danger)', 
                                                    cursor: 'pointer', fontSize: '1rem', 
                                                    padding: '0 8px 0 2px',
                                                    borderLeft: `1px solid ${isSelected ? 'rgba(0,0,0,0.1)' : 'var(--border-color)'}`
                                                }}
                                                title={`Delete ${size} option`}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Add custom size (e.g. 40, Custom XL)" 
                                    value={customSizeInput} 
                                    onChange={e => setCustomSizeInput(e.target.value)} 
                                    style={{ 
                                        flex: 1, 
                                        padding: '8px 12px', 
                                        background: 'transparent', 
                                        border: '1px solid var(--border-color)', 
                                        color: 'var(--text-main)', 
                                        borderRadius: '4px' 
                                    }} 
                                />
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const trimmed = customSizeInput.trim();
                                        if (trimmed && !availableSizes.includes(trimmed)) {
                                            setAvailableSizes([...availableSizes, trimmed]);
                                            setCustomSizeInput('');
                                        }
                                    }} 
                                    style={{ 
                                        padding: '8px 16px', 
                                        background: 'var(--gold)', 
                                        color: '#000', 
                                        border: 'none', 
                                        borderRadius: '4px', 
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Add Size
                                </button>
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Product Images (Max 8)</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                                {(newProduct.images || []).map((img, idx) => (
                                    <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', top: 0, left: 0, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', padding: '2px 4px' }}>{idx + 1}</div>
                                        <button onClick={() => {
                                            const newImgs = [...newProduct.images];
                                            newImgs.splice(idx, 1);
                                            setNewProduct({ ...newProduct, images: newImgs, image: newImgs[0] || '' });
                                        }} style={{ position: 'absolute', top: 0, right: 0, background: 'var(--danger)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '2px 5px', lineHeight: 1 }}>×</button>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    id="product-image-upload-new"
                                    style={{ display: 'none' }}
                                    onChange={e => handleImageUpload(e, urls => {
                                        const combined = [...(newProduct.images || []), ...urls].slice(0, 8);
                                        setNewProduct({ ...newProduct, images: combined, image: combined[0] || '' });
                                    })}
                                />
                                <label
                                    htmlFor="product-image-upload-new"
                                    className="btn btn-outline"
                                    style={{ cursor: 'pointer', margin: 0, padding: '10px 15px', display: 'inline-block' }}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload Images'}
                                </label>
                            </div>
                        </div>
                        <button className="btn btn-primary btn-block" onClick={handleAddProduct}>Add Product</button>
                    </div>
                </div>
            )}

            {editModalOpen && editProduct && (
                <div className="modal-overlay" style={{ display: 'flex', opacity: 1, visibility: 'visible', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content" style={{ background: 'var(--bg-light)', border: '1px solid var(--gold)', padding: '30px', borderRadius: '4px', position: 'relative', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', transform: 'translateY(0)' }}>
                        <button className="close-modal" onClick={() => {
                            if (hasUnsavedChanges) {
                                setShowCloseConfirm(true);
                            } else {
                                setEditModalOpen(false);
                            }
                        }} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        <h2 style={{ marginBottom: '20px' }}>Edit Product</h2>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Name</label>
                            <input type="text" value={editProduct.name} onChange={e => { setEditProduct({ ...editProduct, name: e.target.value }); setHasUnsavedChanges(true); }} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Price (PKR)</label>
                            <input type="number" value={editProduct.price} onChange={e => { setEditProduct({ ...editProduct, price: parseInt(e.target.value) || 0 }); setHasUnsavedChanges(true); }} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Category</label>
                            <input type="text" value={editProduct.category} onChange={e => { setEditProduct({ ...editProduct, category: e.target.value }); setHasUnsavedChanges(true); }} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Stock Quantity</label>
                            <input type="number" value={editProduct.stock !== undefined ? editProduct.stock : 0} onChange={e => { setEditProduct({ ...editProduct, stock: parseInt(e.target.value) || 0 }); setHasUnsavedChanges(true); }} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Select Sizes</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                                {availableSizes.map(size => {
                                    const isSelected = editProduct.sizes && editProduct.sizes.includes(size);
                                    return (
                                        <div 
                                            key={size} 
                                            style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                border: '1px solid var(--gold)', 
                                                borderRadius: '4px',
                                                background: isSelected ? 'var(--gold)' : 'transparent',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const currentSizes = editProduct.sizes || [];
                                                    if (isSelected) {
                                                        setEditProduct({ ...editProduct, sizes: currentSizes.filter(s => s !== size) });
                                                    } else {
                                                        setEditProduct({ ...editProduct, sizes: [...currentSizes, size] });
                                                    }
                                                    setHasUnsavedChanges(true);
                                                }}
                                                style={{
                                                    padding: '6px 12px', background: 'transparent',
                                                    color: isSelected ? '#000' : 'var(--text-main)', border: 'none',
                                                    cursor: 'pointer', fontSize: '0.85rem', fontWeight: isSelected ? 'bold' : 'normal'
                                                }}
                                            >
                                                {size}
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setAvailableSizes(availableSizes.filter(s => s !== size));
                                                    setEditProduct({ ...editProduct, sizes: (editProduct.sizes || []).filter(s => s !== size) });
                                                    setHasUnsavedChanges(true);
                                                }}
                                                style={{
                                                    background: 'transparent', border: 'none', 
                                                    color: isSelected ? '#000' : 'var(--danger)', 
                                                    cursor: 'pointer', fontSize: '1rem', 
                                                    padding: '0 8px 0 2px',
                                                    borderLeft: `1px solid ${isSelected ? 'rgba(0,0,0,0.1)' : 'var(--border-color)'}`
                                                }}
                                                title={`Delete ${size} option`}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Add custom size (e.g. 40, Custom XL)" 
                                    value={customSizeInput} 
                                    onChange={e => setCustomSizeInput(e.target.value)} 
                                    style={{ 
                                        flex: 1, 
                                        padding: '8px 12px', 
                                        background: 'transparent', 
                                        border: '1px solid var(--border-color)', 
                                        color: 'var(--text-main)', 
                                        borderRadius: '4px' 
                                    }} 
                                />
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const trimmed = customSizeInput.trim();
                                        if (trimmed && !availableSizes.includes(trimmed)) {
                                            setAvailableSizes([...availableSizes, trimmed]);
                                            setCustomSizeInput('');
                                            setHasUnsavedChanges(true);
                                        }
                                    }} 
                                    style={{ 
                                        padding: '8px 16px', 
                                        background: 'var(--gold)', 
                                        color: '#000', 
                                        border: 'none', 
                                        borderRadius: '4px', 
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Add Size
                                </button>
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Product Images (Max 8)</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                                {(editProduct.images || []).map((img, idx) => (
                                    <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', top: 0, left: 0, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', padding: '2px 4px' }}>{idx + 1}</div>
                                        <button onClick={() => {
                                            const newImgs = [...(editProduct.images || [])];
                                            newImgs.splice(idx, 1);
                                            setEditProduct({ ...editProduct, images: newImgs, image: newImgs[0] || '' });
                                            setHasUnsavedChanges(true);
                                        }} style={{ position: 'absolute', top: 0, right: 0, background: 'var(--danger)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '2px 5px', lineHeight: 1 }}>×</button>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    id="product-image-upload-edit"
                                    style={{ display: 'none' }}
                                    onChange={e => handleImageUpload(e, urls => {
                                        const combined = [...(editProduct.images || []), ...urls].slice(0, 8);
                                        setEditProduct({ ...editProduct, images: combined, image: combined[0] || '' });
                                        setHasUnsavedChanges(true);
                                    })}
                                />
                                <label
                                    htmlFor="product-image-upload-edit"
                                    className="btn btn-outline"
                                    style={{ cursor: 'pointer', margin: 0, padding: '10px 15px', display: 'inline-block' }}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload Images'}
                                </label>
                            </div>
                        </div>
                        <button className="btn btn-primary btn-block" onClick={handleSaveProduct}>Save Changes</button>
                    </div>

                    {showCloseConfirm && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, borderRadius: '4px' }}>
                            <div style={{ background: 'var(--bg-light)', padding: '24px', borderRadius: '4px', border: '1px solid var(--gold)', width: '320px', textAlign: 'center' }}>
                                <h3 style={{ marginBottom: '16px', color: 'var(--text-main)' }}>Unsaved Changes</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>You have unsaved changes. Would you like to save them?</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button onClick={handleSaveProduct} style={{ background: 'var(--success)', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                                    <button onClick={() => { setShowCloseConfirm(false); setEditModalOpen(false); setHasUnsavedChanges(false); }} style={{ background: 'var(--danger)', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Don't Save</button>
                                    <button onClick={() => setShowCloseConfirm(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {editOrderModalOpen && editOrder && (
                <div className="modal-overlay" style={{ display: 'flex', opacity: 1, visibility: 'visible', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content" style={{ background: 'var(--bg-light)', border: '1px solid var(--gold)', padding: '30px', borderRadius: '4px', position: 'relative', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', transform: 'translateY(0)' }}>
                        <button className="close-modal" onClick={() => setEditOrderModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        <h3 style={{ fontFamily: 'var(--font-head)', color: 'var(--gold)', marginBottom: '20px' }}>Edit Order: {editOrder.id}</h3>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Payment Status</label>
                            <select value={editOrder.payStatus || 'Pending'} onChange={e => setEditOrder({ ...editOrder, payStatus: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--bg-light)', border: '1px solid var(--border-color)', color: 'white' }}>
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Failed">Failed</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Payment Method</label>
                            <select value={editOrder.method || 'Cash on Delivery'} onChange={e => setEditOrder({ ...editOrder, method: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--bg-light)', border: '1px solid var(--border-color)', color: 'white' }}>
                                <option value="Cash on Delivery">Cash on Delivery</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="JazzCash">JazzCash</option>
                                <option value="Credit/Debit Card">Credit/Debit Card</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Order Status</label>
                            <select value={editOrder.status || 'New'} onChange={e => setEditOrder({ ...editOrder, status: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--bg-light)', border: '1px solid var(--border-color)', color: 'white' }}>
                                <option value="New">New</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <button className="btn btn-primary btn-block" onClick={handleSaveOrder}>Save Order Changes</button>
                    </div>
                </div>
            )}
        </div>
    );
}
