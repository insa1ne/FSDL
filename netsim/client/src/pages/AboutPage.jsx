import React from 'react';
import Sidebar from '../components/Sidebar';
import { GraduationCap, Globe } from 'lucide-react';

const teamMembers = [
  { name: 'Niya Johnson',   roll: '1023214', initials: 'NJ', color: '#b76dff' },
  { name: 'Atharva Patil',  roll: '1023217', initials: 'AP', color: '#920498' },
  { name: 'Harsh Patil',    roll: '1023218', initials: 'HP', color: '#dcb8ff' },
  { name: 'Arpit Pawar',    roll: '1023225', initials: 'AP', color: '#ddb7ff' },
  { name: 'Najm Siddiqui',  roll: '1023253', initials: 'NS', color: '#ffaaf8' },
  { name: 'Azeem Usmani',   roll: '1023259', initials: 'AU', color: '#ffb4ab' },
];

const sgFont = { fontFamily: "'Space Grotesk', sans-serif" };

const AboutPage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-16 overflow-y-auto">
        <div className="max-w-4xl mx-auto pb-16">

          {/* Header */}
          <header className="flex flex-col items-center text-center gap-5 pt-4 mb-16">
            <div className="w-16 h-16 glass-panel rounded-2xl flex items-center justify-center"
              style={{ border: '1px solid rgba(183,109,255,0.2)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--accent-primary)', fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ ...sgFont, color: 'var(--content-primary)', letterSpacing: '-0.02em' }}>
                Fr. C. Rodrigues Institute of Technology
              </h1>
              <p className="text-sm" style={{ color: 'var(--content-secondary)' }}>Department of Computer Engineering</p>
            </div>
          </header>

          {/* What We Built */}
          <section className="glass-panel card-hover-glow rounded-2xl p-8 mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ ...sgFont, color: 'var(--content-primary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--accent-primary)', fontVariationSettings: "'FILL' 1" }}>code</span>
              What We Built
            </h2>
            <p className="leading-relaxed text-base" style={{ color: 'var(--content-secondary)' }}>
              NetSim is a modern, real-time network topology visualizer and simulator. Built to help
              students and professionals intuitively design network structures like Star, Ring, and
              Bus topologies. Features include an animated BFS-driven packet tracer, link-failure
              simulations, and a fully client-side subnet calculator. The frontend stack utilizes{' '}
              <strong style={{ color: 'var(--accent-primary)' }}>React, Vite, Zustand, Framer Motion, and Tailwind CSS</strong>{' '}
              to deliver a highly interactive and aesthetically rich experience.
            </p>
          </section>

          {/* Team Grid */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-1" style={{ ...sgFont, color: 'var(--content-primary)' }}>Development Team</h2>
              <p className="text-sm" style={{ color: 'var(--content-secondary)' }}>The minds behind NetSim</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {teamMembers.map((member) => (
                <div key={member.roll}
                  className="glass-panel card-hover-glow rounded-xl p-6 flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4"
                    style={{
                      background: `linear-gradient(135deg, ${member.color}90, ${member.color}50)`,
                      border: `2px solid ${member.color}40`,
                      boxShadow: `0 0 20px ${member.color}30`,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}>
                    {member.initials}
                  </div>
                  <h3 className="font-semibold mb-1" style={{ ...sgFont, color: 'var(--content-primary)' }}>{member.name}</h3>
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--content-muted)' }}>
                    <GraduationCap className="w-3 h-3" />
                    Roll: {member.roll}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Mentor */}
          <div className="glass-panel card-hover-glow rounded-xl p-6 flex items-center gap-5 mb-12 max-w-sm mx-auto"
            style={{ borderColor: 'rgba(183,109,255,0.2)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #b76dff60, #92049860)', border: '2px solid rgba(183,109,255,0.3)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--accent-primary)', ...sgFont }}>Prof</span>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--accent-primary)', ...sgFont }}>
                Project Mentor
              </div>
              <h3 className="font-semibold" style={{ ...sgFont, color: 'var(--content-primary)' }}>Dr. Smita Dange</h3>
            </div>
          </div>

          {/* Footer */}
          <footer className="pt-8 border-t text-center" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-xs leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--content-muted)' }}>
              This project was developed as part of the Full Stack Development Laboratory course at
              Fr. C. Rodrigues Institute of Technology, Vashi, Navi Mumbai.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
