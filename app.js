const config = require('config');
const opts = config.get('redis');
const logger = require('pino')({level: 'info'});
const nologger = {error: () => {}, info: () => {}, debug: () => {}};
const {deleteFilesWithPrefix} = require('./utils');
const {stat} = require('fs').promises;
const stats = {increment: () => {}, histogram: () => {}};


const {purgeTtsCache, synthAudio} = require('@jambonz/speech-utils')(opts, logger);

const dev = (arr) => {
  // Creating the mean with Array.reduce
  let mean = arr.reduce((acc, curr)=>{
    return acc + curr
  }, 0) / arr.length;
   
  // Assigning (value - mean) ^ 2 to every array item
  arr = arr.map((k)=>{
    return (k - mean) ** 2
  })
   
  // Calculating the sum of updated array
 let sum = arr.reduce((acc, curr)=> acc + curr, 0);
  
 // Calculating the variance
 let variance = sum / arr.length
  
 // Returning the standard deviation
 return Math.sqrt(sum / arr.length)
}

const doIt = async() => {
  // Clean env
  //await purgeTtsCache();
  /* clear out any existing tts files */
  deleteFilesWithPrefix('/tmp', 'tts-');

  const sampleText = 'If this is a medical emergency, please hang up and dial 9 1 1.';
  const ttsConfig = config.get('tts');
  let min, max, minPath, maxPath;
  const lengths = [];

  for (let i = 1; i <= ttsConfig.loop; i++) {
    const {filePath, servedFromCache, rtt} = await synthAudio(stats, {
      disableTtsCache: true,
      vendor: ttsConfig.vendor,
      credentials: {
        api_key: ttsConfig.api_key,
        region: ttsConfig.region,
      },
      language: ttsConfig.language,
      voice: ttsConfig.voice,
      text: ttsConfig.sampleText
    });
    const {size} = await stat(filePath);
    lengths.push(size);
    if (size < min || typeof min === 'undefined') {
      min = size;
      minPath = filePath;
    }
    if (size > max || typeof max === 'undefined') {
      max = size;
      maxPath = filePath;
    }
    logger.info({filePath, servedFromCache, rtt}, `synthesized audio ${i}, ${size} bytes`);
  }
  logger.info('done');
  logger.info({minPath, maxPath}, `size range: ${min} - ${max}`);
  logger.info(`std dev: ${dev(lengths)}`);
  process.exit(0);
};

doIt();
