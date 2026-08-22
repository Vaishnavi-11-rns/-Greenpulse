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
    if (password.length < 8) return 'weak';
    if (password.length < 12) return 'medium';
    return 'strong';
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell px-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1.1fr_0.9fr] items-center gap-8">
        <div className="hidden lg:block">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-sky-950/30 shadow-2xl shadow-sky-950/40">
            <div className="auth-visual auth-visual-alt" />
            <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-sky-950/25 to-transparent" />
            <div className="absolute left-8 top-8 flex items-center gap-2 rounded-full border border-white/10 bg-sky-950/50 px-4 py-2 text-sm text-sky-100 backdrop-blur-sm">
              <Leaf className="w-4 h-4 text-emerald-300" />
              Build a greener digital habit
            </div>
            <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/10 bg-sky-950/40 p-4 backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sky-100/80 text-sm">ECO impact</span>
                <span className="text-emerald-300 font-semibold">+24%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-sky-900/80">
                <div className="h-full w-[76%] rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400" />
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
            <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
            <p className="text-sky-100/70 mb-8">Join the green computing revolution</p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                  placeholder="John Doe"
                  required
                />
              </div>

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
                <div className="mt-2 text-xs text-sky-100/70">
                  Strength:{' '}
                  <span className={
                    strength === 'weak' ? 'text-red-400' :
                    strength === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }>
                    {strength.charAt(0).toUpperCase() + strength.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    {password === confirmPassword ? (
                      <>
                        <Check size={16} className="text-green-400" />
                        <span className="text-xs text-green-400">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X size={16} className="text-red-400" />
                        <span className="text-xs text-red-400">Passwords don't match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <label className="flex items-start space-x-2 cursor-pointer mt-4">
                <input type="checkbox" className="rounded border-slate-300 mt-1" required />
                <span className="text-xs text-sky-100/70">
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-2.5 mt-6"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sky-100/70 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
