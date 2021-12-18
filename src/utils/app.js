/*
 * @Author: your name
 * @Date: 2021-11-29 11:08:38
 * @LastEditTime: 2021-12-18 20:27:44
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /maizhen-electron/src/utils/app.js
 */

// 参考 REST Client
// https://docs.feathersjs.com/api/client/rest.html#feathersjs-rest-client

const feathers = require('@feathersjs/feathers');
const rest = require('@feathersjs/rest-client');

const feathersClient = feathers();

// // Connect to the same as the browser URL (only in the browser)
// const restClient = rest();

// Connect to a different URL
const port = 3030
const host = `http://localhost:${port}`
const restClient = rest(host)

// Configure an AJAX library (see below) with that client 
feathersClient.configure(restClient.fetch(window.fetch));

// Connect to the `http://feathers-api.com/messages` service

feathersClient.service('pics')

export default feathersClient