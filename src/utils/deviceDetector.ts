// Universal Device & Controller Detector API

export type DeviceType = 'mobile_phone' | 'mobile_tablet' | 'desktop' | 'meta_quest' | 'console';

export type ControllerBrand = 'playstation' | 'xbox' | 'nintendo' | 'numeric' | 'generic';

export interface DeviceInfo {
  type: DeviceType;
  label: string;
  os: string;
  browser: string;
  isTouch: boolean;
  isMetaQuest: boolean;
  questModel?: 'Quest 1' | 'Quest 2' | 'Quest 3' | 'Quest Pro' | 'Generic Quest';
  supportsWebXR: boolean;
  screenResolution: string;
}

export interface ControllerInfo {
  connected: boolean;
  id: string;
  brand: ControllerBrand;
  brandLabel: string;
  buttonCount: number;
  axesCount: number;
  hasVibration: boolean;
  buttonGlyphs: {
    confirm: string; // Jump (PS: ✕, Xbox: A, Num: 1)
    cancel: string;  // Slam / Crouch (PS: ◯, Xbox: B, Num: 2)
    attack: string;  // Attack (PS: ▢, Xbox: X, Num: 3)
    special: string; // Zip (PS: △, Xbox: Y, Num: 4)
    stick: string;   // Wall Stick / Crawl (PS: L1, Xbox: LB, Num: L1)
    sprint: string;  // Sprint / Wall-Run (PS: R1, Xbox: RB, Num: R1)
    acrobat: string; // Acrobat / Somersault (PS: L2, Xbox: LT, Num: L2)
    swing: string;   // Web Swing (PS: R2, Xbox: RT, Num: R2)
    camera: string;  // Cam Mode (PS: R3, Xbox: RS, Num: R3)
  };
}

// 1. Device Detector
export function detectDevice(): DeviceInfo {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const maxTouchPoints = typeof navigator !== 'undefined' ? navigator.maxTouchPoints || 0 : 0;
  const isTouch = maxTouchPoints > 0 || (typeof window !== 'undefined' && 'ontouchstart' in window);

  // Meta Quest VR Headset Detection
  const isOculus = /OculusBrowser|Quest/i.test(ua);
  let questModel: DeviceInfo['questModel'] | undefined;
  if (isOculus) {
    if (/Quest 3/i.test(ua)) questModel = 'Quest 3';
    else if (/Quest 2/i.test(ua)) questModel = 'Quest 2';
    else if (/Quest Pro/i.test(ua)) questModel = 'Quest Pro';
    else if (/Quest/i.test(ua)) questModel = 'Quest 1';
    else questModel = 'Generic Quest';
  }

  // OS Detection
  let os = 'Unknown OS';
  if (/Windows/i.test(ua)) os = 'Windows PC';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/iPhone|iPod/i.test(ua)) os = 'iOS (iPhone)';
  else if (/iPad/i.test(ua)) os = 'iPadOS (Tablet)';
  else if (/Android/i.test(ua)) {
    os = /Mobile/i.test(ua) ? 'Android Mobile' : 'Android Tablet';
  } else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/PlayStation/i.test(ua)) os = 'PlayStation Browser';
  else if (/Xbox/i.test(ua)) os = 'Xbox Browser';

  // Browser Detection
  let browser = 'Browser';
  if (isOculus) browser = 'Meta Quest Browser (Horizon OS)';
  else if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Google Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Apple Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox';

  // Device Classification
  let type: DeviceType = 'desktop';
  let label = 'Desktop Computer';

  if (isOculus) {
    type = 'meta_quest';
    label = `Meta ${questModel || 'Quest VR Headset'}`;
  } else if (/PlayStation|Xbox/i.test(ua)) {
    type = 'console';
    label = 'Console Browser';
  } else if (/iPad|tablet|PlayBook/i.test(ua) || (isTouch && /Android/i.test(ua) && !/Mobile/i.test(ua))) {
    type = 'mobile_tablet';
    label = 'Tablet Device';
  } else if (/iPhone|Android.*Mobile|Mobile/i.test(ua) || (isTouch && typeof window !== 'undefined' && window.innerWidth < 768)) {
    type = 'mobile_phone';
    label = 'Mobile Smartphone';
  }

  const supportsWebXR = typeof navigator !== 'undefined' && 'xr' in navigator;
  const screenResolution = typeof window !== 'undefined'
    ? `${window.screen.width}x${window.screen.height} (${window.devicePixelRatio || 1}x DPI)`
    : 'Unknown';

  return {
    type,
    label,
    os,
    browser,
    isTouch,
    isMetaQuest: isOculus,
    questModel,
    supportsWebXR,
    screenResolution,
  };
}

