import React from 'react';
import {App, Upload, UploadFile} from "antd";

const Index: React.FC<{
  className?: string;
  children?: any;
  onChange?: (file: UploadFile) => void;
}> = ({children, onChange}) => {
  let {message} = App.useApp();
  return (<Upload onChange={({file}) => {
    onChange?.(file);
    console.log('file', file);
  }} beforeUpload={(file) => {
    // const isPNG = file.type === 'image/png';
    // if (!isPNG) {
    //   message.error(`${file.name} is not a png file`);
    // }
    // return isPNG || Upload.LIST_IGNORE;
    return true;
  }} maxCount={1} showUploadList={false}>{children}</Upload>);
};

export default Index;
