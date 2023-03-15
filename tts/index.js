const fn = require('@jambonz/speech-utils');
const config = require('config');
const opts = config.get('redis');
const logger = require('pino')();
const {deleteFilesWithPrefix} = require('../utils');

const stats = {
  increment: () => {
  },
  histogram: () => {
  },
};


const {purgeTtsCache, synthAudio} = fn(opts, logger);

(async () => {
  // Clean env
  await purgeTtsCache();
  deleteFilesWithPrefix('/tmp', 'tts-');

  const sampleText = 'If this is a medical emergency, please hang up and dial 9 1';
  const ttsConfig = config.get('tts');

  for(let i = 1; i <= 100; i++) {
    await synthAudio(stats, {
      vendor: ttsConfig.vendor,
      credentials: {
        api_key: ttsConfig.api_key,
        region: ttsConfig.region,
      },
      language: ttsConfig.language,
      voice: ttsConfig.voice,
      text: `${sampleText} ${i}`,
    });
  }
})();
