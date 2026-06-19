import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Layers, Camera, Maximize, Smartphone, Share2, Sparkles, Mic, Tv, Volume2, VolumeX, Play, Pause } from 'lucide-react';

const Home = () => {
  const [activeClip, setActiveClip] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const adClips = [
    {
      title: 'AuraSpace AI Room Scanner Spot',
      desc: 'See how our intelligent spatial scanning overlays layout recommendation grids and creates furniture maps instantly in 4K resolution.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-modern-living-room-40502-large.mp4',
      badge: 'Spatial AI Scan',
      duration: '0:15'
    },
    {
      title: 'Cinematic Luxury Interior Showcase',
      desc: 'Experience pure 4K photorealistic rendering. Swap floor timbers, paint colors, and lighting presets in standard, high, or ultra performance.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-design-42289-large.mp4',
      badge: '4K Ultra HD',
      duration: '0:22'
    }
  ];

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [activeClip]);

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col items-center justify-between">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center z-10">
        <div className="inline-flex items-center space-x-2 bg-slate-900/80 border border-slate-800 rounded-full px-4.5 py-1.5 mb-6 shadow-xl backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-primary-400" />
          <span className="text-xs font-semibold tracking-wide text-slate-300 uppercase">
            Introducing WebXR Furniture Placement
          </span>
        </div>
        
        <h1 className="font-outfit text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-200">
            Visualize Furniture inside
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-indigo-400 to-blue-400">
            Your Real Room
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed mb-10">
          AuraSpace uses WebXR and Three.js to let you view, drag, rotate, resize, and arrange virtual furniture inside your room using your mobile or laptop camera before purchasing.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/workspace"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl shadow-primary-600/20 hover:shadow-primary-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Layers className="w-5 h-5" />
            <span>Launch AR Studio</span>
          </Link>
          <Link
            to="/catalog"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 glass-panel hover:bg-slate-800/40 text-slate-200 hover:text-white px-8 py-4 rounded-2xl font-semibold border border-slate-800 hover:border-slate-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Compass className="w-5 h-5" />
            <span>Browse Catalog</span>
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10 w-full">
        <h2 className="text-center font-outfit text-2xl sm:text-3xl font-bold mb-12">
          Advanced Core Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div key={index} className="glass-card p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl w-fit mb-4">
                    <Icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="font-outfit text-lg font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cinematic 4K Advertisement Clips Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 z-10 w-full border-t border-slate-900/60 pt-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4.5 py-1.5 mb-4 shadow-xl">
            <Tv className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-amber-300 uppercase">
              AuraSpace 4K UHD Promo Reel
            </span>
          </div>
          <h2 className="font-outfit text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Experience Interior Placement in Cinematic 4K
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Watch these high-fidelity promotional clips highlighting spatial mapping, precision alignments, and dynamic shadows.
          </p>
        </div>

        {/* Media Grid (Split Video Mockup & Details) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Mockup 4K Player Frame (Left - 7 columns) */}
          <div className="lg:col-span-7 w-full">
            <div className="relative glass-panel rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 p-2">
              
              {/* UHD Camera Lense bezel indicator */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1 rounded-full text-[9px] text-slate-400 font-bold uppercase tracking-widest z-20 flex items-center space-x-1.5 border border-slate-800 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                <span>REC • {adClips[activeClip].badge}</span>
              </div>

              {/* Video Element */}
              <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center group">
                <video
                  ref={videoRef}
                  src={adClips[activeClip].videoUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Glassmorphic Playback controls overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-4 z-10 pointer-events-auto">
                  <div className="flex items-center justify-between w-full text-white">
                    <div className="flex items-center space-x-3.5">
                      <button
                        onClick={handlePlayPause}
                        className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/10 transition-transform hover:scale-105 cursor-pointer text-white"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                      </button>

                      <button
                        onClick={handleMute}
                        className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/10 transition-transform hover:scale-105 cursor-pointer text-white"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* UHD 4K glowing badge */}
                    <div className="flex items-center space-x-2">
                      <span className="bg-amber-500 text-slate-955 text-[9px] font-extrabold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                        4K UHD
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {adClips[activeClip].duration}
                      </span>
                    </div>
                  </div>

                  {/* Simple animating video progress timeline indicator */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-500 to-indigo-500 h-full w-2/3 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ad Spot Details & Switchers (Right - 5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[10px] text-primary-400 font-bold uppercase tracking-widest block mb-1">
                Active Promotion Reel
              </span>
              <h3 className="font-outfit text-2xl font-bold text-white mb-3 leading-tight">
                {adClips[activeClip].title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {adClips[activeClip].desc}
              </p>
            </div>

            {/* Selector Buttons */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                Select Advertisement Spot:
              </span>
              <div className="flex flex-col gap-2.5">
                {adClips.map((clip, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveClip(index)}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-center space-x-4 ${
                      activeClip === index
                        ? 'bg-primary-950/20 border-primary-500 shadow-lg shadow-primary-950/20 text-white'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl border flex items-center justify-center ${
                      activeClip === index ? 'bg-primary-600 border-primary-500 text-white' : 'bg-slate-950 border-slate-900'
                    }`}>
                      <Tv className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs">{clip.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">
                        Promo Spot {index + 1} • {clip.badge}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Guide Footer */}
      <div className="w-full bg-slate-950/80 border-t border-slate-900/60 py-8 text-center text-xs text-slate-500 z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            Built with MERN Stack + React Three Fiber + WebXR Device API
          </div>
          <div className="flex space-x-4">
            <span>Server: localhost:5000</span>
            <span>Client: localhost:5173</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    icon: Camera,
    title: 'AR Camera Overlay',
    desc: 'Access your device camera directly in the web browser using WebXR. Place models on your physical floor.',
  },
  {
    icon: Maximize,
    title: 'Precision Transform',
    desc: 'Drag to place, rotate items using interactive visual rings, and rescale models to match custom gaps.',
  },
  {
    icon: Share2,
    title: 'Save & Share Rooms',
    desc: 'Save your customized room design setups directly to your profile. Copy the sharing link to send to others.',
  },
  {
    icon: Mic,
    title: 'Voice Commands',
    desc: 'Control virtual elements using built-in speech recognition. Command "add chair", "rotate", or "scale up".',
  },
];

export default Home;
