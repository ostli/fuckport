/**
 * http://mochajs.org/
 * http://www.ruanyifeng.com/blog/2015/12/a-mocha-tutorial-of-examples.html
 **/
const fuckport = require('../index.js')
const expect = require('chai').expect
const assert = require('chai').assert
const net = require('net')

describe('fuckport test', () => {

  let test_port = 3000
  // beforeEach((done) => {
  //   const server = net.createServer()
  //   server.listen(0, () => {
  //     test_port = server.address().port;
  //     done();
  //   });
  // })
  //
  // afterEach((done) => {
  //   //console.log('test_port: '+ test_port)
  //   fuckport.killPorts(test_port).then(() => done())
  // })

  //maybe 3000 or others
  it('Get an available port', () => fuckport.getPort(test_port).then( port => expect(port).to.be.an('number')))

  //3000
  it('Get an expected port', () => fuckport.getPort(test_port, true).then( port => expect(port).to.be.equal(test_port)))

  it('Kill a port', () => fuckport.killPorts(test_port).then( PIDs => expect(PIDs).to.be.an('array')))

  it('Kill a lot of port', () => fuckport.killPorts([test_port, 8080]).then( PIDs => expect(PIDs).to.be.an('array')))

  it('Get a lot of PID through the specified ports', () => fuckport.getPortsPids([test_port, 8080]).then( PIDs => expect(PIDs).to.be.an('array')))

});
