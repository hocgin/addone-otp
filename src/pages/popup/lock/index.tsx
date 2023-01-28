import React, {useState} from "react";
import classnames from "classnames";
import {Button, Input, Popconfirm} from "antd";
import {Message, MessageType} from "@/_types";
import {EventEmitter} from "ahooks/lib/useEventEmitter";
import {QuestionCircleOutlined} from '@ant-design/icons';
import styles from './index.less'
import Logo from "./Logo";

const Index: React.FC<{
  className?: string;
  event$: EventEmitter<Message>,
}> = ({className, event$}) => {
  let [passwd, setPasswd] = useState<string | undefined>();

  return (<div className={classnames(className, styles.page)}>
    <div className={styles.box}>
      <div className={styles.logo}>
        <Logo/>
      </div>
      <div className={styles.input}>
        <Input.Group compact>
          <Input.Password style={{width: 'calc(100% - 70px)'}} placeholder={`输入密码`}
                          value={passwd}
                          onChange={e => setPasswd(e?.target?.value)}/>
          <Button type="primary" onClick={() => event$.emit({type: MessageType.UnLock, value: passwd})}>解锁</Button>
        </Input.Group>
      </div>
      <div className={styles.resetRow}>
        <Popconfirm title="警告" description="重置后会导致数据被清空" placement="bottomRight"
                    onConfirm={() => event$.emit({type: MessageType.ResetLock})}
                    icon={<QuestionCircleOutlined style={{color: 'red'}}/>}>
          <Button type="link" danger>忘记密码?</Button>
        </Popconfirm>
      </div>
    </div>
  </div>);
};

export default Index;
