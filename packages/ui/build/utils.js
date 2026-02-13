const chalk = require('chalk')
const log = require('@jupiterjs/jupiter-log')
log.config.moduleName = 'Fishpond'
log.config.dateFormatText = 'MM-dd hh:mm:ss'
const logger = {
  info: (msg) => {
    log.info(chalk.green(msg))
  },
  error: (msg, err) => {
    log.error(chalk.red(msg), err)
  }
}
module.exports = {
  getFolderName: function getFolderName () {
    return process.env.TENANT_NAME || 'default'
  },
  logger,
  log
}
