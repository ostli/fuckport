# fuckport
处理关于端口的诸多相关！Promise\ES6

#接口
~~~~
npm i --save fuckport

const fuckport = require('fuckport')

#获取一个随机可用的端口
funckport.getPort().then(port => console.log(port))

#获取一个可用端口，优先返回传入的端口（如果已被占用则返回一个随机可用端口）
funckport.getPort(8080).then(port => console.log(port))

#获取一个可用端口，返回传入的端口(如果占用中则kill掉)
funckport.getPort(8080, true).then(port => console.log(port))

#获取一组端口的对应pid信息，返回pid数组
funckport.getPortsPids([8080, 8089, 3000]]).then(pids => console.log(pids))

#解除一组端口的占用 返回pid数组
funckport.killPorts([8080, 8089, 3000]]).then(result => console.log(result))
~~~~
