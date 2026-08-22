import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Login failed');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-shell px-4", children: _jsxs("div", { className: "w-full max-w-6xl grid lg:grid-cols-[1.1fr_0.9fr] items-center gap-8", children: [_jsx("div", { className: "hidden lg:block", children: _jsxs("div", { className: "relative overflow-hidden rounded-[2rem] border border-white/10 bg-sky-950/30 shadow-2xl shadow-sky-950/40", children: [_jsx("div", { className: "auth-visual" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-sky-950/80 via-sky-950/25 to-transparent" }), _jsxs("div", { className: "absolute left-8 top-8 flex items-center gap-2 rounded-full border border-white/10 bg-sky-950/50 px-4 py-2 text-sm text-sky-100 backdrop-blur-sm", children: [_jsx(Leaf, { className: "w-4 h-4 text-emerald-300" }), "Smart energy for greener work"] }), _jsxs("div", { className: "absolute bottom-8 left-8 right-8 rounded-2xl border border-white/10 bg-sky-950/40 p-4 backdrop-blur-md", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sky-100/80 text-sm", children: "AI optimization score" }), _jsx("span", { className: "text-emerald-300 font-semibold", children: "91%" })] }), _jsx("div", { className: "h-2.5 w-full rounded-full bg-sky-900/80", children: _jsx("div", { className: "h-full w-[91%] rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400" }) })] })] }) }), _jsxs("div", { className: "w-full max-w-md mx-auto lg:mx-0", children: [_jsx("div", { className: "flex justify-center mb-8", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Leaf, { className: "w-8 h-8 text-emerald-400" }), _jsx("span", { className: "text-2xl font-bold text-white", children: "GreenPulse" })] }) }), _jsxs("div", { className: "auth-card", children: [_jsx("h1", { className: "text-3xl font-bold text-white mb-2", children: "Welcome back" }), _jsx("p", { className: "text-sky-100/70 mb-8", children: "Sign in to your GreenPulse account" }), error && (_jsx("div", { className: "mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-white text-sm font-medium mb-2", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "input-field", placeholder: "you@example.com", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-white text-sm font-medium mb-2", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), className: "input-field pr-10", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-2.5 text-slate-400 hover:text-white", children: showPassword ? _jsx(EyeOff, { size: 20 }) : _jsx(Eye, { size: 20 }) })] })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", className: "rounded border-slate-300" }), _jsx("span", { className: "text-sky-100/70", children: "Remember me" })] }), _jsx(Link, { to: "#", className: "text-emerald-400 hover:text-emerald-300", children: "Forgot password?" })] }), _jsx("button", { type: "submit", disabled: isLoading, className: "btn-primary w-full py-2.5 mt-6", children: isLoading ? 'Signing in...' : 'Sign In' })] }), _jsx("div", { className: "mt-6", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("div", { className: "w-full border-t border-slate-700" }) }), _jsx("div", { className: "relative flex justify-center text-sm", children: _jsx("span", { className: "px-2 bg-sky-950/40 text-sky-100/60", children: "or" }) })] }) }), _jsxs("p", { className: "text-center text-sky-100/70 mt-6", children: ["Don't have an account?", ' ', _jsx(Link, { to: "/register", className: "text-emerald-400 hover:text-emerald-300 font-medium", children: "Create account" })] })] }), _jsx("p", { className: "text-center text-emerald-300 mt-8 italic", children: "\"Compute smarter. Breathe greener.\"" })] })] }) }));
}
//# sourceMappingURL=Login.js.map