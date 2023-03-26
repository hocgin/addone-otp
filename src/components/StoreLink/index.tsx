import React from 'react';
import {HeartTwoTone} from '@ant-design/icons';
import {WebExtension} from '@hocgin/browser-addone-kit';

export const StoreLink: React.FC<{
  className?: string;
}> = (props) => {
  return (
    <HeartTwoTone twoToneColor="#eb2f96" style={{cursor: 'pointer'}} onClick={WebExtension.kit.openRecommendURL}/>);
}
