import React, { Suspense, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import DraggableFurniture from './DraggableFurniture';
import * as THREE from 'three';

/**
 * Floor pointer tracker to handle drag movement operations
 */
const InteractiveFloor = ({ onFloorDrag, onFloorClick }) => {
  const { raycaster, camera } = useThree();
  const planeRef = useRef();

  const handlePointerMove = (e) => {
    if (e.buttons === 1) { // Left click / Touch drag active
      const intersection = e.intersections.find(i => i.object === planeRef.current);
      if (intersection) {
        onFloorDrag(intersection.point);
      }
    }
  };

  const handlePointerDown = (e) => {
    const intersection = e.intersections.find(i => i.object === planeRef.current);
    if (intersection) {
      onFloorClick(intersection.point);
    }
  };

  return (
    <mesh
      ref={planeRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      visible={false}
    >
      <planeGeometry args={[50, 50]} />
      <meshBasicMaterial color="red" />
    </mesh>
  );
};

const ARCanvasContainer = ({
  placedItems,
  selectedId,
  onSelectItem,
  onUpdateItemPosition,
  cameraActive,
  roomDimensions,
  // New interactive configurations
  timeOfDay = 'midday',
  wallColor = '#475569',
  floorFinish = 'grid',
  showWalls = true,
  bgImageActive = false,
}) => {
  const handleFloorDrag = (point) => {
    if (selectedId !== null) {
      // Snap position coordinates to 2 decimal places (1cm resolution)
      const x = Math.round(point.x * 100) / 100;
      const z = Math.round(point.z * 100) / 100;
      
      // Enforce room limits boundaries if specified
      const halfW = roomDimensions.width / 2;
      const halfD = roomDimensions.depth / 2;
      const finalX = Math.max(-halfW, Math.min(halfW, x));
      const finalZ = Math.max(-halfD, Math.min(halfD, z));

      onUpdateItemPosition(selectedId, { x: finalX, y: 0, z: finalZ });
    }
  };

  const handleFloorClick = (point) => {
    // Deselect if clicking blank floor area
    if (selectedId !== null) {
      onSelectItem(null);
    }
  };

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [4, 4, 6], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        onPointerDown={(e) => {
          // If clicking background/blank space, clear selection
          if (e.target === e.currentTarget) {
            onSelectItem(null);
          }
        }}
      >
        {/* Set background based on Time of Day */}
        {!cameraActive && !bgImageActive && (
          <color
            attach="background"
            args={[
              timeOfDay === 'sunrise' ? '#1e1b4b' : // Dark purple sky
              timeOfDay === 'midday' ? '#090d16' :  // Default dark space
              timeOfDay === 'sunset' ? '#2e1035' :  // Sunset purple/indigo
              '#020617'                             // Deep midnight blue
            ]}
          />
        )}

        {/* Dynamic lights based on time of day */}
        {!cameraActive ? (
          <>
            {/* Sunrise lighting */}
            {timeOfDay === 'sunrise' && (
              <>
                <ambientLight intensity={0.65} color="#fed7aa" />
                <directionalLight
                  position={[12, 3, 5]}
                  intensity={1.4}
                  color="#fdba74"
                  castShadow
                  shadow-mapSize-width={1024}
                  shadow-mapSize-height={1024}
                />
                <pointLight position={[-10, 6, -10]} intensity={0.4} color="#93c5fd" />
              </>
            )}

            {/* Midday lighting */}
            {timeOfDay === 'midday' && (
              <>
                <ambientLight intensity={0.7} color="#f8fafc" />
                <directionalLight
                  position={[3, 15, 3]}
                  intensity={1.6}
                  color="#ffffff"
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                />
                <pointLight position={[-10, 8, -10]} intensity={0.4} />
              </>
            )}

            {/* Sunset lighting */}
            {timeOfDay === 'sunset' && (
              <>
                <ambientLight intensity={0.5} color="#fae8ff" />
                <directionalLight
                  position={[-12, 2.5, -4]}
                  intensity={1.3}
                  color="#fca5a5"
                  castShadow
                  shadow-mapSize-width={1024}
                  shadow-mapSize-height={1024}
                />
                <pointLight position={[10, 6, 10]} intensity={0.4} color="#c084fc" />
              </>
            )}

            {/* Midnight / Night lighting */}
            {timeOfDay === 'midnight' && (
              <>
                <ambientLight intensity={0.12} color="#1e1b4b" />
                <directionalLight
                  position={[0, 6, 0]}
                  intensity={0.06}
                  color="#818cf8"
                />
              </>
            )}
          </>
        ) : (
          <>
            <ambientLight intensity={1.0} />
            <directionalLight position={[10, 15, 10]} intensity={1.4} castShadow />
          </>
        )}

        {/* Localized warm light glow from placed Floor Lamps in Midnight mode */}
        {!cameraActive && timeOfDay === 'midnight' && placedItems.map((placed) => {
          const isLamp = placed.item.category === 'Lighting' || placed.item.name.toLowerCase().includes('lamp');
          if (isLamp) {
            const bulbY = placed.item.dimensions.height * 0.95;
            return (
              <group key={`lamp-glow-${placed.id}`} position={[placed.position.x, placed.position.y + bulbY, placed.position.z]}>
                <pointLight
                  intensity={3.2}
                  distance={6}
                  decay={1.2}
                  color="#f59e0b"
                  castShadow
                  shadow-mapSize-width={512}
                  shadow-mapSize-height={512}
                />
                <mesh>
                  <sphereGeometry args={[0.07, 16, 16]} />
                  <meshBasicMaterial color="#fef08a" />
                </mesh>
              </group>
            );
          }
          return null;
        })}

        <Suspense fallback={null}>
          {placedItems.map((placed) => (
            <DraggableFurniture
              key={placed.id}
              item={placed.item}
              position={placed.position}
              rotation={placed.rotation}
              scale={placed.scale}
              isSelected={selectedId === placed.id}
              onClick={() => onSelectItem(placed.id)}
              onDrag={(point) => handleFloorDrag(point)}
            />
          ))}
        </Suspense>

        {/* Room Boundaries Guidelines & Walls */}
        {!cameraActive && showWalls && (
          <group>
            {/* Back Wall */}
            <mesh position={[0, 1.25, -roomDimensions.depth / 2 - 0.05]} castShadow receiveShadow>
              <boxGeometry args={[roomDimensions.width + 0.1, 2.5, 0.1]} />
              <meshStandardMaterial color={wallColor} roughness={0.8} />
            </mesh>
            {/* Left Wall */}
            <mesh position={[-roomDimensions.width / 2 - 0.05, 1.25, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.1, 2.5, roomDimensions.depth]} />
              <meshStandardMaterial color={wallColor} roughness={0.8} />
            </mesh>
            {/* Right Wall */}
            <mesh position={[roomDimensions.width / 2 + 0.05, 1.25, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.1, 2.5, roomDimensions.depth]} />
              <meshStandardMaterial color={wallColor} roughness={0.8} />
            </mesh>
          </group>
        )}

        {/* Custom Floor material / Grid */}
        {!cameraActive && floorFinish !== 'grid' ? (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[roomDimensions.width, roomDimensions.depth]} />
            <meshStandardMaterial
              color={
                floorFinish === 'oak' ? '#b45309' :      // Warm Oak Wood
                floorFinish === 'marble' ? '#0f172a' :   // Midnight Marble
                floorFinish === 'concrete' ? '#475569' : // Concrete
                '#1e293b'
              }
              roughness={floorFinish === 'marble' ? 0.12 : 0.8}
              metalness={floorFinish === 'marble' ? 0.9 : 0.15}
            />
          </mesh>
        ) : (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <planeGeometry args={[roomDimensions.width, roomDimensions.depth]} />
            <meshBasicMaterial color="#6366f1" transparent opacity={0.06} side={THREE.DoubleSide} />
          </mesh>
        )}
        
        {/* Boundary border lines */}
        <lineSegments position={[0, 0.01, 0]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(roomDimensions.width, roomDimensions.depth)]} />
          <lineBasicMaterial color="#8b5cf6" linewidth={2} />
        </lineSegments>

        {/* Standard Grid mapping */}
        {!cameraActive && floorFinish === 'grid' && (
          <Grid
            position={[0, 0, 0]}
            args={[20, 20]}
            cellSize={0.25}
            cellThickness={0.5}
            cellColor="#2A2A38"
            sectionSize={1.25}
            sectionColor="#8b5cf6"
            sectionThickness={1.0}
            fadeDistance={15}
          />
        )}

        <InteractiveFloor
          onFloorDrag={handleFloorDrag}
          onFloorClick={handleFloorClick}
        />

        {/* Orbit Controls (disable when dragging to prevent fighting movements) */}
        <OrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2 - 0.05} // don't go below floor
          minDistance={1}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
};

export default ARCanvasContainer;
export { InteractiveFloor };
