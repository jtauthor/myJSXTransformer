/**
 * Created by tengfei.ma on 2016/7/14.
 */

let fs = require('fs');
let transform = require('./transformer.js');

let content = fs.readFileSync("./test.jsx","utf-8");
let outContent = transform(content);
console.log(outContent);
fs.writeFileSync("./out.js",outContent,"utf-8");