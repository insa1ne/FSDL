import React from 'react';
import Sidebar from '../components/Sidebar';
import { Building2, Code2, GraduationCap, Globe } from 'lucide-react';

const avatarColors = {
  indigo: '#6366f1',
  emerald: '#10b981',
  cyan: '#06b6d4',
  amber: '#f59e0b',
};

const teamMembers = [
  { name: 'Alice Smith',   roll: '1021101', color: avatarColors.indigo,  initials: 'AS' },
  { name: 'Bob Jones',     roll: '1021102', color: avatarColors.emerald, initials: 'BJ' },
  { name: 'Charlie Davis', roll: '1021103', color: avatarColors.cyan,    initials: 'CD' },
  { name: 'Diana Prince',  roll: '1021104', color: avatarColors.amber,   initials: 'DP' },
];

const AboutPage = () => {
  return (
    <div className="flex bg-surface-root min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-12 pb-12">

          {/* Header */}
          <header className="flex flex-col items-center text-center space-y-4 pt-8">
            <div className="w-20 h-20 bg-surface-panel border border-border-subtle rounded-2xl flex items-center justify-center shadow-xl">
              <Building2 className="w-10 h-10 text-accent-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-content-primary tracking-tight">
                Fr. C. Rodrigues Institute of Technology
              </h1>
              <p className="text-lg text-content-secondary mt-2">Department of Computer Engineering</p>
            </div>
          </header>

          {/* What We Built */}
          <section className="bg-surface-panel border border-border-subtle rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-content-primary mb-4 flex items-center gap-2">
              <Code2 className="text-accent-primary" /> What We Built
            </h2>
            <p className="text-content-secondary leading-relaxed text-lg max-w-3xl">
              NetSim is a modern, real-time network topology visualizer and simulator. Built to help
              students and professionals intuitively design network structures like Star, Ring, and
              Bus topologies. Features include an animated BFS-driven packet tracer, link-failure
              simulations, and a fully client-side subnet calculator. The frontend stack utilizes{' '}
              <strong>React, Vite, Zustand, Framer Motion, and Tailwind CSS</strong> to deliver a
              highly interactive and aesthetically rich experience.
            </p>
          </section>

          {/* Team Section */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-content-primary">Development Team</h2>
              <p className="text-content-secondary mt-1">The minds behind NetSim</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member) => (
                <div
                  key={member.roll}
                  className="bg-surface-panel/50 border border-border-subtle rounded-2xl p-6 flex flex-col items-center text-center hover:bg-surface-hover/80 transition-colors"
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: member.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: 16,
                      boxShadow: `0 0 20px ${member.color}55`,
                      outline: '4px solid var(--surface-root)',
                    }}
                  >
                    {member.initials}
                  </div>
                  <h3 className="text-lg font-bold text-content-primary">{member.name}</h3>
                  <div className="flex items-center gap-1.5 text-content-secondary text-sm mt-1">
                    <GraduationCap className="w-4 h-4" />
                    Roll No: {member.roll}
                  </div>
                  <button className="mt-4 p-2 bg-surface-root rounded-full text-content-secondary hover:text-content-primary transition-colors">
                    <Globe className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Mentor */}
            <div className="mt-8 mx-auto max-w-sm bg-surface-panel border border-indigo-500/30 rounded-2xl p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-900 border border-indigo-500/30 flex items-center justify-center">
                <span className="text-accent-primary font-bold text-sm">Prof</span>
              </div>
              <div>
                <div className="text-xs text-accent-primary font-bold tracking-wider mb-1">PROJECT MENTOR</div>
                <h3 className="text-lg font-bold text-content-primary">Prof. Jane Doe</h3>
              </div>
            </div>
          </section>

          {/* Attribution footer */}
          <footer className="pt-12 border-t border-border-subtle text-center">
            <p className="text-content-muted text-sm max-w-3xl mx-auto leading-relaxed">
              "This project was developed as part of the Full Stack Development Laboratory course at
              Fr. C. Rodrigues Institute of Technology, Vashi, Navi Mumbai, Department of Computer
              Engineering."
            </p>
          </footer>

        </div>
      </main>
    </div>
  );
};

export default AboutPage;
