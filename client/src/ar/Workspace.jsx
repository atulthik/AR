import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ARCanvasContainer from './ARCanvasContainer';
import { 
  Camera, Compass, Trash, Save, Sparkles, Mic, MicOff, Info, 
  AlertTriangle, Check, RotateCcw, Plus, Trash2, ArrowUpRight, DollarSign,
  Clock, Paintbrush, History, Play, Pause, Undo, Redo, Moon, Sun, Image
} from 'lucide-react';

const Workspace = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Catalog State
  const [catalog, setCatalog] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Editor Workspace State
  const [placedItems, setPlacedItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [roomName, setRoomName] = useState('My Dream Room');
  const [savedDesignId, setSavedDesignId] = useState(null);

  // Advanced Room Limits
  const [roomDimensions, setRoomDimensions] = useState({ width: 5.0, depth: 5.0 });

  // Camera Overlay State
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Voice Command States
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef(null);

  // UI Overlays & Toggles
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [promoCode, setPromoCode] = useState('WELCOME10');
  const [isPromoApplied, setIsPromoApplied] = useState(true);

  // Background room upload and AI scanner states
  const [bgImage, setBgImage] = useState(null);
  const [bgOpacity, setBgOpacity] = useState(0.85);
  const [isScanning, setIsScanning] = useState(false);
  const [scanLog, setScanLog] = useState('');

  // Compatibility & Recommendations Cache
  const [warnings, setWarnings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // 4D Studio Customizer states (Time, Walls, Floors)
  const [timeOfDay, setTimeOfDay] = useState('midday');
  const [wallColor, setWallColor] = useState('#475569');
  const [floorFinish, setFloorFinish] = useState('grid');
  const [showWalls, setShowWalls] = useState(true);

  // Design timeline history states (Temporal Dimension)
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isPlayingWalkthrough, setIsPlayingWalkthrough] = useState(false);

  // Track history changes with a debounce to capture quiet states
  useEffect(() => {
    const handler = setTimeout(() => {
      const currentHistoryState = history[historyIndex];
      // Compare stringified versions to see if coordinates or items have changed
      if (JSON.stringify(currentHistoryState) !== JSON.stringify(placedItems)) {
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, placedItems]);
        setHistoryIndex(newHistory.length);
      }
    }, 800);

    return () => clearTimeout(handler);
  }, [placedItems]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      setHistoryIndex(idx);
      setPlacedItems(history[idx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      setHistoryIndex(idx);
      setPlacedItems(history[idx]);
    }
  };

  // Keyboard shortcut listener for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  const playWalkthrough = () => {
    if (history.length <= 1) return;
    setIsPlayingWalkthrough(true);
    
    let currentStep = 0;
    setHistoryIndex(0);
    setPlacedItems(history[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < history.length) {
        setHistoryIndex(currentStep);
        setPlacedItems(history[currentStep]);
      } else {
        clearInterval(interval);
        setIsPlayingWalkthrough(false);
      }
    }, 1000);
  };

  // Fetch product catalog on mount
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.furniture.getAll();
        if (res.success) {
          setCatalog(res.data);
          
          // Check if we passed a product to place from Catalog details page
          if (location.state?.placeItem) {
            handlePlaceItem(location.state.placeItem);
          }
          // Check if we are loading an existing saved layout session
          if (location.state?.loadDesign) {
            loadSavedDesign(location.state.loadDesign);
          }
        }
      } catch (err) {
        console.error('Failed to pull catalog for workspace:', err);
      } finally {
        setLoadingCatalog(false);
      }
    };
    fetchCatalog();
  }, [location.state]);

  // Run Real-Time Checks (Overlap and boundary warnings)
  useEffect(() => {
    performCompatibilityCheck();
    generateAIRecommendations();
  }, [placedItems, roomDimensions]);

  // Load Saved Design layout helper
  const loadSavedDesign = (design) => {
    setSavedDesignId(design._id);
    setRoomName(design.roomName);
    
    const loaded = design.furniture.map((p, idx) => ({
      id: `saved-${idx}-${Date.now()}`,
      item: p.itemId,
      position: p.position,
      rotation: p.rotation,
      scale: p.scale,
    }));
    setPlacedItems(loaded);
    setHistory([loaded]);
    setHistoryIndex(0);
  };

  // Toggle local Webcam Background stream
  const toggleCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        streamRef.current = stream;
        setCameraActive(true);
      } catch (err) {
        alert('Webcam access was denied or is unavailable. Please verify browser permissions.');
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBgImage(event.target.result);
        setCameraActive(false); // turn off webcam if uploading static room
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAIScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanLog("Initializing AI Spatial Scanner...");
    
    const steps = [
      { log: "Analyzing canvas environment and depth visualizers...", delay: 800 },
      { log: "Mapping background contours and perspective angles...", delay: 1600 },
      { log: "Detecting room limits and floor coordinates...", delay: 2400 },
      { log: "Spatial mapping complete. Wall limits set to 4.8m x 4.2m. Aligning lighting...", delay: 3200 },
      { log: "Syncing environmental lights. Scan complete! Recommended layout updated.", delay: 4000 }
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setScanLog(step.log);
        if (step.delay === 4000) {
          setRoomDimensions({ width: 4.8, depth: 4.2 });
          setTimeOfDay("sunset"); // Set ambient light to matching sunset
          setIsScanning(false);
          setScanLog("");
          
          // Auto place a sofa & coffee table starter kit if room is empty!
          if (placedItems.length === 0) {
            const sofa = catalog.find(i => i.category === 'Sofa');
            const table = catalog.find(i => i.category === 'Table');
            const itemsToPlace = [];
            if (sofa) {
              itemsToPlace.push({
                id: `placed-${Date.now()}-sofa`,
                item: sofa,
                position: { x: 0, y: 0, z: -0.8 },
                rotation: 0,
                scale: 1,
              });
            }
            if (table) {
              itemsToPlace.push({
                id: `placed-${Date.now()}-table`,
                item: table,
                position: { x: 0, y: 0, z: 0.6 },
                rotation: 0,
                scale: 1,
              });
            }
            if (itemsToPlace.length > 0) {
              setPlacedItems(itemsToPlace);
            }
          }
        }
      }, step.delay);
    });
  };

  const trigger4KExport = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      alert("Unable to locate WebGL design canvas.");
      return;
    }
    
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `auraspace-4k-room-design-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Failed to render canvas snapshot. Please ensure WebGL preserveDrawingBuffer is active.");
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        setVoiceTranscript(transcript);
        handleVoiceCommand(transcript);
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
      };

      rec.onend = () => {
        setVoiceActive(false);
      };

      recognitionRef.current = rec;
    }
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Synchronize webcam stream with video element once active and mounted
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  const toggleVoiceCommands = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please try Chrome.');
      return;
    }

    if (voiceActive) {
      recognitionRef.current.stop();
      setVoiceActive(false);
    } else {
      recognitionRef.current.start();
      setVoiceActive(true);
      setVoiceTranscript('Listening... try: "add chair" or "rotate"');
    }
  };

  // Voice command execution logic
  const handleVoiceCommand = (command) => {
    if (command.includes('add chair') || command.includes('place chair')) {
      const chair = catalog.find(i => i.category === 'Chair') || catalog[0];
      if (chair) handlePlaceItem(chair);
    } else if (command.includes('add sofa') || command.includes('place sofa')) {
      const sofa = catalog.find(i => i.category === 'Sofa') || catalog[0];
      if (sofa) handlePlaceItem(sofa);
    } else if (command.includes('add table') || command.includes('place table')) {
      const table = catalog.find(i => i.category === 'Table') || catalog[0];
      if (table) handlePlaceItem(table);
    } else if (command.includes('rotate')) {
      // Rotate selected item by 45 degrees (0.785 radians)
      handleUpdateSelected('rotation', 0.785);
    } else if (command.includes('scale up') || command.includes('size up')) {
      handleUpdateSelected('scale', 0.2);
    } else if (command.includes('scale down') || command.includes('size down')) {
      handleUpdateSelected('scale', -0.2);
    } else if (command.includes('delete') || command.includes('remove')) {
      if (selectedId !== null) handleDeleteItem(selectedId);
    } else if (command.includes('clear room') || command.includes('clear all')) {
      setPlacedItems([]);
      setSelectedId(null);
    } else if (command.includes('save design')) {
      triggerSaveDesign();
    }
  };

  // Place Item from drawer
  const handlePlaceItem = (item) => {
    // Generate a unique workspace instance ID
    const newPlaced = {
      id: `placed-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      item: item,
      position: { x: 0, y: 0, z: 0 },
      rotation: 0, // Facing forward in radians
      scale: 1, // Uniform scale multiplier
    };
    setPlacedItems(prev => [...prev, newPlaced]);
    setSelectedId(newPlaced.id);
  };

  // Update item position coordinates
  const handleUpdateItemPosition = (id, newPos) => {
    setPlacedItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, position: newPos };
      }
      return item;
    }));
  };

  // Relative updates (Rotation, Scale) for the selected item
  const handleUpdateSelected = (property, deltaValue) => {
    if (selectedId === null) return;
    setPlacedItems(prev => prev.map(item => {
      if (item.id === selectedId) {
        if (property === 'rotation') {
          // Keep rotation between 0 and 2*PI
          const newRot = (item.rotation + deltaValue) % (Math.PI * 2);
          return { ...item, rotation: newRot };
        }
        if (property === 'scale') {
          const newScale = Math.max(0.5, Math.min(2.5, item.scale + deltaValue));
          return { ...item, scale: Math.round(newScale * 10) / 10 };
        }
      }
      return item;
    }));
  };

  // Absolute setters (from inputs)
  const handleSetSelectedAbsolute = (property, value) => {
    if (selectedId === null) return;
    setPlacedItems(prev => prev.map(item => {
      if (item.id === selectedId) {
        return { ...item, [property]: Number(value) };
      }
      return item;
    }));
  };

  const handleDeleteItem = (id) => {
    setPlacedItems(prev => prev.filter(item => item.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // Cost Estimation Calculators
  const calculateCosts = () => {
    const subtotal = placedItems.reduce((acc, current) => acc + current.item.price, 0);
    const discount = isPromoApplied ? subtotal * 0.1 : 0;
    const tax = (subtotal - discount) * 0.08;
    const total = subtotal - discount + tax;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  };

  // Compatibility Checker: Bounding box collisions & out of boundaries warnings
  const performCompatibilityCheck = () => {
    const newWarnings = [];
    const halfW = roomDimensions.width / 2;
    const halfD = roomDimensions.depth / 2;

    placedItems.forEach((placed, index) => {
      const itemW = placed.item.dimensions.width * placed.scale;
      const itemD = placed.item.dimensions.depth * placed.scale;
      const posX = placed.position.x;
      const posZ = placed.position.z;

      // 1. Boundary check
      if (
        Math.abs(posX) + itemW / 2 > halfW ||
        Math.abs(posZ) + itemD / 2 > halfD
      ) {
        newWarnings.push(`"${placed.item.name}" exceeds room limits boundary.`);
      }

      // 2. Intersecting overlap check (AABB collision check in 2D floor plane)
      for (let j = index + 1; j < placedItems.length; j++) {
        const other = placedItems[j];
        const otherW = other.item.dimensions.width * other.scale;
        const otherD = other.item.dimensions.depth * other.scale;
        const otherX = other.position.x;
        const otherZ = other.position.z;

        const gapX = Math.abs(posX - otherX);
        const gapZ = Math.abs(posZ - otherZ);

        if (gapX < (itemW + otherW) / 2 && gapZ < (itemD + otherD) / 2) {
          newWarnings.push(`"${placed.item.name}" overlaps with "${other.item.name}".`);
        }
      }
    });

    setWarnings(newWarnings);
  };

  // AI Layout recommendations
  const generateAIRecommendations = () => {
    const list = [];
    const categories = placedItems.map(p => p.item.category);

    const hasSofa = categories.includes('Sofa');
    const hasTable = categories.includes('Table');
    const hasChair = categories.includes('Chair');
    const hasBed = categories.includes('Bed');

    if (placedItems.length === 0) {
      list.push({
        text: 'Place a Chesterfield Sofa to frame your lounge arrangement.',
        actionItem: catalog.find(i => i.category === 'Sofa')
      });
    } else {
      if (hasSofa && !hasTable) {
        list.push({
          text: 'Pair your Sofa with a Scandi Coffee Table.',
          actionItem: catalog.find(i => i.category === 'Table')
        });
      }
      if (hasChair && !hasTable) {
        list.push({
          text: 'Place a Side Table next to your Armchair.',
          actionItem: catalog.find(i => i.category === 'Table')
        });
      }
      if (hasBed && !hasChair) {
        list.push({
          text: 'Add a Lounge Chair to create a cozy bedroom reading corner.',
          actionItem: catalog.find(i => i.category === 'Chair')
        });
      }
    }

    setRecommendations(list);
  };

  // Submit Room design state to database API
  const triggerSaveDesign = async () => {
    if (!user) {
      alert('Please log in or create an account to save designs!');
      return;
    }

    const payload = {
      roomName,
      designId: savedDesignId,
      furniture: placedItems.map(p => ({
        itemId: p.item._id,
        position: p.position,
        rotation: p.rotation,
        scale: p.scale,
      })),
    };

    try {
      const res = await api.designs.save(payload);
      if (res.success) {
        setSavedDesignId(res.data._id);
        setSaveSuccess(true);
        setShareLink(`${window.location.origin}/share/${res.data._id}`);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert('Failed to save layout: ' + res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Network issue when saving. Please try again.');
    }
  };

  const selectedItemData = placedItems.find(p => p.id === selectedId);
  const costs = calculateCosts();

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col lg:flex-row overflow-hidden relative">
      {/* Absolute Video Frame for Camera Overlay */}
      {cameraActive && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}

      {/* Absolute Image background overlay */}
      {!cameraActive && bgImage && (
        <img
          src={bgImage}
          alt="Room Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ opacity: bgOpacity }}
        />
      )}

      {/* Main 3D Canvas Editor Frame */}
      <div className="flex-grow h-1/2 lg:h-full relative z-10">
        <ARCanvasContainer
          placedItems={placedItems}
          selectedId={selectedId}
          onSelectItem={setSelectedId}
          onUpdateItemPosition={handleUpdateItemPosition}
          cameraActive={cameraActive}
          roomDimensions={roomDimensions}
          timeOfDay={timeOfDay}
          wallColor={wallColor}
          floorFinish={floorFinish}
          showWalls={showWalls}
          bgImageActive={!!bgImage}
        />

        {/* AI Laser Scan line and HUD terminal overlay */}
        {isScanning && (
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden bg-emerald-500/5">
            {/* Horizontal laser scan bar */}
            <div className="absolute left-0 right-0 h-1 bg-emerald-400 opacity-80 shadow-[0_0_15px_4px_rgba(52,211,153,0.8)] animate-laser-scan"></div>
            
            {/* HUD Status terminal */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950/90 border border-emerald-500/30 p-6 rounded-2xl max-w-sm w-full text-emerald-400 font-mono text-xs flex flex-col items-center space-y-3 shadow-2xl animate-scanning-pulse">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" />
                <span className="font-bold tracking-widest text-[10px]">AI ROOM SCANNER ACTIVE</span>
              </div>
              <div className="text-center leading-relaxed h-10 select-none">
                {scanLog}
              </div>
              <div className="w-full bg-slate-900 h-1 rounded overflow-hidden">
                <div className="bg-emerald-500 h-full animate-pulse w-3/4"></div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Controls Overlays */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {/* Room Name config */}
          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-900 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center space-x-2">
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="bg-transparent border-b border-transparent focus:border-primary-500 font-outfit font-bold text-white text-sm outline-none w-40"
            />
          </div>

          {/* Setup / Camera triggers */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleCamera}
              className={`p-3 rounded-2xl border transition-all shadow-xl cursor-pointer flex items-center justify-center space-x-1.5 text-xs font-semibold ${
                cameraActive
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                  : 'bg-slate-950/80 backdrop-blur-md border-slate-900 text-slate-300 hover:text-white'
              }`}
              title="Camera Pass-through Mode"
            >
              <Camera className="w-4 h-4" />
              <span>{cameraActive ? 'Standard 3D' : 'Camera AR'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`p-3 rounded-2xl border transition-all shadow-xl cursor-pointer flex items-center justify-center space-x-1.5 text-xs font-semibold ${
                bgImage
                  ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                  : 'bg-slate-950/80 backdrop-blur-md border-slate-900 text-slate-300 hover:text-white'
              }`}
              title="Upload Room Background Image"
            >
              <Image className="w-4 h-4" />
              <span>{bgImage ? 'Change Room BG' : 'Upload Room BG'}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            <button
              onClick={triggerAIScan}
              disabled={isScanning}
              className={`p-3 rounded-2xl border transition-all shadow-xl cursor-pointer flex items-center justify-center space-x-1.5 text-xs font-semibold ${
                isScanning
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-slate-950/80 backdrop-blur-md border-slate-900 text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-800'
              }`}
              title="Trigger AI Room Spatial Scanner"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>AI Scan Room</span>
            </button>

            <button
              onClick={trigger4KExport}
              className="p-3 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-955 border border-yellow-400/30 hover:brightness-110 font-bold transition-all shadow-xl cursor-pointer flex items-center justify-center space-x-1.5 text-xs"
              title="Export 4K UHD Render Snapshot"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Export 4K Render</span>
            </button>

            <button
              onClick={toggleVoiceCommands}
              className={`p-3 rounded-2xl border transition-all shadow-xl cursor-pointer flex items-center justify-center space-x-1.5 text-xs font-semibold ${
                voiceActive
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-pulse'
                  : 'bg-slate-950/80 backdrop-blur-md border-slate-900 text-slate-300 hover:text-white'
              }`}
              title="Voice Commands Mode"
            >
              {voiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span>Speech</span>
            </button>
          </div>

          {/* Background image opacity controls */}
          {bgImage && (
            <div className="bg-slate-950/90 border border-slate-900 p-2.5 rounded-2xl flex items-center space-x-3 shadow-xl max-w-xs pointer-events-auto">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">BG Opacity</span>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={bgOpacity}
                onChange={(e) => setBgOpacity(Number(e.target.value))}
                className="w-24 accent-primary-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => setBgImage(null)}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wide transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}

          {/* Voice transcript bubble banner */}
          {voiceTranscript && (
            <div className="bg-slate-950/90 border border-slate-900 text-slate-300 text-xs px-4.5 py-2 rounded-xl max-w-xs leading-relaxed animate-fade-in shadow-xl">
              <span className="text-[9px] text-primary-400 font-bold block uppercase mb-0.5">Voice Command Input</span>
              {voiceTranscript}
            </div>
          )}
        </div>

        {/* Floating Quick Action Keys on Selected items */}
        {selectedItemData && (
          <div className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-md border border-slate-900 p-4 rounded-2xl shadow-2xl space-y-3 max-w-sm">
            <div>
              <h4 className="font-outfit font-bold text-xs text-white uppercase tracking-wider">
                {selectedItemData.item.name}
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Adjust position coordinates or apply rotation rings
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateSelected('rotation', 0.392)} // ~22.5 deg
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs py-2 px-3 border border-slate-800 rounded-lg flex items-center justify-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rotate 22°</span>
              </button>
              
              <button
                onClick={() => handleUpdateSelected('scale', 0.1)}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs py-2 px-3 border border-slate-800 rounded-lg flex items-center justify-center"
              >
                Scale +
              </button>

              <button
                onClick={() => handleUpdateSelected('scale', -0.1)}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs py-2 px-3 border border-slate-800 rounded-lg flex items-center justify-center"
              >
                Scale -
              </button>

              <button
                onClick={() => handleDeleteItem(selectedItemData.id)}
                className="bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-400 p-2 rounded-lg transition-colors cursor-pointer"
                title="Remove selected"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Workspace Sidebar Panels (Catalog Drawer, Calculators, Save Layouts) */}
      <div className="w-full lg:w-96 glass-panel border-t lg:border-t-0 lg:border-l border-slate-900 flex flex-col justify-between max-h-[50%] lg:max-h-full overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Save layout panel */}
          <div className="pb-4 border-b border-slate-900/60">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Studio Setup</div>
              {user ? (
                <button
                  onClick={triggerSaveDesign}
                  className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-md cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Room</span>
                </button>
              ) : (
                <Link to="/login" className="text-primary-400 text-xs font-semibold hover:underline">
                  Login to Save
                </Link>
              )}
            </div>
            
            {saveSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs mb-3 flex flex-col gap-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <Check className="w-4 h-4" />
                  <span>Layout Saved Successfully!</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 select-all break-all bg-slate-950 p-1.5 rounded border border-slate-900">
                  {shareLink}
                </div>
              </div>
            )}

            {/* Room measurement custom controller */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Room Width (m)</span>
                <input
                  type="number"
                  step="0.5"
                  value={roomDimensions.width}
                  onChange={(e) => setRoomDimensions(prev => ({ ...prev, width: Math.max(2.0, Number(e.target.value)) }))}
                  className="w-full bg-slate-950 border border-slate-900 text-sm py-1.5 px-3 rounded-lg text-white mt-1 outline-none text-center"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Room Depth (m)</span>
                <input
                  type="number"
                  step="0.5"
                  value={roomDimensions.depth}
                  onChange={(e) => setRoomDimensions(prev => ({ ...prev, depth: Math.max(2.0, Number(e.target.value)) }))}
                  className="w-full bg-slate-950 border border-slate-900 text-sm py-1.5 px-3 rounded-lg text-white mt-1 outline-none text-center"
                />
              </div>
            </div>
          </div>

          {/* 4D Studio Control Panel */}
          <div className="bg-slate-900/40 p-4.5 rounded-2xl border border-slate-800 space-y-4 shadow-inner">
            <h3 className="font-outfit text-sm font-bold text-white mb-1 flex items-center space-x-1.5 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-indigo-400">
              <Sparkles className="w-4 h-4 text-primary-400 animate-pulse" />
              <span>4D Studio Customizer</span>
            </h3>

            {/* Time of Day Presets */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center justify-between">
                <span>4D Temporal Light Simulator</span>
                <span className="text-primary-400 font-bold lowercase">{timeOfDay}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'sunrise', icon: '🌅', label: 'Sunrise' },
                  { id: 'midday', icon: '☀️', label: 'Midday' },
                  { id: 'sunset', icon: '🌇', label: 'Sunset' },
                  { id: 'midnight', icon: '🌌', label: 'Midnight' }
                ].map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => setTimeOfDay(preset.id)}
                    className={`py-2 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center border ${
                      timeOfDay === preset.id
                        ? 'bg-gradient-to-tr from-primary-600/30 to-indigo-600/10 border-primary-500 text-white font-semibold'
                        : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800'
                    }`}
                  >
                    <span className="text-sm">{preset.icon}</span>
                    <span className="text-[9px] mt-0.5 tracking-tight">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Room Wall & Floor Aesthetics */}
            <div className="space-y-2.5 pt-1 border-t border-slate-900/50">
              {/* Wall Colors */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Wall Paint Palette</span>
                <div className="flex items-center space-x-2.5">
                  {[
                    { hex: '#e2e8f0', name: 'Nordic' },
                    { hex: '#c2410c', name: 'Earth' },
                    { hex: '#15803d', name: 'Sage' },
                    { hex: '#4338ca', name: 'Indigo' },
                    { hex: '#334155', name: 'Slate' }
                  ].map(color => (
                    <button
                      key={color.hex}
                      onClick={() => setWallColor(color.hex)}
                      className={`w-6 h-6 rounded-full border transition-all cursor-pointer relative ${
                        wallColor === color.hex
                          ? 'ring-2 ring-primary-500 scale-110 border-white'
                          : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {wallColor === color.hex && (
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-900 font-bold">✓</div>
                      )}
                    </button>
                  ))}
                  <div className="flex-grow"></div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[9px] text-slate-400">Walls</span>
                    <input
                      type="checkbox"
                      checked={showWalls}
                      onChange={(e) => setShowWalls(e.target.checked)}
                      className="accent-primary-500 h-3.5 w-3.5 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Floor Finishes */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Floor Material Finish</span>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'grid', label: 'Studio Grid' },
                    { id: 'oak', label: 'Oak Wood' },
                    { id: 'marble', label: 'Marble' },
                    { id: 'concrete', label: 'Concrete' }
                  ].map(finish => (
                    <button
                      key={finish.id}
                      onClick={() => setFloorFinish(finish.id)}
                      className={`py-1.5 text-[10px] rounded-lg border text-center transition-all cursor-pointer ${
                        floorFinish === finish.id
                          ? 'bg-slate-800 border-slate-700 text-primary-400 font-semibold'
                          : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {finish.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Design Construction History / Timeline */}
            <div className="space-y-2 pt-2 border-t border-slate-900/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Temporal History Timeline</span>
                </span>
                <span className="text-[9px] text-slate-400">Step {historyIndex + 1} of {history.length}</span>
              </div>

              {/* Undo / Redo / Play controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex === 0}
                  className="p-1.5 bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-all cursor-pointer"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex === history.length - 1}
                  className="p-1.5 bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-all cursor-pointer"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="w-3.5 h-3.5" />
                </button>

                <div className="flex-grow">
                  <input
                    type="range"
                    min={0}
                    max={history.length - 1}
                    value={historyIndex}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      setHistoryIndex(idx);
                      setPlacedItems(history[idx]);
                    }}
                    className="w-full accent-primary-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>

                <button
                  onClick={playWalkthrough}
                  disabled={history.length <= 1 || isPlayingWalkthrough}
                  className={`flex items-center space-x-1 px-2.5 py-1.5 text-[9px] font-bold rounded-lg border transition-all cursor-pointer ${
                    isPlayingWalkthrough
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                      : 'bg-primary-600/10 border-primary-500/20 text-primary-400 hover:bg-primary-600 hover:text-white'
                  }`}
                  title="Play steps of layout assembly"
                >
                  {isPlayingWalkthrough ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                  <span>{isPlayingWalkthrough ? 'Playing' : 'Playback'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Catalog Drawer placement */}
          <div>
            <h3 className="font-outfit text-sm font-bold text-white mb-3 flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-primary-400" />
              <span>Catalog Drawer</span>
            </h3>
            
            {loadingCatalog ? (
              <div className="text-center py-4 text-xs text-slate-500">Loading catalog...</div>
            ) : catalog.length === 0 ? (
              <div className="text-xs text-slate-500">No catalog items available. Populate via admin page.</div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {catalog.map(item => (
                  <button
                    key={item._id}
                    onClick={() => handlePlaceItem(item)}
                    className="p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-900 text-left rounded-xl hover:border-slate-800 transition-all cursor-pointer group"
                  >
                    <div className="font-outfit font-bold text-xs text-white line-clamp-1 group-hover:text-primary-400">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      ${item.price.toFixed(0)} • {item.dimensions.width}m wide
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Compatibility Checker Alerts */}
          {warnings.length > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl space-y-1.5 shadow-md">
              <div className="flex items-center space-x-1.5 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Compatibility Warnings</span>
              </div>
              <ul className="list-disc pl-4 text-[10px] space-y-1 leading-relaxed text-slate-300">
                {warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Style Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-primary-600/10 border border-primary-500/20 text-primary-400 p-4 rounded-2xl space-y-2.5 shadow-md">
              <div className="flex items-center space-x-1.5 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-primary-400" />
                <span>AI Room Recommendations</span>
              </div>
              <ul className="text-[10px] space-y-2 text-slate-300">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-2">
                    <span>{rec.text}</span>
                    {rec.actionItem && (
                      <button
                        onClick={() => handlePlaceItem(rec.actionItem)}
                        className="bg-primary-600 hover:bg-primary-500 text-white text-[9px] font-bold px-2 py-1 rounded transition-colors"
                      >
                        Add
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Cost Estimation calculations */}
        <div className="p-6 bg-slate-950/80 border-t border-slate-900">
          <h3 className="font-outfit text-sm font-bold text-white mb-3 flex items-center space-x-1">
            <DollarSign className="w-4 h-4 text-primary-400" />
            <span>Cost Estimation Calculator</span>
          </h3>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Items Placed ({placedItems.length}):</span>
              <span>${costs.subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-slate-400 items-center">
              <div className="flex items-center space-x-1">
                <span>Promo Discount (10%):</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded">WELCOME10</span>
              </div>
              <span className="text-emerald-400">-${costs.discount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Sales Tax (8%):</span>
              <span>${costs.tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-white font-bold border-t border-slate-900 pt-2.5 mt-2.5 text-sm">
              <span>Estimated Total:</span>
              <span className="text-primary-400">${costs.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
