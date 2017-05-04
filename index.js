/**
 * 端口相关 适用于Windows、Unix
 * Created by uv-w on 2017/5/2.
 **/
const net = require('net')
const cli_color = require('cli-color')
const _ = require('lodash')
const exec = require('child_process').exec

const utils = {
  is_window: process.platform == 'win32'
  ,validate_port: port => /^(0|[1-9]\d*)$/.test(port) && port <= 65535
  ,build_port_msg: port => 'Param ' + port + ' is not a valid port!'
  ,log: (msg, type) => console.log(cli_color[ type == 'error'
                                                    ? 'red'
                                                    : 'blue' ](msg))
  ,exe_shell: (command) => {
    return new Promise((resolve, reject) => {
      exec(command, (err, stdout) => {
        if(err){
          return reject(err)
        }
        resolve(stdout)
      })
    })
  }
}

//获取一个随机的可用端口
const getRandomPort = (port) => new Promise((resolve, reject) => {
  try {
    const server = net.createServer()
    server.unref()
    .on('error', reject)
    .listen(port || 0, () => {
      const _port = server.address().port
      server.close(() => resolve(_port))
    });
  } catch (e) {
    reject(e)
  }

});

//处理命令返回信息
const parseStdout = (stdout) => {
  let pid = -1
  if(stdout && stdout != -1){
    if(utils.is_window){
      stdout = String(stdout).split('\n')
      stdout.forEach(function (line) {
        line = line.trim().split(/\s+/);//通过空格截取每个标志字符
        if(line.length == 5){
          pid = line[4]
        }
      })
    }else{
      pid = stdout || -1
    }
  }
  return Number(pid)
}

//
const getPortsPids = (ports) => {
  ports = _.isArray(ports) ? ports : [ ports ]
  let checkPromiseArr = []
  ports.forEach((port) => {
    if(utils.validate_port(port)){
      let command = utils.is_window
                    ? 'netstat -ano | findstr ":' + port + '" | findstr "LISTENING"'
                    : 'lsof -i:' + port + ' | grep LISTEN | awk \'{print $2}\''

      checkPromiseArr.push(utils.exe_shell(command).catch( err => -1))
    }else{
      checkPromiseArr.push(Promise.resolve(-1))
    }
  })
  return Promise.all(checkPromiseArr)
                .then(result => result.map( _result => parseStdout(_result)))
                .catch(err => err)

}

const killPorts = (ports) => {
  try {
    return getPortsPids(ports)
    .then(pids => {
      pids.forEach( pid => {
        pid > 0 ? process.kill(pid) : ''
      })
      return Promise.resolve(pids)
    })
    .catch(err => {
      throw err
    })

  } catch (e) {
    return Promise.reject(e)
  }
}

/**
 *返回一个可用的端口
 *@param port 如果提供一个端口，则尽可能返回这个端口，否则返回一个随机可用端口
 *@param must 如果为true，则检查提供的端口是否被占用，占用则杀掉
 **/
const getPort = (port, must) => {
  if(must === true){
    if(!utils.validate_port(port)){
      return Promise.reject(utils.build_port_msg(port))
    }
    return killPorts(port).then(pid => port).catch(err => err)
  }else{
    return getRandomPort(port).catch(() => getRandomPort())
  }
}

//getPortsPids([3000, -1, 3001, 'ss', '3044']).then(pids => utils.log(pids, 'error'))
//getRandomPort(30001).then(port => utils.log(port)).catch(err => utils.log(err, 'error'))
//getPort(3000, true).then(port => utils.log(port))
//killPorts([3000, 3001]).then(pids => utils.log(pids))

module.exports  = {
  getPort
  ,killPorts
  ,getPortsPids
}
