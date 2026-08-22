import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const getPasswordStrength = () => {
        if (password.length < 8)
            return 'weak';
        if (password.length < 12)
            return 'medium';
        return 'strong';
    };
    const strength = getPasswordStrength();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        setIsLoading(true);
        try {
            await register(email, password, fullName);
            navigate('/dashboard');
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-shell px-4", children: _jsxs("div", { className: "w-full max-w-6xl grid lg:grid-cols-[1.1fr_0.9fr] items-center gap-8", children: [_jsx("div", { className: "hidden lg:block", children: _jsxs("div", { className: "relative overflow-hidden rounded-[2rem] border border-white/10 bg-sky-950/30 shadow-2xl shadow-sky-950/40", children: [_jsx("div", { className: "auth-visual auth-visual-alt" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-sky-950/80 via-sky-950/25 to-transparent" }), _jsxs("div", { className: "absolute left-8 top-8 flex items-center gap-2 rounded-full border border-white/10 bg-sky-950/50 px-4 py-2 text-sm text-sky-100 backdrop-blur-sm", children: [_jsx(Leaf, { className: "w-4 h-4 text-emerald-300" }), "Build a greener digital habit"] }), _jsxs("div", { className: "absolute bottom-8 left-8 right-8 rounded-2xl border border-white/10 bg-sky-950/40 p-4 backdrop-blur-md", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sky-100/80 text-sm", children: "ECO impact" }), _jsx("span", { className: "text-emerald-300 font-semibold", children: "+24%" })] }), _jsx("div", { className: "h-2.5 w-full rounded-full bg-sky-900/80", children: _jsx("div", { className: "h-full w-[76%] rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400" }) })] })] }) }), _jsxs("div", { className: "w-full max-w-md mx-auto lg:mx-0", children: [_jsx("div", { className: "flex justify-center mb-8", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Leaf, { className: "w-8 h-8 text-emerald-400" }), _jsx("span", { className: "text-2xl font-bold text-white", children: "GreenPulse" })] }) }), _jsxs("div", { className: "auth-card", children: [_jsx("h1", { className: "text-3xl font-bold text-white mb-2", children: "Create account" }), _jsx("p", { className: "text-sky-100/70 mb-8", children: "Join the green computing revolution" }), error && (_jsx("div", { className: "mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-white text-sm font-medium mb-2", children: "Full Name" }), _jsx("input", { type: "text", value: fullName, onChange: (e) => setFullName(e.target.value), className: "input-field", placeholder: "John Doe", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-white text-sm font-medium mb-2", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "input-field", placeholder: "you@example.com", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-white text-sm font-medium mb-2", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), className: "input-field pr-10", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-2.5 text-slate-400 hover:text-white", children: showPassword ? _jsx(EyeOff, { size: 20 }) : _jsx(Eye, { size: 20 }) })] }), _jsxs("div", { className: "mt-2 text-xs text-sky-100/70", children: ["Strength:", ' ', _jsx("span", { className: strength === 'weak' ? 'text-red-400' :
                                                                strength === 'medium' ? 'text-yellow-400' :
                                                                    'text-green-400', children: strength.charAt(0).toUpperCase() + strength.slice(1) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-white text-sm font-medium mb-2", children: "Confirm Password" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showConfirm ? 'text' : 'password', value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: "input-field pr-10", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true }), _jsx("button", { type: "button", onClick: () => setShowConfirm(!showConfirm), className: "absolute right-3 top-2.5 text-slate-400 hover:text-white", children: showConfirm ? _jsx(EyeOff, { size: 20 }) : _jsx(Eye, { size: 20 }) })] }), confirmPassword && (_jsx("div", { className: "mt-2 flex items-center gap-2", children: password === confirmPassword ? (_jsxs(_Fragment, { children: [_jsx(Check, { size: 16, className: "text-green-400" }), _jsx("span", { className: "text-xs text-green-400", children: "Passwords match" })] })) : (_jsxs(_Fragment, { children: [_jsx(X, { size: 16, className: "text-red-400" }), _jsx("span", { className: "text-xs text-red-400", children: "Passwords don't match" })] })) }))] }), _jsxs("label", { className: "flex items-start space-x-2 cursor-pointer mt-4", children: [_jsx("input", { type: "checkbox", className: "rounded border-slate-300 mt-1", required: true }), _jsx("span", { className: "text-xs text-sky-100/70", children: "I agree to the Terms of Service and Privacy Policy" })] }), _jsx("button", { type: "submit", disabled: isLoading, className: "btn-primary w-full py-2.5 mt-6", children: isLoading ? 'Creating account...' : 'Create Account' })] }), _jsxs("p", { className: "text-center text-sky-100/70 mt-6", children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", className: "text-emerald-400 hover:text-emerald-300 font-medium", children: "Sign in" })] })] })] })] }) }));
}
//# sourceMappingURL=Register.js.map