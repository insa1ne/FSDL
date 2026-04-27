import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroSimulator from '../components/HeroSimulator';
import { Network, Shield, Cpu, ActivitySquare } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -10, scale: 1.02 }}
    className="relative group p-6 rounded-2xl bg-surface-card/50 border border-border-subtle hover:border-indigo-500/50 backdrop-blur-sm overflow-hidden transition-all duration-300"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative z-10">
      <div className="w-12 h-12 rounded-xl bg-surface-panel border border-border-subtle flex items-center justify-center mb-4 text-accent-primary group-hover:text-indigo-300 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all">
        <Icon />
      </div>
      <h3 className="text-xl font-bold text-content-primary mb-2">{title}</h3>
      <p className="text-content-secondary leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-surface-root text-content-primary selection:bg-indigo-500/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-surface-root/80 backdrop-blur-md border-b border-border-subtle/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-content-primary font-bold text-xl tracking-tight">
            <ActivitySquare className="text-accent-primary" />
            NetSim<span className="text-accent-primary">.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-content-secondary hover:text-content-primary transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="text-sm font-medium bg-accent-primary hover:bg-indigo-500 text-content-primary px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-accent-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              v1.0 Live Demo
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-content-primary tracking-tight leading-[1.1]">
              Visualize Networks <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                In Real-Time
              </span>
            </h1>
            <p className="text-lg text-content-secondary max-w-lg leading-relaxed">
              Design, simulate, and understand network topologies instantly. A powerful and aesthetic engine for modern networking concepts.
            </p>
            
            <div className="flex items-center gap-4 mt-4">
              <Link to="/simulator" className="px-8 py-4 bg-accent-primary hover:bg-indigo-500 text-content-primary rounded-xl font-semibold shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all transform hover:-translate-y-1">
                Launch Simulator
              </Link>
              <Link to="/about" className="px-8 py-4 bg-surface-card hover:bg-surface-hover text-content-primary rounded-xl font-semibold border border-border-subtle transition-all">
                About Team
              </Link>
            </div>
          </motion.div>

          {/* Hero Simulator Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur-3xl -z-10 rounded-full" />
            <HeroSimulator />
          </motion.div>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-surface-panel border-t border-border-subtle relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-content-primary mb-4">Everything you need to simulate</h2>
            <p className="text-content-secondary max-w-2xl mx-auto">No clunky interfaces. Just a smooth, intuitive builder with real-time packet tracking.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Network} 
              title="Smart Topologies" 
              desc="Generate Star, Bus, and Ring topologies instantly. Auto-arranging algorithms compute precise spatial placements for any node count." 
            />
            <FeatureCard 
              icon={ActivitySquare} 
              title="Animated Packet Tracer" 
              desc="Watch data flow. Our BFS-driven engine routes packets across the active graph, lighting up connections hop by hop in real-time." 
            />
            <FeatureCard 
              icon={Shield} 
              title="Subnet Calculator" 
              desc="Derive network details perfectly. A complete integrated subnetting suite built fully on the client-side for zero latency." 
            />
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
