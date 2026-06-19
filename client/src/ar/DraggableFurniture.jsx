import React, { Suspense, useState } from 'react';
import { GLBModel, FallbackBox } from '../components/ModelViewer';
import { BoxHelper } from 'three';
import * as THREE from 'three';

const DraggableFurniture = ({
  item,
  position,
  rotation,
  scale,
  isSelected,
  onClick,
  onDrag,
}) => {
  const [modelError, setModelError] = useState(false);
  const { width, height, depth } = item.dimensions;

  // Simple pointer down handler to trigger selection and drag-start
  const handlePointerDown = (e) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <group
      position={[position.x, position.y, position.z]}
      rotation={[0, rotation, 0]}
      scale={scale}
      onPointerDown={handlePointerDown}
    >
      <Suspense fallback={null}>
        {!modelError && item.modelUrl ? (
          <GLBModel
            url={item.modelUrl}
            dimensions={item.dimensions}
            onLoadError={() => setModelError(true)}
          />
        ) : (
          <FallbackBox width={width} height={height} depth={depth} />
        )}
      </Suspense>

      {/* Selected Highlighter Rings or Wireframe Box */}
      {isSelected && (
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[width * 1.05, height * 1.05, depth * 1.05]} />
          <meshBasicMaterial
            color="#8b5cf6"
            wireframe
            transparent
            opacity={0.8}
          />
          
          {/* Subtle rotation ring indicator */}
          <mesh position={[0, -height / 2 + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[Math.max(width, depth) * 0.7, Math.max(width, depth) * 0.75, 32]} />
            <meshBasicMaterial color="#a78bfa" side={THREE.DoubleSide} />
          </mesh>
        </mesh>
      )}
    </group>
  );
};

export default DraggableFurniture;
