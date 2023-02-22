import React, {useState} from "react";
import classnames from "classnames";
import {Button, Input, Popconfirm} from "antd";
import {Message, MessageType} from "@/_types";
import {EventEmitter} from "ahooks/lib/useEventEmitter";
import {QuestionCircleOutlined} from '@ant-design/icons';
import styles from './index.less'
import Logo from "./Logo";
import {I18nKit} from "@hocgin/browser-addone-kit";

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
          <Input.Password style={{width: 'calc(100% - 70px)'}}
                          placeholder={I18nKit.getMessageOrDefault('input_password_placeholder' as any)}
                          value={passwd}
                          onChange={e => setPasswd(e?.target?.value)}/>
          <Button type="primary" onClick={() => event$.emit({
            type: MessageType.UnLock,
            value: passwd
          })} style={{paddingLeft: 9}}>{I18nKit.getMessageOrDefault(`unlock` as any)}</Button>
        </Input.Group>
      </div>
      <div className={styles.resetRow}>
        <Popconfirm title={I18nKit.getMessageOrDefault('reset_password_title' as any)}
                    description={I18nKit.getMessageOrDefault('reset_password_desc' as any)} placement="bottomRight"
                    onConfirm={() => event$.emit({type: MessageType.ResetLock})}
                    icon={<QuestionCircleOutlined style={{color: 'red'}}/>}>
          <Button type="link" danger>{I18nKit.getMessageOrDefault('forgot_password' as any)}</Button>
        </Popconfirm>
      </div>
    </div>
  </div>);
};

export default Index;
