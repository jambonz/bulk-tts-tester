require('./docker_start');
const scenario = process.env.TEST_SCENARIO || 'microsoft';
require(`./${scenario}`)
require('./docker_stop');