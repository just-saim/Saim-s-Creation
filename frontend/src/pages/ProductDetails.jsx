import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const COLOR_MAP = {
    'Red': '#e53935', 'Blue': '#1e88e5', 'Green': '#43a047', 'Black': '#333',
    'Gold': '#c9a84c', 'Maroon': '#800020', 'Teal': '#00897b', 'Ivory': '#f5f0e1',
    'White': '#fff', 'Pink': '#e91e63', 'Yellow': '#fdd835', 'Purple': '#8e24aa',
    'Orange': '#fb8c00', 'Grey': '#9e9e9e', 'Brown': '#795548', 'Navy': '#1a237e',
    'Beige': '#d4c5a9', 'Silver': '#bdbdbd', 'Cream': '#fffdd0'
};

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState(null);
    const [sizeError, setSizeError] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [qty, setQty] = useState(1);
    const [cartOpen, setCartOpen] = useState(false);
    const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('sc_cart')) || []);

    // Image Viewer States
    const [activeImage, setActiveImage] = useState('');
    const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
    const [lensStyle, setLensStyle] = useState({ display: 'none' });

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                const found = data.find(p => p.id === id);
                setProduct(found);

                if (found) {
                    const similar = data.filter(p => p.category === found.category && p.id !== found.id).slice(0, 5);
                    setSimilarProducts(similar);
                    const imgs = found.images && found.images.length > 0 ? found.images : (found.image ? [found.image] : []);
                    setActiveImage(imgs[0] || '');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching product:", err);
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        localStorage.setItem('sc_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (goToCart = false) => {
        if (!product) return;
        // Size validation - only if product has sizes
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            setSizeError(true);
            // Scroll size selector into view
            document.getElementById('size-selector-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        setSizeError(false);
        const exist = cart.find(item => item.id === product.id);
        if (exist) {
            setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item));
        } else {
            setCart([...cart, { ...product, qty }]);
        }
        if (goToCart) setCartOpen(true);
        else {
            const toast = document.createElement('div');
            toast.innerText = `✓ Added ${qty} item${qty > 1 ? 's' : ''} to cart`;
            toast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#C9A84C;color:#000;padding:12px 24px;border-radius:4px;font-weight:700;z-index:9999;font-size:0.9rem;';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2500);
        }
    };

    const handleMouseMove = (e) => {
        if (!activeImage) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;

        // Lens size (150x150)
        let lensSize = 150;
        let lensX = x - (lensSize / 2);
        let lensY = y - (lensSize / 2);

        if (lensX < 0) lensX = 0;
        if (lensY < 0) lensY = 0;
        if (lensX > width - lensSize) lensX = width - lensSize;
        if (lensY > height - lensSize) lensY = height - lensSize;

        setLensStyle({
            display: 'block',
            left: `${lensX}px`,
            top: `${lensY}px`,
            width: `${lensSize}px`,
            height: `${lensSize}px`
        });

        // Zoom ratio
        const ratioX = lensX / (width - lensSize);
        const ratioY = lensY / (height - lensSize);

        setZoomStyle({
            display: 'block',
            backgroundImage: `url(${activeImage})`,
            backgroundPosition: `${ratioX * 100}% ${ratioY * 100}%`,
            backgroundSize: `${width * 2}px ${height * 2}px` // 2x magnification
        });
    };

    const handleMouseLeave = () => {
        setLensStyle({ display: 'none' });
        setZoomStyle({ display: 'none' });
    };

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', color: 'var(--gold)' }}>Loading...</div>;
    if (!product) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', color: 'var(--text-main)', flexDirection: 'column' }}><h2>Product Not Found</h2><button className="btn btn-outline" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>Go Back Home</button></div>;

    const allImages = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);

    return (
        <div style={{ minHeight: '100vh' }}>
            <header className="navbar fade-in-down pd-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 100, minHeight: '75px' }}>
                {/* Left side: Empty spacer for centering */}
                <div className="desktop-spacer" style={{ justifyContent: 'flex-start' }}></div>

                {/* Center: Logo */}
                <div className="logo" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <img src="/Img/logo-transparent.png" alt="Saim's Creation Logo" className="logo-img-1" />
                    <span className="logo-separator">×</span>
                    <img src="/Img/upscalemedia-transformed.png" alt="Partner Logo" className="logo-img-2" />
                </div>
                
                {/* Right side: Icons */}
                <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 20px)', flexWrap: 'nowrap', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                    <span onClick={() => {
                        document.body.classList.toggle('light-theme');
                        localStorage.setItem('sc_theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
                    }} style={{ cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }} title="Toggle Theme">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                    </span>
                    {/* Cart icon - opens mini cart */}
                    <div style={{ position: 'relative', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center' }} onClick={() => setCartOpen(true)}>
                        🛒
                        {cart.length > 0 && <span className="cart-badge">{cart.reduce((a, c) => a + c.qty, 0)}</span>}
                    </div>
                </div>
            </header>

            {/* Mini Cart Drawer */}
            {cartOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
                    <div onClick={() => setCartOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
                    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '360px', background: 'var(--bg-light)', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.3)' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>My Bag ({cart.reduce((a, c) => a + c.qty, 0)} items)</span>
                            <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                            {cart.length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '60px' }}>Your bag is empty</div>
                            ) : cart.map(item => (
                                <div key={item.id} style={{ display: 'flex', gap: '12px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                                    <div style={{ width: '70px', height: '90px', background: 'var(--bg-color)', flexShrink: 0, borderRadius: '2px', overflow: 'hidden' }}>
                                        {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Rs. {item.price.toLocaleString()}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button onClick={() => setCart(c => c.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))} style={{ width: '28px', height: '28px', border: '1px solid var(--border-color,var(--border-color))', background: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1rem', borderRadius: '2px' }}>−</button>
                                            <span style={{ minWidth: '24px', textAlign: 'center', color: 'var(--text-main)', fontWeight: 600 }}>{item.qty}</span>
                                            <button onClick={() => setCart(c => c.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))} style={{ width: '28px', height: '28px', border: '1px solid var(--border-color,var(--border-color))', background: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1rem', borderRadius: '2px' }}>+</button>
                                            <button onClick={() => setCart(c => c.filter(i => i.id !== item.id))} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {cart.length > 0 && (
                            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--gold)' }}>Rs. {cart.reduce((a, c) => a + c.price * c.qty, 0).toLocaleString()}</span>
                                </div>
                                <button style={{ width: '100%', padding: '14px', background: 'var(--text-main)', color: 'var(--bg-color)', border: 'none', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px', letterSpacing: '1px' }}>Checkout</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div style={{ padding: '20px clamp(16px, 4vw, 40px)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
                <span style={{ margin: '0 6px' }}>/</span>
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>{product.category}</span>
                <span style={{ margin: '0 6px' }}>/</span>
                <span style={{ color: 'var(--text-main)' }}>{product.name}</span>
            </div>

            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px) 40px' }}>
                <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative' }}>

                    {/* Left: Image Viewer */}
                    <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', minWidth: '320px' }}>

                        <div
                            className="product-detail-main-img"
                            style={{ position: 'relative', border: '1px solid var(--border-color)', cursor: 'crosshair', width: '100%', aspectRatio: '3/4', overflow: 'hidden' }}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            {product.stock === 0 && <span className="badge badge-out badge-wrapper" style={{ zIndex: 10 }}>Sold Out</span>}
                            {/* Wishlist Heart Icon - top right of image */}
                            <button
                                onClick={() => setWishlisted(w => !w)}
                                style={{
                                    position: 'absolute', top: '12px', right: '12px', zIndex: 10,
                                    background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%',
                                    width: '38px', height: '38px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
                                    backdropFilter: 'blur(4px)'
                                }}
                                title="Add to Wishlist"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? '#e53935' : 'none'} stroke={wishlisted ? '#e53935' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                            </button>
                            {activeImage ? (
                                <img src={activeImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No Image</div>
                            )}

                            {/* Hover Lens */}
                            <div style={{ ...lensStyle, position: 'absolute', background: 'var(--lens-bg)', border: '1px solid var(--lens-border)', pointerEvents: 'none' }}></div>
                        </div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {allImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        onMouseEnter={() => setActiveImage(img)}
                                        style={{
                                            width: '60px', height: '80px', border: activeImage === img ? '2px solid var(--gold)' : '1px solid var(--border-color)',
                                            cursor: 'pointer', opacity: activeImage === img ? 1 : 0.6,
                                            transition: 'all 0.2s', borderRadius: '2px', overflow: 'hidden'
                                        }}
                                        className="product-detail-thumb"
                                    >
                                        <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Sticky Info Panel */}
                    <div style={{ flex: '1 1 45%', position: 'relative', minWidth: '320px', paddingBottom: '40px' }}>

                        {/* Zoom Result Box Overlay */}
                        <div style={{
                            ...zoomStyle,
                            position: 'absolute', top: 0, left: '-20px', width: '100%', height: '600px', zIndex: 50,
                            backgroundRepeat: 'no-repeat', backgroundColor: 'var(--bg-light)', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px var(--zoom-shadow, rgba(0,0,0,0.5))', borderRadius: '4px',
                            pointerEvents: 'none'
                        }}></div>

                        <div style={{ opacity: zoomStyle.display === 'block' ? 0.2 : 1, transition: 'opacity 0.2s' }}>
                            <h1 style={{ fontSize: '1.6rem', color: 'var(--text-main)', margin: '0 0 8px', fontWeight: 700, fontFamily: 'var(--font-head)', lineHeight: 1.3 }}>{product.name}</h1>

                            {/* Rating Badge */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '2px', fontSize: '0.85rem', marginBottom: '15px', cursor: 'pointer' }}>
                                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>4.3</span>
                                <span style={{ color: 'var(--gold)' }}>★</span>
                                <span style={{ color: 'var(--border-color)' }}>|</span>
                                <span style={{ color: 'var(--text-muted)' }}>15.8k Ratings</span>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '15px 0' }} />

                            {/* Pricing */}
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '5px' }}>
                                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)' }}>Rs. {product.price.toLocaleString()}</span>
                                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>MRP Rs. {Math.floor(product.price * 2.5).toLocaleString()}</span>
                                <span style={{ fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 700 }}>(60% OFF)</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--success)', marginBottom: '25px', fontWeight: 600 }}>inclusive of all taxes</div>

                            {/* Colors */}
                            {product.colors && product.colors.length > 0 && (
                                <div style={{ marginBottom: '25px' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', color: 'var(--text-main)' }}>More Colors</div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        {product.colors.map(c => (
                                            <div key={c} style={{ width: '45px', height: '45px', background: COLOR_MAP[c] || '#888', border: '1px solid var(--border-color, rgba(255,255,255,0.2))', cursor: 'pointer', borderRadius: '2px' }} title={c}></div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sizes */}
                            {product.sizes && product.sizes.length > 0 && (
                                <div id="size-selector-section" style={{ marginBottom: '30px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-main)' }}>
                                            Select Size
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 700, cursor: 'pointer', letterSpacing: '1px' }}>SIZE CHART &gt;</div>
                                    </div>
                                    {sizeError && (
                                        <div style={{ color: '#e53935', fontSize: '0.85rem', marginBottom: '10px' }}>
                                            Please select a size
                                        </div>
                                    )}
                                    <div className={sizeError ? 'shake-animation' : ''} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                        {product.sizes.map(s => (
                                            <div key={s}
                                                onClick={() => { setSelectedSize(s); setSizeError(false); }}
                                                style={{
                                                    width: '50px', height: '50px', borderRadius: '50%',
                                                    border: selectedSize === s ? '2px solid var(--gold)' : sizeError ? '1px solid #e53935' : '1px solid var(--border-color)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                    fontWeight: selectedSize === s ? 700 : 400,
                                                    color: selectedSize === s ? 'var(--gold)' : sizeError ? '#e53935' : 'var(--text-main)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-main)' }}>Quantity</span>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '40px', height: '40px', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700 }}>−</button>
                                    <span style={{ minWidth: '40px', textAlign: 'center', color: 'var(--text-main)', fontWeight: 600, fontSize: '1rem' }}>{qty}</span>
                                    <button onClick={() => setQty(q => q + 1)} style={{ width: '40px', height: '40px', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700 }}>+</button>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                                <button
                                    onClick={() => addToCart(true)}
                                    disabled={product.stock === 0}
                                    style={{ width: '100%', padding: '16px', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', background: product.stock === 0 ? '#555' : 'var(--text-main)', color: 'var(--bg-color)', border: 'none', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', letterSpacing: '1px', transition: 'all 0.2s', borderRadius: '2px' }}
                                >
                                    {product.stock === 0 ? 'OUT OF STOCK' : 'BUY NOW'}
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => addToCart(false)}
                                    disabled={product.stock === 0}
                                    style={{ width: '100%', padding: '16px', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                >
                                    🛍 ADD TO CART
                                </button>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', marginBottom: '25px' }} />

                            {/* Delivery Options */}
                            <div style={{ marginBottom: '30px' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
                                    🚚 Delivery Options
                                </div>
                                <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden', maxWidth: '350px' }}>
                                    <input type="text" placeholder="Enter pincode" style={{ flex: 1, padding: '12px 16px', background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none' }} />
                                    <button style={{ background: 'transparent', border: 'none', color: 'var(--gold)', fontWeight: 700, padding: '0 20px', cursor: 'pointer' }}>Check</button>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '10px', lineHeight: '1.5' }}>Please enter PIN code to check delivery time & Pay on Delivery Availability</div>
                            </div>

                            {/* Detailed Sections */}
                            <div style={{ marginTop: '40px' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                    📝 Product Details
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '25px' }}>
                                    <strong style={{ color: 'var(--text-main)' }}>PRODUCT STORY</strong><br />
                                    Built for high-intensity action, this versatile piece merges elegant design with casual flair. Whether you're attending a festive occasion or keeping it low-key, its premium fabric and comfortable fit offer total comfort and all-day support. A true game-changer in your wardrobe.
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '25px' }}>
                                    <strong style={{ color: 'var(--text-main)' }}>FEATURES & BENEFITS</strong><br />
                                    • Premium Fabric - Ensures durability and maximum comfort.<br />
                                    • Elegant Design - Crafted to make a statement.<br />
                                    • Lightweight - Perfect for all-day wear.<br />
                                    • SoftFoam+ sockliner - Enhanced comfort from first step to final play.
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '25px' }}>
                                    <strong style={{ color: 'var(--text-main)' }}>DETAILS</strong><br />
                                    Main Material: Textile<br />
                                    Fit: Regular Fit<br />
                                    Category: {product.category}<br />
                                    Occasion: {product.occasion}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '25px' }}>
                                    <strong style={{ color: 'var(--text-main)' }}>Material & Care</strong><br />
                                    100% Premium Material<br />
                                    Wipe with a clean, dry cloth to remove dust. Do not machine wash.
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Similar Products Section */}
                {similarProducts.length > 0 && (
                    <div style={{ marginTop: '80px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>Similar Products</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                            {similarProducts.map(p => (
                                <div key={p.id} className="product-detail-similar-card" style={{ cursor: 'pointer', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '4px' }} onClick={() => navigate(`/product/${p.id}`)}>
                                    <div className="product-detail-similar-img" style={{ width: '100%', aspectRatio: '3/4', marginBottom: '10px' }}>
                                        {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                                    </div>
                                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>Saim's Creation</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>Rs. {p.price.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
