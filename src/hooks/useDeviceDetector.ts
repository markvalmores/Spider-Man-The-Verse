import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  detectDevice,
  detectControllerBrand,
  getControllerGlyphs,
  getActiveGamepad,
  DeviceInfo,
  ControllerBrand,
  ControllerInfo,
} from '../utils/deviceDetector';

const TOUCH_LAYOUT_KEY = 'spiderman_touch_layout';

export function useDeviceDetector() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(detectDevice);
  const [preferredLayout, setPreferredLayout] = useState<ControllerBrand>(() => {
    try {
      const saved = localStorage.getItem(TOUCH_LAYOUT_KEY);
      return (saved as ControllerBrand) || 'playstation';
    } catch {
      return 'playstation';
    }
  });

  const [gamepadState, setGamepadState] = useState<ControllerInfo>({
    connected: false,
    id: '',
    brand: preferredLayout,
    brandLabel: 'Touch / Virtual Controls',
    buttonCount: 0,
    axesCount: 0,
    hasVibration: false,
    buttonGlyphs: getControllerGlyphs(preferredLayout),
  });

  // Re-detect on window resize / orientation change
  useEffect(() => {
    const handleResize = () => setDeviceInfo(detectDevice());
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Poll Gamepad
  useEffect(() => {
    let animId: number;

    const checkGamepad = () => {
      const gp = getActiveGamepad();
      if (gp && gp.connected) {
        const brand = detectControllerBrand(gp);
        let brandLabel = 'Universal Gamepad';
        if (brand === 'playstation') brandLabel = gp.id.includes('DualSense') ? 'PS5 DualSense Controller' : 'PlayStation DualShock Controller';
        else if (brand === 'xbox') brandLabel = 'Xbox Wireless Controller';
        else if (brand === 'nintendo') brandLabel = 'Nintendo Switch Controller';
        else if (brand === 'numeric') brandLabel = 'Arcade / Generic USB Controller';

        const hasVibration = 'vibrationActuator' in gp || 'hapticActuators' in gp;

        setGamepadState({
          connected: true,
          id: gp.id,
          brand,
          brandLabel,
          buttonCount: gp.buttons.length,
          axesCount: gp.axes.length,
          hasVibration: Boolean(hasVibration),
          buttonGlyphs: getControllerGlyphs(brand),
        });
      } else {
        setGamepadState((prev) => {
          if (!prev.connected && prev.brand === preferredLayout) return prev;
          return {
            connected: false,
            id: '',
            brand: preferredLayout,
            brandLabel: 'Touch / On-Screen Controls',
            buttonCount: 0,
            axesCount: 0,
            hasVibration: false,
            buttonGlyphs: getControllerGlyphs(preferredLayout),
          };
        });
      }

      animId = requestAnimationFrame(checkGamepad);
    };

    animId = requestAnimationFrame(checkGamepad);

    const onConnected = () => checkGamepad();
    const onDisconnected = () => checkGamepad();

    window.addEventListener('gamepadconnected', onConnected);
    window.addEventListener('gamepaddisconnected', onDisconnected);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('gamepadconnected', onConnected);
      window.removeEventListener('gamepaddisconnected', onDisconnected);
    };
  }, [preferredLayout]);

  const setTouchLayout = useCallback((layout: ControllerBrand) => {
    setPreferredLayout(layout);
    try {
      localStorage.setItem(TOUCH_LAYOUT_KEY, layout);
    } catch {
      // Ignore
    }
  }, []);

  const triggerVibration = useCallback((durationMs: number = 100, strong: number = 0.5, weak: number = 0.3) => {
    // 1. Controller Haptic Actuator
    const gp = getActiveGamepad();
    if (gp && 'vibrationActuator' in gp && (gp as any).vibrationActuator) {
      try {
        (gp as any).vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: durationMs,
          weakMagnitude: weak,
          strongMagnitude: strong,
        });
      } catch {
        // Fallback
      }
    }
    // 2. Mobile Device Vibration API
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(durationMs);
      } catch {
        // Ignore
      }
    }
  }, []);

  return {
    deviceInfo,
    gamepadState,
    preferredLayout,
    setTouchLayout,
    triggerVibration,
    glyphs: useMemo(() => {
      return gamepadState.connected
        ? gamepadState.buttonGlyphs
        : getControllerGlyphs(preferredLayout);
    }, [gamepadState.connected, gamepadState.buttonGlyphs, preferredLayout]),
  };
}
