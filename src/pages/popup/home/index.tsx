import React, {useRef, useState} from "react";
import classnames from "classnames";
import styles from "./index.less";
import {App, Button, Dropdown, Empty, Image, Input, Popconfirm, Popover, Select, Space, Tooltip} from "antd";
import {
  CloudDownloadOutlined,
  FilterFilled,
  FilterOutlined,
  LockOutlined,
  PlusOutlined,
  WechatOutlined,
  QrcodeOutlined
} from "@ant-design/icons";
import {PopupItem, StoreLink} from "@/components";
import {DataType, Message, MessageType} from "@/_types";
import UploadFile from "@/pages/popup/UploadFile";
import QrScanner from "qr-scanner";
import {LangKit} from "@/_utils";
import {WebExtension} from "@hocgin/browser-addone-kit";
import {useBoolean, useLocalStorageState, useRequest} from "ahooks";
import AppService from "@/_utils/_2fa/apps";
import OptService from "@/_utils/_2fa/apps";
import {EventEmitter} from "ahooks/lib/useEventEmitter";
import {TwoFaKit} from "@/_utils/_2fa";

const Index: React.FC<{
  event$: EventEmitter<Message>,
  className?: string;
}> = ({className, event$}) => {
  let {message} = App.useApp();
  let [passwd, setPasswd] = useState<string | undefined>();
  let boxRef = useRef<any>();
  let [filter, setFilter] = useLocalStorageState('filter', {
    defaultValue: {
      keyword: undefined,
      state: 'all',
    }
  });
  let [list, setList] = useState<DataType[]>([]);
  let [open, {toggle: toggleOpen}] = useBoolean(false);
  let $listAllData = useRequest(() => AppService.listAllData(filter), {
    refreshDeps: [filter],
    pollingInterval: 1000,
    onSuccess: setList,
  }), $updateById = useRequest(AppService.updateById, {
    manual: true,
    onSuccess: $listAllData.refreshAsync
  }), $save = useRequest(AppService.save, {
    manual: true,
    onError: e => message.error(`${e?.message}`),
    onSuccess: () => {
      $listAllData.refresh();
      message.success(`保存成功`);
    },
  }), $removeById = useRequest(AppService.removeById, {
    manual: true,
    onError: e => message.error(`${e?.message}`),
    onSuccess: () => {
      $listAllData.refresh();
      message.success(`删除成功`);
    },
  })
  let onMessage = async (message: Message) => {
    console.log('消息接收(HOME)', message);
    if (message?.type === MessageType.Pin) {
      await $updateById.runAsync(message?.value, {pin: true});
    } else if (message?.type === MessageType.Unpin) {
      await $updateById.runAsync(message?.value, {pin: false});
    } else if (message?.type === MessageType.UploadQrCode) {
      await $save.runAsync(TwoFaKit.keyUriToStoreOptions(message.value!))
    } else if (message?.type === MessageType.ImportBackup) {
      await OptService.saveBatchStore(message.value);
    } else if (message?.type === MessageType.ExportBackup) {
      await TwoFaKit.saveFile(JSON.stringify(list), `备份文件.json`);
    } else if (message?.type === MessageType.Delete) {
      await $removeById.runAsync(message.value);
    } else if (message?.type === MessageType.ScanPageQrCode) {
      let tab = await WebExtension.kit.getCurrentTab();
      console.log('扫描页面二维码', tab);
      WebExtension.tabs.sendMessage(tab?.id, {type: MessageType.ScanPageImage} as Message, onMessage);
    }
  };
  event$.useSubscription(onMessage);

  return <div className={classnames(styles.page, className)}>
    <div className={styles.searchBox}>
      <div className={styles.search}>
        <Input
          bordered={false}
          placeholder="搜索.."
          allowClear
          onChange={(e) => setFilter({...filter, keyword: e?.target?.value as any})}
          suffix={
            <Button
              type="text"
              size="small"
              icon={open ? <FilterFilled/> : <FilterOutlined/>}
              onClick={toggleOpen}
            />
          }
        />
        {open ? (
          <div className={styles.toolbar}>
            <Select
              placeholder="状态"
              size="small"
              bordered={true}
              options={[
                {
                  value: 'all',
                  label: '所有',
                }
              ] as any}
              onChange={value => setFilter({...filter, state: value})}
              value={filter.state}
              style={{minWidth: '7em'}}/>
          </div>
        ) : null}
      </div>
    </div>
    <div className={styles.box} ref={boxRef}>
      {list.map((item) => <PopupItem item={item} event$={event$}/>)}
      {!list?.length && <div style={{
        height: '100%', display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}><Empty/></div>}
    </div>
    <div className={styles.bottombar}>
      <Space size={2}>
        <Dropdown menu={{
          onClick: e => event$.emit({type: e.key} as any),
          items: [{
            key: MessageType.ScanPageQrCode,
            label: '扫描二维码',
          }, {
            key: `&${MessageType.UploadQrCode}`,
            label: <UploadFile
              onChange={async (file) => {
                QrScanner.scanImage(file.originFileObj as any, {})
                  .then((scanResult) => {
                    event$.emit({type: MessageType.UploadQrCode, value: scanResult});
                  })
                  .catch(e => message.error(`扫描失败: ${e.message}`));
              }}>上传二维码</UploadFile>,
          }, {
            key: MessageType.ManualInput,
            label: '手动录入',
          }, {
            key: `&${MessageType.ImportBackup}`,
            label: <UploadFile onChange={async (file) => {
              LangKit.readFile(file.originFileObj as any)
                .then((value) => event$.emit({type: MessageType.ImportBackup, value: JSON.parse(value as any)}))
                .catch(e => message.error(`导入失败: ${e.message}`));
            }}>导入备份</UploadFile>,
          }]
        }}>
          <Button size='small'>
            <Space>
              新增
              <PlusOutlined/>
            </Space>
          </Button>
        </Dropdown>
        <Tooltip title={`导出备份`}>
          <Button type="text" size="small" icon={<CloudDownloadOutlined/>}
                  onClick={() => event$.emit({type: MessageType.ExportBackup as any})}/>
        </Tooltip>
        <Popconfirm title="设置密码"
                    description={<Input.Password placeholder={`请输入密码`} value={passwd}
                                                 onChange={e => setPasswd(e.target?.value)}/>}
                    onConfirm={() => event$.emit({type: MessageType.Lock, value: passwd})}>
          <Button type="text" size="small" icon={<LockOutlined/>}/>
        </Popconfirm>
      </Space>
      <Space className={styles.siderTool}>
        <Popover content={<Image src="https://cdn.hocgin.top/icons/minaapp_2fa.jpg" width={80} alt="小程序"/>}>
          <WechatOutlined style={{color: `#67BD68`}}/>
        </Popover>
        <StoreLink/>
        <Popover placement="topRight"
                 content={<Image src="https://cdn.hocgin.top/uPic/mp-logo.jpg" width={80} alt="公众号"/>}>
          <QrcodeOutlined/>
        </Popover>
      </Space>
    </div>
  </div>;
};

export default Index;
