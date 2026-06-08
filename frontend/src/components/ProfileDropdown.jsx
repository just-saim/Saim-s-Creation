import React, { useState } from 'react';

export default function ProfileDropdown({ isOpen, setIsOpen }) {
    const [loginTab, setLoginTab] = useState('login'); // 'login' | 'register'
    const [emailInput, setEmailInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [regFirstName, setRegFirstName] = useState('');
    const [regLastName, setRegLastName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [subscribeToOffers, setSubscribeToOffers] = useState(false);

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

    const handleEmailPasswordLogin = () => {
        if (!emailInput || !passwordInput) {
            alert('Please enter both email and password');
            return;
        }
        localStorage.setItem('sc_logged_in', 'true');
        setIsLoggedIn(true);
        alert('Successfully logged in!');
        setIsOpen(false);
    };

    const handleRegister = () => {
        if (!regFirstName || !regLastName || !regEmail || !regPassword) {
            alert('Please fill all required fields');
            return;
        }
        const newProfile = {
            name: `${regFirstName} ${regLastName}`,
            email: regEmail,
            phone: '',
            address: ''
        };
        localStorage.setItem('sc_customer_profile', JSON.stringify(newProfile));
        setCustomerProfile(newProfile);
        localStorage.setItem('sc_logged_in', 'true');
        setIsLoggedIn(true);
        alert('Account created successfully!');
        setIsOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('sc_logged_in');
        setIsLoggedIn(false);
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
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
                                <input type="text" value={customerProfile.phone} onChange={e => setCustomerProfile({...customerProfile, phone: e.target.value})} style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }} placeholder="Enter phone number" />
                            </div>
                            <button className="btn btn-outline btn-block" style={{ marginTop: '5px' }} onClick={() => {
                                localStorage.setItem('sc_customer_profile', JSON.stringify(customerProfile));
                                alert('Profile updated successfully!');
                            }}>Save Profile</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Shipping Address</label>
                                <textarea value={customerProfile.address} onChange={e => setCustomerProfile({...customerProfile, address: e.target.value})} style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', minHeight: '80px', resize: 'vertical' }} placeholder="Enter complete address"></textarea>
                            </div>
                            <button className="btn btn-outline btn-block" style={{ marginTop: '5px' }} onClick={() => {
                                localStorage.setItem('sc_customer_profile', JSON.stringify(customerProfile));
                                alert('Address saved successfully!');
                            }}>Save Address</button>
                        </div>
                    )}

                    <div style={{ marginTop: '10px', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
                        <button className="btn btn-block" onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '8px' }}>Log Out</button>
                    </div>
                </div>
            )}
        </div>
    );
}
