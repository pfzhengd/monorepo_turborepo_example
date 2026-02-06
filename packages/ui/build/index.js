const { exec } = require('child_process')
const { logger } = require('./utils');
(async () => {
  function clean () {
    return new Promise((resolve, reject) => {
      logger.info('开始清理旧文件夹。。。')
      exec('npm run clean', (err) => {
        if (err) {
          logger.error('清理出现了错误 ', err)
          reject(err)
        } else {
          logger.info('清理成功。')
          resolve(true)
        }
      })
    })
  }

  function setEnv () {
    logger.info('开始设置环境变量。。。')
    process.env.NODE_ENV = 'production'
  }

  function buildPackage () {
    return new Promise((resolve, reject) => {
      logger.info('开始构建包。。。')
      exec('npx rollup -c', (err) => {
        if (err) {
          logger.error('构建包出现了错误 ', err)
          reject(err)
        } else {
          logger.info('构建包成功。')
          resolve(true)
        }
      })
    })
  }
  await clean()
  await setEnv()
  await buildPackage()
})()
