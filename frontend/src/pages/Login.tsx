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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell px-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1.1fr_0.9fr] items-center gap-8">
        <div className="hidden lg:block">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-sky-950/30 shadow-2xl shadow-sky-950/40">
            <div className="auth-visual" />
            <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-sky-950/25 to-transparent" />
            <div className="absolute left-8 top-8 flex items-center gap-2 rounded-full border border-white/10 bg-sky-950/50 px-4 py-2 text-sm text-sky-100 backdrop-blur-sm">
              <Leaf className="w-4 h-4 text-emerald-300" />
              Smart energy for greener work
            </div>
            <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/10 bg-sky-950/40 p-4 backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sky-100/80 text-sm">AI optimization score</span>
                <span className="text-emerald-300 font-semibold">91%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-sky-900/80">
                <div className="h-full w-[91%] rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <Leaf className="w-8 h-8 text-emerald-400" />
              <span className="text-2xl font-bold text-white">GreenPulse</span>
            </div>
          </div>

          <div className="auth-card">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-sky-100/70 mb-8">Sign in to your GreenPulse account</p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300" />
                  <span className="text-sky-100/70">Remember me</span>
                </label>
                <Link to="#" className="text-emerald-400 hover:text-emerald-300">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-2.5 mt-6"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-sky-950/40 text-sky-100/60">or</span>
                </div>
              </div>
            </div>

            <p className="text-center text-sky-100/70 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Create account
              </Link>
            </p>
          </div>

          <p className="text-center text-emerald-300 mt-8 italic">"Compute smarter. Breathe greener."</p>
        </div>
      </div>
    </div>
  );
}
