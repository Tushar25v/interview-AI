import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  ExternalLink, Brain, Search, Loader2, CheckCircle, AlertCircle, 
  Globe, Video, FileText, GraduationCap, Target, 
  TrendingUp, Award, Lightbulb, Zap, ArrowRight, 
  Circle, Square, Triangle, Hexagon, Activity, Eye, Database,
  Code, Users, MessageSquare, BarChart3, Timer, Sparkles,
  Compass, Map, BookMarked, Telescope, Radar, Layers, Play,
  Filter, Cpu, Network, Scan, Bot,
  Clock, Mic, Volume2, Heart, Waves, Atom, Orbit, User,
  Github, Mail, Home
} from 'lucide-react';
import { PerTurnFeedbackItem } from '../services/api';

interface PostInterviewReportProps {
  perTurnFeedback: PerTurnFeedbackItem[];
  finalSummary: {
    status: 'loading' | 'completed' | 'error';
    data?: {
      patterns_tendencies?: string;
      strengths?: string;
      weaknesses?: string;
      improvement_focus_areas?: string;
      resource_search_topics?: string[];
      recommended_resources?: any[];
    };
    error?: string;
  };
  resources: {
    status: 'loading' | 'completed' | 'error';
    data?: any[];
    error?: string;
  };
  onStartNewInterview: () => void;
  onGoHome: () => void;
}

// Advanced particle system for immersive backgrounds
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  pulsation: number;
  rotation: number;
  rotationSpeed: number;
}

// Enhanced floating orb system
interface FloatingOrb {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  speed: number;
  direction: number;
  pulse: number;
}

// FIXED: Add interface for search timeline stages
interface SearchStage {
  id: number;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  duration: number; // Duration in seconds for this stage
  color: string;
}

