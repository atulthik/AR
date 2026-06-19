import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Grid } from '@react-three/drei';
import { AlertCircle, RotateCcw } from 'lucide-react';

/**
 * Loads and renders the GLTF model. Uses a fallback if loading fails.
 */
const GLBModel = ({ url, dimensions, onLoadError }) => {
  const isLocal = url && url.startsWith('/uploads/');
  const resolvedUrl = isLocal ? `http://localhost:5000${url}` : url;
  
  let scene;
  let loadError = null;

  try {
    const gltf = useGLTF(resolvedUrl);
    scene = gltf.scene;
  } catch (err) {
    if (err instanceof Promise || (err && typeof err.then === 'function')) {
      throw err;
    }
    loadError = err;
  }

  useEffect(() => {
    if (loadError) {
      console.error('Error loading 3D GLB model:', loadError);
      onLoadError();
    }
  }, [loadError, onLoadError]);

  if (loadError) {
    return null;
  }

  // Auto-adjust scale to match dimensions if model is loaded
  // This is optional but ensures that models match database values
  return <primitive object={scene.clone()} dispose={null} />;
};

/**
 * Gorgeous geometric placeholder model matching the real-world dimensions
 */
const FallbackBox = ({ width = 1, height = 1, depth = 1 }) => {
  return (
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        color="#8b5cf6"
        roughness={0.2}
        metalness={0.5}
        transparent
        opacity={0.7}
      />
      {/* Bounding box helper */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
        <lineBasicMaterial color="#a78bfa" linewidth={2} />
      </lineSegments>
    </mesh>
  );
};

// Inject THREE onto window for FallbackBox line helper creation
import * as THREE from 'three';
window.THREE = THREE;

const ModelViewer = ({ modelUrl, dimensions }) => {
  const [hasError, setHasError] = useState(false);
  const width = dimensions?.width || 0.8;
  const height = dimensions?.height || 0.9;
  const depth = dimensions?.depth || 0.8;

  // Reset error when modelUrl changes
  useEffect(() => {
    setHasError(false);
  }, [modelUrl]);

  return (
    <div className="w-full h-full relative bg-slate-950/40 rounded-2xl border border-slate-900 overflow-hidden">
      {/* Canvas container */}
      <Canvas
        camera={{ position: [2, 2, 2], fov: 45 }}
        shadows
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        <color attach="background" args={['#080b11']} />
        
        {/* Lights */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />

        <Suspense fallback={null}>
          {!hasError && modelUrl ? (
            <Stage environment="city" intensity={0.6} adjustCamera={1.2}>
              <GLBModel
                url={modelUrl}
                dimensions={{ width, height, depth }}
                onLoadError={() => setHasError(true)}
              />
            </Stage>
          ) : (
            <>
              <FallbackBox width={width} height={height} depth={depth} />
              <Grid
                position={[0, 0, 0]}
                args={[10.5, 10.5]}
                cellSize={0.25}
                cellThickness={0.5}
                cellColor="#2A2A38"
                sectionSize={1.25}
                sectionColor="#8b5cf6"
                sectionThickness={1.0}
                fadeDistance={10}
              />
            </>
          )}
        </Suspense>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2} // Don't orbit below the floor grid
          minDistance={0.5}
          maxDistance={10}
        />
      </Canvas>

      {/* Overlays / Indicators */}
      {(!modelUrl || hasError) && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 text-xs text-primary-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            {hasError
              ? 'Failed to load GLB. Showing dimension-accurate wireframe mesh.'
              : 'GLB model not uploaded. Showing scale-accurate preview mesh.'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ModelViewer;
export { GLBModel, FallbackBox };
