const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Avoid Metro trying to read a fake file path like "<anonymous>" during symbolication on web
config.symbolicator = {
  customizeFrame: (frame) => {
    if (!frame || !frame.file) return frame;
    if (frame.file.includes('<anonymous>')) {
      return { ...frame, collapse: true };
    }
    return frame;
  },
};

module.exports = config;
