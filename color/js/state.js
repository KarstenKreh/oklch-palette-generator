// ================================================================
//  Shared application state
// ================================================================

export const state = {
  currentMode: 'balanced',
  chromaScale: 0.25,
  bgColorHex: '#335A7F',
  bgAutoMatch: true,
  errorColorHex: '#CC3333',
  errorAutoMatch: true,
  extraAccents: [],
  brandPin: false,
  errorPin: false,
  toastTimer: null,
};

// Late-binding callback to avoid circular dependency with generate()
export let regenerate = () => {};
export function setRegenerateCallback(fn) { regenerate = fn; }
