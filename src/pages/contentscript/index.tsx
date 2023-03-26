import $ from 'jquery';
import {WebExtension} from "@hocgin/browser-addone-kit";
import ReactDOM from "react-dom";
import React from "react";
import WebMask from "./WebMask";

let elementId = `${WebExtension.kit.getExtensionId()}_otp`;


$(() => {
  if (!document.getElementById(elementId)) {
    let element = document.createElement('div');
    element.id = elementId;
    ReactDOM.render(<WebMask/>, element, () => {
      // 获取 body 元素
      let body = document.body;
      if (body.parentNode) {
        // 在 body 元素的后面插入新的段落
        body.parentNode.insertBefore(element, document.body);
      }
    });
  }
});
