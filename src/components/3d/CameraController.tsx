import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { PhotoSettings, CameraMode, ParkourState } from './CityTypes';

interface CameraControllerProps {
  targetPos: [number, number, number];
  playerRotY?: number;
  speed: number;
  isSwinging: boolean;
  cameraMode?: CameraMode;
  parkourState?: ParkourState;
  wallNormal?: [number, number, number];
  photoSettings?: PhotoSettings;
}

export default function CameraController({
  targetPos,
  playerRotY = 0,
  speed,
  isSwinging,
  cameraMode = 'cinematic',
  parkourState = 'none',
  wallNormal,
  photoSettings,
}: CameraControllerProps) {
  const { camera } = useThree();
  const currentCamPos = useRef(new THREE.Vector3(0, 18, 25));
  const currentLookAt = useRef(new THREE.Vector3(0, 15, 0));
  const shakeOffset = useRef(new THREE.Vector3(0, 0, 0));
  const currentTilt = useRef<number>(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const clock = state.clock.getElapsedTime();
    const target = new THREE.Vector3(...targetPos);
    const perspCam = camera as THREE.PerspectiveCamera;

    // 1. Photo Mode Orbit Camera (Highest Priority)
    if (photoSettings && photoSettings.active) {
      if (perspCam.isPerspectiveCamera && Math.abs(perspCam.fov - photoSettings.fov) > 0.1) {
        perspCam.fov = photoSettings.fov;
        perspCam.updateProjectionMatrix();
      }

      const angleRad = (photoSettings.orbitAngle * Math.PI) / 180;
      const camX = target.x + Math.sin(angleRad) * photoSettings.distance;
      const camZ = target.z + Math.cos(angleRad) * photoSettings.distance;
      const camY = Math.max(0.5, target.y + 1.5 + photoSettings.height);

      const desiredPos = new THREE.Vector3(camX, camY, camZ);
      currentCamPos.current.lerp(desiredPos, 14 * dt);
      camera.position.copy(currentCamPos.current);

      const lookTarget = new THREE.Vector3(target.x, target.y + 1.5, target.z);
      currentLookAt.current.lerp(lookTarget, 14 * dt);
      camera.lookAt(currentLookAt.current);

      // Apply Dutch angle / comic camera tilt
      if (photoSettings.tilt !== 0) {
        camera.rotation.z += (photoSettings.tilt * Math.PI) / 180;
      }
      return;
    }

    // Forward direction from player rotation
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRotY);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRotY);

    let targetFov = 65;
    let desiredPos = new THREE.Vector3();
    let lookTarget = new THREE.Vector3(target.x, target.y + 1.8, target.z);
    let lerpSpeed = 7;
    let targetTilt = 0;

    // 2. Parkour Dynamic Cinematic Framing (takes effect in cinematic or action mode)
    if (parkourState === 'wall_run_up') {
      // Dramatic low-angle heroic camera looking up the skyscraper
      targetFov = cameraMode === 'cinematic' ? 78 : 70;
      lerpSpeed = 10;
      const normalVec = wallNormal ? new THREE.Vector3(...wallNormal) : forward.clone().negate();

      desiredPos.set(
        target.x + normalVec.x * 6.5,
        Math.max(1.0, target.y - 2.8),
        target.z + normalVec.z * 6.5
      );
      // Look higher along the building to anticipate Spidey sprinting to the roof
      lookTarget.set(target.x, target.y + 3.8, target.z);

      // Camera micro-shake from running on vertical surface
      const scuffShake = Math.sin(clock * 28) * 0.04;
      desiredPos.x += scuffShake;
    } else if (parkourState === 'wall_run_horizontal') {
      // Over-the-shoulder flank camera with stylish Dutch angle
      targetFov = cameraMode === 'cinematic' ? 74 : 68;
      lerpSpeed = 9;
      const normalVec = wallNormal ? new THREE.Vector3(...wallNormal) : forward.clone().negate();

      desiredPos.set(
        target.x + normalVec.x * 5.5 - forward.x * 4.5,
        target.y + 1.8,
        target.z + normalVec.z * 5.5 - forward.z * 4.5
      );
      lookTarget.set(target.x + forward.x * 2.5, target.y + 1.5, target.z + forward.z * 2.5);
      targetTilt = cameraMode === 'cinematic' ? 0.12 : 0.04;
    } else if (parkourState === 'vaulting') {
      // Intimate, dynamic tracking punch-in on Spidey's acrobatic vault
      targetFov = cameraMode === 'cinematic' ? 62 : 65;
      lerpSpeed = 14;
      desiredPos.set(
        target.x - forward.x * 5.5 + right.x * 2.2,
        target.y + 1.6,
        target.z - forward.z * 5.5 + right.z * 2.2
      );
      lookTarget.set(target.x + forward.x * 1.5, target.y + 1.2, target.z + forward.z * 1.5);
      targetTilt = cameraMode === 'cinematic' ? -0.06 : 0;
    } else if (parkourState === 'ledge_hang') {
      // Vertigo shot! High camera behind Spidey's head, angled downwards to show the sheer drop
      targetFov = cameraMode === 'cinematic' ? 58 : 65;
      lerpSpeed = 11;
      const normalVec = wallNormal ? new THREE.Vector3(...wallNormal) : forward.clone().negate();

      desiredPos.set(
        target.x + normalVec.x * 3.2,
        target.y + 2.8,
        target.z + normalVec.z * 3.2
      );
      // Look slightly down at Spidey's hanging pose with the drop below
      lookTarget.set(
        target.x - normalVec.x * 0.4,
        target.y + 0.3,
        target.z - normalVec.z * 0.4
      );
    } else if (parkourState === 'ledge_climb') {
      // Ascending crane lift following Spidey's pull-up onto the roof
      targetFov = 66;
      lerpSpeed = 12;
      desiredPos.set(
        target.x - forward.x * 6,
        target.y + 3.2,
        target.z - forward.z * 6
      );
      lookTarget.set(target.x, target.y + 1.8, target.z);
    } else {
      // 3. Normal Traversal Cameras by Mode
      if (cameraMode === 'first_person' || cameraMode === 'vr_quest') {
        // Immersive First-Person / Meta Quest VR Camera
        targetFov = cameraMode === 'vr_quest' ? 110 : 95;
        lerpSpeed = 22;

        // Position camera directly at Spidey's eye coordinates
        desiredPos.set(
          target.x + forward.x * 0.25,
          target.y + 2.05,
          target.z + forward.z * 0.25
        );

        // Look straight ahead in player facing orientation
        lookTarget.set(
          target.x + forward.x * 12,
          target.y + 2.05 + (isSwinging ? -0.8 : 0),
          target.z + forward.z * 12
        );

        // Dynamic banking head tilt when swinging or crawling
        if (isSwinging) {
          targetTilt = THREE.MathUtils.clamp(-forward.x * 0.22, -0.25, 0.25);
        } else if (parkourState === 'wall_crawl' || parkourState === 'wall_stick') {
          targetTilt = 0.18;
        }
      } else if (cameraMode === 'drone') {
        // High-altitude cinematic drone vantage
        targetFov = 60;
        const droneDistance = 22;
        const droneHeight = 14;
        desiredPos.set(
          target.x - forward.x * droneDistance,
          target.y + droneHeight,
          target.z - forward.z * droneDistance
        );
        lookTarget.set(target.x + forward.x * 6, target.y + 1.5, target.z + forward.z * 6);
        lerpSpeed = 5;
      } else if (cameraMode === 'cinematic') {
        // Hollywood Action Movie dynamic camera
        const baseDistance = isSwinging ? 16 : 10.5;
        const speedOffset = Math.min(speed * 0.08, 9);
        const heightOffset = isSwinging ? 4.8 : 3.8;

        // Dynamic FOV widening with speed
        targetFov = isSwinging
          ? Math.min(84, 72 + (speed / 70) * 12)
          : Math.min(76, 65 + (speed / 50) * 8);

        // Position camera behind player facing direction with smooth banking
        desiredPos.set(
          target.x - forward.x * (baseDistance + speedOffset),
          target.y + heightOffset,
          target.z - forward.z * (baseDistance + speedOffset)
        );

        // Look ahead in direction of travel
        lookTarget.set(
          target.x + forward.x * 4,
          target.y + 1.6,
          target.z + forward.z * 4
        );

        // Cinematic speed shake on high velocities (>55 MPH)
        if (speed > 55) {
          const shakeIntensity = Math.min(0.18, ((speed - 55) / 40) * 0.18);
          shakeOffset.current.set(
            Math.sin(clock * 32) * shakeIntensity,
            Math.cos(clock * 26) * shakeIntensity * 0.6,
            Math.sin(clock * 20) * shakeIntensity * 0.5
          );
          desiredPos.add(shakeOffset.current);
        }

        // Slight banking tilt into turns when swinging
        if (isSwinging) {
          targetTilt = THREE.MathUtils.clamp(-forward.x * 0.15, -0.12, 0.12);
        }

        lerpSpeed = isSwinging ? 6 : 8;
      } else {
        // Standard Action Camera
        const baseDistance = isSwinging ? 18 : 12;
        const speedOffset = Math.min(speed * 0.08, 8);
        const heightOffset = isSwinging ? 6 : 4.5;
        targetFov = isSwinging ? 75 : 65;

        desiredPos.set(
          target.x - forward.x * (baseDistance + speedOffset),
          target.y + heightOffset,
          target.z - forward.z * (baseDistance + speedOffset)
        );
        lookTarget.set(target.x, target.y + 1.8, target.z);
        lerpSpeed = isSwinging ? 6 : 8;
      }
    }

    // Smooth FOV interpolation
    if (perspCam.isPerspectiveCamera && Math.abs(perspCam.fov - targetFov) > 0.2) {
      perspCam.fov = THREE.MathUtils.lerp(perspCam.fov, targetFov, 6 * dt);
      perspCam.updateProjectionMatrix();
    }

    // Smooth position interpolation
    currentCamPos.current.lerp(desiredPos, lerpSpeed * dt);
    camera.position.copy(currentCamPos.current);

    // Smooth lookAt interpolation
    currentLookAt.current.lerp(lookTarget, (lerpSpeed + 2) * dt);
    camera.lookAt(currentLookAt.current);

    // Smooth Dutch tilt
    currentTilt.current = THREE.MathUtils.lerp(currentTilt.current, targetTilt, 8 * dt);
    if (Math.abs(currentTilt.current) > 0.001) {
      camera.rotation.z += currentTilt.current;
    }
  });

  return null;
}
