# fuckport [![stable](http://badges.github.io/stability-badges/dist/stable.svg)](https://github.com/uv-w/fuckport)
获取可用端口、杀端口等常用操作！

[![NPM version](https://badge.fury.io/js/badge-list.svg)](https://github.com/uv-w/fuckport)

## Rationale

* `lsof -i :<port>` for Unix
* `netstat -ano|findstr "<port>"` for Windows
## Installation
	$ npm i --save fuckport

## Usage
```js

const fuckport = require('fuckport')

//获取一个随机可用的端口
funckport.getPort().then(port => console.log(port))
//=>eg: 3000

//获取一个可用端口，优先返回传入的端口（如果已被占用则返回一个随机可用端口）
funckport.getPort(8080).then(port => console.log(port))
//=>eg: 8080 or 3000 ...

//获取一个可用端口，返回传入的端口(如果占用中则kill掉)
funckport.getPort(8080, true).then(port => console.log(port))
//=>eg: 8080

//获取一组端口的对应pid信息，返回pid数组(未被占用返回-1)
funckport.getPortsPids([8080, 8089, 3000]]).then(pids => console.log(pids))
//=>eg: [43533, -1, 34556]


//解除一组端口的占用 返回pid数组
funckport.killPorts([8080, 8089, 3000]]).then(pids => console.log(pids))
//=>eg: [ -1, -1, 536 ]
```