// 2. Controller Brand Detector
export function detectControllerBrand(
  gamepad: Gamepad | string | null,
  userPreferredLayout?: ControllerBrand
): ControllerBrand {
  if (userPreferredLayout) return userPreferredLayout;
  if (!gamepad) return 'playstation';

  const id = (typeof gamepad === 'string' ? gamepad : gamepad.id || '').toLowerCase();

  // PlayStation: DualSense (054c:0ce6), DualShock 4 (054c:05c4), "sony", "playstation", "wireless controller"
  if (
    id.includes('dualsense') ||
    id.includes('dualshock') ||
    id.includes('playstation') ||
    id.includes('054c') ||
    id.includes('sony')
  ) {
    return 'playstation';
  }

  // Xbox: XInput, Xbox One, Xbox 360, Xbox Wireless, 045e
  if (
    id.includes('xbox') ||
    id.includes('xinput') ||
    id.includes('045e') ||
    id.includes('microsoft')
  ) {
    return 'xbox';
  }

  // Nintendo Switch
  if (
    id.includes('nintendo') ||
    id.includes('switch') ||
    id.includes('joy-con') ||
    id.includes('057e')
  ) {
    return 'nintendo';
  }

  // Generic / Numeric / Retro / Arcade sticks
  if (
    id.includes('generic') ||
    id.includes('arcade') ||
    id.includes('usb gamepad') ||
    id.includes('2in1') ||
    id.includes('gamepad')
  ) {
    return 'numeric';
  }

  return 'playstation';
}

// 3. Controller Glyphs Generator
export function getControllerGlyphs(brand: ControllerBrand): ControllerInfo['buttonGlyphs'] {
  switch (brand) {
    case 'xbox':
      return {
        confirm: 'A',
        cancel: 'B',
        attack: 'X',
        special: 'Y',
        stick: 'LB',
        sprint: 'RB',
        acrobat: 'LT',
        swing: 'RT',
        camera: 'RS',
      };
    case 'nintendo':
      return {
        confirm: 'B',
        cancel: 'A',
        attack: 'Y',
        special: 'X',
        stick: 'L',
        sprint: 'R',
        acrobat: 'ZL',
        swing: 'ZR',
        camera: 'R3',
      };
    case 'numeric':
      return {
        confirm: '1',
        cancel: '2',
        attack: '3',
        special: '4',
        stick: 'L1',
        sprint: 'R1',
        acrobat: 'L2',
        swing: 'R2',
        camera: 'R3',
      };
    case 'playstation':
    default:
      return {
        confirm: '✕',
        cancel: '◯',
        attack: '▢',
        special: '△',
        stick: 'L1',
        sprint: 'R1',
        acrobat: 'L2',
        swing: 'R2',
        camera: 'R3',
      };
  }
}

// 4. Gamepad Poller & Status Detector
export function getActiveGamepad(): Gamepad | null {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
  const gamepads = navigator.getGamepads();
  for (let i = 0; i < gamepads.length; i++) {
    const gp = gamepads[i];
    if (gp && gp.connected) return gp;
  }
  return null;
}

export function detectConnectedGamepad(): ControllerInfo {
  const gp = getActiveGamepad();
  if (!gp) {
    return {
      connected: false,
      id: 'None',
      brand: 'playstation',
      brandLabel: 'Touch / Keyboard Standard Mode',
      buttonCount: 0,
      axesCount: 0,
      hasVibration: false,
      buttonGlyphs: getControllerGlyphs('playstation'),
    };
  }

  const brand = detectControllerBrand(gp.id);
  const brandLabel =
    brand === 'playstation'
      ? 'PlayStation Wireless Controller (DualSense / DualShock)'
      : brand === 'xbox'
      ? 'Xbox Wireless Controller (XInput)'
      : brand === 'nintendo'
      ? 'Nintendo Switch Controller'
      : 'Generic USB / Numeric Gamepad';

  return {
    connected: true,
    id: gp.id,
    brand,
    brandLabel,
    buttonCount: gp.buttons.length,
    axesCount: gp.axes.length,
    hasVibration: !!gp.vibrationActuator,
    buttonGlyphs: getControllerGlyphs(brand),
  };
}
