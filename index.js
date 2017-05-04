/**
 * 端口相关 适用于Windows、Unix
 * Created by uv-w on 2017/5/2.
 **/
const net = require('net')
const utils = require('./utils')

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
  if(!stdout.failed){
    if(utils.is_window){
      stdout = stdout.stdout.split('\n')
      stdout
      .forEach(function (line) {
        line = line.trim().split(/\s+/);//通过空格截取每个标志字符
        //pid = line && line[2] && !~line[2].indexOf(':' + _port) ? line[4] : ''
        pid = line ? line[4] : ''
      })
    }else{
      pid = stdout.stdout || -1
    }
  }
  return Number(pid)
}

//
const getPortsPids = (ports) => {
  ports = utils._.isArray(ports) ? ports : [ ports ]
  let checkPromiseArr = []
  ports.forEach((port) => {
    if(utils.validate_port(port)){
      let command = utils.is_window
                    ? 'netstat -ano | findstr ":' + port + '" | findstr "LISTENING"'
                    : 'lsof -i:' + port + ' | grep LISTEN | awk \'{print $2}\''

      checkPromiseArr.push(utils.execa.shell(command))
    }else{
      checkPromiseArr.push(Promise.resolve(-1))
    }
  })
  return Promise.all(checkPromiseArr)
                .then(result => {
                  return result.map( _result => parseStdout(_result))
                })

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

//getPortsPids([3000, -1, 3001, 'ss', '3044']).then(pids => utils.log(pids))
//getRandomPort(3000).then(port => utils.log(port)).catch(err => utils.log(err, 'error'))
//getPort(3001, true).then(port => utils.log(port))
//killPorts([3000, 3001]).then(pids => utils.log(pids))

module.exports  = {
  getPort
  ,killPorts
  ,getPortsPids
}
