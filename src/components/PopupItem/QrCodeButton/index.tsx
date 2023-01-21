import React from 'react';
import {QrcodeOutlined} from "@ant-design/icons";
import {App, Button, Popover, QRCode} from "antd";

const Index: React.FC<{
  className?: string;
  value?: string;
}> = ({value}) => {
  return <>
    <Popover trigger={'click'} overlayInnerStyle={{padding: 0}} content={<QRCode value={`${value}`} bordered={false}/>}>
      <Button type='text' icon={<QrcodeOutlined/>}>查看二维码</Button>
    </Popover>
  </>;
};

export default Index;
