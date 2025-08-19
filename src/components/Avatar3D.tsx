'use client';

import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { WaifuModel, ANIMATION_SETS } from '@/types/waifu';

interface BlenderAvatarModelProps {
  waifuData?: WaifuModel | null;
  animation?: string;
  speaking?: boolean;
}

function BlenderAvatarModel({ waifuData, animation = 'idle', speaking = false }: BlenderAvatarModelProps) {
  const group = useRef<THREE.Group>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate model path based on waifu configuration
  const getModelPath = (waifu: WaifuModel) => {
    // For now, use a base model path - this will be expanded when you have Blender exports
    // Path structure: /models/waifu_{hairStyle}_{outfit}_{animationSet}.glb
    return `/models/base_waifu.glb`; // Placeholder - will be dynamic
  };

  const modelUrl = waifuData ? (waifuData.modelUrl || getModelPath(waifuData)) : '/models/base_waifu.glb';

  let gltf, animations, actions, names;
  
  try {
    const gltfData = useGLTF(modelUrl);
    gltf = gltfData;
    animations = gltfData.animations;
    const animationData = useAnimations(animations, group);
    actions = animationData.actions;
    names = animationData.names;
  } catch (err) {
    console.error('Error loading GLTF:', err);
  }

  // Apply waifu appearance to model materials
  useEffect(() => {
    if (gltf?.scene && waifuData) {
      const scene = gltf.scene;
      
      // Traverse the scene and update materials based on waifu configuration
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const material = child.material as THREE.MeshStandardMaterial;
          
          // Update colors based on waifu appearance
          if (child.name.includes('hair') || child.name.includes('Hair')) {
            const hairColorHex = getColorHex(waifuData.appearance.hairColor, 'hair');
            material.color.setHex(parseInt(hairColorHex.replace('#', ''), 16));
          }
          
          if (child.name.includes('eye') || child.name.includes('Eye')) {
            const eyeColorHex = getColorHex(waifuData.appearance.eyeColor, 'eye');
            material.color.setHex(parseInt(eyeColorHex.replace('#', ''), 16));
          }
          
          if (child.name.includes('skin') || child.name.includes('Skin') || child.name.includes('body')) {
            const skinColorHex = getColorHex(waifuData.appearance.skinTone, 'skin');
            material.color.setHex(parseInt(skinColorHex.replace('#', ''), 16));
          }
        }
      });
      
      setIsLoaded(true);
    }
  }, [gltf?.scene, waifuData]);

  // Animation management for Blender exports
  useEffect(() => {
    if (!actions || !waifuData) return;

    // Stop all current animations
    Object.values(actions).forEach(action => action?.stop());

    // Get the correct animation name based on the waifu's animation set
    const animationSet = ANIMATION_SETS.find(set => set.id === waifuData.animationSet);
    let targetAnimation = animation;

    // Map generic animations to specific animation set animations
    if (animationSet) {
      const animationIndex = ['idle', 'happy', 'wave', 'thinking', 'dance'].indexOf(animation);
      if (animationIndex !== -1 && animationSet.animations[animationIndex]) {
        targetAnimation = animationSet.animations[animationIndex];
      }
    }

    // Try to play the mapped animation
    if (actions[targetAnimation]) {
      actions[targetAnimation].reset().fadeIn(0.5).play();
    } else if (actions.idle) {
      // Fallback to idle
      actions.idle.reset().fadeIn(0.5).play();
    } else if (names.length > 0 && actions[names[0]]) {
      // Fallback to first available animation
      actions[names[0]].reset().fadeIn(0.5).play();
    }

    console.log(`Playing animation: ${targetAnimation} for ${waifuData.personality.name}`);
  }, [animation, actions, names, waifuData]);

  // Enhanced speaking animation with lip sync and head movement
  useFrame((state) => {
    if (!group.current) return;

    const time = state.clock.getElapsedTime();

    if (speaking) {
      // Subtle head movement
      group.current.rotation.y = Math.sin(time * 2) * 0.05;
      group.current.rotation.x = Math.sin(time * 3) * 0.02;
      
      // Subtle scale breathing effect
      const breathScale = 1 + Math.sin(time * 8) * 0.01;
      group.current.scale.setScalar(breathScale);
    } else {
      // Idle breathing
      const idleBreath = 1 + Math.sin(time * 2) * 0.005;
      group.current.scale.setScalar(idleBreath);
      
      // Slight idle rotation
      group.current.rotation.y = Math.sin(time * 0.5) * 0.02;
    }
  });

  if (!gltf) {
    return (
      <group>
        {/* Fallback 3D placeholder */}
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.5, 2, 4, 8]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
        <mesh position={[0, 1.2, 0.2]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={group}>
      <primitive 
        object={gltf.scene} 
        scale={[1.5, 1.5, 1.5]} 
        position={[0, -1.5, 0]}
        rotation={[0, Math.PI, 0]} // Face forward
      />
    </group>
  );
}

