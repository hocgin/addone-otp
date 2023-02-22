import React from 'react';
import {QrcodeOutlined} from "@ant-design/icons";
import {App, Button, Popover, QRCode} from "antd";
import {I18nKit} from "@hocgin/browser-addone-kit";

const Index: React.FC<{
  className?: string;
  value?: string;
}> = ({value}) => {
  return <>
    <Popover trigger={'click'} overlayInnerStyle={{padding: 0}} content={<QRCode value={`${value}`} bordered={false}/>}>
      <Button type='text' icon={<QrcodeOutlined/>}>{I18nKit.getMessageOrDefault(`show_qrcode` as any)}</Button>
    </Popover>
  </>;
};

export default Index;
