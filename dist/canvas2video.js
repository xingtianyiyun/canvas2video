!function(e,t){if("object"==typeof exports&&"object"==typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var o=t();for(var r in o)("object"==typeof exports?exports:e)[r]=o[r]}}(window,(function(){return function(e){var t={};function o(r){if(t[r])return t[r].exports;var n=t[r]={i:r,l:!1,exports:{}};return e[r].call(n.exports,n,n.exports,o),n.l=!0,n.exports}return o.m=e,o.c=t,o.d=function(e,t,r){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(o.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)o.d(r,n,function(t){return e[t]}.bind(null,n));return r},o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="",o(o.s=0)}([function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r={mimeType:"video/webm",outVideoType:"mp4",transcodeOptions:"",concatDemuxerOptions:"-af apad -map 0:v -map 1:a -shortest"};t.Canvas2Video=class{constructor(e){this.config=Object.assign({},r,e)}startRecord(){const e={};e.promise=new Promise((t,o)=>{e.resolve=t,e.reject=o}),this.deferred=e;const t=this.config.canvas.captureStream(),o=new MediaRecorder(t,{mimeType:this.config.mimeType}),r=[];o.ondataavailable=function(e){e.data&&e.data.size&&r.push(e.data)},o.onstop=()=>{const e=URL.createObjectURL(new Blob(r,{type:this.config.mimeType}));this.deferred.resolve(e)},o.start(),this.recorder=o}stopRecord(){this.recorder.stop()}async convertVideoUrl(e){const{audio:t,outVideoType:o,mimeType:r,workerOptions:n,transcodeOptions:i,concatDemuxerOptions:a}=this.config,{createWorker:s}=window.FFmpeg,c=s(n||{});await c.load();const d=r.split("/")[1];if(await c.write("video."+d,e),t){const e=t.split(".").pop();await c.write("1."+e,t),await c.concatDemuxer(["video."+d,"1."+e],"out."+o,a)}else d!==o&&await c.transcode(`video.${d} `,"out."+o,i);const{data:p}=await c.read("out."+o),u=new Blob([p],{type:"video/"+o}),f=URL.createObjectURL(u);return await c.terminate(),f}async getStreamURL(){const e=await this.deferred.promise,{mimeType:t,audio:o,outVideoType:r}=this.config;if(t==="video/"+r&&!o)return e;if(!window.FFmpeg){const e=new Error("please load FFmpeg script file like https://unpkg.com/@ffmpeg/ffmpeg@0.7.0/dist/ffmpeg.min.js");return Promise.reject(e)}return this.convertVideoUrl(e)}}}])}));