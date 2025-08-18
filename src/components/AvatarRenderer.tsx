'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface AvatarState {
  emotion: 'neutral' | 'happy' | 'excited' | 'surprised' | 'thankful';
  speaking: boolean;
  visemes?: number[];
}

export default function AvatarRenderer({ emotion = 'neutral' }: { emotion?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const avatarRef = useRef<THREE.Group>();
  const animationIdRef = useRef<number>();
  
  const [avatarState, setAvatarState] = useState<AvatarState>({
    emotion: emotion as AvatarState['emotion'],
    speaking: false
  });

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(400, 600);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    scene.background = null;
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const avatarGroup = new THREE.Group();
    
    const headGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1;
    avatarGroup.add(head);

    const bodyGeometry = new THREE.CylinderGeometry(0.6, 0.8, 1.5);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff69b4 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -0.2;
    avatarGroup.add(body);

    const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 1.1, 0.7);
    avatarGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 1.1, 0.7);
    avatarGroup.add(rightEye);

    const mouthGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const mouthMaterial = new THREE.MeshLambertMaterial({ color: 0xff1493 });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, 0.9, 0.7);
    avatarGroup.add(mouth);

    scene.add(avatarGroup);
    camera.position.z = 3;

    sceneRef.current = scene;
    rendererRef.current = renderer;
    avatarRef.current = avatarGroup;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      if (avatarRef.current) {
        avatarRef.current.rotation.y += 0.005;
        
        const breathingScale = 1 + Math.sin(Date.now() * 0.003) * 0.02;
        avatarRef.current.children[1].scale.y = breathingScale;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!avatarRef.current) return;

    const head = avatarRef.current.children[0] as THREE.Mesh;
    const mouth = avatarRef.current.children[4] as THREE.Mesh;
    const leftEye = avatarRef.current.children[2] as THREE.Mesh;
    const rightEye = avatarRef.current.children[3] as THREE.Mesh;

    switch (avatarState.emotion) {
      case 'happy':
        (head.material as THREE.MeshLambertMaterial).color.setHex(0xffdbac);
        leftEye.scale.setScalar(1.2);
        rightEye.scale.setScalar(1.2);
        break;
      case 'excited':
        (head.material as THREE.MeshLambertMaterial).color.setHex(0xffc0cb);
        leftEye.scale.setScalar(1.5);
        rightEye.scale.setScalar(1.5);
        break;
      case 'surprised':
        leftEye.scale.setScalar(1.8);
        rightEye.scale.setScalar(1.8);
        mouth.scale.setScalar(2);
        break;
      case 'thankful':
        (head.material as THREE.MeshLambertMaterial).color.setHex(0xffe4e1);
        leftEye.scale.setScalar(0.8);
        rightEye.scale.setScalar(0.8);
        break;
      default:
        (head.material as THREE.MeshLambertMaterial).color.setHex(0xffdbac);
        leftEye.scale.setScalar(1);
        rightEye.scale.setScalar(1);
        mouth.scale.setScalar(1);
    }

    if (avatarState.speaking && avatarState.visemes) {
      const mouthScale = 1 + (avatarState.visemes[0] || 0) * 0.3;
      mouth.scale.setScalar(mouthScale);
    } else {
      mouth.scale.setScalar(1);
    }
  }, [avatarState]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Your AI Waifu</h3>
        <p className="text-sm text-white/60">
          Emotion: {avatarState.emotion} | {avatarState.speaking ? 'Speaking...' : 'Listening'}
        </p>
      </div>
      
      <div 
        ref={mountRef} 
        className="rounded-lg overflow-hidden border border-white/20"
        style={{ width: '400px', height: '600px' }}
      />
      
      <div className="mt-4 text-center">
        <div className="flex justify-center space-x-2">
          {['neutral', 'happy', 'excited', 'surprised', 'thankful'].map((emotion) => (
            <div
              key={emotion}
              className={`w-3 h-3 rounded-full ${
                avatarState.emotion === emotion ? 'bg-pink-500' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-white/40 mt-2">Emotion indicators</p>
      </div>
    </div>
  );
}