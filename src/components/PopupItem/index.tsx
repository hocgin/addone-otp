import React, {useState} from 'react';
import {App, Avatar, Button, Popconfirm, Progress, Space, Tooltip} from "antd";
import styles from './index.less';
import {DataType, Message, MessageType,} from "@/_types";
import {EventEmitter} from 'ahooks/lib/useEventEmitter';
import {useRafTimeout} from "ahooks";
import {LinkOutlined, PushpinFilled, DeleteOutlined, WarningOutlined, CheckOutlined} from '@ant-design/icons';
import OptService from "@/_utils/_2fa/apps";
import QrCodeButton from "./QrCodeButton";
import classnames from "classnames";

export const PopupItem: React.FC<{
  className?: string;
  event$: EventEmitter<Message>
  item: DataType
}> = ({item, event$}) => {
  let {message} = App.useApp();
  let [deploy, setDeploy] = useState<number | undefined>(undefined);
  useRafTimeout(() => setDeploy(undefined), deploy)

  return (<div className={classnames(styles.itemWrapper, {
    [styles.disabled]: !item?.isValid
  })}>
    <div className={styles.itemBox}>
      <div className={classnames(styles.item, {})}>
        <div className={styles.logo}>
          <Avatar size={40} src={OptService.getWebSiteImageUrl(item)} shape='square'/>
        </div>
        <div className={styles.content}>
          <div>{item?.label}</div>
          <div>{item?.issuer}</div>
        </div>
        <div className={styles.token} onClick={() => {
          navigator?.clipboard?.writeText?.(`${item?.token}`);
          message.success(`复制成功`);
          setDeploy(1000);
        }}>
          <div className={classnames(styles.tokenCode, {
            [styles.copied]: deploy,
            [styles.warn]: item?.timeRemaining! <= 5
          })}>{item?.token ?? `N/A`}</div>
          <div className={styles.progress}>
            <Progress strokeWidth={18} width={26} format={() => `${item?.timeRemaining ?? ``}`}
                      strokeColor={item?.timeRemaining! <= 5 ? `#D95342`
                        // : item?.timeRemaining! <= 15 ? `#F5BD4F`
                        : undefined}
                      type="circle" percent={item?.progress ?? 0}/>
          </div>
        </div>
      </div>
      <div className={styles.toolbar}>
        <Button type='text' icon={deploy ? <CheckOutlined style={{color: '#00B06D'} as any}/> : <LinkOutlined/>}
                onClick={() => {
                  navigator?.clipboard?.writeText?.(`${item?.keyUri}`);
                  setDeploy(1000);
                  message.success(`复制成功`);
                }}>复制链接</Button>
        <QrCodeButton value={item?.keyUri}/>
        <Popconfirm title={`警告`} description={`删除后不可恢复?`}
                    onConfirm={() => event$.emit({type: MessageType.Delete, value: item?.id})}
                    placement="bottomRight"
                    showCancel={false}>
          <Button type='text' icon={<DeleteOutlined/>} danger>删除</Button>
        </Popconfirm>
      </div>
    </div>
    <Space className={styles.state} size={4}>
      {!item?.isValid && <>
        <Tooltip title={`配置错误:${item?.message}`} placement="bottomRight">
          <WarningOutlined className={classnames(styles.warn)}/>
        </Tooltip>
      </>}
      <PushpinFilled className={classnames(styles.pin, {
        [styles.checked]: item?.pin
      })} onClick={() => event$.emit({type: item?.pin ? MessageType.Unpin : MessageType.Pin, value: item?.id})}/>
    </Space>
  </div>);
};
