import React from "react";
import classnames from "classnames";
import {App, Button, Input, Popconfirm} from "antd";
import {Message, MessageType} from "@/_types";
import {EventEmitter} from "ahooks/lib/useEventEmitter";
import {QuestionCircleOutlined} from '@ant-design/icons';
import styles from './index.less'

const Index: React.FC<{
  className?: string;
  event$: EventEmitter<Message>,
}> = ({className, event$}) => {
  return (<div className={classnames(className, styles.page)}>
    <div className={styles.box}>
      <div>
        <Input.Group compact>
          <Input.Password style={{width: 'calc(100% - 70px)'}} placeholder={`输入密码`}/>
          <Button type="primary">解锁</Button>
        </Input.Group>
      </div>
      <div className={styles.resetRow}>
        <Popconfirm title="警告" description="重置密码后保存数据会被清空。" placement="bottomRight"
                    onConfirm={() => event$.emit({type: MessageType.ResetLock})}
                    icon={<QuestionCircleOutlined style={{color: 'red'}}/>}>
          <Button type="link" danger>忘记密码?</Button>
        </Popconfirm>
      </div>
    </div>
  </div>);
};

export default Index;
