import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function Landing() {
  const [animateTitle, setAnimateTitle] = useState(false);

  useEffect(() => {
    setAnimateTitle(true);
  }, []);

  const features = [
    { 
      icon: "▣", 
      title: "Smart Matching", 
      desc: "AI-powered candidate filtering and skill scoring",
      color: "primary"
    },
    { 
      icon: "◈", 
      title: "Analytics Dashboard", 
      desc: "Real-time placement insights and metrics",
      color: "secondary"
    },
    { 
      icon: "◐", 
      title: "Automation", 
      desc: "Streamlined workflow and eligibility validation",
      color: "accent"
    },
    { 
      icon: "◆", 
      title: "Secure Platform", 
      desc: "Enterprise-grade data protection",
      color: "primary"
    },
  ];

  const stats = [
    { value: "100%", label: "Automated Filtering" },
    { value: "3", label: "User Roles" },
    { value: "Real-time", label: "Status Tracking" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-primary-900 to-secondary-900 text-white overflow-hidden relative">
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 border border-white/20 rotate-45"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 border border-white/20 -rotate-12"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 border border-white/20 rotate-12"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${animateTitle ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold uppercase tracking-wider">Enterprise Placement Solution</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-down">
            <span className="block mb-2">Intelligent Placement</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400">
              Automation Platform
            </span>
          </h1>

          <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-300 animate-slide-up animate-delay-200">
            A full-stack, role-based placement automation system with intelligent filtering, 
            skill matching, and comprehensive recruitment workflow management.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12 max-w-3xl w-full animate-fade-in animate-delay-300">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="text-3xl font-bold text-accent-400 mb-2">{stat.value}</div>
              <div className="text-sm text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-6xl w-full animate-scale-in animate-delay-300">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 mb-4 rounded-lg bg-${feature.color}-600/20 border border-${feature.color}-500/30 flex items-center justify-center text-2xl font-bold text-${feature.color}-400 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-scale-in animate-delay-300">
          <Link
            to="/login"
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>→</span>
            <span>Sign In</span>
          </Link>

          <Link
            to="/register"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>Get Started</span>
            <span>→</span>
          </Link>
        </div>

        {/* Key Features List */}
        <div className="mt-16 max-w-4xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Core Automation Features</h2>
            <div className="w-20 h-1 bg-accent-500 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <div className="w-10 h-10 mb-4 rounded bg-primary-600/20 border border-primary-500/30 flex items-center justify-center">
                <span className="text-primary-400 font-bold">✓</span>
              </div>
              <h3 className="font-semibold mb-2">Eligibility Filtering</h3>
              <p className="text-sm text-gray-400">Automatic CGPA validation and skill-based filtering</p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <div className="w-10 h-10 mb-4 rounded bg-accent-600/20 border border-accent-500/30 flex items-center justify-center">
                <span className="text-accent-400 font-bold">%</span>
              </div>
              <h3 className="font-semibold mb-2">Match Scoring</h3>
              <p className="text-sm text-gray-400">Intelligent skill compatibility calculation</p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <div className="w-10 h-10 mb-4 rounded bg-secondary-600/20 border border-secondary-500/30 flex items-center justify-center">
                <span className="text-secondary-300 font-bold">◉</span>
              </div>
              <h3 className="font-semibold mb-2">Workflow Management</h3>
              <p className="text-sm text-gray-400">End-to-end recruitment process automation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;