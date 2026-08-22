import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Clock } from 'lucide-react';
import { api } from '../services/api';
export default function PairingDevice() {
    const navigate = useNavigate();
    const [pairingCode, setPairingCode] = useState(null);
    const [expiresAt, setExpiresAt] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState('instructions');
    const generatePairingCode = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.requestPairingCode();
            setPairingCode(response.code);
            setExpiresAt(new Date(response.expires_at));
            setStep('code');
        }
        catch (err) {
            setError('Failed to generate pairing code');
        }
        finally {
            setIsLoading(false);
        }
    };
    const copyToClipboard = () => {
        if (pairingCode) {
            navigator.clipboard.writeText(pairingCode);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };
    const getTimeRemaining = () => {
        if (!expiresAt)
            return '';
        const now = new Date();
        const diff = expiresAt.getTime() - now.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    useEffect(() => {
        if (expiresAt) {
            const interval = setInterval(() => {
                if (new Date() > expiresAt) {
                    setPairingCode(null);
                    setExpiresAt(null);
                    setStep('instructions');
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [expiresAt]);
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950", children: [_jsx("nav", { className: "sticky top-0 z-40 border-b border-slate-800 bg-black/40 backdrop-blur-xl", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16", children: [_jsxs("button", { onClick: () => navigate('/dashboard'), className: "flex items-center gap-2 text-slate-400 hover:text-white transition", children: [_jsx(ArrowLeft, { className: "w-5 h-5" }), "Back"] }), _jsx("h1", { className: "text-2xl font-bold text-white", children: "Connect Your Laptop" }), _jsx("div", { className: "w-20" })] }) }), _jsx("div", { className: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: step === 'instructions' ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "card", children: [_jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "text-6xl", children: "\uD83D\uDCBB" }) }), _jsx("h2", { className: "text-2xl font-bold text-white text-center mb-4", children: "Connect Your Laptop" }), _jsxs("div", { className: "mb-6 p-4 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-center", children: [_jsx("p", { className: "text-emerald-200 font-semibold text-lg mb-1", children: "\u2728 Automatic Live Telemetry Active!" }), _jsx("p", { className: "text-emerald-300/80 text-sm mb-3", children: "No pairing code or agent terminal command needed! The system automatically supplies live carbon and hardware metrics for your dashboard." }), _jsx("button", { onClick: () => navigate('/dashboard'), className: "px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-sm transition", children: "\uD83D\uDE80 Go to Live Dashboard" })] }), _jsx("p", { className: "text-slate-300 text-center mb-8", children: "GreenPulse needs a lightweight monitoring agent to securely read your laptop's resource usage." }), error && (_jsx("div", { className: "mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200", children: error })), _jsxs("div", { className: "space-y-4 mb-8", children: [_jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: "flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-emerald-600", children: _jsx("span", { className: "text-white font-bold", children: "1" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: "Download Monitoring Agent" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Get the GreenPulse monitoring agent for your operating system" }), _jsxs("div", { className: "mt-3 flex gap-2", children: [_jsx("button", { className: "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition", children: "\uD83D\uDCE5 Windows" }), _jsx("button", { className: "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition", children: "\uD83D\uDCE5 macOS" }), _jsx("button", { className: "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition", children: "\uD83D\uDCE5 Linux" })] })] })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: "flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-emerald-600", children: _jsx("span", { className: "text-white font-bold", children: "2" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: "Generate Pairing Code" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Click the button below to get a unique pairing code" })] })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: "flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-emerald-600", children: _jsx("span", { className: "text-white font-bold", children: "3" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: "Enter Code in Agent" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Launch the monitoring agent and enter the pairing code when prompted" })] })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: "flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-emerald-600", children: _jsx("span", { className: "text-white font-bold", children: "4" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: "Start Monitoring" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Your laptop's real telemetry will appear on your dashboard" })] })] })] }), _jsxs("div", { className: "flex gap-4 pt-4", children: [_jsx("button", { onClick: () => navigate('/dashboard'), className: "btn-secondary flex-1", children: "Skip for Now" }), _jsx("button", { onClick: generatePairingCode, disabled: isLoading, className: "btn-primary flex-1", children: isLoading ? 'Generating...' : 'Generate Pairing Code' })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
                                { icon: '🔒', title: 'Secure Connection', desc: 'Encrypted telemetry' },
                                { icon: '💨', title: 'Low Resource', desc: 'Minimal impact' },
                                { icon: '🟢', title: 'Real-time', desc: 'Live updates' },
                            ].map((feature, i) => (_jsxs("div", { className: "card", children: [_jsx("div", { className: "text-3xl mb-2", children: feature.icon }), _jsx("h4", { className: "font-semibold text-white", children: feature.title }), _jsx("p", { className: "text-sm text-slate-400", children: feature.desc })] }, i))) })] })) : (_jsxs("div", { className: "card space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Pairing Code Ready" }), _jsx("p", { className: "text-slate-300", children: "Copy this code and enter it in the GreenPulse monitoring agent" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-6 text-center space-y-4", children: [_jsx("div", { className: "text-5xl font-mono font-bold text-emerald-400 tracking-widest", children: pairingCode }), _jsx("button", { onClick: copyToClipboard, className: "w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition font-medium", children: isCopied ? (_jsxs(_Fragment, { children: [_jsx(Check, { className: "w-5 h-5" }), "Copied!"] })) : (_jsxs(_Fragment, { children: [_jsx(Copy, { className: "w-5 h-5" }), "Copy Code"] })) })] }), _jsxs("div", { className: "flex items-center justify-center gap-2 text-slate-400", children: [_jsx(Clock, { className: "w-5 h-5" }), _jsxs("span", { children: ["Code expires in: ", _jsx("span", { className: "text-emerald-400 font-mono", children: getTimeRemaining() })] })] }), _jsxs("div", { className: "bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2", children: [_jsx("p", { className: "text-blue-300 font-medium", children: "Next Steps:" }), _jsxs("ol", { className: "text-blue-200 text-sm space-y-1 list-decimal list-inside", children: [_jsx("li", { children: "Open the GreenPulse monitoring agent" }), _jsx("li", { children: "Paste or enter the pairing code above" }), _jsx("li", { children: "Authorize the connection on this page" }), _jsx("li", { children: "Real telemetry will start flowing to your dashboard" })] })] }), _jsx("button", { onClick: () => navigate('/dashboard'), className: "btn-primary w-full", children: "Go to Dashboard" }), _jsx("button", { onClick: () => {
                                setPairingCode(null);
                                setExpiresAt(null);
                                setStep('instructions');
                            }, className: "btn-secondary w-full", children: "Generate New Code" })] })) })] }));
}
//# sourceMappingURL=PairingDevice.js.map