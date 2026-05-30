import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const COLOR_MAP = {
    'Red': '#e53935', 'Blue': '#1e88e5', 'Green': '#43a047', 'Black': '#333',
    'Gold': '#c9a84c', 'Maroon': '#800020', 'Teal': '#00897b', 'Ivory': '#f5f0e1',
    'White': '#fff', 'Pink': '#e91e63', 'Yellow': '#fdd835', 'Purple': '#8e24aa',
    'Orange': '#fb8c00', 'Grey': '#9e9e9e', 'Brown': '#795548', 'Navy': '#1a237e',
    'Beige': '#d4c5a9', 'Silver': '#bdbdbd', 'Cream': '#fffdd0'
};

export default function Home() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('sc_cart')) || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [loginTab, setLoginTab] = useState('login'); // 'login' | 'register'
    const [emailInput, setEmailInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [regFirstName, setRegFirstName] = useState('');
    const [regLastName, setRegLastName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [subscribeToOffers, setSubscribeToOffers] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 16;

    // Customer profile state
    const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('sc_logged_in') === 'true');
    const [customerProfile, setCustomerProfile] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('sc_customer_profile')) || {
                name: '',
                email: '',
                phone: '',
                address: ''
            };
        } catch (e) {
            return { name: '', email: '', phone: '', address: '' };
        }
    });
    const [activeProfileTab, setActiveProfileTab] = useState('profile'); // 'profile' | 'address'
    const [language, setLanguage] = useState(() => localStorage.getItem('sc_language') || 'English');

    const profileDropdownRef = React.useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filters
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 50000]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedOccasions, setSelectedOccasions] = useState([]);
    const [sortBy, setSortBy] = useState('recommended');

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error("Error fetching products:", err));
    }, []);

    useEffect(() => {
        localStorage.setItem('sc_cart', JSON.stringify(cart));
    }, [cart]);

    // Extract unique values for filters
    const allCategories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);
    const allColors = useMemo(() => {
        const colorSet = new Set();
        products.forEach(p => (p.colors || []).forEach(c => colorSet.add(c)));
        return [...colorSet];
    }, [products]);
    const allOccasions = useMemo(() => [...new Set(products.map(p => p.occasion).filter(Boolean))], [products]);
    const maxPrice = useMemo(() => Math.max(...products.map(p => p.price), 50000), [products]);

    // Filtering logic
    const filteredProducts = useMemo(() => {
        let result = products.filter(p => {
            const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
            const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
            const matchColor = selectedColors.length === 0 || (p.colors || []).some(c => selectedColors.includes(c));
            const matchOccasion = selectedOccasions.length === 0 || selectedOccasions.includes(p.occasion);
            const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchCategory && matchPrice && matchColor && matchOccasion && matchSearch;
        });

        if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
        else if (sortBy === 'newest') result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

        return result;
    }, [products, selectedCategories, priceRange, selectedColors, selectedOccasions, searchTerm, sortBy]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredProducts]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const currentItems = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const toggleFilter = (arr, setArr, val) => {
        if (arr.includes(val)) setArr(arr.filter(x => x !== val));
        else setArr([...arr, val]);
    };

    const addToCart = (product) => {
        const exist = cart.find(item => item.id === product.id);
        if (exist) {
            setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
        setIsCartOpen(true);
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const handleEmailPasswordLogin = () => {
        if (!emailInput || !passwordInput) {
            alert("Please enter both email and password.");
        } else if (emailInput === 'admin@saim.com' && passwordInput === 'admin123') {
            window.location.href = '/admin';
        } else {
            alert("Login successful!");
            setIsLoggedIn(true);
            localStorage.setItem('sc_logged_in', 'true');
            const updatedProfile = {
                name: customerProfile.name || 'Customer',
                email: emailInput,
                phone: customerProfile.phone || '',
                address: customerProfile.address || ''
            };
            setCustomerProfile(updatedProfile);
            localStorage.setItem('sc_customer_profile', JSON.stringify(updatedProfile));
            setIsProfileOpen(false);
            setEmailInput('');
            setPasswordInput('');
        }
    };

    const handleRegister = () => {
        if (!regFirstName || !regLastName || !regEmail || !regPassword) {
            alert("Please fill in all fields.");
        } else {
            alert("Account created successfully!");
            setIsLoggedIn(true);
            localStorage.setItem('sc_logged_in', 'true');
            const updatedProfile = {
                name: `${regFirstName} ${regLastName}`,
                email: regEmail,
                phone: '',
                address: ''
            };
            setCustomerProfile(updatedProfile);
            localStorage.setItem('sc_customer_profile', JSON.stringify(updatedProfile));
            setIsProfileOpen(false);
            setRegFirstName('');
            setRegLastName('');
            setRegEmail('');
            setRegPassword('');
        }
    };

    const handleSaveProfile = () => {
        localStorage.setItem('sc_customer_profile', JSON.stringify(customerProfile));
        alert("Profile details saved successfully!");
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('sc_logged_in');
        localStorage.removeItem('sc_customer_profile');
        setCustomerProfile({ name: '', email: '', phone: '', address: '' });
        setIsProfileOpen(false);
        alert("Logged out successfully.");
    };

    const clearAllFilters = () => {
        setSelectedCategories([]);
        setPriceRange([0, maxPrice]);
        setSelectedColors([]);
        setSelectedOccasions([]);
        setSearchTerm('');
    };

    const activeFilterCount = selectedCategories.length + selectedColors.length + selectedOccasions.length + (priceRange[1] < maxPrice || priceRange[0] > 0 ? 1 : 0);

    return (
        <div id="customer-view">
            <header id="main-header" style={{ background: 'rgba(5, 5, 5, 0.95)' }}>
                <div className="container header-content" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div className="top-row-margin" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', position: 'relative' }}>
                        <div className="desktop-spacer" style={{ justifyContent: 'flex-start' }}></div>
                        <div className="logo" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '8px' }}>
                            <img src="/Img/logo-transparent.png" alt="Saim's Creation Logo" className="logo-img-1" />
                            <span className="logo-separator">×</span>
                            <img src="/Img/upscalemedia-transformed.png" alt="Partner Logo" className="logo-img-2" />
                        </div>
                        <div className="header-actions" style={{ flex: 1, flexWrap: 'nowrap' }}>
                            <span onClick={() => {
                                document.body.classList.toggle('light-theme');
                                localStorage.setItem('sc_theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
                            }} style={{ cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }} title="Toggle Theme">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                            </span>
                            <span style={{ cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </span>
                            <div className="user-menu-container" ref={profileDropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <span className="user-icon-wrapper" onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ cursor: 'pointer', color: 'var(--text-main)', transition: 'color 0.3s', display: 'flex', alignItems: 'center' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </span>
                                {isProfileOpen && (
                                    <div className="profile-dropdown-card">
                                        {!isLoggedIn ? (
                                            <>
                                                <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px', paddingBottom: '0px' }}>
                                                    <span 
                                                        onClick={() => setLoginTab('login')} 
                                                        style={{ cursor: 'pointer', fontWeight: loginTab === 'login' ? 700 : 400, color: loginTab === 'login' ? 'var(--gold)' : 'var(--text-muted)', borderBottom: loginTab === 'login' ? '2px solid var(--gold)' : 'none', paddingBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                                                    >
                                                        LOGIN
                                                    </span>
                                                    <span 
                                                        onClick={() => setLoginTab('register')} 
                                                        style={{ cursor: 'pointer', fontWeight: loginTab === 'register' ? 700 : 400, color: loginTab === 'register' ? 'var(--gold)' : 'var(--text-muted)', borderBottom: loginTab === 'register' ? '2px solid var(--gold)' : 'none', paddingBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                                                    >
                                                        CREATE ACCOUNT
                                                    </span>
                                                </div>

                                                {loginTab === 'login' ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '2px', alignItems: 'stretch' }}>
                                                            <input type="email" placeholder="Email Address*" value={emailInput} onChange={e => setEmailInput(e.target.value)} style={{ border: 'none', flex: 1, padding: '8px 12px', background: 'transparent', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.9rem' }} />
                                                        </div>
                                                        <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '2px', alignItems: 'stretch' }}>
                                                            <input type="password" placeholder="Password*" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} style={{ border: 'none', flex: 1, padding: '8px 12px', background: 'transparent', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.9rem' }} />
                                                        </div>
                                                        <button className="btn btn-primary btn-block" style={{ background: 'var(--gold)', color: '#000', border: 'none', padding: '10px', fontWeight: 700, fontSize: '0.85rem' }} onClick={handleEmailPasswordLogin}>LOGIN</button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '2px', alignItems: 'stretch' }}>
                                                            <input type="text" placeholder="First Name*" value={regFirstName} onChange={e => setRegFirstName(e.target.value)} style={{ border: 'none', flex: 1, padding: '8px 12px', background: 'transparent', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.9rem' }} />
                                                        </div>
                                                        <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '2px', alignItems: 'stretch' }}>
                                                            <input type="text" placeholder="Last Name*" value={regLastName} onChange={e => setRegLastName(e.target.value)} style={{ border: 'none', flex: 1, padding: '8px 12px', background: 'transparent', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.9rem' }} />
                                                        </div>
                                                        <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '2px', alignItems: 'stretch' }}>
                                                            <input type="email" placeholder="Email Address*" value={regEmail} onChange={e => setRegEmail(e.target.value)} style={{ border: 'none', flex: 1, padding: '8px 12px', background: 'transparent', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.9rem' }} />
                                                        </div>
                                                        <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '2px', alignItems: 'stretch' }}>
                                                            <input type="password" placeholder="Password*" value={regPassword} onChange={e => setRegPassword(e.target.value)} style={{ border: 'none', flex: 1, padding: '8px 12px', background: 'transparent', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.9rem' }} />
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
                                                            <input type="checkbox" id="subscribe" checked={subscribeToOffers} onChange={e => setSubscribeToOffers(e.target.checked)} style={{ width: 'auto', marginTop: '3px', accentColor: 'var(--gold)' }} />
                                                            <label htmlFor="subscribe" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1.3 }}>Subscribe to stay updated with new products and offers</label>
                                                        </div>
                                                        <button className="btn btn-primary btn-block" style={{ background: 'var(--gold)', color: '#000', border: 'none', padding: '10px', fontWeight: 700, fontSize: '0.85rem', marginTop: '4px' }} onClick={handleRegister}>CREATE ACCOUNT</button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0px' }}>
                                                    <span 
                                                        onClick={() => setActiveProfileTab('profile')} 
                                                        style={{ cursor: 'pointer', fontWeight: activeProfileTab === 'profile' ? 700 : 400, color: activeProfileTab === 'profile' ? 'var(--gold)' : 'var(--text-muted)', borderBottom: activeProfileTab === 'profile' ? '2px solid var(--gold)' : 'none', paddingBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                                                    >
                                                        Profile Details
                                                    </span>
                                                    <span 
                                                        onClick={() => setActiveProfileTab('address')} 
                                                        style={{ cursor: 'pointer', fontWeight: activeProfileTab === 'address' ? 700 : 400, color: activeProfileTab === 'address' ? 'var(--gold)' : 'var(--text-muted)', borderBottom: activeProfileTab === 'address' ? '2px solid var(--gold)' : 'none', paddingBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                                                    >
                                                        Address
                                                    </span>
                                                </div>

                                                {activeProfileTab === 'profile' ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Name</label>
                                                            <input type="text" value={customerProfile.name} onChange={e => setCustomerProfile({...customerProfile, name: e.target.value})} style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }} placeholder="Enter name" />
                                                        </div>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Email</label>
                                                            <input type="email" value={customerProfile.email} onChange={e => setCustomerProfile({...customerProfile, email: e.target.value})} style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }} placeholder="Enter email" />
                                                        </div>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Phone</label>
                                                            <input type="text" value={customerProfile.phone} onChange={e => setCustomerProfile({...customerProfile, phone: e.target.value})} style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }} placeholder="Enter phone" />
                                                        </div>
                                                        <button className="btn btn-primary" style={{ background: 'var(--gold)', color: '#000', border: 'none', padding: '8px 16px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', marginTop: '4px' }} onClick={handleSaveProfile}>SAVE PROFILE</button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Delivery Address</label>
                                                            <textarea rows="3" value={customerProfile.address} onChange={e => setCustomerProfile({...customerProfile, address: e.target.value})} style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)' }} placeholder="Enter delivery address" />
                                                        </div>
                                                        <button className="btn btn-primary" style={{ background: 'var(--gold)', color: '#000', border: 'none', padding: '8px 16px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', marginTop: '4px' }} onClick={handleSaveProfile}>SAVE ADDRESS</button>
                                                    </div>
                                                )}

                                                <button onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                    LOG OUT
                                                </button>
                                            </div>
                                        )}
                                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '20px', display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'flex-start' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Language</span>
                                            <select value={language} onChange={e => { setLanguage(e.target.value); localStorage.setItem('sc_language', e.target.value); }} style={{ background: 'var(--bg-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '4px 8px', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}>
                                                <option value="English">English</option>
                                                <option value="Hindi">Hindi</option>
                                                <option value="Urdu">Urdu</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <span className="cart-icon-wrapper" onClick={() => setIsCartOpen(true)} style={{ cursor: 'pointer', color: 'var(--text-main)', transition: 'color 0.3s', position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                <span className="cart-badge">{cart.reduce((sum, item) => sum + item.qty, 0)}</span>
                            </span>
                            <button className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                        </div>
                    </div>
                    <nav style={{ width: '100%' }}>
                        <ul className="nav-links" style={{ margin: 0, padding: 0 }}>
                            {['All', 'New Arrivals', 'Sarees', 'Suits', 'Lehenga', 'Garara'].map(cat => (
                                <li key={cat}><a href="#" className={selectedCategories.length === 0 && cat === 'All' ? 'active' : selectedCategories.includes(cat) ? 'active' : ''} onClick={(e) => { e.preventDefault(); if (cat === 'All') setSelectedCategories([]); else setSelectedCategories([cat]); }}>{cat}</a></li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
                <button onClick={() => setIsMobileMenuOpen(false)} style={{ position: 'absolute', top: '20px', right: '30px', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '2.5rem', cursor: 'pointer', zIndex: 1002 }}>×</button>
                <ul className="mobile-menu-links">
                    {['All', 'New Arrivals', 'Sarees', 'Suits', 'Lehenga', 'Garara'].map(cat => (
                        <li key={cat}>
                            <a href="#" className={selectedCategories.length === 0 && cat === 'All' ? 'active' : selectedCategories.includes(cat) ? 'active' : ''} onClick={(e) => {
                                e.preventDefault();
                                if (cat === 'All') setSelectedCategories([]);
                                else setSelectedCategories([cat]);
                                setIsMobileMenuOpen(false);
                            }}>
                                {cat}
                            </a>
                        </li>
                    ))}
                    <li className="mobile-only" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                        <div onClick={(e) => { setIsProfileOpen(true); setIsMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', color: 'var(--text-main)', fontSize: '1.2rem' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            <span>Login / Register / Account</span>
                        </div>
                    </li>
                </ul>
            </div>

            <section className="hero">
                <div className="hero-content">
                    <h4 className="text-gold" style={{ marginBottom: '16px', letterSpacing: '4px' }}>THE FESTIVE EDIT</h4>
                    <h1>Elegance Woven <br />In Every Thread</h1>
                    <p>Discover the finest curation of South Asian luxury wear. Handcrafted for your most precious moments.</p>
                    <button className="btn btn-primary" onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })}>Explore Collection</button>
                </div>
            </section>

            {/* Mobile Filters Overlay Backdrop */}
            <div className={`mobile-filters-overlay ${isMobileFiltersOpen ? 'open' : ''}`} onClick={() => setIsMobileFiltersOpen(false)}></div>

            <section className="container store-section" id="shop">
                {/* ===== MYNTRA-STYLE SIDEBAR FILTERS ===== */}
                <aside className={`sidebar-filters ${isMobileFiltersOpen ? 'open' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                        <h3 style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>FILTERS</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {activeFilterCount > 0 && (
                                <button onClick={clearAllFilters} style={{ color: 'var(--gold)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', background: 'none', border: 'none', cursor: 'pointer' }}>Clear All</button>
                            )}
                            <button className="mobile-only filter-close-btn" onClick={() => setIsMobileFiltersOpen(false)}>×</button>
                        </div>
                    </div>

                    {/* CATEGORY / BRAND */}
                    <div className="filter-group">
                        <h4>CATEGORY</h4>
                        <ul className="filter-list">
                            {allCategories.map(cat => {
                                const count = products.filter(p => p.category === cat).length;
                                return (
                                    <li key={cat}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleFilter(selectedCategories, setSelectedCategories, cat)} style={{ width: 'auto', accentColor: 'var(--gold)' }} />
                                                {cat}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({count})</span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* PRICE RANGE */}
                    <div className="filter-group">
                        <h4>PRICE</h4>
                        <div style={{ padding: '0 4px' }}>
                            <input
                                type="range"
                                min={0}
                                max={maxPrice}
                                step={500}
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                style={{
                                    width: '100%', padding: 0, border: 'none', height: '4px',
                                    appearance: 'auto', accentColor: 'var(--gold)', cursor: 'pointer',
                                    background: 'transparent'
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <span>₨ {priceRange[0].toLocaleString()}</span>
                                <span>₨ {priceRange[1].toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* COLOR */}
                    <div className="filter-group">
                        <h4>COLOR</h4>
                        <ul className="filter-list">
                            {allColors.map(color => {
                                const count = products.filter(p => (p.colors || []).includes(color)).length;
                                return (
                                    <li key={color}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" checked={selectedColors.includes(color)} onChange={() => toggleFilter(selectedColors, setSelectedColors, color)} style={{ width: 'auto', accentColor: 'var(--gold)' }} />
                                                <span style={{
                                                    width: '14px', height: '14px', borderRadius: '50%', display: 'inline-block',
                                                    background: COLOR_MAP[color] || '#888',
                                                    border: color === 'White' || color === 'Ivory' || color === 'Cream' ? '1px solid #666' : '1px solid transparent',
                                                    flexShrink: 0
                                                }}></span>
                                                {color}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({count})</span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* OCCASION / TYPE */}
                    <div className="filter-group">
                        <h4>OCCASION</h4>
                        <ul className="filter-list">
                            {allOccasions.map(occ => {
                                const count = products.filter(p => p.occasion === occ).length;
                                return (
                                    <li key={occ}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" checked={selectedOccasions.includes(occ)} onChange={() => toggleFilter(selectedOccasions, setSelectedOccasions, occ)} style={{ width: 'auto', accentColor: 'var(--gold)' }} />
                                                {occ}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({count})</span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </aside>

                {/* ===== PRODUCTS GRID ===== */}
                <main>
                    <div className="store-header">
                        <div className="text-muted desktop-only"><span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{filteredProducts.length}</span> Products Found</div>
                        
                        {/* Mobile Filter Trigger Button */}
                        <button className="mobile-filter-trigger" onClick={() => setIsMobileFiltersOpen(true)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                            </svg>
                            Filter {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
                        </button>

                        <div className="store-sort-wrapper">
                            <span className="text-muted text-sm desktop-only">Sort by :</span>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '6px 12px', fontSize: '0.85rem', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-main)', cursor: 'pointer' }}>
                                <option value="recommended">Recommended</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="newest">What's New</option>
                            </select>
                        </div>
                    </div>
                    <div className="product-grid">
                        {currentItems.map(p => (
                            <div className="product-card fade-in-up" key={p.id} onClick={() => navigate(`/product/${p.id}`)}>
                                {p.stock === 0 ? <span className="badge badge-out badge-wrapper">Sold Out</span> : p.featured ? <span className="badge badge-wrapper" style={{ background: 'var(--gold)', color: '#000' }}>NEW</span> : <span className="badge badge-stock badge-wrapper">In Stock</span>}
                                <div className="product-img-wrapper">
                                    {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 1, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); window.open(`/product/${p.id}`, '_blank'); }} /> : <span className="product-img-placeholder-text">SC</span>}
                                    <button className="btn quick-view-btn" onClick={(e) => { e.stopPropagation(); addToCart(p); }}>Add to Cart</button>
                                </div>
                                <div className="product-info">
                                    <div className="product-category">{p.category} | {p.occasion}</div>
                                    <h3 className="product-title">{p.name}</h3>
                                    <div className="product-price">₨ {p.price.toLocaleString()}</div>
                                    {p.colors && p.colors.length > 0 && (
                                        <div className="color-dots">
                                            {p.colors.map(c => (
                                                <span key={c} className="color-dot" style={{ background: COLOR_MAP[c] || '#888' }} title={c}></span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '40px' }}>
                            <button className="btn btn-outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>&laquo; Prev</button>
                            <span style={{ color: 'var(--text-main)' }}>Page {currentPage} of {totalPages}</span>
                            <button className="btn btn-outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Next &raquo;</button>
                        </div>
                    )}
                </main>
            </section>

            {/* NO IMAGE POPUP - OPEN IN NEW TAB INSTEAD */}



            {/* Cart Sidebar */}
            <div className={`modal-overlay ${isCartOpen ? 'active' : ''}`} onClick={() => setIsCartOpen(false)} style={{ display: isCartOpen ? 'block' : 'none' }}></div>
            <div className={`cart-sidebar ${isCartOpen ? 'active' : ''}`}>
                <div className="cart-header">
                    <h3>Your Cart</h3>
                    <button className="close-modal" style={{ position: 'static' }} onClick={() => setIsCartOpen(false)}>×</button>
                </div>
                <div className="cart-items">
                    {cart.map(item => (
                        <div className="cart-item" key={item.id}>
                            <div className="cart-item-img d-flex align-center justify-center">SC</div>
                            <div className="cart-item-details">
                                <div className="text-sm text-gold">{item.category}</div>
                                <div style={{ fontFamily: 'var(--font-head)' }}>{item.name}</div>
                                <div className="text-muted text-sm mt-1">Qty: {item.qty}</div>
                                <div className="d-flex justify-between align-center mt-2">
                                    <div className="text-gold font-head">₨ {(item.price * item.qty).toLocaleString()}</div>
                                    <button className="text-sm" style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => removeFromCart(item.id)}>Remove</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && <p className="text-muted">Your cart is empty.</p>}
                </div>
                {cart.length > 0 && (
                    <div className="cart-footer">
                        <div className="summary-total">
                            <span>Total</span>
                            <span>₨ {cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString()}</span>
                        </div>
                        <button className="btn btn-primary btn-block" style={{ marginTop: '20px' }} onClick={() => { alert("Proceeding to checkout (Demo)"); setIsCartOpen(false); }}>Proceed to Checkout</button>
                    </div>
                )}
            </div>

            <footer>
                <div className="container">
                    <div className="footer-bottom">
                        &copy; 2024 Saim's Creation. All Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
