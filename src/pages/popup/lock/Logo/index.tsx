import React from 'react';
import styles from "./index.less";
import {UserOutlined} from "@ant-design/icons";
import {WebExtension} from "@hocgin/browser-addone-kit";
import {Avatar} from "antd";
import classnames from "classnames";

const Index: React.FC<{
  className?: string;
}> = (props) => {
  return (<div className={styles.container}>
    <Avatar className={styles.image} size={84} icon={<UserOutlined/>}
            src={WebExtension.runtime.getURL('/logo.png')}/>
    <div className={classnames(styles.pulse, styles.p1)}></div>
    <div className={classnames(styles.pulse, styles.p2)}></div>
  </div>);
};

export default Index;
