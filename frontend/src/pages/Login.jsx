import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, GraduationCap, Users, BarChart3, BookOpen } from 'lucide-react';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({ identifier: false, password: false });
    const [loading, setLoading] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Custom empty field validation
        let hasError = false;
        const newErrors = { identifier: false, password: false };

        if (!identifier.trim()) {
            newErrors.identifier = true;
            hasError = true;
        }
        if (!password) {
            newErrors.password = true;
            hasError = true;
        }

        if (hasError) {
            setValidationErrors(newErrors);
            return;
        }

        setError('');
        setLoading(true);

        let credentials = { password };
        if (identifier.includes('@')) {
            credentials.email = identifier;
        } else {
            credentials.admissionNo = identifier;
        }

        const result = await login(credentials);
        setLoading(false);
        if (result.success) {
            navigate('/');
        } else {
            // Provide a more descriptive error if the backend just returns "Login failed"
            setError(result.message === 'Login failed' ? 'Incorrect email or password' : result.message);
        }
    };

    return (
        <div className="fixed inset-0 flex bg-white z-50">
            {/* Keyframes */}
            <style>{`
                @keyframes floatUp {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes floatDown {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(8px); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse-ring {
                    0% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.05); opacity: 0.15; }
                    100% { transform: scale(1); opacity: 0.3; }
                }
                .login-input {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .login-input:focus {
                    border-color: #1A8AE5 !important;
                    box-shadow: 0 0 0 3px rgba(26, 138, 229, 0.08) !important;
                    background: #fff !important;
                }
                .login-btn {
                    background: linear-gradient(135deg, #1A8AE5 0%, #0E6EB8 100%);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .login-btn:hover:not(:disabled) {
                    background: linear-gradient(135deg, #0E6EB8 0%, #0B5894 100%);
                    box-shadow: 0 8px 24px -4px rgba(26, 138, 229, 0.35);
                    transform: translateY(-1px);
                }
                .login-btn:active:not(:disabled) {
                    transform: translateY(0px);
                }
                .slide-content {
                    animation: fadeInUp 0.4s ease-out;
                }
            `}</style>

            {/* --- Left Branded Panel --- */}
            <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden flex-col m-3 rounded-[28px]" style={{ background: 'linear-gradient(160deg, #1A8AE5 0%, #0E6EB8 40%, #1A8AE5 70%, #48A9F3 100%)' }}>
                {/* Decorative circles */}
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/[0.07]"
                    style={{ animation: 'pulse-ring 6s ease-in-out infinite' }}
                />
                <div className="absolute top-1/4 -left-16 w-56 h-56 rounded-full bg-white/[0.06]"
                    style={{ animation: 'pulse-ring 8s ease-in-out infinite 1s' }}
                />
                <div className="absolute -bottom-12 right-1/4 w-48 h-48 rounded-full bg-white/[0.05]"
                    style={{ animation: 'pulse-ring 7s ease-in-out infinite 2s' }}
                />

                {/* Subtle dot grid */}
                <div className="absolute inset-0 rounded-[28px] opacity-[0.06]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />

                <div className="relative z-10 p-8 pb-0">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white">SAMS</span>
                    </div>
                </div>

                {/* Center — Slide content */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10">
                    {/* Slide 1: Feature cards */}
                    {activeSlide === 0 && (
                        <div className="slide-content flex flex-col items-center gap-5 w-full">
                            <div className="w-full max-w-xs bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20 flex items-center gap-4"
                                style={{ animation: 'floatUp 5s ease-in-out infinite' }}
                            >
                                <div className="h-11 w-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Users className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Student Management</p>
                                    <p className="text-xs text-white/60 mt-0.5">Organize batches & profiles</p>
                                </div>
                            </div>
                            <div className="w-full max-w-xs bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20 flex items-center gap-4 ml-8"
                                style={{ animation: 'floatDown 6s ease-in-out infinite 0.5s' }}
                            >
                                <div className="h-11 w-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <BarChart3 className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Results & Analytics</p>
                                    <p className="text-xs text-white/60 mt-0.5">Track academic performance</p>
                                </div>
                            </div>
                            <div className="w-full max-w-xs bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20 flex items-center gap-4"
                                style={{ animation: 'floatUp 7s ease-in-out infinite 1s' }}
                            >
                                <div className="h-11 w-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Assignments</p>
                                    <p className="text-xs text-white/60 mt-0.5">Create & distribute tasks</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Slide 2: Analytics highlight */}
                    {activeSlide === 1 && (
                        <div className="slide-content flex flex-col items-center gap-5 w-full">
                            <div className="w-full max-w-xs bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center"
                                style={{ animation: 'floatUp 5s ease-in-out infinite' }}
                            >
                                <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <BarChart3 className="h-7 w-7 text-white" />
                                </div>
                                <p className="text-lg font-bold text-white">Real-time Analytics</p>
                                <p className="text-xs text-white/60 mt-1.5 leading-relaxed">Monitor student performance, attendance, and academic progress with intuitive dashboards</p>
                            </div>
                            <div className="w-full max-w-xs flex gap-3">
                                <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center"
                                    style={{ animation: 'floatDown 6s ease-in-out infinite 0.3s' }}
                                >
                                    <p className="text-2xl font-bold text-white">98%</p>
                                    <p className="text-[10px] text-white/50 mt-1 uppercase font-semibold tracking-wide">Accuracy</p>
                                </div>
                                <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center"
                                    style={{ animation: 'floatDown 6s ease-in-out infinite 0.6s' }}
                                >
                                    <p className="text-2xl font-bold text-white">500+</p>
                                    <p className="text-[10px] text-white/50 mt-1 uppercase font-semibold tracking-wide">Students</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Slide 3: Easy onboarding */}
                    {activeSlide === 2 && (
                        <div className="slide-content flex flex-col items-center gap-5 w-full">
                            <div className="w-full max-w-xs bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center"
                                style={{ animation: 'floatUp 5s ease-in-out infinite' }}
                            >
                                <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <GraduationCap className="h-7 w-7 text-white" />
                                </div>
                                <p className="text-lg font-bold text-white">Easy Onboarding</p>
                                <p className="text-xs text-white/60 mt-1.5 leading-relaxed">Upload student data via Excel, auto-generate credentials, and get started in minutes</p>
                            </div>
                            <div className="w-full max-w-xs bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 flex items-center gap-3"
                                style={{ animation: 'floatDown 6s ease-in-out infinite 0.5s' }}
                            >
                                <div className="flex -space-x-2">
                                    {['bg-white/30', 'bg-white/25', 'bg-white/20'].map((color, i) => (
                                        <div key={i} className={`h-8 w-8 rounded-full ${color} border-2 border-white/30 flex items-center justify-center text-[10px] text-white font-bold`}>
                                            {['A', 'B', 'C'][i]}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-white/70"><span className="font-semibold text-white">Bulk upload</span> students in one click</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom — Tagline */}
                <div className="relative z-10 p-8 pt-0">
                    {activeSlide === 0 && (
                        <div className="slide-content">
                            <h2 className="text-[22px] font-bold text-white leading-snug">
                                One Platform to Manage
                                <br />
                                <span className="text-white/70">All Student Operations</span>
                            </h2>
                            <p className="text-white/50 text-sm mt-3 leading-relaxed max-w-xs">
                                Streamline your institution’s workflow — manage students, classrooms, and results all in one place.
                            </p>
                        </div>
                    )}
                    {activeSlide === 1 && (
                        <div className="slide-content">
                            <h2 className="text-[22px] font-bold text-white leading-snug">
                                Know how your
                                <br />
                                <span className="text-white/70">students are doing.</span>
                            </h2>
                            <p className="text-white/50 text-sm mt-3 leading-relaxed max-w-xs">
                                See grades, attendance, and progress at a glance — no spreadsheets needed.
                            </p>
                        </div>
                    )}
                    {activeSlide === 2 && (
                        <div className="slide-content">
                            <h2 className="text-[22px] font-bold text-white leading-snug">
                                Set up takes
                                <br />
                                <span className="text-white/70">less than 5 minutes.</span>
                            </h2>
                            <p className="text-white/50 text-sm mt-3 leading-relaxed max-w-xs">
                                Upload an Excel sheet, and your student accounts are ready to go.
                            </p>
                        </div>
                    )}

                    {/* Dot indicators */}
                    <div className="flex gap-2 mt-6">
                        {[0, 1, 2].map((i) => (
                            <button
                                key={i}
                                onClick={() => setActiveSlide(i)}
                                className={`rounded-full transition-all duration-300 cursor-pointer ${activeSlide === i
                                    ? 'w-6 h-1.5 bg-white'
                                    : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* --- Right Form Panel --- */}
            <div className="flex-1 flex flex-col bg-white">
                {/* Mobile header (visible only on small screens) */}
                <div className="lg:hidden w-full py-6 px-6 bg-gradient-to-r from-[#E8F3FD] to-[#D1E8FC]">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <GraduationCap className="h-5 w-5 text-[#1A8AE5]" />
                        </div>
                        <span className="text-lg font-bold text-gray-800">EduCore</span>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center px-8 sm:px-14 lg:px-20 xl:px-28 py-10 max-w-xl mx-auto w-full">
                    {/* Heading */}
                    <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 tracking-tight">
                        Welcome back!
                    </h1>
                    <p className="text-gray-400 text-[15px] mt-2 mb-8">
                        Please enter your details to sign in to your account
                    </p>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3"
                            style={{ animation: 'fadeInUp 0.3s ease-out' }}
                        >
                            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-red-700">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* Email / Admission No */}
                        <div>
                            <label className="text-[13px] font-semibold text-gray-600 mb-2 block uppercase tracking-wide">
                                Email
                            </label>
                            <input
                                type="text"
                                className={`login-input w-full px-4 py-3.5 bg-gray-50 border ${validationErrors.identifier ? 'border-red-400' : 'border-gray-200'} rounded-xl outline-none text-gray-800 placeholder:text-gray-300 text-[15px]`}
                                placeholder="admin@example.com"
                                value={identifier}
                                onChange={(e) => {
                                    setIdentifier(e.target.value);
                                    if (validationErrors.identifier) setValidationErrors({ ...validationErrors, identifier: false });
                                }}
                            />
                            {validationErrors.identifier && (
                                <p className="text-red-500 text-[13px] mt-1.5 flex items-center gap-1">
                                    <span className="font-bold">*</span> Please fill out this field.
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-[13px] font-semibold text-gray-600 mb-2 block uppercase tracking-wide">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className={`login-input w-full px-4 py-3.5 pr-12 bg-gray-50 border ${validationErrors.password ? 'border-red-400' : 'border-gray-200'} rounded-xl outline-none text-gray-800 placeholder:text-gray-300 text-[15px]`}
                                    placeholder="minimum 8 characters"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (validationErrors.password) setValidationErrors({ ...validationErrors, password: false });
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors duration-200"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                                </button>
                            </div>
                            {validationErrors.password && (
                                <p className="text-red-500 text-[13px] mt-1.5 flex items-center gap-1">
                                    <span className="font-bold">*</span> Please fill out this field.
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="login-btn w-full py-3.5 px-4 text-white rounded-xl font-semibold text-[15px] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="w-full pb-8">
                    <p className="text-center text-xs text-gray-300">
                        &copy; 2026 Student Academic Management System
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
