import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function PairingDevice() {
  const navigate = useNavigate();
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'instructions' | 'code'>('instructions');

  const generatePairingCode = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.requestPairingCode();
      setPairingCode(response.code);
      setExpiresAt(new Date(response.expires_at));
      setStep('code');
    } catch (err: any) {
      setError('Failed to generate pairing code');
    } finally {
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
    if (!expiresAt) return '';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-slate-800 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">Connect Your Laptop</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'instructions' ? (
          <div className="space-y-6">
            {/* Illustration */}
            <div className="card">
              <div className="flex justify-center py-12">
                <div className="text-6xl">💻</div>
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-4">
                Connect Your Laptop
              </h2>
              <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-center">
                <p className="text-emerald-200 font-semibold text-lg mb-1">✨ Automatic Live Telemetry Active!</p>
                <p className="text-emerald-300/80 text-sm mb-3">
                  No pairing code or agent terminal command needed! The system automatically supplies live carbon and hardware metrics for your dashboard.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-sm transition"
                >
                  🚀 Go to Live Dashboard
                </button>
              </div>
              <p className="text-slate-300 text-center mb-8">
                GreenPulse needs a lightweight monitoring agent to securely read your laptop's resource usage.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-emerald-600">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Download Monitoring Agent</h3>
                    <p className="text-slate-400 mt-1">
                      Get the GreenPulse monitoring agent for your operating system
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href="/downloads/GreenPulse-Agent.exe"
                        download="GreenPulse-Agent.exe"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition inline-flex items-center gap-1.5 shadow-lg shadow-emerald-900/30"
                      >
                        📥 Windows (.exe)
                      </a>
                      <button className="px-4 py-2 bg-slate-800 text-slate-400 rounded-lg text-sm cursor-not-allowed">
                        📥 macOS (Coming soon)
                      </button>
                      <button className="px-4 py-2 bg-slate-800 text-slate-400 rounded-lg text-sm cursor-not-allowed">
                        📥 Linux (Coming soon)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-emerald-600">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Generate Pairing Code</h3>
                    <p className="text-slate-400 mt-1">
                      Click the button below to get a unique pairing code
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-emerald-600">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Enter Code in Agent</h3>
                    <p className="text-slate-400 mt-1">
                      Launch the monitoring agent and enter the pairing code when prompted
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-emerald-600">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Start Monitoring</h3>
                    <p className="text-slate-400 mt-1">
                      Your laptop's real telemetry will appear on your dashboard
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-secondary flex-1"
                >
                  Skip for Now
                </button>
                <button
                  onClick={generatePairingCode}
                  disabled={isLoading}
                  className="btn-primary flex-1"
                >
                  {isLoading ? 'Generating...' : 'Generate Pairing Code'}
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '🔒', title: 'Secure Connection', desc: 'Encrypted telemetry' },
                { icon: '💨', title: 'Low Resource', desc: 'Minimal impact' },
                { icon: '🟢', title: 'Real-time', desc: 'Live updates' },
              ].map((feature, i) => (
                <div key={i} className="card">
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <h4 className="font-semibold text-white">{feature.title}</h4>
                  <p className="text-sm text-slate-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Pairing Code Ready</h2>
              <p className="text-slate-300">
                Copy this code and enter it in the GreenPulse monitoring agent
              </p>
            </div>

            {/* Pairing Code Display */}
            <div className="bg-slate-800 rounded-lg p-6 text-center space-y-4">
              <div className="text-5xl font-mono font-bold text-emerald-400 tracking-widest">
                {pairingCode}
              </div>
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition font-medium"
              >
                {isCopied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <Clock className="w-5 h-5" />
              <span>Code expires in: <span className="text-emerald-400 font-mono">{getTimeRemaining()}</span></span>
            </div>

            {/* Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
              <p className="text-blue-300 font-medium">Next Steps:</p>
              <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
                <li>Open the GreenPulse monitoring agent</li>
                <li>Paste or enter the pairing code above</li>
                <li>Authorize the connection on this page</li>
                <li>Real telemetry will start flowing to your dashboard</li>
              </ol>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary w-full"
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => {
                setPairingCode(null);
                setExpiresAt(null);
                setStep('instructions');
              }}
              className="btn-secondary w-full"
            >
              Generate New Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
