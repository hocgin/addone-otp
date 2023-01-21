import React from 'react';
import {App, Button, Divider, Form, Input, InputNumber, Modal, Radio, Select, Tooltip} from 'antd';
import {PlusOutlined} from "@ant-design/icons";
import {useBoolean, useRequest} from "ahooks";
import {EventEmitter} from "ahooks/lib/useEventEmitter";
import {Message, MessageType} from "@/_types";
import {Algorithm, Strategy} from "@/_utils/_2fa";
import AppService from "@/services/apps";

let _initialValues = {
  type: `TOTP`,
  period: 30,
  digits: 6,
  algorithm: 'SHA1',
};
const Index: React.FC<{
  className?: string;
  initialValues?: any;
  event$: EventEmitter<Message>;
}> = ({event$, initialValues = _initialValues}) => {
  let {message} = App.useApp();
  let [form] = Form.useForm();
  let [more, {toggle: toggleMore}] = useBoolean(false);
  let [visible, {toggle: toggleVisible, setFalse: setFalseVisible}] = useBoolean(false);
  let $save = useRequest(AppService.save, {
    manual: true,
    onError: e => message.error(e.message),
    onSuccess: () => {
      message.success(`保存成功`);
      setFalseVisible();
    },
  });

  return (<>
    <Button type='ghost' size='small' onClick={toggleVisible}>
      <Tooltip title='新增'>
        <PlusOutlined/>
      </Tooltip>
    </Button>
    <Modal
      closable={false}
      maskClosable={false}
      style={{
        padding: '5px 7px'
      }}
      onOk={_ => form.submit()}
      open={visible}
      onCancel={setFalseVisible}>
      <Form form={form} size='small' initialValues={initialValues} colon={false} onFinish={$save.run}>
        <Form.Item label='标题' name="label" required>
          <Input allowClear placeholder='标题..'/>
        </Form.Item>
        <Form.Item label='密钥' name="secret" required>
          <Input.TextArea allowClear autoSize placeholder='密钥..'/>
        </Form.Item>
        <Form.Item label='账号' name="issuer" tooltip='批量下载请用换行分隔'>
          <Input allowClear placeholder='账号..'/>
        </Form.Item>
        {/*@ts-ignore*/}
        <Divider orientation="left" onClick={toggleMore} orientationMargin={0} plain>高级配置</Divider>
        {more && <>
          <Form.Item label='类型' name="type">
            <Radio.Group buttonStyle="solid">
              {Object.keys(Strategy).map(key => <Radio.Button value={(Strategy as any)[key]}>{key}</Radio.Button>)}
            </Radio.Group>
          </Form.Item>
          <Form.Item label='周期' name="period">
            <InputNumber placeholder='周期..' style={{width: '100%'}}/>
          </Form.Item>
          <Form.Item label='位数' name="digits">
            <Radio.Group buttonStyle="solid">
              {[6, 8].map(item => <Radio.Button value={item}>{item}位</Radio.Button>)}
            </Radio.Group>
          </Form.Item>
          <Form.Item label='算法' name="algorithm">
            <Select placeholder={`算法..`} options={Object.keys(Algorithm).map(key => ({
              label: key,
              value: (Algorithm as any)[key],
            }))}/>
          </Form.Item>
        </>}
      </Form>
    </Modal>
  </>);
};

export default Index;
