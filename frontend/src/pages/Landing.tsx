import { useNavigate } from 'react-router-dom';
import { Leaf, Zap, TrendingDown, Cpu, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    { icon: Cpu, title: 'Real-time monitoring', desc: 'Track your laptop, CPU, RAM, battery and workload health in real time.' },
    { icon: TrendingDown, title: 'Carbon tracking', desc: 'Understand how digital activity impacts your footprint and costs.' },
    { icon: Zap, title: 'AI predictions', desc: 'Forecast energy spikes and get greener recommendations automatically.' },
    { icon: Leaf, title: 'Eco scheduling', desc: 'Shift demanding tasks to greener, lower-emission windows.' }
  ];

  return (
    <div className="min-h-screen dashboard-bg text-white">
      <div className="floating-orb orb-one" />
      <div className="floating-orb orb-two" />
      <div className="floating-orb orb-three" />

      <nav className="fixed w-full top-0 z-50 border-b border-white/10 bg-sky-950/25 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-400/20 border border-emerald-300/30">
              <Leaf className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="text-2xl font-bold text-white">GreenPulse</span>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button onClick={() => navigate('/dashboard')} className="primary-btn">Dashboard</button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="secondary-btn">Login</button>
                <button onClick={() => navigate('/register')} className="primary-btn">Get Started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <section className="dashboard-hero">
            <div className="hero-copy">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-300/25 text-emerald-200 text-sm font-medium mb-4">
                <Leaf className="w-4 h-4" />
                Climate-aware computing
              </div>

              <h1 className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tight text-white mb-5">
                Make your laptop <span className="text-emerald-300">smarter</span> and <span className="text-sky-300">greener</span>.
              </h1>

              <p className="text-lg text-sky-100/80 max-w-xl mb-7 leading-relaxed">
                Monitor energy use, estimate carbon impact, and turn everyday computing into a cleaner digital habit with real-time AI insights.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')} className="primary-btn">
                  {isAuthenticated ? 'Open dashboard' : 'Start free'}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => navigate('/dashboard')} className="secondary-btn">Explore analytics</button>
              </div>

              <div className="mt-8 flex flex-wrap gap-6 text-sm text-sky-100/70">
                <span>42% less idle waste</span>
                <span>Live telemetry</span>
                <span>AI-powered insights</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image-card">
                <div className="hero-image" />
                <div className="hero-card-badge">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  Live system health
                </div>
                <div className="hero-mini-metric">
                  <p className="text-xs text-sky-100/70">Carbon saved</p>
                  <p className="text-2xl font-bold text-white">18.4%</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-16 grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:-translate-y-1 transition-transform duration-200">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300 border border-emerald-300/20">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                <p className="text-sky-100/70 leading-relaxed">{desc}</p>
              </div>
            ))}
          </section>

          <section className="mt-20 grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-stretch">
            <div className="card overflow-hidden p-0">
              <div className="h-[340px] w-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80')" }} />
            </div>

            <div className="card flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-sky-400/10 px-3 py-1 text-sm border border-sky-300/20 text-sky-200">
                <Leaf className="w-4 h-4" />
                Green living data
              </div>
              <h3 className="mt-4 text-3xl font-bold text-white">Track the impact of your daily digital life.</h3>
              <p className="mt-3 text-sky-100/75 leading-relaxed">
                Turn raw device metrics into clear, actionable recommendations that reduce energy waste and improve sustainability.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-sky-900/30 border border-white/10 p-4">
                  <div className="text-2xl font-bold text-white">91.2%</div>
                  <div className="text-sky-100/70 text-sm">Efficiency score</div>
                </div>
                <div className="rounded-2xl bg-emerald-900/30 border border-white/10 p-4">
                  <div className="text-2xl font-bold text-white">64%</div>
                  <div className="text-sky-100/70 text-sm">Renewable share</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
