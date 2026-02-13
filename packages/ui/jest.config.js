module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // node | jsdom
  snapshotSerializers: [],
  setupFiles: ['./test/setup.js']
}
