import React, {useEffect} from 'react';
import {WebExtension} from "@hocgin/browser-addone-kit";
import {Message, MessageType} from "@/_types";
import ScreenShot from "js-web-screen-shot";
import QrScanner from "qr-scanner";
import {message} from "antd";
import {TwoFaKit} from "@/_utils/_2fa";
import {useRequest} from "ahooks";
import AppService from "@/_utils/_2fa/apps";

const Index: React.FC<{
  className?: string;
}> = (props) => {
  const [messageApi, contextHolder] = message.useMessage();
  let $save = useRequest(AppService.save, {
    manual: true,
    onError: e => messageApi.error(`${e?.message}`),
    onSuccess: () => messageApi.success(`保存成功`),
  });
  let onMessage = async (message: Message, sender: any, sendResponse: any) => {
    console.log('页面接收到消息[Content]', message);
    if (message.type === MessageType.ScanPageImage) {
      new ScreenShot({
        clickCutFullScreen: true,
        enableWebRtc: true,
        completeCallback: async (base64Image: any) => {
          QrScanner.scanImage(base64Image, {}).then((scanResult: any) => {
            console.log('扫描内容', scanResult);
            $save.runAsync(TwoFaKit.keyUriToStoreOptions(scanResult))
          }).catch(_ => messageApi.error('扫描失败'));
        },
      });
    } else if (message.type === MessageType.ScanImageUrl) {
      let url = message?.value;
      if (`${url}`.includes('http')) {
        let response = await fetch(url);
        url = await response.blob();
      }
      QrScanner.scanImage(url, {}).then((scanResult: any) => {
        console.log('扫描内容', scanResult);
        $save.runAsync(TwoFaKit.keyUriToStoreOptions(scanResult))
      }).catch(_ => messageApi.error('扫描失败'));
    } else if (message.type === MessageType.InsertEditableToken) {
      // @ts-ignore
      document.activeElement.value = `${message.value}`.trim();
      console.log('当前聚焦的元素', document.activeElement, message.value);
    } else if (message.type === MessageType.ErrorMessage) {
      messageApi.error(`${message.value}`);
    }
    return true;
  };
  useEffect(() => {
    WebExtension.runtime.onMessage.addListener(onMessage);
    return () => {
      WebExtension.runtime.onMessage.removeListener(onMessage);
    };
  });
  return (<>{contextHolder}</>);
};

export default Index;
