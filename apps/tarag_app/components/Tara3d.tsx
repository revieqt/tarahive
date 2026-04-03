// // Tara3d.tsx
// import React, { useRef, useEffect, Suspense } from 'react';
// import { View, StyleSheet } from 'react-native';
// import { Canvas, useFrame } from '@react-three/fiber/native';
// import { OrbitControls, useGLTF } from '@react-three/drei';
// import { Asset } from 'expo-asset';
// import * as THREE from 'three';

// type MascotState = 'Idle' | 'Talking' | 'Thinking' | 'Sad';

// interface Tara3dProps {
//   state?: MascotState;
//   size?: number; // width & height
// }

// function TaraModel({ state = 'Idle' }: { state?: MascotState }) {
//   const mixer = useRef<THREE.AnimationMixer | null>(null);

//   // Load GLB from local assets
//   const asset = Asset.fromModule(require('../assets/3d/tara-3d.glb'));
//   // Make sure the asset is downloaded
//   useEffect(() => {
//     asset.downloadAsync();
//   }, []);

//   const { scene, animations } = useGLTF(asset.localUri!);

//   // Update animation based on `state`
//   useEffect(() => {
//     if (!animations.length) return;

//     if (!mixer.current) {
//       mixer.current = new THREE.AnimationMixer(scene);
//     }

//     // Stop all actions
//     animations.forEach((clip) => {
//       const action = mixer.current!.clipAction(clip);
//       action.stop();
//       if (clip.name === state) action.play();
//     });
//   }, [state, animations, scene]);

//   // Animate mixer
//   useFrame((_, delta) => {
//     if (mixer.current) mixer.current.update(delta);
//   });

//   return <primitive object={scene} />;
// }

// export default function Tara3d({ state = 'Idle', size = 300 }: Tara3dProps) {
//   return (
//     <View style={[styles.container, { width: size, height: size }]}>
//       <Canvas style={{ flex: 1 }}>
//         <ambientLight intensity={0.7} />
//         <directionalLight position={[0, 5, 5]} intensity={1} />
//         <Suspense fallback={null}>
//           <TaraModel state={state} />
//         </Suspense>
//         <OrbitControls enableZoom={false} enablePan={false} />
//       </Canvas>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: 'transparent',
//   },
// });