// Helper function to get color hex values
function getColorHex(colorId: string, type: 'hair' | 'eye' | 'skin'): string {
  const colorMaps = {
    hair: {
      blonde: '#f4e4bc', brown: '#8b4513', black: '#000000', red: '#dc143c',
      pink: '#ffc0cb', blue: '#4169e1', purple: '#9370db', white: '#f8f8f8'
    },
    eye: {
      blue: '#4169e1', brown: '#8b4513', green: '#228b22', hazel: '#8e7618',
      purple: '#9370db', red: '#dc143c', gold: '#ffd700', silver: '#c0c0c0'
    },
    skin: {
      fair: '#fdbcb4', light: '#edb98a', medium: '#d08b5b',
      tan: '#ae7242', dark: '#8d5524', deep: '#6b4226'
    }
  };
  
  return colorMaps[type][colorId] || '#ffffff';
}

interface Avatar3DProps {
  waifuData?: WaifuModel | null;
  animation?: string;
  speaking?: boolean;
  className?: string;
}

export default function Avatar3D({ 
  waifuData, 
  animation = 'idle', 
  speaking = false,
  className = ''
}: Avatar3DProps) {
  const [error, setError] = useState(false);
  
  // Load custom waifu from localStorage if not provided
  const [customWaifu, setCustomWaifu] = useState<WaifuModel | null>(null);
  
  useEffect(() => {
    if (!waifuData) {
      const saved = localStorage.getItem('custom_waifu');
      if (saved) {
        try {
          setCustomWaifu(JSON.parse(saved));
        } catch (err) {
          console.error('Error parsing saved waifu:', err);
        }
      }
    }
  }, [waifuData]);

  const finalWaifuData = waifuData || customWaifu;

  if (!finalWaifuData) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-6xl mb-4">👸</div>
          <p className="text-purple-200">No waifu created yet</p>
          <p className="text-sm text-purple-300 mt-2">Go to Create Waifu to design your companion</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-purple-200">Failed to load {finalWaifuData.personality.name}</p>
          <button 
            onClick={() => setError(false)}
            className="mt-4 px-4 py-2 bg-purple-600 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ 
          position: [0, 0.5, 3], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        onError={() => setError(true)}
      >
        {/* Enhanced lighting for better 3D appearance */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.4} />
        <pointLight position={[0, 2, 2]} intensity={0.5} color="#ff69b4" />
        
        {/* Avatar */}
        <Suspense fallback={null}>
          <BlenderAvatarModel 
            waifuData={finalWaifuData}
            animation={animation}
            speaking={speaking}
          />
        </Suspense>

        {/* Camera Controls */}
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          target={[0, 0, 0]}
        />
      </Canvas>

      {/* Waifu Info Overlay */}
      {finalWaifuData && (
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
          <p className="text-white font-semibold">{finalWaifuData.personality.name}</p>
          <p className="text-purple-200 text-sm">
            {ANIMATION_SETS.find(set => set.id === finalWaifuData.animationSet)?.name} Style
          </p>
        </div>
      )}
    </div>
  );
}