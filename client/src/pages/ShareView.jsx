import React, { useState, useEffect, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stage } from '@react-three/drei';
import { GLBModel, FallbackBox } from '../components/ModelViewer';
import { Compass, User, RefreshCw, AlertTriangle, Layers } from 'lucide-react';

const PlacedModelItem = ({ itemData, position, rotation, scale }) => {
  const [hasError, setHasError] = useState(false);
  const { width, height, depth } = itemData.dimensions;

  return (
    <group position={[position.x, position.y, position.z]} rotation={[0, rotation, 0]} scale={scale}>
      <Suspense fallback={null}>
        {!hasError && itemData.modelUrl ? (
          <GLBModel
            url={itemData.modelUrl}
            dimensions={itemData.dimensions}
            onLoadError={() => setHasError(true)}
          />
        ) : (
          <FallbackBox width={width} height={height} depth={depth} />
        )}
      </Suspense>
    </group>
  );
};

const ShareView = () => {
  const { id } = useParams();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDesign = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.designs.getById(id);
      if (res.success) {
        setDesign(res.data);
      } else {
        setError(res.message || 'Design layout not found');
      }
    } catch (err) {
      setError('Could not connect to layout fetching API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesign();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Loading shared room layout...</p>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Failed to Load Design</h3>
        <p className="text-slate-400 mb-6">{error || 'Design not found'}</p>
        <Link to="/catalog" className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium">
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col lg:flex-row relative">
      {/* 3D Scene Viewport */}
      <div className="flex-grow h-2/3 lg:h-full relative">
        <Canvas camera={{ position: [3, 3, 3], fov: 50 }} shadows>
          <color attach="background" args={['#080b11']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
          <pointLight position={[-10, 10, -10]} intensity={0.5} />

          <Suspense fallback={null}>
            {design.furniture.map((placed, index) => {
              if (!placed.itemId) return null;
              return (
                <PlacedModelItem
                  key={placed._id || index}
                  itemData={placed.itemId}
                  position={placed.position}
                  rotation={placed.rotation}
                  scale={placed.scale}
                />
              );
            })}
          </Suspense>

          <Grid
            position={[0, 0, 0]}
            args={[15, 15]}
            cellSize={0.25}
            cellThickness={0.5}
            cellColor="#2A2A38"
            sectionSize={1.25}
            sectionColor="#6366f1"
            sectionThickness={1.0}
            fadeDistance={12}
          />

          <OrbitControls makeDefault enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2} />
        </Canvas>

        {/* Action Indicators */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-900 shadow-xl">
            <h1 className="font-outfit font-bold text-white text-base leading-snug">
              {design.roomName}
            </h1>
            <div className="flex items-center space-x-1 mt-1 text-slate-400 text-xs">
              <User className="w-3.5 h-3.5" />
              <span>Created by {design.userId?.name || 'Anonymous User'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Sidebar panel */}
      <div className="w-full lg:w-96 glass-panel border-t lg:border-t-0 lg:border-l border-slate-900 p-6 flex flex-col justify-between max-h-1/3 lg:max-h-full overflow-y-auto">
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <Layers className="w-5 h-5 text-primary-400" />
            <h2 className="font-outfit text-xl font-bold text-white">Placed Furniture list</h2>
          </div>

          <div className="space-y-3">
            {design.furniture.map((placed, idx) => {
              const item = placed.itemId;
              if (!item) return null;

              return (
                <div key={idx} className="bg-slate-900/60 border border-slate-900 p-3.5 rounded-xl">
                  <h3 className="font-outfit font-bold text-sm text-white line-clamp-1">{item.name}</h3>
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span className="text-slate-400 font-semibold">${item.price.toFixed(2)}</span>
                    <span className="text-slate-500 uppercase tracking-widest text-[9px]">
                      Scale: {placed.scale.toFixed(1)}x
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900/60 mt-6 space-y-3">
          <button
            onClick={() => navigate('/workspace', { state: { loadDesign: design } })}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3 rounded-xl shadow-lg transition-all text-center text-sm cursor-pointer"
          >
            Clone Layout to Studio
          </button>
          <Link
            to="/catalog"
            className="w-full block border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold py-3 rounded-xl transition-all text-center text-sm"
          >
            Explore AuraSpace Catalog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShareView;
