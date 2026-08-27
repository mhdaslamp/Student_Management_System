import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import heroPhoto from '../assets/login-hero.png';

import samsLogo from '../assets/SAMS LOGO SMALL.svg';

// ── Login Panel (shared between web & mobile) ────────────────────────────────
function LoginPanel({ onLogin, onGoogleLogin }) {
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

                <div className="flex items-center w-full my-2">
                    <hr className="flex-grow border-t border-[#e0e0e0]" />
                    <span className="px-4 text-[#9c9c9c]" style={{ fontFamily: "'Inter', sans-serif", fontSize: 14 }}>or</span>
                    <hr className="flex-grow border-t border-[#e0e0e0]" />
                </div>

                {/* Google Sign-In button */}
                <button
                    type="button"
                    onClick={onGoogleLogin}
                    disabled={loading}
                    className="bg-white border border-[#e0e0e0] h-14 rounded-[56px] w-full flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-60"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16, color: 'black' }}
                >
                    <svg width="24" height="24" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        <path fill="none" d="M0 0h48v48H0z"/>
                    </svg>
                    Continue with Google
                </button>
            </div>
        </div>
    );
}

// ── Page Root ────────────────────────────────────────────────────────────────
export default function Login() {
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (credentials) => {
        const result = await login(credentials);
        if (result.success) navigate('/');
        return result;
    };

    const handleGoogleLogin = async () => {
        const result = await loginWithGoogle();
        if (result.success) {
            navigate('/');
        } else {
            alert(result.message);
        }
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
                    <LoginPanel onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} />
                </div>
            </div>

            {/* Mobile layout — form anchored at bottom for thumb reach */}
            <div className="flex md:hidden w-full h-full flex-col items-center justify-end pb-10 px-[33px]">
                <LoginPanel onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} />
            </div>
        </div>
    );
}
