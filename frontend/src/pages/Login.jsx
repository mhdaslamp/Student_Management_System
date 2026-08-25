import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import heroPhoto from '../assets/login-hero.png';

import samsLogo from '../assets/SAMS LOGO SMALL.svg';

// ── Login Panel (shared between web & mobile) ────────────────────────────────
function LoginPanel({ onLogin }) {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState(null); // 'empty' | 'wrong' | null
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!password.trim()) { setError('empty'); return; }
        setError(null);
        setLoading(true);

        let credentials = { password };
        if (identifier.includes('@')) {
            credentials.email = identifier;
        } else {
            credentials.admissionNo = identifier;
        }

        const result = await onLogin(credentials);
        setLoading(false);
        if (!result.success) setError('wrong');
    };

    const onKey = (e) => e.key === 'Enter' && handleLogin();

    return (
        <div className="flex flex-col gap-[37px] items-center w-full">
            {/* Logo block */}
            <div className="flex flex-col items-center w-[289px]">
                <p
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        fontSize: 56,
                        lineHeight: '67px',
                        letterSpacing: '-3px',
                        color: 'black',
                    }}
                >
                    Welcome to
                </p>
                <img src={samsLogo} alt="SAMS" className="w-[247px] h-auto" />
            </div>

            {/* Form */}
            <div className="flex flex-col gap-6 items-start w-full">
                <div className="flex flex-col gap-2 items-start w-full">
                    <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 14, lineHeight: '20px', color: '#616161' }}>
                        Please enter your details to sign in to your account
                    </p>

                    <div className="flex flex-col gap-2 items-start w-full">
                        {/* Email / Admission No */}
                        <div className="flex flex-col items-start w-full">
                            <div
                                className="h-7 flex items-center"
                                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16, color: 'black' }}
                            >
                                Email
                            </div>
                            <div className="bg-white border border-[#9c9c9c] flex gap-[10px] h-14 items-center px-4 rounded-[56px] w-full">
                                <input
                                    id="login-email"
                                    type="text"
                                    placeholder="admin@example.com"
                                    value={identifier}
                                    onChange={(e) => { setIdentifier(e.target.value); setError(null); }}
                                    onKeyDown={onKey}
                                    className="flex-1 min-w-0 bg-transparent outline-none placeholder-[#9c9c9c]"
                                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 14, color: '#000' }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col items-start w-full">
                            <div
                                className="h-7 flex items-center"
                                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16, color: 'black' }}
                            >
                                Password
                            </div>
                            <div
                                className={`bg-white border flex gap-[10px] h-14 items-center px-4 rounded-[56px] w-full ${error ? 'border-red-400' : 'border-[#9c9c9c]'
                                    }`}
                            >
                                <input
                                    id="login-password"
                                    type={showPwd ? 'text' : 'password'}
                                    placeholder="Enter Password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                                    onKeyDown={onKey}
                                    className="flex-1 min-w-0 bg-transparent outline-none placeholder-[#9c9c9c]"
                                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 14, color: '#000' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd((v) => !v)}
                                    className="shrink-0 text-black cursor-pointer"
                                >
                                    {showPwd ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="flex items-center gap-2 px-1 mt-1">
                                <AlertCircle size={14} className="text-red-500 shrink-0" />
                                <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: '#ef4444' }}>
                                    {error === 'empty'
                                        ? 'Please enter your password.'
                                        : 'Incorrect email or password. Please try again.'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Forgot password */}
                <div
                    className="flex gap-[2px] items-center justify-end w-full whitespace-nowrap"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 14 }}
                >
                    <span style={{ color: '#616161' }}>Forgot Password?</span>
                    <a href="#" onClick={(e) => e.preventDefault()} className="underline" style={{ color: 'black' }}>
                        {' '}Click Here
                    </a>
                </div>

                {/* Login button */}
                <button
                    id="login-submit"
                    type="button"
                    onClick={handleLogin}
                    disabled={loading}
                    className="bg-black h-14 rounded-[56px] w-full flex items-center justify-center hover:bg-neutral-800 transition-colors disabled:opacity-60"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16, color: 'white' }}
                >
                    {loading ? 'Signing in…' : 'Login'}
                </button>
            </div>
        </div>
    );
}

// ── Page Root ────────────────────────────────────────────────────────────────
export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (credentials) => {
        const result = await login(credentials);
        if (result.success) navigate('/');
        return result;
    };

    return (
        <div className="bg-white w-screen h-screen overflow-hidden">
            {/* Desktop layout */}
            <div className="hidden md:flex w-full h-full">
                {/* Left — hero photo (60%) */}
                <div className="w-[60%] relative overflow-hidden rounded-br-[30px] rounded-tr-[30px]">
                    <img
                        src={heroPhoto}
                        alt="SAAMS hero"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>
                {/* Right — login panel (40%) */}
                <div className="w-[40%] shrink-0 flex flex-col items-center justify-center px-[45px]">
                    <LoginPanel onLogin={handleLogin} />
                </div>
            </div>

            {/* Mobile layout — form anchored at bottom for thumb reach */}
            <div className="flex md:hidden w-full h-full flex-col items-center justify-end pb-10 px-[33px]">
                <LoginPanel onLogin={handleLogin} />
            </div>
        </div>
    );
}
