/**
 * http://mochajs.org/
 * http://www.ruanyifeng.com/blog/2015/12/a-mocha-tutorial-of-examples.html
 **/
const fuckport = require('../index.js')
const expect = require('chai').expect
const assert = require('chai').assert
const net = require('net')

describe('Fuckport test', () => {

  let test_port = 3000

  //=>an invalid msg
  it('Get an invalid expected port', () => fuckport.getPort(-1, true).catch( invalid_msg => expect( invalid_msg ).to.be.an( 'string' )))

  //=>an available port
  it('Get an random port', () => fuckport.getPort().then( port => expect( port ).to.be.an( 'number' )))

  //=>maybe 3000 or others
  it('Get an available port', () => fuckport.getPort( test_port ).then( port => expect( port ).to.be.an( 'number' )))

  //=>3000
  it('Get an expected port', () => fuckport.getPort( test_port, true ).then( port => expect(port).to.be.equal(test_port)))

  //=>[-1 or other pid,...]
  it('Kill a port', () => fuckport.killPorts( test_port ).then( PIDs => expect( PIDs ).to.be.an( 'array' )))

  //=>[pid, other pid,...]
  it('Kill a lot of port', () => fuckport.killPorts( [test_port, 8080] ).then( PIDs => expect( PIDs ).to.be.an( 'array' )))

  //=>[-1] or [other pid]...
  it('Get a PID of specified port', () => fuckport.getPortsPids( test_port ).then( PIDs => expect(PIDs).to.be.an('array')))

  //=>[-1, other pid,...]
  it('Get a lot of PIDs through the specified ports', () => fuckport.getPortsPids( [test_port, 8080] ).then( PIDs => expect( PIDs ).to.be.an( 'array' )))

});
