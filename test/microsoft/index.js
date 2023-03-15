const test = require('tape').test ;
const fn = require('@jambonz/speech-utils');
const config = require('config');
const opts = config.get('redis');
const logger = require('pino')();
const {getAudioDuration, deleteFilesWithPrefix} = require('../utils');
const LOOP = 100;

const stats = {
  increment: () => {
  },
  histogram: () => {
  },
};


test('Starting Microsoft', async (t) => {
  const {purgeTtsCache, synthAudio, client} = fn(opts, logger);

  await purgeTtsCache();
  deleteFilesWithPrefix('/tmp', 'tts-');

  const sampleText = 'If this is a medical emergency, please hang up and dial 9 1';
  const expectedDuration = 5.3;

  for(let i = 1; i <= LOOP; i++) {
    let opts = await synthAudio(stats, {
      vendor: 'microsoft',
      credentials: {
        api_key: process.env.MICROSOFT_API_KEY,
        region: process.env.MICROSOFT_REGION,
      },
      language: 'en-US',
      voice: 'en-US-AriaNeural',
      text: `${sampleText} ${i}`,
    });
    
    const duration = await getAudioDuration(opts.filePath);
    t.ok(Math.abs(duration - expectedDuration) < 0.5, `expected ${opts.filePath} duration: ${duration} to be close to ${expectedDuration}`)
  }


  t.end();
});