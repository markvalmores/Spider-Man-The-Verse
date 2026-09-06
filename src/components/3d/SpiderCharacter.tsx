import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { BuildingData, PlayerControls, PhotoModePose, ParkourState } from './CityTypes';
import { SoundEffect } from '../../hooks/useAudio';

interface SpiderCharacterProps {
  buildings: BuildingData[];
  controls: PlayerControls;
  suitId: string;
  isPaused?: boolean;
  photoPose?: PhotoModePose;
  onPositionUpdate: (
    pos: [number, number, number],
    speed: number,
    isSwinging: boolean,
    rotY?: number,
    parkourState?: ParkourState,
    wallNormal?: [number, number, number]
  ) => void;
  playSound: (sound: SoundEffect) => void;
  onAttackHit?: () => void;
  onParkourStateChange?: (state: ParkourState) => void;
  turnDelta?: number;
}

export default function SpiderCharacter({
  buildings,
  controls,
  suitId,
  isPaused = false,
  photoPose = 'action',
  onPositionUpdate,
  playSound,
  onAttackHit,
  onParkourStateChange,
  turnDelta = 0,
}: SpiderCharacterProps) {
  const characterRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const webMeshRef = useRef<THREE.Mesh>(null);

  // Character Physics state
  const pos = useRef<THREE.Vector3>(new THREE.Vector3(0, 15, 0));
  const vel = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const rotY = useRef<number>(0);

  // Web swing & Parabolic flight state
  const isSwinging = useRef<boolean>(false);
  const swingAnchor = useRef<THREE.Vector3 | null>(null);
  const swingRopeLength = useRef<number>(40);
  const swingStartHeight = useRef<number>(15);
  const isParabolicFlight = useRef<boolean>(false);
  const flightTimer = useRef<number>(0);
  const [webTarget, setWebTarget] = useState<THREE.Vector3 | null>(null);

  // Dash and Locomotion states
  const isDashing = useRef<boolean>(false);
  const dashTimer = useRef<number>(0);
  const dashCooldown = useRef<number>(0);
  const jumpCooldown = useRef<number>(0);
  const airJumpsUsed = useRef<number>(0);
  const walkAudioTimer = useRef<number>(0);

  // Action states
  const isZipping = useRef<boolean>(false);
  const isSlamming = useRef<boolean>(false);
  const isAttacking = useRef<boolean>(false);
  const attackTimer = useRef<number>(0);

  // Parkour System States
  const parkourState = useRef<ParkourState>('none');
  const parkourTimer = useRef<number>(0);
  const parkourWallNormal = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 1));
  const parkourWallPoint = useRef<THREE.Vector3>(new THREE.Vector3());
  const parkourWallRunCooldown = useRef<number>(0);
  const parkourFootstepTimer = useRef<number>(0);
  const ledgeClimbTarget = useRef<THREE.Vector3>(new THREE.Vector3());
  const vaultEndPos = useRef<THREE.Vector3>(new THREE.Vector3());

  // Suit Color Schemes & Movie-Accurate Design Details
  const suitColors = useMemo(() => {
    switch (suitId) {
      case 'spiderman-1':
        return {
          primary: '#b91c1c',
          secondary: '#1e3a8a',
          eyes: '#e2e8f0',
          eyeFrame: '#94a3b8',
          emblem: '#0f172a',
          backEmblem: '#dc2626',
          webColor: '#cbd5e1',
          roughness: 0.35,
          metalness: 0.25,
          eyeType: 'raimi',
        };
      case 'spiderman-2':
        return {
          primary: '#dc2626',
          secondary: '#1d4ed8',
          eyes: '#f8fafc',
          eyeFrame: '#cbd5e1',
          emblem: '#0f172a',
          backEmblem: '#ef4444',
          webColor: '#f1f5f9',
          roughness: 0.3,
          metalness: 0.3,
          eyeType: 'raimi',
        };
      case 'spiderman-3-black':
      case 's1':
        return {
          primary: '#09090b',
          secondary: '#18181b',
          eyes: '#ffffff',
          eyeFrame: '#52525b',
          emblem: '#ffffff',
          backEmblem: '#ffffff',
          webColor: '#71717a',
          roughness: 0.2,
          metalness: 0.45,
          eyeType: 'raimi',
        };
      case 'tasm-1':
        return {
          primary: '#b91c1c',
          secondary: '#0f172a',
          eyes: '#fbbf24', // Amber sunglass lenses
          eyeFrame: '#0f172a',
          emblem: '#0f172a',
          backEmblem: '#ef4444',
          webColor: '#334155',
          roughness: 0.45,
          metalness: 0.15,
          eyeType: 'tasm1',
        };
      case 'tasm-2':
        return {
          primary: '#ef4444',
          secondary: '#1e40af',
          eyes: '#ffffff',
          eyeFrame: '#09090b',
          emblem: '#0f172a',
          backEmblem: '#dc2626',
          webColor: '#1e293b',
          roughness: 0.3,
          metalness: 0.2,
          eyeType: 'tasm2',
        };
      case 'homecoming':
        return {
          primary: '#e11d48',
          secondary: '#2563eb',
          eyes: '#ffffff',
          eyeFrame: '#0f172a',
          emblem: '#0f172a',
          backEmblem: '#dc2626',
          webColor: '#0f172a',
          roughness: 0.35,
          metalness: 0.2,
          eyeType: 'stark',
        };
      case 'far-from-home':
        return {
          primary: '#b91c1c',
          secondary: '#18181b',
          eyes: '#ffffff',
          eyeFrame: '#09090b',
          emblem: '#ffffff',
          backEmblem: '#ffffff',
          webColor: '#09090b',
          roughness: 0.25,
          metalness: 0.35,
          eyeType: 'stark',
        };
      case 'no-way-home':
        return {
          primary: '#dc2626',
          secondary: '#18181b',
          eyes: '#ffffff',
          eyeFrame: '#eab308',
          emblem: '#eab308', // Nano-Gold Spider
          backEmblem: '#ca8a04',
          webColor: '#ca8a04',
          roughness: 0.2,
          metalness: 0.65,
          eyeType: 'nano',
        };
      case 'no-way-home-final':
        return {
          primary: '#e11d48',
          secondary: '#0284c7', // Iridescent metallic blue
          eyes: '#f8fafc',
          eyeFrame: '#0f172a',
          emblem: '#0f172a',
          backEmblem: '#ef4444',
          webColor: '#0f172a',
          roughness: 0.25,
          metalness: 0.5,
          eyeType: 'classic',
        };
      case 'brand-new-day':
        return {
          primary: '#f43f5e',
          secondary: '#0ea5e9',
          eyes: '#38bdf8',
          eyeFrame: '#0284c7',
          emblem: '#0284c7',
          backEmblem: '#0284c7',
          webColor: '#38bdf8',
          roughness: 0.15,
          metalness: 0.1,
          eyeType: 'comic',
        };
      default: // Classic
        return {
          primary: '#dc2626',
          secondary: '#2563eb',
          eyes: '#f8fafc',
          eyeFrame: '#0f172a',
          emblem: '#0f172a',
          backEmblem: '#dc2626',
          webColor: '#0f172a',
          roughness: 0.35,
          metalness: 0.2,
          eyeType: 'classic',
        };
    }
  }, [suitId]);

  // Find best anchor for web swinging
  const findBestAnchor = () => {
    let bestAnchor: THREE.Vector3 | null = null;
    let minScore = Infinity;
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY.current);

    buildings.forEach((b) => {
      const anchor = new THREE.Vector3(...b.roofAnchor);
      const toAnchor = anchor.clone().sub(pos.current);
      const dist = toAnchor.length();

      if (anchor.y > pos.current.y + 4 && dist > 18 && dist < 110) {
        const dirToAnchor = toAnchor.clone().normalize();
        const dot = forward.dot(dirToAnchor);

        if (dot > -0.1) {
          const score = dist - dot * 35;
          if (score < minScore) {
            minScore = score;
            bestAnchor = anchor;
          }
        }
      }
    });

    return bestAnchor;
  };

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const clock = state.clock.getElapsedTime();

    // In Photo Mode, pause physics and apply photo pose
    if (isPaused) {
      if (leftArmRef.current && rightArmRef.current && leftLegRef.current && rightLegRef.current && characterRef.current) {
        if (photoPose === 'crouch') {
          characterRef.current.rotation.set(0.4, rotY.current, 0);
          leftLegRef.current.rotation.set(-1.4, 0, -0.4);
          rightLegRef.current.rotation.set(-1.4, 0, 0.4);
          leftArmRef.current.rotation.set(-1.1, 0, -0.3);
          rightArmRef.current.rotation.set(-0.7, 0, 0.3);
        } else if (photoPose === 'thwip') {
          characterRef.current.rotation.set(0.1, rotY.current, 0);
          leftArmRef.current.rotation.set(-1.5, 0.2, 0);
          rightArmRef.current.rotation.set(-1.5, -0.2, 0);
          leftLegRef.current.rotation.set(0.3, 0, -0.3);
          rightLegRef.current.rotation.set(-0.4, 0, 0.3);
        } else if (photoPose === 'hang') {
          characterRef.current.rotation.set(0, rotY.current, Math.PI);
          leftArmRef.current.rotation.set(0.4, 0, -0.3);
          rightArmRef.current.rotation.set(0.4, 0, 0.3);
          leftLegRef.current.rotation.set(0.5, 0, 0);
          rightLegRef.current.rotation.set(0.8, 0, 0);
        } else if (photoPose === 'heroic') {
          characterRef.current.rotation.set(0, rotY.current, 0);
          leftArmRef.current.rotation.set(0.4, 0, -0.9);
          rightArmRef.current.rotation.set(0.4, 0, 0.9);
          leftLegRef.current.rotation.set(0, 0, -0.2);
          rightLegRef.current.rotation.set(0, 0, 0.2);
        } else if (photoPose === 'selfie') {
          characterRef.current.rotation.set(0, rotY.current + 0.3, 0);
          rightArmRef.current.rotation.set(-1.4, 0.8, 0.5);
          leftArmRef.current.rotation.set(-1.3, 0, -0.5);
          leftLegRef.current.rotation.set(0, 0, -0.1);
          rightLegRef.current.rotation.set(0, 0, 0.1);
        }
      }
      return;
    }

    if (turnDelta !== 0) {
      rotY.current += turnDelta;
    }

    if (parkourWallRunCooldown.current > 0) {
      parkourWallRunCooldown.current -= dt;
    }

    // Decrement timers
    if (dashCooldown.current > 0) dashCooldown.current -= dt;
    if (jumpCooldown.current > 0) jumpCooldown.current -= dt;
    if (flightTimer.current > 0) {
      flightTimer.current -= dt;
      if (flightTimer.current <= 0) isParabolicFlight.current = false;
    }

    // Reset air jumps when grounded or sticking to wall
    if (pos.current.y <= 0.2 || parkourState.current !== 'none') {
      airJumpsUsed.current = 0;
    }

    // 1. Attack action handling
    if (controls.attack && !isAttacking.current) {
      isAttacking.current = true;
      attackTimer.current = 0.4;
      playSound('combat');
      if (onAttackHit) onAttackHit();
    }
    if (isAttacking.current) {
      attackTimer.current -= dt;
      if (attackTimer.current <= 0) {
        isAttacking.current = false;
      }
    }

    // 2. Supersonic Web Dash (Air & Ground Dash)
    if (controls.dash && !isDashing.current && dashCooldown.current <= 0 && parkourState.current === 'none') {
      isDashing.current = true;
      dashTimer.current = 0.32;
      dashCooldown.current = 0.75;
      playSound('dash');

      const dashForward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY.current);
      if (controls.left) dashForward.add(new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY.current).multiplyScalar(0.7));
      if (controls.right) dashForward.add(new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY.current).multiplyScalar(0.7));
      if (controls.backward) dashForward.negate();
      dashForward.normalize();

      vel.current.copy(dashForward.multiplyScalar(68));
      vel.current.y = Math.max(vel.current.y * 0.5, 6);
      isParabolicFlight.current = true;
      flightTimer.current = 0.8;
    }

    if (isDashing.current) {
      dashTimer.current -= dt;
      if (dashTimer.current <= 0) {
        isDashing.current = false;
      }
    }

    // 3. Web Zip handling
    if (controls.zip && !isZipping.current && !isSwinging.current && parkourState.current === 'none') {
      const anchor = findBestAnchor();
      if (anchor) {
        isZipping.current = true;
        setWebTarget(anchor);
        playSound('zip');
        const zipDir = anchor.clone().sub(pos.current);
        if (zipDir.lengthSq() > 0.001) {
          zipDir.normalize();
          vel.current.copy(zipDir.multiplyScalar(65));
        }
        setTimeout(() => {
          isZipping.current = false;
          setWebTarget(null);
        }, 450);
      }
    }

    // 4. Ground Slam
    if (controls.slam && pos.current.y > 4 && !isSlamming.current && parkourState.current === 'none') {
      isSlamming.current = true;
      vel.current.set(0, -95, 0);
      playSound('slam');
    }

    // 5. Parabolic Web-Swinging Engine: Initiation & Parabolic Launch
    if (controls.swing && !isSwinging.current && !isZipping.current && parkourState.current === 'none') {
      const anchor = findBestAnchor();
      if (anchor) {
        isSwinging.current = true;
        swingAnchor.current = anchor;
        swingStartHeight.current = pos.current.y;
        swingRopeLength.current = Math.max(pos.current.distanceTo(anchor), 15);
        setWebTarget(anchor);
        playSound('swing');
      }
    } else if (!controls.swing && isSwinging.current) {
      // Parabolic Web Release: Calculate launch trajectory from instantaneous tangential speed
      isSwinging.current = false;
      setWebTarget(null);

      const boostForward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY.current);
      // Launch impulse into parabolic arc flight
      vel.current.add(boostForward.multiplyScalar(16));
      vel.current.y = Math.max(vel.current.y + 14, 16);

      isParabolicFlight.current = true;
      flightTimer.current = 1.4;
      playSound('whoosh');
    }

    // Forward direction from character rotation
    const forwardVec = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY.current);
    const rightVec = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY.current);

    // ==========================================
    // 5. PARKOUR STATE MACHINE & WALL INTERACTION
    // ==========================================

    // Handle Active Parkour States (Ledge Hang, Ledge Climb, Vaulting)
    if (parkourState.current === 'ledge_hang') {
      // Zero velocity while hanging
      vel.current.set(0, 0, 0);

      // Facing directly into the wall/ledge
      rotY.current = Math.atan2(-parkourWallNormal.current.x, -parkourWallNormal.current.z);

      // Player input to climb up onto roof: Space / W / Jump / Climb
      if (controls.jump || controls.forward || controls.climb) {
        parkourState.current = 'ledge_climb';
        parkourTimer.current = 0.35;
        playSound('climb');
        if (onParkourStateChange) onParkourStateChange('ledge_climb');
      } else if (controls.backward || controls.slam) {
        // Drop down from ledge
        parkourState.current = 'none';
        parkourWallRunCooldown.current = 0.5;
        vel.current.copy(parkourWallNormal.current.clone().multiplyScalar(5));
        vel.current.y = -2;
        if (onParkourStateChange) onParkourStateChange('none');
      }
    } else if (parkourState.current === 'ledge_climb') {
      // Smooth dynamic muscle-up hoist onto roof
      parkourTimer.current -= dt;
      const progress = 1 - Math.max(0, parkourTimer.current / 0.35);

      // Interpolate position from hang position to roof footing
      pos.current.lerp(ledgeClimbTarget.current, Math.min(1, dt * 14));

      if (parkourTimer.current <= 0) {
        pos.current.copy(ledgeClimbTarget.current);
        vel.current.copy(forwardVec.clone().multiplyScalar(4));
        parkourState.current = 'none';
        parkourWallRunCooldown.current = 0.4;
        if (onParkourStateChange) onParkourStateChange('none');
      }
    } else if (parkourState.current === 'vaulting') {
      // Smooth acrobatic speed vault over obstacle / parapet
      parkourTimer.current -= dt;
      const progress = 1 - Math.max(0, parkourTimer.current / 0.38);

      // Arc path: boost forward while maintaining height over obstacle
      pos.current.lerp(vaultEndPos.current, Math.min(1, dt * 12));

      if (parkourTimer.current <= 0) {
        pos.current.copy(vaultEndPos.current);
        vel.current.copy(forwardVec.clone().multiplyScalar(controls.sprint ? 28 : 20));
        parkourState.current = 'none';
        parkourWallRunCooldown.current = 0.3;
        if (onParkourStateChange) onParkourStateChange('none');
      }
    } else if (parkourState.current === 'wall_run_up') {
      // Running vertically up the skyscraper
      vel.current.y = controls.sprint ? 34 : 26;
      vel.current.x = 0;
      vel.current.z = 0;

      // Keep Spidey pinned close to the wall face
      pos.current.x = THREE.MathUtils.lerp(
        pos.current.x,
        parkourWallPoint.current.x + parkourWallNormal.current.x * 0.5,
        dt * 12
      );
      pos.current.z = THREE.MathUtils.lerp(
        pos.current.z,
        parkourWallPoint.current.z + parkourWallNormal.current.z * 0.5,
        dt * 12
      );

      // Footstep scuff audio
      parkourFootstepTimer.current += dt;
      if (parkourFootstepTimer.current >= 0.16) {
        parkourFootstepTimer.current = 0;
        playSound('wallrun');
      }

      // Orientation: facing into the building
      rotY.current = Math.atan2(-parkourWallNormal.current.x, -parkourWallNormal.current.z);

      // Jump / Acrobat off wall (Acrobatic Wall Kick / Somersault)
      if (controls.jump || controls.acrobat) {
        const isAcrobat = !!controls.acrobat;
        parkourState.current = isAcrobat ? 'wall_acrobat' : 'wall_jump';
        parkourTimer.current = 0.55;
        parkourWallRunCooldown.current = 0.4;
        vel.current.copy(parkourWallNormal.current.clone().multiplyScalar(isAcrobat ? 25 : 20));
        vel.current.y = isAcrobat ? 26 : 22;
        playSound('swing');
        if (onParkourStateChange) onParkourStateChange(isAcrobat ? 'wall_acrobat' : 'wall_jump');
      }

      // Check if reached rooftop or released sprint/forward
      const currentBldRoof = parkourWallPoint.current.y;
      if (pos.current.y >= currentBldRoof - 1.2) {
        // Auto-vault over the rooftop ledge onto the roof!
        pos.current.y = currentBldRoof + 0.1;
        pos.current.add(parkourWallNormal.current.clone().multiplyScalar(-2.2));
        vel.current.copy(forwardVec.clone().multiplyScalar(18));
        vel.current.y = 8;
        parkourState.current = 'none';
        parkourWallRunCooldown.current = 0.5;
        playSound('vault');
        if (onParkourStateChange) onParkourStateChange('none');
      } else if (!controls.forward && !controls.sprint && !controls.jump) {
        // Slide / drop off wall
        parkourState.current = 'none';
        parkourWallRunCooldown.current = 0.4;
        vel.current.copy(parkourWallNormal.current.clone().multiplyScalar(4));
        if (onParkourStateChange) onParkourStateChange('none');
      }
    } else if (parkourState.current === 'wall_run_horizontal') {
      // Horizontal Wall Run along skyscraper facade
      const tangentVec = new THREE.Vector3(0, 1, 0).cross(parkourWallNormal.current).normalize();
      // Choose tangent matching player's forward direction
      if (forwardVec.dot(tangentVec) < 0) {
        tangentVec.negate();
      }

      const hSpeed = controls.sprint ? 32 : 24;
      vel.current.x = tangentVec.x * hSpeed;
      vel.current.z = tangentVec.z * hSpeed;
      vel.current.y = -1.2; // Slow vertical drift

      // Keep Spidey pinned close to the wall face
      pos.current.x = THREE.MathUtils.lerp(
        pos.current.x,
        parkourWallPoint.current.x + parkourWallNormal.current.x * 0.55,
        dt * 12
      );
      pos.current.z = THREE.MathUtils.lerp(
        pos.current.z,
        parkourWallPoint.current.z + parkourWallNormal.current.z * 0.55,
        dt * 12
      );

      // Footstep scuff audio
      parkourFootstepTimer.current += dt;
      if (parkourFootstepTimer.current >= 0.18) {
        parkourFootstepTimer.current = 0;
        playSound('wallrun');
      }

      // Look in horizontal run direction
      rotY.current = Math.atan2(-tangentVec.x, -tangentVec.z);

      // Jump / Acrobat off wall during horizontal run
      if (controls.jump || controls.acrobat) {
        const isAcrobat = !!controls.acrobat;
        parkourState.current = isAcrobat ? 'wall_acrobat' : 'wall_jump';
        parkourTimer.current = 0.55;
        parkourWallRunCooldown.current = 0.4;
        const jumpDir = tangentVec.clone().multiplyScalar(isAcrobat ? 18 : 14).add(parkourWallNormal.current.clone().multiplyScalar(isAcrobat ? 20 : 16));
        vel.current.copy(jumpDir);
        vel.current.y = isAcrobat ? 25 : 20;
        playSound('swing');
        if (onParkourStateChange) onParkourStateChange(isAcrobat ? 'wall_acrobat' : 'wall_jump');
      }

      // Check wall ends or player stops
      parkourTimer.current -= dt;
      if (parkourTimer.current <= 0 || (!controls.forward && !controls.left && !controls.right && !controls.sprint)) {
        parkourState.current = 'none';
        parkourWallRunCooldown.current = 0.4;
        vel.current.copy(parkourWallNormal.current.clone().multiplyScalar(6));
        if (onParkourStateChange) onParkourStateChange('none');
      }
    } else if (parkourState.current === 'wall_stick') {
      // Marvel's Spider-Man 2: Clinging firmly to skyscraper facade
      vel.current.set(0, 0, 0);

      // Keep Spidey pinned close to the wall face
      pos.current.x = THREE.MathUtils.lerp(
        pos.current.x,
        parkourWallPoint.current.x + parkourWallNormal.current.x * 0.45,
        dt * 14
      );
      pos.current.z = THREE.MathUtils.lerp(
        pos.current.z,
        parkourWallPoint.current.z + parkourWallNormal.current.z * 0.45,
        dt * 14
      );

      // Facing directly into the building facade
      rotY.current = Math.atan2(-parkourWallNormal.current.x, -parkourWallNormal.current.z);

      // 1. Wall Jump / Wall Acrobat (Acrobatic Spider-Man 2 Wall Kick into open air!)
      if (controls.jump || controls.acrobat) {
        const isAcrobat = !!controls.acrobat;
        parkourState.current = isAcrobat ? 'wall_acrobat' : 'wall_jump';
        parkourTimer.current = 0.55;
        parkourWallRunCooldown.current = 0.35;
        vel.current.copy(parkourWallNormal.current.clone().multiplyScalar(isAcrobat ? 26 : 22));
        vel.current.y = isAcrobat ? 26 : 22;
        playSound('swing');
        if (onParkourStateChange) onParkourStateChange(isAcrobat ? 'wall_acrobat' : 'wall_jump');
      }
      // 2. Sprint -> Surge directly into Skyscraper Wall Run!
      else if (controls.sprint) {
        if (controls.left || controls.right) {
          parkourState.current = 'wall_run_horizontal';
          parkourTimer.current = 2.5;
          playSound('wallrun');
          if (onParkourStateChange) onParkourStateChange('wall_run_horizontal');
        } else {
          parkourState.current = 'wall_run_up';
          playSound('wallrun');
          if (onParkourStateChange) onParkourStateChange('wall_run_up');
        }
      }
      // 3. Climb action or forward+climb
      else if (controls.climb) {
        parkourState.current = 'wall_climb';
        playSound('climb');
        if (onParkourStateChange) onParkourStateChange('wall_climb');
      }
      // 4. Directional keys or crawl button -> 4-directional Wall Crawl!
      else if (controls.forward || controls.backward || controls.left || controls.right || controls.crawl) {
        parkourState.current = 'wall_crawl';
        playSound('climb');
        if (onParkourStateChange) onParkourStateChange('wall_crawl');
      }
      // 5. Drop / slam -> detach and free fall
      else if (controls.slam) {
        parkourState.current = 'none';
        parkourWallRunCooldown.current = 0.4;
        vel.current.copy(parkourWallNormal.current.clone().multiplyScalar(4));
        vel.current.y = -3;
        if (onParkourStateChange) onParkourStateChange('none');
      }
    } else if (parkourState.current === 'wall_crawl') {
      // 4-Directional Wall Crawl across skyscraper facade
      const tangentVec = new THREE.Vector3(0, 1, 0).cross(parkourWallNormal.current).normalize();

      let hMove = 0;
      if (controls.left) hMove -= 1;
      if (controls.right) hMove += 1;

      let vMove = 0;
      if (controls.forward) vMove += 1;
      if (controls.backward) vMove -= 1;

      // Calculate crawl velocity
      const crawlSpeed = 8.5;
      vel.current.x = tangentVec.x * hMove * crawlSpeed;
      vel.current.z = tangentVec.z * hMove * crawlSpeed;
      vel.current.y = vMove * crawlSpeed;

      // Keep Spidey pinned close to the wall face
      pos.current.x = THREE.MathUtils.lerp(
        pos.current.x,
        parkourWallPoint.current.x + parkourWallNormal.current.x * 0.45,
        dt * 14
      );
      pos.current.z = THREE.MathUtils.lerp(
        pos.current.z,
        parkourWallPoint.current.z + parkourWallNormal.current.z * 0.45,
        dt * 14
      );

      // Facing wall
      rotY.current = Math.atan2(-parkourWallNormal.current.x, -parkourWallNormal.current.z);

      // Periodic crawling hand/footstep sound
      if (hMove !== 0 || vMove !== 0) {
        parkourFootstepTimer.current += dt;
        if (parkourFootstepTimer.current >= 0.28) {
          parkourFootstepTimer.current = 0;
          playSound('climb');
        }
      }

      // Check if reached top roof edge
      const currentBldRoof = parkourWallPoint.current.y;
      if (pos.current.y >= currentBldRoof - 1.2) {
        // Vault smoothly over rooftop parapet
        pos.current.y = currentBldRoof + 0.1;
        pos.current.add(parkourWallNormal.current.clone().multiplyScalar(-2.0));
        vel.current.copy(forwardVec.clone().multiplyScalar(12));
        vel.current.y = 5;
        parkourState.current = 'none';
        parkourWallRunCooldown.current = 0.4;
        playSound('vault');
        if (onParkourStateChange) onParkourStateChange('none');
      }
      // Revert to stationary wall stick when not pressing movement
      else if (hMove === 0 && vMove === 0 && !controls.crawl) {
        parkourState.current = 'wall_stick';
        if (onParkourStateChange) onParkourStateChange('wall_stick');
      }
      // Wall Jump / Wall Acrobat off crawl
      else if (controls.jump || controls.acrobat) {
        const isAcrobat = !!controls.acrobat;
        parkourState.current = isAcrobat ? 'wall_acrobat' : 'wall_jump';
        parkourTimer.current = 0.55;
        parkourWallRunCooldown.current = 0.35;
        vel.current.copy(parkourWallNormal.current.clone().multiplyScalar(isAcrobat ? 26 : 22));
        vel.current.y = isAcrobat ? 26 : 22;
        playSound('swing');
        if (onParkourStateChange) onParkourStateChange(isAcrobat ? 'wall_acrobat' : 'wall_jump');
      }
      // Sprint -> Wall Run
      else if (controls.sprint) {
        parkourState.current = 'wall_run_up';
        playSound('wallrun');
        if (onParkourStateChange) onParkourStateChange('wall_run_up');
      }
    } else if (parkourState.current === 'wall_climb') {
      // Rapid Hand-over-Hand Vertical Climbing
      vel.current.set(0, 18, 0);

      // Keep Spidey pinned close to the wall face
      pos.current.x = THREE.MathUtils.lerp(
        pos.current.x,
        parkourWallPoint.current.x + parkourWallNormal.current.x * 0.45,
        dt * 14
      );
      pos.current.z = THREE.MathUtils.lerp(
        pos.current.z,
        parkourWallPoint.current.z + parkourWallNormal.current.z * 0.45,
        dt * 14
      );

      rotY.current = Math.atan2(-parkourWallNormal.current.x, -parkourWallNormal.current.z);

      parkourFootstepTimer.current += dt;
      if (parkourFootstepTimer.current >= 0.22) {
        parkourFootstepTimer.current = 0;
        playSound('climb');
      }

      // Check rooftop arrival
      const currentBldRoof = parkourWallPoint.current.y;
      if (pos.current.y >= currentBldRoof - 1.2) {
        pos.current.y = currentBldRoof + 0.1;
        pos.current.add(parkourWallNormal.current.clone().multiplyScalar(-2.0));
        vel.current.copy(forwardVec.clone().multiplyScalar(14));
        vel.current.y = 6;
        parkourState.current = 'none';
        parkourWallRunCooldown.current = 0.4;
        playSound('vault');
        if (onParkourStateChange) onParkourStateChange('none');
      } else if (controls.jump || controls.acrobat) {
        // Wall Jump / Wall Acrobat off climb
        const isAcrobat = !!controls.acrobat;
        parkourState.current = isAcrobat ? 'wall_acrobat' : 'wall_jump';
        parkourTimer.current = 0.55;
        parkourWallRunCooldown.current = 0.35;
        vel.current.copy(parkourWallNormal.current.clone().multiplyScalar(isAcrobat ? 26 : 22));
        vel.current.y = isAcrobat ? 26 : 22;
        playSound('swing');
        if (onParkourStateChange) onParkourStateChange(isAcrobat ? 'wall_acrobat' : 'wall_jump');
      } else if (controls.sprint) {
        parkourState.current = 'wall_run_up';
        playSound('wallrun');
        if (onParkourStateChange) onParkourStateChange('wall_run_up');
      } else if (!controls.forward && !controls.climb) {
        parkourState.current = 'wall_stick';
        if (onParkourStateChange) onParkourStateChange('wall_stick');
      }
    } else if (parkourState.current === 'wall_jump' || parkourState.current === 'wall_acrobat') {
      // Acrobatic mid-air somersault leap off skyscraper wall
      parkourTimer.current -= dt;
      vel.current.y += -32 * dt; // Normal gravity during leap
      pos.current.addScaledVector(vel.current, dt);

      if (parkourTimer.current <= 0 || controls.swing || controls.zip) {
        parkourState.current = 'none';
        if (onParkourStateChange) onParkourStateChange('none');
      }
    } else {
      // Normal physics and Parkour Trigger Detection
      const gravity = -34;

      if (isSwinging.current && swingAnchor.current) {
        // ==========================================
        // PARABOLIC WEB-SWINGING PHYSICS ENGINE
        // ==========================================
        const toAnchor = swingAnchor.current.clone().sub(pos.current);
        const currentDist = toAnchor.length();

        // Parabolic kinetic acceleration: As Spidey swoops down, potential energy converts into kinetic speed
        const heightDrop = Math.max(0, swingStartHeight.current - pos.current.y);
        const parabolicEnergyBoost = Math.sqrt(2 * 9.81 * heightDrop);

        // Apply gravity
        vel.current.y += gravity * dt;

        // Apply centripetal rope constraint & parabolic arc tension
        if (currentDist > swingRopeLength.current && currentDist > 0.01) {
          const ropeDir = toAnchor.clone().normalize();
          const vDotRope = vel.current.dot(ropeDir);
          // Zero outward radial velocity, keeping movement strictly tangential along the swing arc
          vel.current.sub(ropeDir.multiplyScalar(vDotRope));
          pos.current.add(ropeDir.multiplyScalar(currentDist - swingRopeLength.current));

          // Tangential forward acceleration along swing trajectory
          const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY.current);
          vel.current.add(forward.multiplyScalar((26 + parabolicEnergyBoost * 0.7) * dt));
        }

        // Mid-swing aerodynamic steering
        if (controls.left) rotY.current += 2.2 * dt;
        if (controls.right) rotY.current -= 2.2 * dt;

        // Jump key during swing triggers instant high-apex launch release!
        if (controls.jump && jumpCooldown.current <= 0) {
          isSwinging.current = false;
          setWebTarget(null);
          jumpCooldown.current = 0.4;

          const boostForward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY.current);
          vel.current.add(boostForward.multiplyScalar(20));
          vel.current.y = Math.max(vel.current.y + 18, 22);

          isParabolicFlight.current = true;
          flightTimer.current = 1.5;
          playSound('whoosh');
        }
      } else {
        // ==========================================
        // GROUND & AIR LOCOMOTION PHYSICS
        // (Walking, Running, Sprinting, Jumping)
        // ==========================================
        vel.current.y += gravity * dt;

        // Direction vectors based on current character heading
        const forwardVector = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY.current);
        const rightVector = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY.current);

        const moveDir = new THREE.Vector3(0, 0, 0);

        // Movement directional accumulation
        if (controls.forward) moveDir.add(forwardVector);
        if (controls.backward) moveDir.sub(forwardVector);
        if (controls.left) moveDir.sub(rightVector);
        if (controls.right) moveDir.add(rightVector);

        if (moveDir.lengthSq() > 0.001) {
          moveDir.normalize();

          // Movement Physics Speeds:
          // 1. Backpedal / Slow Walk: ~13 mph (6 m/s)
          // 2. Standard Run: ~25 mph (11.5 m/s)
          // 3. High-Speed Sprint: ~44 mph (20 m/s)
          const isWalkingBackwards = controls.backward && !controls.forward;
          let targetSpeed = 20; // Standard jog/run

          if (isWalkingBackwards) {
            targetSpeed = 12; // Deliberate walking
          } else if (controls.sprint) {
            targetSpeed = 36; // Maximum velocity sprint
          }

          const groundFriction = pos.current.y <= 0.2 ? 18 : 6;
          vel.current.x = THREE.MathUtils.lerp(vel.current.x, moveDir.x * targetSpeed, groundFriction * dt);
          vel.current.z = THREE.MathUtils.lerp(vel.current.z, moveDir.z * targetSpeed, groundFriction * dt);

          // Footstep audio cadence when grounded
          if (pos.current.y <= 0.2) {
            walkAudioTimer.current += dt;
            const stepInterval = controls.sprint ? 0.18 : 0.32;
            if (walkAudioTimer.current >= stepInterval) {
              walkAudioTimer.current = 0;
              playSound('wallrun');
            }
          }
        } else {
          const damping = pos.current.y <= 0.2 ? 16 : 2;
          vel.current.x = THREE.MathUtils.lerp(vel.current.x, 0, damping * dt);
          vel.current.z = THREE.MathUtils.lerp(vel.current.z, 0, damping * dt);
        }

        // ==========================================
        // JUMPING PHYSICS (Ground Jump & Mid-Air Double Jump)
        // ==========================================
        if (controls.jump && jumpCooldown.current <= 0) {
          if (pos.current.y <= 0.4) {
            // Ground jump / Sprint Super Jump
            jumpCooldown.current = 0.35;
            vel.current.y = controls.sprint ? 28 : 22;
            if (controls.sprint && moveDir.lengthSq() > 0.01) {
              vel.current.add(moveDir.clone().multiplyScalar(10));
            }
            playSound('swing');
          } else if (airJumpsUsed.current < 1 && pos.current.y > 2) {
            // Mid-air acrobatic double-jump / web leap
            airJumpsUsed.current += 1;
            jumpCooldown.current = 0.4;
            vel.current.y = 22;
            const airForward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY.current);
            vel.current.add(airForward.multiplyScalar(12));
            isParabolicFlight.current = true;
            flightTimer.current = 0.8;
            playSound('swing');
          }
        }
      }

      // Smooth heading steering in direction of forward movement
      if (controls.forward) {
        const forwardVector = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY.current);
        const rightVector = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY.current);
        const intendedDir = new THREE.Vector3(0, 0, 0);
        intendedDir.add(forwardVector);
        if (controls.left) intendedDir.sub(rightVector);
        if (controls.right) intendedDir.add(rightVector);

        if (intendedDir.lengthSq() > 0.01) {
          const targetAngle = Math.atan2(-intendedDir.x, -intendedDir.z);
          let diff = targetAngle - rotY.current;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          rotY.current += diff * 10 * dt;
        }
      }

      // Integrate position
      pos.current.addScaledVector(vel.current, dt);

      // Safe NaN protection & City Bounds clamping (prevents white screen)
      if (isNaN(pos.current.x) || isNaN(pos.current.y) || isNaN(pos.current.z)) {
        pos.current.set(0, 15, 0);
        vel.current.set(0, 0, 0);
      }
      pos.current.x = THREE.MathUtils.clamp(pos.current.x, -190, 190);
      pos.current.z = THREE.MathUtils.clamp(pos.current.z, -190, 190);

      // Ground collision
      if (pos.current.y <= 0) {
        pos.current.y = 0;
        if (isSlamming.current) isSlamming.current = false;
        vel.current.y = 0;
      }

      // ==========================================
      // PARKOUR ENVIRONMENT COLLISION & DETECTION
      // ==========================================
      if (!isSwinging.current && parkourWallRunCooldown.current <= 0) {
        const horizontalVel = new THREE.Vector2(vel.current.x, vel.current.z);
        for (const b of buildings) {
          const minX = b.x - b.width / 2;
          const maxX = b.x + b.width / 2;
          const minZ = b.z - b.depth / 2;
          const maxZ = b.z + b.depth / 2;
          const roofY = b.height;

          // 1. ROOFTOP COLLISION & ROOF PARAPET / HVAC VAULT DETECTION
          const isOverRoof =
            pos.current.x >= minX - 0.2 &&
            pos.current.x <= maxX + 0.2 &&
            pos.current.z >= minZ - 0.2 &&
            pos.current.z <= maxZ + 0.2;

          if (isOverRoof) {
            // Landing on roof
            if (pos.current.y <= roofY + 0.1 && pos.current.y >= roofY - 4) {
              pos.current.y = roofY;
              vel.current.y = Math.max(0, vel.current.y);
              if (isSlamming.current) isSlamming.current = false;

              // Rooftop HVAC Obstacle Vaulting Check
              const hvacPos = new THREE.Vector3(
                b.x - b.width * 0.22,
                roofY + 0.6,
                b.z + b.depth * 0.2
              );
              const distToHvac = pos.current.distanceTo(hvacPos);
              if (
                distToHvac < 3.2 &&
                (controls.forward || controls.sprint || controls.jump) &&
                horizontalVel.length() > 3
              ) {
                // Perform Speed Vault over Rooftop HVAC unit
                parkourState.current = 'vaulting';
                parkourTimer.current = 0.38;
                vaultEndPos.current.copy(pos.current).add(forwardVec.clone().multiplyScalar(4.8));
                vaultEndPos.current.y = roofY;
                playSound('vault');
                if (onParkourStateChange) onParkourStateChange('vaulting');
                break;
              }

              // Rooftop Parapet Vault Check (running towards edge of roof)
              const distToEdgeWest = Math.abs(pos.current.x - minX);
              const distToEdgeEast = Math.abs(pos.current.x - maxX);
              const distToEdgeNorth = Math.abs(pos.current.z - minZ);
              const distToEdgeSouth = Math.abs(pos.current.z - maxZ);
              const minEdgeDist = Math.min(distToEdgeWest, distToEdgeEast, distToEdgeNorth, distToEdgeSouth);

              if (minEdgeDist < 1.8 && (controls.sprint || controls.jump) && horizontalVel.length() > 8) {
                // Vault over roof parapet edge into free flight!
                parkourState.current = 'vaulting';
                parkourTimer.current = 0.35;
                vaultEndPos.current.copy(pos.current).add(forwardVec.clone().multiplyScalar(5.5));
                vaultEndPos.current.y = roofY + 0.8;
                playSound('vault');
                if (onParkourStateChange) onParkourStateChange('vaulting');
                break;
              }
            }
          }

          // 2. VERTICAL WALL DETECTION (Wall-Run & Ledge Hang)
          // Check proximity to building's 4 outer vertical faces
          if (pos.current.y > 0.5 && pos.current.y <= roofY + 0.4) {
            const margin = 1.35;
            const inYRange = pos.current.y >= 0.5 && pos.current.y <= roofY;

            // Check West face (x ≈ minX)
            const nearWest =
              Math.abs(pos.current.x - minX) < margin &&
              pos.current.z >= minZ - 0.5 &&
              pos.current.z <= maxZ + 0.5;

            // Check East face (x ≈ maxX)
            const nearEast =
              Math.abs(pos.current.x - maxX) < margin &&
              pos.current.z >= minZ - 0.5 &&
              pos.current.z <= maxZ + 0.5;

            // Check North face (z ≈ minZ)
            const nearNorth =
              Math.abs(pos.current.z - minZ) < margin &&
              pos.current.x >= minX - 0.5 &&
              pos.current.x <= maxX + 0.5;

            // Check South face (z ≈ maxZ)
            const nearSouth =
              Math.abs(pos.current.z - maxZ) < margin &&
              pos.current.x >= minX - 0.5 &&
              pos.current.x <= maxX + 0.5;

            let wallHitNormal: THREE.Vector3 | null = null;
            let contactPoint: THREE.Vector3 | null = null;

            if (nearWest && pos.current.x < minX + 0.5) {
              wallHitNormal = new THREE.Vector3(-1, 0, 0);
              contactPoint = new THREE.Vector3(minX, roofY, pos.current.z);
            } else if (nearEast && pos.current.x > maxX - 0.5) {
              wallHitNormal = new THREE.Vector3(1, 0, 0);
              contactPoint = new THREE.Vector3(maxX, roofY, pos.current.z);
            } else if (nearNorth && pos.current.z < minZ + 0.5) {
              wallHitNormal = new THREE.Vector3(0, 0, -1);
              contactPoint = new THREE.Vector3(pos.current.x, roofY, minZ);
            } else if (nearSouth && pos.current.z > maxZ - 0.5) {
              wallHitNormal = new THREE.Vector3(0, 0, 1);
              contactPoint = new THREE.Vector3(pos.current.x, roofY, maxZ);
            }

            if (wallHitNormal && contactPoint) {
              // A. LEDGE HANG & CLIMB TRIGGER
              // Airborne within 2.2m below roof top
              if (
                pos.current.y >= roofY - 2.2 &&
                pos.current.y <= roofY + 0.2 &&
                vel.current.y < 3 &&
                !isOverRoof
              ) {
                parkourState.current = 'ledge_hang';
                parkourWallNormal.current.copy(wallHitNormal);
                parkourWallPoint.current.copy(contactPoint);
                pos.current.set(
                  contactPoint.x + wallHitNormal.x * 0.45,
                  roofY - 1.35,
                  contactPoint.z + wallHitNormal.z * 0.45
                );
                vel.current.set(0, 0, 0);
                rotY.current = Math.atan2(-wallHitNormal.x, -wallHitNormal.z);

                // Ledge hoist destination landing on the roof
                ledgeClimbTarget.current.set(
                  contactPoint.x - wallHitNormal.x * 1.5,
                  roofY + 0.1,
                  contactPoint.z - wallHitNormal.z * 1.5
                );

                playSound('ledgegrab');
                if (onParkourStateChange) onParkourStateChange('ledge_hang');
                break;
              }

              // B. WALL-RUN, WALL-STICK, WALL-CRAWL & WALL-CLIMB TRIGGER
              // If player is moving into wall or holding sprint/forward/climb/crawl
              const isMovingIntoWall = forwardVec.dot(wallHitNormal) < -0.25;
              const isMovingAlongWall = Math.abs(forwardVec.dot(wallHitNormal)) < 0.45;
              const isAirborne = pos.current.y > 0.5;

              if (pos.current.y < roofY - 1.5) {
                parkourWallNormal.current.copy(wallHitNormal);
                parkourWallPoint.current.copy(contactPoint);

                // 1. Sprint held -> Marvel's Wall-Run (horizontal or vertical)
                if (controls.sprint && (isMovingIntoWall || isMovingAlongWall || controls.forward || controls.jump)) {
                  if (isMovingAlongWall && (controls.left || controls.right || horizontalVel.length() > 6)) {
                    parkourState.current = 'wall_run_horizontal';
                    parkourTimer.current = 2.0;
                    parkourFootstepTimer.current = 0;
                    playSound('wallrun');
                    if (onParkourStateChange) onParkourStateChange('wall_run_horizontal');
                    break;
                  } else {
                    parkourState.current = 'wall_run_up';
                    parkourFootstepTimer.current = 0;
                    playSound('wallrun');
                    if (onParkourStateChange) onParkourStateChange('wall_run_up');
                    break;
                  }
                }
                // 2. Climb held -> Fast vertical Wall Climb!
                else if (controls.climb) {
                  parkourState.current = 'wall_climb';
                  parkourFootstepTimer.current = 0;
                  playSound('climb');
                  if (onParkourStateChange) onParkourStateChange('wall_climb');
                  break;
                }
                // 3. Crawl held -> 4-Directional Wall Crawl!
                else if (controls.crawl) {
                  parkourState.current = 'wall_crawl';
                  playSound('climb');
                  if (onParkourStateChange) onParkourStateChange('wall_crawl');
                  break;
                }
                // 4. Marvel's Spider-Man 2 Adhesion: Airborne contact or pressing into wall -> Stick to Wall!
                else if (
                  controls.stick ||
                  controls.parkour ||
                  isMovingIntoWall ||
                  (isAirborne && vel.current.length() < 32 && !controls.slam)
                ) {
                  parkourState.current = 'wall_stick';
                  vel.current.set(0, 0, 0);
                  playSound('ledgegrab');
                  if (onParkourStateChange) onParkourStateChange('wall_stick');
                  break;
                }
              }
            }
          }
        }
      }
    }

    // ==========================================
    // 6. PROCEDURAL RIG TRANSFORM & ANIMATIONS
    // ==========================================
    if (characterRef.current) {
      characterRef.current.position.copy(pos.current);
      characterRef.current.rotation.y = rotY.current;

      if (isSwinging.current) {
        const bank = THREE.MathUtils.clamp(vel.current.x * 0.02, -0.6, 0.6);
        characterRef.current.rotation.z = bank;
        characterRef.current.rotation.x = 0.4;
      } else if (isZipping.current) {
        characterRef.current.rotation.x = 0.8;
      } else if (parkourState.current === 'wall_run_up') {
        // Leaning into wall as Spidey sprints up
        characterRef.current.rotation.x = 0.35;
        characterRef.current.rotation.z = 0;
      } else if (parkourState.current === 'wall_run_horizontal') {
        // Tilting sideways against skyscraper facade
        characterRef.current.rotation.z = 0.45;
        characterRef.current.rotation.x = 0.15;
      } else if (parkourState.current === 'wall_stick') {
        // Flat against building facade
        characterRef.current.rotation.x = 0.15;
        characterRef.current.rotation.z = 0;
      } else if (parkourState.current === 'wall_crawl') {
        characterRef.current.rotation.x = 0.22;
        characterRef.current.rotation.z = 0;
      } else if (parkourState.current === 'wall_climb') {
        characterRef.current.rotation.x = 0.3;
        characterRef.current.rotation.z = 0;
      } else if (parkourState.current === 'wall_jump' || parkourState.current === 'wall_acrobat') {
        // Somersault acrobatic roll
        characterRef.current.rotation.x -= dt * 16;
        characterRef.current.rotation.z = 0;
      } else if (parkourState.current === 'vaulting') {
        // Acrobatic horizontal body roll over obstacle
        characterRef.current.rotation.z = -0.55;
        characterRef.current.rotation.x = 0.4;
      } else if (parkourState.current === 'ledge_hang') {
        characterRef.current.rotation.x = 0;
        characterRef.current.rotation.z = 0;
      } else {
        characterRef.current.rotation.z = 0;
        characterRef.current.rotation.x = 0;
      }
    }

    // Procedural Animation of Limbs by State
    const speed = vel.current.length();
    const isGrounded = pos.current.y <= 0.2;

    if (leftArmRef.current && rightArmRef.current && leftLegRef.current && rightLegRef.current) {
      if (parkourState.current === 'ledge_hang') {
        // Both hands gripping ledge above head, feet dangling
        rightArmRef.current.rotation.set(-2.8, 0, 0.2);
        leftArmRef.current.rotation.set(-2.8, 0, -0.2);
        leftLegRef.current.rotation.set(0.3, 0, -0.1);
        rightLegRef.current.rotation.set(0.3, 0, 0.1);
      } else if (parkourState.current === 'ledge_climb') {
        // Muscle up push-up over ledge
        rightArmRef.current.rotation.set(-1.2, 0, 0.3);
        leftArmRef.current.rotation.set(-1.2, 0, -0.3);
        rightLegRef.current.rotation.set(-1.1, 0, 0);
        leftLegRef.current.rotation.set(0.2, 0, 0);
      } else if (parkourState.current === 'vaulting') {
        // Hand plant on obstacle, legs tucked & swinging over
        rightArmRef.current.rotation.set(-1.4, 0, -0.4);
        leftArmRef.current.rotation.set(0.6, 0, -0.5);
        rightLegRef.current.rotation.set(-1.4, 0.3, 0.4);
        leftLegRef.current.rotation.set(-1.2, -0.2, 0.3);
      } else if (parkourState.current === 'wall_stick') {
        // Marvel's Spider-Man 2 iconic 4-point wall adhesion stance
        rightArmRef.current.rotation.set(-1.7, 0.2, 0.7);
        leftArmRef.current.rotation.set(-1.7, -0.2, -0.7);
        rightLegRef.current.rotation.set(-0.9, 0.4, 0.5);
        leftLegRef.current.rotation.set(-0.9, -0.4, -0.5);
      } else if (parkourState.current === 'wall_crawl') {
        // Alternating 4-limbed wall crawl cycle
        const crawlCycle = Math.sin(clock * 14);
        leftArmRef.current.rotation.set(-1.8 + crawlCycle * 0.4, 0, -0.6);
        rightArmRef.current.rotation.set(-1.8 - crawlCycle * 0.4, 0, 0.6);
        leftLegRef.current.rotation.set(-0.8 - crawlCycle * 0.4, -0.3, -0.4);
        rightLegRef.current.rotation.set(-0.8 + crawlCycle * 0.4, 0.3, 0.4);
      } else if (parkourState.current === 'wall_climb') {
        // Rapid hand-over-hand climbing
        const climbCycle = Math.sin(clock * 18);
        leftArmRef.current.rotation.set(-2.2 + climbCycle * 0.6, 0, -0.3);
        rightArmRef.current.rotation.set(-2.2 - climbCycle * 0.6, 0, 0.3);
        leftLegRef.current.rotation.set(-1.0 - climbCycle * 0.5, 0, -0.2);
        rightLegRef.current.rotation.set(-1.0 + climbCycle * 0.5, 0, 0.2);
      } else if (parkourState.current === 'wall_jump' || parkourState.current === 'wall_acrobat') {
        // Somersault acrobatic tuck
        leftArmRef.current.rotation.set(-2.2, 0, -0.4);
        rightArmRef.current.rotation.set(-2.2, 0, 0.4);
        leftLegRef.current.rotation.set(-1.5, 0, 0);
        rightLegRef.current.rotation.set(-1.5, 0, 0);
      } else if (parkourState.current === 'wall_run_up' || parkourState.current === 'wall_run_horizontal') {
        // Fast vertical / horizontal climbing sprint stride
        const stride = Math.sin(clock * 22) * 1.3;
        leftArmRef.current.rotation.set(stride, 0, 0);
        rightArmRef.current.rotation.set(-stride, 0, 0);
        leftLegRef.current.rotation.set(-stride, 0, 0);
        rightLegRef.current.rotation.set(stride, 0, 0);
      } else if (isDashing.current) {
        // Supersonic Dash aerodynamic streamline pose
        leftArmRef.current.rotation.set(1.4, 0, -0.4);
        rightArmRef.current.rotation.set(1.4, 0, 0.4);
        leftLegRef.current.rotation.set(0.3, 0, -0.2);
        rightLegRef.current.rotation.set(0.3, 0, 0.2);
      } else if (isParabolicFlight.current) {
        // Acrobatic parabolic apex soaring pose
        leftArmRef.current.rotation.set(-1.8, 0, -0.5);
        rightArmRef.current.rotation.set(-1.8, 0, 0.5);
        leftLegRef.current.rotation.set(0.6, 0, -0.2);
        rightLegRef.current.rotation.set(0.9, 0, 0.2);
      } else if (isSwinging.current) {
        // Right hand up holding web, legs trailed
        rightArmRef.current.rotation.set(-2.7, 0, 0.3);
        leftArmRef.current.rotation.set(0.5, 0, -0.5);
        leftLegRef.current.rotation.set(0.8, 0, 0);
        rightLegRef.current.rotation.set(1.2, 0, 0);
      } else if (isAttacking.current) {
        rightArmRef.current.rotation.set(-1.6, 0.8, 0);
        leftArmRef.current.rotation.set(0.8, 0, 0);
        rightLegRef.current.rotation.set(-1.2, 0, 0);
        leftLegRef.current.rotation.set(0, 0, 0);
      } else if (isGrounded && speed > 0.5) {
        const isBackpedaling = controls.backward && !controls.forward;
        const dirMult = isBackpedaling ? -1 : 1;
        // Faster gait frequency during sprint vs walking
        const runFreq = controls.sprint ? speed * 0.45 : speed * 0.55;
        const armAmp = controls.sprint ? 1.2 : 0.75;
        const legAmp = controls.sprint ? 1.4 : 0.85;
        const armSwing = Math.sin(clock * runFreq) * armAmp * dirMult;
        const legSwing = Math.sin(clock * runFreq) * legAmp * dirMult;
        leftArmRef.current.rotation.set(armSwing, 0, 0);
        rightArmRef.current.rotation.set(-armSwing, 0, 0);
        leftLegRef.current.rotation.set(-legSwing, 0, 0);
        rightLegRef.current.rotation.set(legSwing, 0, 0);
      } else if (!isGrounded) {
        // Airborne jump / dive pose
        leftArmRef.current.rotation.set(-1.2, 0, 0);
        rightArmRef.current.rotation.set(-1.2, 0, 0);
        leftLegRef.current.rotation.set(0.5, 0, 0);
        rightLegRef.current.rotation.set(0.5, 0, 0);
      } else {
        // Idle breathing
        const breathe = Math.sin(clock * 2) * 0.08;
        leftArmRef.current.rotation.set(breathe, 0, 0);
        rightArmRef.current.rotation.set(breathe, 0, 0);
        leftLegRef.current.rotation.set(0, 0, 0);
        rightLegRef.current.rotation.set(0, 0, 0);
      }
    }

    // Update Web Line Geometry
    if (webMeshRef.current) {
      if (webTarget) {
        const wristWorld = pos.current.clone().add(new THREE.Vector3(0.35, 1.8, -0.3).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY.current));
        const distance = wristWorld.distanceTo(webTarget);
        webMeshRef.current.position.copy(wristWorld).lerp(webTarget, 0.5);
        webMeshRef.current.scale.set(1, distance, 1);
        const dir = webTarget.clone().sub(wristWorld).normalize();
        webMeshRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        webMeshRef.current.visible = true;
      } else {
        webMeshRef.current.visible = false;
      }
    }

    // Send position, speed, rotation and parkour state to HUD & Camera
    const totalSpeedMph = Math.round(vel.current.length() * 2.23);
    onPositionUpdate(
      [pos.current.x, pos.current.y, pos.current.z],
      totalSpeedMph,
      isSwinging.current,
      rotY.current,
      parkourState.current,
      [parkourWallNormal.current.x, parkourWallNormal.current.y, parkourWallNormal.current.z]
    );
  });

  return (
    <>
      {/* 3D Dynamic Spider-Man Rig */}
      <group ref={characterRef} position={[0, 0, 0]}>
        {/* Facing forward into the world (showing back to third-person camera by default) */}
        <group rotation={[0, Math.PI, 0]}>
          {/* Torso */}
          <mesh position={[0, 1.35, 0]} castShadow>
            <boxGeometry args={[0.7, 0.85, 0.45]} />
            <meshStandardMaterial
              color={suitColors.primary}
              roughness={suitColors.roughness}
              metalness={suitColors.metalness}
            />
          </mesh>

          {/* Chest Spider Emblem */}
          <mesh position={[0, 1.45, 0.235]}>
            <planeGeometry args={[0.34, 0.34]} />
            <meshBasicMaterial color={suitColors.emblem} side={THREE.DoubleSide} transparent opacity={0.95} />
          </mesh>

          {/* Back Spider Emblem */}
          <mesh position={[0, 1.45, -0.235]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.36, 0.36]} />
            <meshBasicMaterial color={suitColors.backEmblem} side={THREE.DoubleSide} transparent opacity={0.9} />
          </mesh>

          {/* Subtle 3D Web lattice highlights on chest */}
          <mesh position={[0, 1.35, 0.232]}>
            <planeGeometry args={[0.62, 0.78]} />
            <meshBasicMaterial color={suitColors.webColor} wireframe transparent opacity={0.35} />
          </mesh>

          {/* Head & Mask */}
          <group position={[0, 2.05, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.35, 20, 20]} />
              <meshStandardMaterial
                color={suitColors.primary}
                roughness={suitColors.roughness}
                metalness={suitColors.metalness}
              />
            </mesh>

            {/* Webbing Grid on Mask */}
            <mesh>
              <sphereGeometry args={[0.355, 12, 12]} />
              <meshBasicMaterial color={suitColors.webColor} wireframe transparent opacity={0.25} />
            </mesh>

            {/* Eyes: Expressive Angled Lenses with Custom Frame Colors */}
            {/* Right Eye */}
            <group position={[0.13, 0.05, 0.31]} rotation={[0, 0.25, -0.2]}>
              {/* Outer Frame */}
              <mesh position={[0, 0, -0.002]}>
                <planeGeometry args={[0.21, 0.15]} />
                <meshBasicMaterial color={suitColors.eyeFrame} />
              </mesh>
              {/* Inner Lens */}
              <mesh position={[0, 0, 0.002]}>
                <planeGeometry args={[0.17, 0.11]} />
                <meshBasicMaterial color={suitColors.eyes} />
              </mesh>
            </group>

            {/* Left Eye */}
            <group position={[-0.13, 0.05, 0.31]} rotation={[0, -0.25, 0.2]}>
              {/* Outer Frame */}
              <mesh position={[0, 0, -0.002]}>
                <planeGeometry args={[0.21, 0.15]} />
                <meshBasicMaterial color={suitColors.eyeFrame} />
              </mesh>
              {/* Inner Lens */}
              <mesh position={[0, 0, 0.002]}>
                <planeGeometry args={[0.17, 0.11]} />
                <meshBasicMaterial color={suitColors.eyes} />
              </mesh>
            </group>
          </group>

          {/* Left Arm */}
          <group ref={leftArmRef} position={[-0.45, 1.65, 0]}>
            <mesh position={[0, -0.4, 0]} castShadow>
              <boxGeometry args={[0.22, 0.75, 0.22]} />
              <meshStandardMaterial
                color={suitColors.primary}
                roughness={suitColors.roughness}
                metalness={suitColors.metalness}
              />
            </mesh>
            {/* Wrist Web Shooter */}
            <mesh position={[0, -0.7, 0.1]}>
              <boxGeometry args={[0.12, 0.1, 0.1]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
            </mesh>
          </group>

          {/* Right Arm (Shooting Arm) */}
          <group ref={rightArmRef} position={[0.45, 1.65, 0]}>
            <mesh position={[0, -0.4, 0]} castShadow>
              <boxGeometry args={[0.22, 0.75, 0.22]} />
              <meshStandardMaterial
                color={suitColors.primary}
                roughness={suitColors.roughness}
                metalness={suitColors.metalness}
              />
            </mesh>
            {/* Wrist Web Shooter */}
            <mesh position={[0, -0.7, 0.1]}>
              <boxGeometry args={[0.12, 0.1, 0.1]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
            </mesh>
          </group>

          {/* Waist & Hips */}
          <mesh position={[0, 0.85, 0]}>
            <boxGeometry args={[0.65, 0.3, 0.42]} />
            <meshStandardMaterial
              color={suitColors.secondary}
              roughness={suitColors.roughness}
              metalness={suitColors.metalness}
            />
          </mesh>

          {/* Left Leg */}
          <group ref={leftLegRef} position={[-0.2, 0.7, 0]}>
            <mesh position={[0, -0.45, 0]} castShadow>
              <boxGeometry args={[0.25, 0.85, 0.25]} />
              <meshStandardMaterial
                color={suitColors.secondary}
                roughness={suitColors.roughness}
                metalness={suitColors.metalness}
              />
            </mesh>
            {/* Boot */}
            <mesh position={[0, -0.85, 0.04]} castShadow>
              <boxGeometry args={[0.26, 0.25, 0.35]} />
              <meshStandardMaterial
                color={suitColors.primary}
                roughness={suitColors.roughness}
                metalness={suitColors.metalness}
              />
            </mesh>
          </group>

          {/* Right Leg */}
          <group ref={rightLegRef} position={[0.2, 0.7, 0]}>
            <mesh position={[0, -0.45, 0]} castShadow>
              <boxGeometry args={[0.25, 0.85, 0.25]} />
              <meshStandardMaterial
                color={suitColors.secondary}
                roughness={suitColors.roughness}
                metalness={suitColors.metalness}
              />
            </mesh>
            {/* Boot */}
            <mesh position={[0, -0.85, 0.04]} castShadow>
              <boxGeometry args={[0.26, 0.25, 0.35]} />
              <meshStandardMaterial
                color={suitColors.primary}
                roughness={suitColors.roughness}
                metalness={suitColors.metalness}
              />
            </mesh>
          </group>
        </group>
      </group>

      {/* Dynamic 3D Volumetric Web Strand in World Space */}
      <mesh ref={webMeshRef} visible={false}>
        <cylinderGeometry args={[0.08, 0.08, 1, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#e0f2fe"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
    </>
  );
}
