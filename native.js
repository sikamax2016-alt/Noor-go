// Browser fallback. The Android workflow replaces www/native.js with the bundled native bridge.
window.NATIVE = window.NATIVE || {
  on: false,
  async phone() {
    throw new Error('Native phone authentication is only available in the Android app.');
  },
  async push() {
    return null;
  },
  async watchLocation() {
    return null;
  },
  async stopLocation() {
    return null;
  }
};
