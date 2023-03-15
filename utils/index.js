const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');

const fs = require('fs');
const path = require('path');

function deleteFilesWithPrefix(directoryPath, prefix) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Error while reading directory:', err);
      return;
    }
    for (const file in files) {
      if (file.startsWith(prefix)) {
        const filePath = path.join(directoryPath, file);
        fs.unlinkSync(filePath);
      }
    }
  });
}

async function getAudioDuration(filePath) {
  try {
    const {streams:[ret]} = await ffprobe(filePath, { path: ffprobeStatic.path });
    return ret.duration;
  } catch (err) {
    console.error('Error while getting duration:', err);
    return null;
  }
}

module.exports = { getAudioDuration, deleteFilesWithPrefix }