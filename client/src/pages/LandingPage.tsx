import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Lightbulb, Clock, Users, Sparkles, ChevronRight, Heart, Cake, Flag } from 'lucide-react';
import { Logo } from '../components/Logo';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Logo size="md" showText />
        <div className="flex gap-3">
          <button onClick={() => navigate('/dashboard')} className="btn-ghost text-sm">
            Dashboard
          </button>
          <button onClick={() => navigate('/create')} className="btn-primary text-sm">
            Plan My Event
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Sparkles className="w-4 h-4" />
          AI-Powered Event Planning
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-stone-900 mb-4 leading-tight">
          Plan Smarter.<br />
          <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Celebrate Better.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto mb-10">
          Planora AI helps you organize weddings, birthday parties, and community events
          with intelligent planning, smart budgets, and personalized recommendations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/create')} className="btn-primary text-lg py-3 px-8 shadow-lg hover:shadow-xl">
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Plan My Event
            </span>
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary text-lg py-3 px-8">
            View Demo Dashboard
          </button>
        </div>
        <p className="mt-4 text-sm text-stone-500">No registration required — start planning instantly</p>
      </section>

      {/* Event Types */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-stone-900 mb-10">
          Plan Any Celebration
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Heart,
              title: 'Weddings',
              desc: 'From intimate ceremonies to grand celebrations. Budget allocation, vendor management, timeline planning, and guest coordination.',
              color: 'text-pink-600 bg-pink-50',
              border: 'border-pink-200',
            },
            {
              icon: Cake,
              title: 'Birthday Parties',
              desc: 'Fun themes, activity planning, catering options, and entertainment for all ages. Make every birthday memorable.',
              color: 'text-amber-600 bg-amber-50',
              border: 'border-amber-200',
            },
            {
              icon: Flag,
              title: 'Community Events',
              desc: 'Festivals, fundraisers, and gatherings. Volunteer management, logistics, and community engagement tools.',
              color: 'text-emerald-600 bg-emerald-50',
              border: 'border-emerald-200',
            },
          ].map((item) => (
            <button
              key={item.title}
              onClick={() => navigate('/create')}
              className={`card text-left hover:shadow-md transition-all duration-200 border ${item.border} group cursor-pointer`}
            >
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2 group-hover:text-primary-700">
                {item.title}
              </h3>
              <p className="text-stone-600">{item.desc}</p>
              <div className="mt-4 flex items-center text-primary-600 font-medium text-sm">
                Start planning <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-stone-900 mb-4">
            Everything You Need to Plan Perfectly
          </h2>
          <p className="text-center text-stone-600 mb-12 max-w-xl mx-auto">
            Intelligent tools that adapt to your event type, budget, and preferences.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: DollarSign, title: 'Smart Budgets', desc: 'AI-optimized budget allocation with real-time tracking and savings suggestions.' },
              { icon: Lightbulb, title: 'Personalized Ideas', desc: 'Theme, decoration, menu, and activity ideas tailored to your preferences.' },
              { icon: Users, title: 'Vendor & Guest Tools', desc: 'Track vendors, manage guest lists, RSVPs, and dietary requirements.' },
              { icon: Clock, title: 'Dynamic Timelines', desc: 'Auto-generated planning timelines that adapt to your event date.' },
              { icon: Calendar, title: 'Day-of Schedule', desc: 'Detailed event day schedules with responsibilities and contingencies.' },
              { icon: Sparkles, title: 'AI Recommendations', desc: 'Context-aware suggestions that improve as you add details.' },
              { icon: Flag, title: 'Risk Planning', desc: 'Identify risks early with practical mitigation strategies.' },
              { icon: ChevronRight, title: 'Export & Share', desc: 'Download plans, budgets, and checklists as printable documents.' },
            ].map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-stone-600">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Planning?
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Create your first event in minutes. No account required.
          </p>
          <button
            onClick={() => navigate('/create')}
            className="bg-white text-primary-700 font-semibold py-3 px-8 rounded-xl text-lg hover:bg-primary-50 transition-all shadow-lg"
          >
            Plan My Event Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-8 text-center text-sm">
        <div className="max-w-7xl mx-auto px-6">
          <p className="mb-2">Planora AI — Plan Smarter. Celebrate Better.</p>
          <p>&copy; {new Date().getFullYear()} Planora AI. All data is stored locally in your browser.</p>
        </div>
      </footer>
    </div>
  );
}
