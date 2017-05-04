/**
 * 端口相关 适用于Windows、Unix
 * Created by uv-w on 2017/5/2.
 **/
const net = require('net')
const utils = require('./utils')
const log = console.log

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
    return reject(e)
  }

});

//处理命令返回信息
const parseStdout = (stdout) => {
  let pid = -1
  if(!stdout.failed){
    stdout = stdout.stdout.split('\n')
    stdout
    .forEach(function (line) {
      line = line.trim().split(/\s+/);//通过空格截取每个标志字符
      if (utils.is_window) {//windows平台通常的PID所处位置是第5位
        pid = line && line[2] && !~line[2].indexOf(':' + _port) ? line[4] : ''
      } else {//Mac平台一般第2位是PID
        pid = line[0] == 'node' ? line[1] : ''
      }
    })
  }
  return Number(pid)
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
    return Promise.reject('[error]: ' + e)
  }
}

const getPortsPids = (ports) => {
  try {
    ports = utils._.isArray(ports) ? ports : [ ports ]
    let checkPromiseArr = []
    ports.forEach((port) => {
      if(!utils.validate_port(port)){
        throw  utils.build_port_msg(port)
      }
      let command = utils.is_window ? 'netstat -ano | findstr "' + port + '"' :
                                      'lsof -i:' + port
      checkPromiseArr.push(
        new Promise((resolve, reject) => {
          utils.execa.shell(command)
          .then(result => resolve(result))
          .catch(err => resolve(err))
        })
      )
    })
    return Promise.all(checkPromiseArr).then(result => {
      return result.map( _result => parseStdout(_result))
    })
  } catch (e) {
    return Promise.reject('[error]: ' + e)
  }
}

module.exports  = {
  getPort
  ,killPorts
  ,getPortsPids
}
