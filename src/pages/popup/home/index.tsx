import React, {useRef, useState} from "react";
import classnames from "classnames";
import styles from "./index.less";
import {App, Button, Dropdown, Empty, Image, Input, Popconfirm, Popover, QRCode, Select, Space, Tooltip} from "antd";
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
import {ContextMenusId, DataType, Message, MessageType} from "@/_types";
import UploadFile from "@/pages/popup/UploadFile";
import QrScanner from "qr-scanner";
import {LangKit} from "@/_utils";
import {I18nKit, WebExtension} from "@hocgin/browser-addone-kit";
import {useBoolean, useLocalStorageState, useRequest} from "ahooks";
import AppService from "@/_utils/_2fa/apps";
import OptService from "@/_utils/_2fa/apps";
import {EventEmitter} from "ahooks/lib/useEventEmitter";
import {TwoFaKit} from "@/_utils/_2fa";

const Index: React.FC<{
  event$: EventEmitter<Message>,
  className?: string;
}> = ({className, event$}) => {
  let {message, modal} = App.useApp();
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
      message.success(I18nKit.getMessageOrDefault('success'));
    },
  }), $removeById = useRequest(async (id: any) => {
    await AppService.removeById(id);
    WebExtension.contextMenus.remove(`${ContextMenusId.FillPrefix}${id}`);
  }, {
    manual: true,
    onError: e => message.error(`${e?.message}`),
    onSuccess: () => {
      $listAllData.refresh();
      message.success(I18nKit.getMessageOrDefault('success'));
    },
  });
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
      await TwoFaKit.saveFile(JSON.stringify(list), `file.json`);
    } else if (message?.type === MessageType.Delete) {
      await $removeById.runAsync(message.value);
    } else if (message?.type === MessageType.ScanPageQrCode) {
      let tab = await WebExtension.kit.getCurrentTab();
      console.log('扫描页面二维码', tab);
      WebExtension.tabs.sendMessage(tab?.id, {type: MessageType.ScanPageImage} as Message, onMessage);
    } else if (message?.type === MessageType.SyncWeChat) {
      let allQrCode = await AppService.getAllQrCode();
      modal.info({title: `用小程序扫描同步`, content: <QRCode value={`${allQrCode}`}/>})
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
            label: I18nKit.getMessageOrDefault('scan_qrcode'),
          }, {
            key: `&${MessageType.UploadQrCode}`,
            label: <UploadFile
              onChange={async (file) => {
                QrScanner.scanImage(file.originFileObj as any, {})
                  .then((scanResult) => {
                    event$.emit({type: MessageType.UploadQrCode, value: scanResult});
                  })
                  .catch(e => message.error(`${I18nKit.getMessageOrDefault('error')}: ${e.message}`));
              }}>{I18nKit.getMessageOrDefault('upload_qrcode')}</UploadFile>,
          }, {
            key: MessageType.ManualInput,
            label: I18nKit.getMessageOrDefault('manual_input'),
          }, {
            key: `&${MessageType.ImportBackup}`,
            label: <UploadFile onChange={async (file) => {
              LangKit.readFile(file.originFileObj as any)
                .then((value) => event$.emit({type: MessageType.ImportBackup, value: JSON.parse(value as any)}))
                .catch(e => message.error(`${I18nKit.getMessageOrDefault('error')}: ${e.message}`));
            }}>{I18nKit.getMessageOrDefault('input_backup')}</UploadFile>,
          }
            // , {
            //   key: MessageType.SyncWeChat,
            //   label: I18nKit.getMessageOrDefault('sync_wechat', "同步到小程序"),
            // }
          ]
        }}>
          <Button size='small'>
            <Space>
              {I18nKit.getMessageOrDefault('plus')}
              <PlusOutlined/>
            </Space>
          </Button>
        </Dropdown>
        <Tooltip title={I18nKit.getMessageOrDefault('export_backup')}>
          <Button type="text" size="small" icon={<CloudDownloadOutlined/>}
                  onClick={() => event$.emit({type: MessageType.ExportBackup as any})}/>
        </Tooltip>
        <Popconfirm title={I18nKit.getMessageOrDefault('set_password')}
                    description={<Input.Password
                      placeholder={I18nKit.getMessageOrDefault('set_password_placeholder')}
                      value={passwd}
                      onChange={e => setPasswd(e.target?.value)}/>}
                    onConfirm={() => event$.emit({type: MessageType.Lock, value: passwd})}>
          <Button type="text" size="small" icon={<LockOutlined/>}/>
        </Popconfirm>
      </Space>
      <Space className={styles.siderTool}>
        <Popover content={<Image src="https://cdn.hocgin.top/icons/minaapp_2fa.jpg" width={80}
                                 alt={I18nKit.getMessageOrDefault(`wx_mina_qrcode` as any)}/>}>
          <WechatOutlined style={{color: `#67BD68`}}/>
        </Popover>
        <StoreLink/>
        <Popover placement="topRight" content={<Image src="https://cdn.hocgin.top/uPic/mp-logo.jpg" width={80}
                                                      alt={I18nKit.getMessageOrDefault(`wx_gz_qrcode` as any)}/>}>
          <QrcodeOutlined/>
        </Popover>
      </Space>
    </div>
  </div>;
};

export default Index;