const PostInterviewReport: React.FC<PostInterviewReportProps> = ({
  perTurnFeedback,
  finalSummary,
  resources,
  onStartNewInterview,
  onGoHome,
}) => {
  // Advanced state management
  const [currentView, setCurrentView] = useState<'overview' | 'analysis' | 'resources'>('overview');
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [scrollY, setScrollY] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState<Record<string, boolean>>({});
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingOrbs, setFloatingOrbs] = useState<FloatingOrb[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // FIXED: Add artificial timing control state
  const [timingControl, setTimingControl] = useState({
    summaryStartTime: Date.now(),
    resourcesStartTime: Date.now(),
    summaryForceLoading: false,
    resourcesForceLoading: false,
    actualSummaryData: null as any,
    actualResourcesData: null as any[],
  });

  // Feedback form state


  // FIXED: Search progress state for Perplexity-style timeline
  const [searchProgress, setSearchProgress] = useState({
    currentStage: 0,
    progress: 0,
    elapsedTime: 0,
    stages: [
      {
        id: 0,
        label: "Analyzing Interview Context",
        description: "Understanding your performance and identifying skill gaps",
        icon: Brain,
        duration: 3,
        color: "blue"
      },
      {
        id: 1, 
        label: "Building Search Queries",
        description: "Crafting targeted search queries based on your interview context",
        icon: Search,
        duration: 3,
        color: "cyan"
      },
      {
        id: 2,
        label: "Searching the Web",
        description: "Querying online resources and databases",
        icon: Database,
        duration: 5,
        color: "emerald"
      },
      {
        id: 3,
        label: "Filtering & Ranking",
        description: "Evaluating relevance and quality of found resources",
        icon: Filter,
        duration: 2,
        color: "purple"
      },
      {
        id: 4,
        label: "Consolidating Results",
        description: "Organizing and personalizing recommendations for you",
        icon: Target,
        duration: 2,
        color: "pink"
      }
    ] as SearchStage[]
  });
  
  // Analysis progress state (simplified for 10-second display)
  const [analysisProgress, setAnalysisProgress] = useState({
    progress: 0,
    currentStep: 'Initializing AI Analysis...',
    elapsedTime: 0
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);

  // FIXED: Initialize timing control when component mounts
  useEffect(() => {
    const now = Date.now();
    setTimingControl(prev => ({
      ...prev,
      summaryStartTime: now,
      resourcesStartTime: now,
      summaryForceLoading: finalSummary.status === 'loading',
      resourcesForceLoading: resources.status === 'loading'
    }));
  }, []);

  // FIXED: Monitor actual data and apply artificial delays
  useEffect(() => {
    const now = Date.now();
    
    // Handle final summary data with 10-second delay
    if (finalSummary.status === 'completed' && finalSummary.data && !timingControl.actualSummaryData) {
      setTimingControl(prev => ({
        ...prev,
        actualSummaryData: finalSummary.data
      }));
    }
    
    // Handle resources data with 15-second delay  
    if (resources.status === 'completed' && resources.data && !timingControl.actualResourcesData) {
      setTimingControl(prev => ({
        ...prev,
        actualResourcesData: resources.data
      }));
    }
  }, [finalSummary, resources, timingControl.actualSummaryData, timingControl.actualResourcesData]);

  // FIXED: Timer effect for artificial delays and progress tracking
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const summaryElapsed = (now - timingControl.summaryStartTime) / 1000;
      const resourcesElapsed = (now - timingControl.resourcesStartTime) / 1000;

      // Update analysis progress (10 seconds)
      if (timingControl.summaryForceLoading || (finalSummary.status === 'loading' && summaryElapsed < 12)) {
        const progress = Math.min((summaryElapsed / 12) * 100, 100);
        const steps = [
          'Initializing AI Analysis...',
          'Processing conversation patterns...',
          'Identifying key strengths...',
          'Analyzing improvement areas...',
          'Generating insights...',
          'Finalizing recommendations...'
        ];
        const stepIndex = Math.floor((summaryElapsed / 12) * steps.length);
        
        setAnalysisProgress({
          progress,
          currentStep: steps[Math.min(stepIndex, steps.length - 1)],
          elapsedTime: summaryElapsed
        });

        // Check if we should stop showing loading (10 seconds passed AND we have data)
        if (summaryElapsed >= 12 && timingControl.actualSummaryData) {
          setTimingControl(prev => ({ ...prev, summaryForceLoading: false }));
        }
      }

      // Update search progress (15 seconds) with stage-based timeline
      if (timingControl.resourcesForceLoading || (resources.status === 'loading' && resourcesElapsed < 17)) {
        let cumulativeTime = 0;
        let currentStage = 0;
        
        // Determine current stage based on elapsed time
        for (let i = 0; i < searchProgress.stages.length; i++) {
          cumulativeTime += searchProgress.stages[i].duration;
          if (resourcesElapsed <= cumulativeTime) {
            currentStage = i;
            break;
          }
        }

        const totalProgress = Math.min((resourcesElapsed / 17) * 100, 100);
        
        setSearchProgress(prev => ({
          ...prev,
          currentStage,
          progress: totalProgress,
          elapsedTime: resourcesElapsed
        }));

        // Check if we should stop showing loading (15 seconds passed AND we have data)
        if (resourcesElapsed >= 17 && timingControl.actualResourcesData) {
          setTimingControl(prev => ({ ...prev, resourcesForceLoading: false }));
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [timingControl.summaryStartTime, timingControl.resourcesStartTime, timingControl.summaryForceLoading, timingControl.resourcesForceLoading, timingControl.actualSummaryData, timingControl.actualResourcesData, finalSummary.status, resources.status, searchProgress.stages]);

  // Enhanced mouse tracking with smoothing
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  }, []);

  // Advanced scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Determine current section based on scroll position
      const sections = ['overview', 'analysis', 'resources'];
      const sectionHeight = window.innerHeight;
      const newSection = Math.floor(window.scrollY / sectionHeight);
      setCurrentSection(Math.min(newSection, sections.length - 1));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic particle system
  useEffect(() => {
    const createParticles = () => {
      const summaryLoading = timingControl.summaryForceLoading || finalSummary.status === 'loading';
      const resourcesLoading = timingControl.resourcesForceLoading || resources.status === 'loading';
      const count = (summaryLoading || resourcesLoading) ? 20 : 8;
      
      return Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: summaryLoading ? 'blue' : resourcesLoading ? 'green' : 'purple',
        life: 1,
        pulsation: Math.random() * Math.PI * 2,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.1
      }));
    };

    setParticles(createParticles());

    const animationLoop = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: (p.x + p.vx + 100) % 100,
        y: (p.y + p.vy + 100) % 100,
        pulsation: p.pulsation + 0.1,
        rotation: p.rotation + p.rotationSpeed,
        life: Math.max(0, p.life - 0.005)
      })).filter(p => p.life > 0));
    }, 50);

    return () => clearInterval(animationLoop);
  }, [timingControl.summaryForceLoading, timingControl.resourcesForceLoading, finalSummary.status, resources.status]);

  // Floating orbs system
  useEffect(() => {
    const createOrbs = () => {
      return Array.from({ length: 5 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 200 + 100,
        color: ['cyan', 'purple', 'pink', 'blue', 'green'][i],
        opacity: Math.random() * 0.3 + 0.1,
        speed: Math.random() * 0.5 + 0.2,
        direction: Math.random() * Math.PI * 2,
        pulse: Math.random() * Math.PI * 2
      }));
    };

    setFloatingOrbs(createOrbs());

    const orbAnimation = setInterval(() => {
      setFloatingOrbs(prev => prev.map(orb => ({
        ...orb,
        x: (orb.x + Math.cos(orb.direction) * orb.speed + 100) % 100,
        y: (orb.y + Math.sin(orb.direction) * orb.speed + 100) % 100,
        pulse: orb.pulse + 0.05,
        direction: orb.direction + 0.01
      })));
    }, 100);

    return () => clearInterval(orbAnimation);
  }, []);

  // Time tracking for animations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Custom handler for Go Home button - navigates to hero section
  const handleGoHome = () => {
    // Reset interview state
    onGoHome();
    
    // Scroll to top (hero section) after a small delay to ensure page has loaded
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };



  // Revolutionary background system with multiple layers
  const renderAdvancedBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient that responds to mouse */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
              rgba(6, 182, 212, 0.15) 0%, 
              rgba(168, 85, 247, 0.1) 25%, 
              rgba(236, 72, 153, 0.08) 50%, 
              transparent 75%),
            radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, 
              rgba(34, 197, 94, 0.12) 0%, 
              rgba(249, 115, 22, 0.08) 30%, 
              transparent 60%),
            linear-gradient(135deg, 
              #0a0a0a 0%, 
              #0f172a 25%, 
              #1e293b 50%, 
              #0f172a 75%, 
              #0a0a0a 100%)
          `
        }}
      />

      {/* Floating orbs removed per design request */}

      {/* Dynamic particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: particle.color === 'blue' ? '#3b82f6' : 
                       particle.color === 'green' ? '#10b981' : '#a855f7',
            borderRadius: '50%',
            opacity: particle.life * (0.4 + 0.6 * Math.sin(particle.pulsation)),
            boxShadow: `0 0 ${particle.size * 2}px currentColor`,
            transform: `rotate(${particle.rotation}rad) scale(${0.5 + 0.5 * Math.sin(particle.pulsation * 2)})`
          }}
        />
      ))}

      {/* Parallax geometric shapes */}
      <div 
        className="absolute inset-0"
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      >
        <Circle className="absolute top-1/4 left-1/6 w-6 h-6 text-cyan-400/20 animate-pulse" />
        <Square className="absolute top-1/3 right-1/4 w-4 h-4 text-purple-400/20 animate-bounce" />
        <Triangle className="absolute bottom-1/3 left-1/3 w-5 h-5 text-pink-400/20 animate-pulse" />
        <Hexagon className="absolute bottom-1/4 right-1/6 w-7 h-7 text-blue-400/20 animate-bounce" />
      </div>
        </div>
      );

  // FIXED: Elegant loading state for analysis (without fake progress indicators)
  const renderAnalysisLoading = () => (
    <div className="relative">
      {/* Main analysis card */}
      <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        {/* Static background - removed shimmer animation */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              linear-gradient(45deg, 
                rgba(59, 130, 246, 0.1) 0%, 
                rgba(168, 85, 247, 0.1) 50%, 
                rgba(236, 72, 153, 0.1) 100%)
            `
          }}
        />
        
        <div className="relative z-10 space-y-8">
          {/* AI Brain Header */}
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-20 h-20">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <Brain className="w-10 h-10 text-white animate-pulse" />
              </div>
              <div className="absolute -inset-2 rounded-full border-2 border-blue-400/30 animate-ping" />
              <div className="absolute -inset-4 rounded-full border border-purple-400/20 animate-pulse" />
            </div>
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
                AI Coach Analyzing
              </h3>
              <p className="text-blue-300/80 text-lg">Deep analysis of your interview performance</p>
            </div>
          </div>

          {/* Current step without time/progress */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-3 px-6 py-3 bg-black/40 rounded-2xl border border-blue-500/20">
              <Activity className="w-5 h-5 text-blue-400 animate-spin" />
              <span className="text-blue-300 font-medium">{analysisProgress.currentStep}</span>
            </div>
          </div>

          {/* Analysis modules - simplified without progress indicators */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: MessageSquare, label: 'Response Analysis' },
              { icon: TrendingUp, label: 'Pattern Recognition' },
              { icon: Award, label: 'Strength Identification' },
              { icon: Target, label: 'Improvement Areas' }
            ].map((module, index) => {
              const isActive = analysisProgress.progress > (index * 25);
              return (
                <div 
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-500 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/40' 
                      : 'bg-gray-800/20 border border-gray-600/20'
                  }`}
                >
                  <module.icon className={`w-6 h-6 ${
                    isActive ? 'text-blue-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-blue-300' : 'text-gray-500'
                  }`}>
                    {module.label}
                  </span>
                  {isActive && (
                    <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // FIXED: Perplexity-style resource search loading with timeline (without fake progress indicators)
  const renderSearchLoading = () => {
    const currentStageData = searchProgress.stages[searchProgress.currentStage];
    
    return (
      <div className="relative">
        {/* Main search card */}
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          {/* Static background - removed shimmer animation */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: `
                linear-gradient(45deg, 
                  rgba(34, 197, 94, 0.1) 0%, 
                  rgba(6, 182, 212, 0.1) 50%, 
                  rgba(59, 130, 246, 0.1) 100%)
              `
            }}
          />
          
                  <div className="relative z-10 space-y-6">
          {/* Search Agent Header */}
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-16 h-16">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 via-cyan-600 to-blue-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                <Search className="w-8 h-8 text-white animate-bounce" />
              </div>
              <div className="absolute -inset-2 rounded-full border-2 border-emerald-400/30 animate-ping" />
              <div className="absolute -inset-4 rounded-full border border-cyan-400/20 animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-400 bg-clip-text text-transparent">
                AI Search Agent Active
              </h3>
              <p className="text-emerald-300/80">Curating personalized learning resources</p>
            </div>
          </div>

          {/* Current stage without time/progress */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-3 px-5 py-2 bg-black/40 rounded-xl border border-emerald-500/20">
              <currentStageData.icon className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-emerald-300 font-medium text-sm">{currentStageData.label}</span>
            </div>
            <p className="text-gray-400 text-xs">{currentStageData.description}</p>
          </div>

                      {/* Perplexity-style timeline with proper alignment */}
            <div className="space-y-4">
              {/* Timeline container with improved alignment */}
              <div className="relative max-w-3xl mx-auto">
                {/* Timeline line positioned for better alignment */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-600/50"></div>
                
                {/* Progress line */}
                <div 
                  className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-emerald-400 to-cyan-400 transition-all duration-300"
                  style={{ 
                    height: `${(searchProgress.currentStage / (searchProgress.stages.length - 1)) * 100}%`
                  }}
                ></div>
                
                {/* Timeline stages with proper spacing */}
                <div className="space-y-4">
                  {searchProgress.stages.map((stage, index) => {
                    const isActive = index === searchProgress.currentStage;
                    const isCompleted = index < searchProgress.currentStage;
                    const isPending = index > searchProgress.currentStage;
                    
                    return (
                      <div key={stage.id} className="relative flex items-start">
                        {/* Timeline dot - properly centered without redundant checkmark */}
                        <div className="flex-shrink-0 relative">
                          <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-emerald-400 border-emerald-400' 
                              : isActive 
                                ? 'bg-cyan-400 border-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50' 
                                : 'bg-gray-600 border-gray-600'
                          }`}>
                          </div>
                        </div>
                        
                        {/* Stage content with proper alignment */}
                        <div className={`ml-6 flex-1 transition-all duration-300 ${
                          isActive ? 'opacity-100' : isPending ? 'opacity-50' : 'opacity-75'
                        }`}>
                          <div className="flex items-center space-x-3 mb-2">
                            <stage.icon className={`w-5 h-5 ${
                              isCompleted ? 'text-emerald-400' : isActive ? 'text-cyan-400' : 'text-gray-500'
                            }`} />
                            <h4 className={`text-lg font-medium ${
                              isCompleted ? 'text-emerald-300' : isActive ? 'text-cyan-300' : 'text-gray-500'
                            }`}>
                              {stage.label}
                            </h4>
                            {isActive && (
                              <span className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded-lg animate-pulse">
                                Active
                              </span>
                            )}
                            {isCompleted && (
                              <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-300 rounded-lg">
                                Complete
                              </span>
                            )}
                          </div>
                          <p className={`text-sm leading-relaxed ${
                            isActive ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };



  // ✨ Footer Section (replicated from Index.tsx)
  const renderFooter = () => (
    <footer className="py-16 relative overflow-hidden mt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-purple-900/5 z-0"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center mb-6">
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 opacity-70 blur-sm"></div>
                <div className="relative p-1 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black">
                    <Sparkles className="h-5 w-5 text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-purple-400" />
                  </div>
                </div>
              </div>
              <h3 className="ml-3 text-2xl font-bold bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-300 bg-clip-text text-transparent">AI Interviewer</h3>
            </div>
            
            <p className="text-gray-400 text-center mb-6 max-w-md text-lg">
              Enhance your interview skills with our AI-powered simulator. Practice, get feedback, and improve.
            </p>
            
            <div className="flex justify-center space-x-4 mb-8">
              <a href="https://github.com/Ranjit2111/AI-Interview-Agent" target="_blank" rel="noopener noreferrer" className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-full hover:border-cyan-500/30 hover:shadow-cyan-500/20 transition-all duration-300 group">
                <Github className="h-6 w-6 text-gray-300 group-hover:text-cyan-400 transition-colors" />
              </a>
              <a href="https://x.com/Ranjit_AI" target="_blank" rel="noopener noreferrer" className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-full hover:border-purple-500/30 hover:shadow-purple-500/20 transition-all duration-300 group">
                <svg className="h-6 w-6 text-gray-300 group-hover:text-purple-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/ranjit-n/" target="_blank" rel="noopener noreferrer" className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-full hover:border-pink-500/30 hover:shadow-pink-500/20 transition-all duration-300 group">
                <svg className="h-6 w-6 text-gray-300 group-hover:text-pink-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="mailto:ranjitn.dev@gmail.com" target="_blank" rel="noopener noreferrer" className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-full hover:border-cyan-500/30 hover:shadow-cyan-500/20 transition-all duration-300 group">
                <Mail className="h-6 w-6 text-gray-300 group-hover:text-cyan-400 transition-colors" />
              </a>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>© 2025 AI Interviewer. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );

  // ✨ Clean Minimal Resource List
  const renderSearchResults = (actualResourcesData: any[]) => (
    <div className="relative">
      {/* Clean header */}
      <div className="text-center mb-16">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-400 bg-clip-text text-transparent mb-4">
          Learning Resources
        </h3>
        <p className="text-gray-400 text-sm">AI-curated resources based on your interview performance</p>
      </div>

      {/* Minimal list layout */}
      <div className="max-w-4xl mx-auto space-y-1">
        {actualResourcesData.map((resource: any, index: number) => (
          <div 
            key={index}
            className="group relative border-l-2 border-transparent hover:border-emerald-400/60 transition-all duration-300"
          >
            {/* Clean row container */}
            <div className="flex items-start space-x-4 p-6 hover:bg-white/5 transition-colors duration-300 rounded-r-xl">
              
              {/* Resource type badge */}
              <div className="flex-shrink-0 mt-1">
                {resource.resource_type && (
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-emerald-500/15 text-emerald-300 rounded-full border border-emerald-500/30">
                    {resource.resource_type}
                  </span>
                )}
              </div>

              {/* Content area */}
              <div className="flex-1 min-w-0">
                {/* Title and link */}
                <div className="mb-3">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex items-center"
                  >
                    <h4 className="text-lg font-medium text-white group-hover/link:text-emerald-300 transition-colors duration-300 mr-2">
                      {resource.title}
                    </h4>
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover/link:text-emerald-400 opacity-60 group-hover/link:opacity-100 transition-all duration-300" />
                  </a>
                </div>

                {/* Reasoning */}
                {resource.reasoning && (
                  <div className="flex items-start space-x-2 text-sm">
                    <Target className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300 leading-relaxed">
                      <span className="text-cyan-300 font-medium">Why this helps: </span>
                      {resource.reasoning}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Subtle separator line */}
            {index < actualResourcesData.length - 1 && (
              <div className="ml-6 mr-6 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ✨ Revolutionary turn-wise feedback display - Conversation timeline with advanced visual design
  const renderInnovativeFeedback = (perTurnFeedback: any[]) => (
    <div className="relative">
      {/* Background artistic elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-20 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-300" />
        <div className="absolute bottom-40 right-32 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-20 right-20 w-20 h-20 bg-red-500/10 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>



      {/* Innovative conversation timeline */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Central conversation river */}
        <div className="relative">
          {/* Main conversation flow line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500/30 via-pink-500/30 to-red-500/30"></div>
          
          {/* Conversation bubbles */}
          <div className="space-y-8">
            {perTurnFeedback.map((item, index) => {
              
              return (
                <div key={index} className="relative">
                  {/* Timeline node with question number */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-600 to-red-500 flex items-center justify-center shadow-2xl z-20 border-4 border-black/50">
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>

                  {/* Question bubble (left side, attached to center line) */}
                  <div className="pt-20 mb-2">
                    <div className="flex">
                      <div className="relative max-w-md mr-2 ml-auto" style={{ marginRight: 'calc(50% + 0.125rem)' }}>
                        {/* Question container */}
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-3xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                          <div className="relative bg-gradient-to-br from-black/60 via-purple-900/30 to-purple-800/30 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 shadow-2xl">
                            {/* AI Interviewer badge */}
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                <Bot className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">AI Interviewer</span>
                            </div>
                            <p className="text-white leading-relaxed text-sm">{item.question}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Answer bubble (right side, attached to center line) */}
                  <div className="mb-4">
                    <div className="flex">
                      <div className="relative max-w-md ml-2 mr-auto" style={{ marginLeft: 'calc(50% + 0.125rem)' }}>
                        {/* Answer container */}
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-800/20 rounded-3xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                          <div className="relative bg-gradient-to-br from-black/60 via-blue-900/30 to-cyan-800/30 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 shadow-2xl">
                            {/* User badge */}
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center">
                                <User className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wide">Your Response</span>
                            </div>
                            <p className="text-white leading-relaxed text-sm">{item.answer}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Coach Feedback (center, simplified to match other bubbles) */}
                  <div className="flex justify-center mb-4">
                    <div className="relative max-w-4xl w-full">
                      {/* Simplified coaching feedback container */}
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 to-orange-800/20 rounded-3xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                        <div className="relative bg-gradient-to-br from-black/60 via-yellow-900/30 to-orange-900/30 backdrop-blur-xl border border-yellow-500/30 rounded-3xl p-6 shadow-2xl">
                          {/* Simple AI Coach badge (consistent with other bubbles) */}
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center">
                              <Brain className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wide">AI Coach Analysis</span>
                          </div>
                          
                          {/* Simple feedback content */}
                          <p className="text-white leading-relaxed text-sm">{item.feedback}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress indicator between conversations */}
                  {index < perTurnFeedback.length - 1 && (
                    <div className="flex justify-center mb-8">
                      <div className="w-16 h-1 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Rest of component implementation continues...
  return (
    <div 
      ref={containerRef}
      className="min-h-screen relative"
      onMouseMove={handleMouseMove}
    >
      {/* Advanced background system */}
      {renderAdvancedBackground()}
      
      {/* Main content with revolutionary layout */}
      <div className="relative z-10 min-h-screen">
        
        {/* Minimal Hero Section */}
        <section className="py-12 sm:py-16 px-3 sm:px-4 md:px-8 relative">
          <div className="max-w-2xl sm:max-w-3xl lg:max-w-4xl mx-auto">
            {/* Compact header */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-500 mb-4 sm:mb-6 shadow-lg">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4 sm:px-0">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
                  Interview Analysis Report
                </span>
              </h1>
              
              <p className="text-gray-400 text-sm sm:text-base max-w-lg sm:max-w-xl mx-auto px-4 sm:px-0">
                AI-powered insights into your interview performance
              </p>
            </div>

            {/* Compact navigation buttons */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-4">
              {[
                { 
                  id: 'analysis', 
                  label: 'Performance Analysis', 
                  icon: Brain, 
                  status: (timingControl.summaryForceLoading || finalSummary.status === 'loading') ? 'loading' as const : 
                         (timingControl.actualSummaryData || finalSummary.status === 'completed') ? 'completed' as const : 
                         finalSummary.status 
                },
                { 
                  id: 'resources', 
                  label: 'Learning Resources', 
                  icon: Search, 
                  status: (timingControl.resourcesForceLoading || resources.status === 'loading') ? 'loading' as const : 
                         (timingControl.actualResourcesData || resources.status === 'completed') ? 'completed' as const : 
                         resources.status 
                },
                { 
                  id: 'feedback', 
                  label: 'Turn-by-Turn Feedback', 
                  icon: MessageSquare, 
                  status: 'completed' as const 
                }
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    const element = document.getElementById(section.id);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`group relative inline-flex items-center justify-center space-x-3 px-4 sm:px-6 py-3 backdrop-blur-xl border rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 min-h-[48px] w-full sm:w-auto ${
                    section.status === 'completed' 
                      ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400/50' 
                      : section.status === 'loading' 
                        ? 'bg-cyan-500/10 border-cyan-500/30 hover:border-cyan-400/50' 
                        : 'bg-black/30 border-white/10 hover:border-cyan-400/40'
                  }`}
                >
                  {/* Status indicator */}
                  <div className="flex-shrink-0">
                    {section.status === 'loading' ? (
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    ) : section.status === 'completed' ? (
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                    )}
                  </div>
                  
                  {/* Icon */}
                  <section.icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                    section.status === 'completed' 
                      ? 'text-emerald-300 group-hover:text-emerald-200' 
                      : section.status === 'loading' 
                        ? 'text-cyan-300 group-hover:text-cyan-200' 
                        : 'text-gray-300 group-hover:text-cyan-400'
                  }`} />
                  
                  {/* Label */}
                  <span className={`text-sm font-medium transition-colors ${
                    section.status === 'completed' 
                      ? 'text-emerald-200 group-hover:text-emerald-100' 
                      : section.status === 'loading' 
                        ? 'text-cyan-200 group-hover:text-cyan-100' 
                        : 'text-white group-hover:text-cyan-400'
                  }`}>
                    {section.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Analysis section */}
        <section id="analysis" className="min-h-screen flex items-center px-3 sm:px-4 md:px-8 py-12 sm:py-16">
          <div className="w-full max-w-3xl sm:max-w-4xl lg:max-w-6xl mx-auto">
            {(timingControl.summaryForceLoading || finalSummary.status === 'loading') && renderAnalysisLoading()}
            {!timingControl.summaryForceLoading && (timingControl.actualSummaryData || (finalSummary.status === 'completed' && finalSummary.data)) && (
              <div className="space-y-6 sm:space-y-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent mb-8 sm:mb-12 px-4 sm:px-0">
                  Performance Analysis
                </h2>
                
                {/* Analysis results grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  {/* Patterns & Tendencies */}
                  <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                      <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Observed Patterns</h3>
                    </div>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                      {(timingControl.actualSummaryData?.patterns_tendencies || finalSummary.data?.patterns_tendencies) || 'No specific patterns identified.'}
                    </p>
                  </div>

                  {/* Strengths */}
                  <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                      <Award className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Key Strengths</h3>
                    </div>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                      {(timingControl.actualSummaryData?.strengths || finalSummary.data?.strengths) || 'No specific strengths identified.'}
                    </p>
                  </div>

                  {/* Areas for Development */}
                  <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                      <Target className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Development Areas</h3>
                    </div>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                      {(timingControl.actualSummaryData?.weaknesses || finalSummary.data?.weaknesses) || 'No specific weaknesses identified.'}
                    </p>
                  </div>

                  {/* Improvement Focus */}
                  <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                      <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Focus Areas</h3>
                    </div>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                      {(timingControl.actualSummaryData?.improvement_focus_areas || finalSummary.data?.improvement_focus_areas) || 'No specific focus areas identified.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {finalSummary.status === 'error' && (
              <div className="text-center space-y-4 sm:space-y-6">
                <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto" />
                <h3 className="text-xl sm:text-2xl font-bold text-red-400">Analysis Error</h3>
                <p className="text-red-300 text-sm sm:text-base px-4 sm:px-0">{finalSummary.error}</p>
              </div>
            )}
          </div>
        </section>

        {/* Resources section */}
        <section id="resources" className="min-h-screen flex items-center px-4 md:px-8 py-8">
          <div className="w-full max-w-5xl mx-auto">
            {(timingControl.resourcesForceLoading || resources.status === 'loading') && renderSearchLoading()}
            {!timingControl.resourcesForceLoading && (timingControl.actualResourcesData || (resources.status === 'completed' && resources.data)) && 
              renderSearchResults(timingControl.actualResourcesData || resources.data)
            }
            {!timingControl.resourcesForceLoading && resources.status === 'error' && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-red-400 mb-2">Resource Search Failed</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    {resources.error || 'Unable to find learning resources at this time. Please try again later.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Feedback section */}
        <section id="feedback" className="min-h-screen flex items-center px-4 md:px-8 py-16">
          <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 bg-clip-text text-transparent mb-12">
              Detailed Feedback
            </h2>
            
            {perTurnFeedback && perTurnFeedback.length > 0 ? (
              renderInnovativeFeedback(perTurnFeedback)
            ) : (
              <div className="text-center space-y-6">
                <MessageSquare className="w-16 h-16 text-gray-500 mx-auto" />
                <h3 className="text-2xl font-bold text-gray-400">No Detailed Feedback</h3>
                <p className="text-gray-500">No turn-by-turn feedback available for this session.</p>
              </div>
            )}
          </div>
        </section>

        {/* Call to action section */}
        <section className="py-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-500 flex items-center justify-center mx-auto shadow-2xl">
              <Zap className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-3xl font-bold text-white">Ready for Your Next Challenge?</h3>
            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Apply what you've learned and practice again to improve further.
            </p>
            
            {/* Two action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                onClick={handleGoHome}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white text-lg font-semibold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 group border-0"
              >
                <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                <span>Go Home</span>
              </Button>

              <Button
                onClick={onStartNewInterview}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 hover:from-cyan-400 hover:via-purple-500 hover:to-pink-400 text-white text-lg font-semibold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 group border-0"
              >
                <span>Start New Interview</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
                      </div>
          </section>

          {/* Footer */}
          {renderFooter()}
        </div>



        {/* Custom styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }

          @keyframes float {
            0%, 100% { 
              transform: translate(0, 0) rotate(0deg); 
            }
            33% { 
              transform: translate(10px, -10px) rotate(120deg); 
            }
            66% { 
              transform: translate(-5px, 5px) rotate(240deg); 
            }
          }

          @keyframes pulseGlow {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
              transform: scale(1);
            }
            50% { 
              box-shadow: 0 0 40px rgba(34, 197, 94, 0.6);
              transform: scale(1.05);
            }
          }

          @keyframes slideInFromLeft {
            0% {
              opacity: 0;
              transform: translateX(-50px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideInFromRight {
            0% {
              opacity: 0;
              transform: translateX(50px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes bounceIn {
            0% {
              opacity: 0;
              transform: scale(0.3) translateY(50px);
            }
            50% {
              opacity: 1;
              transform: scale(1.1) translateY(-10px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          /* Enhanced scrollbar styling */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.1);
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #06b6d4, #8b5cf6);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #0891b2, #7c3aed);
          }
        `
      }} />
    </div>
  );
};

export default PostInterviewReport; 