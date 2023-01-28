import React from "react";
import classnames from "classnames";
import styles from "./index.less";
import {App, Button, Divider, Form, Input, InputNumber, Radio, Select,} from "antd";
import {Message, MessageType} from "@/_types";
import {EventEmitter} from "ahooks/lib/useEventEmitter";
import {Algorithm, Strategy} from "@/_utils/_2fa";
import {useBoolean, useRequest} from "ahooks";
import AppService from "@/services/apps";

let _initialValues = {
  type: `TOTP`,
  period: 30,
  digits: 6,
  algorithm: 'SHA1',
};
const Index: React.FC<{
  className?: string;
  event$: EventEmitter<Message>,
  initialValues?: any;
}> = ({className, event$, initialValues = _initialValues}) => {
  let {message} = App.useApp();
  let [form] = Form.useForm();
  let [more, {toggle: toggleMore}] = useBoolean(false);
  let $save = useRequest(AppService.save, {
    manual: true,
    onError: e => message.error(e.message),
    onSuccess: () => message.success(`保存成功`),
  });
  let onClickGoHome = () => event$.emit({type: MessageType.GoHomePage})

  return (<div className={classnames(styles.page, className)}>
    <Form form={form} initialValues={initialValues} colon={false} onFinish={$save.run}>
      <Form.Item label='标题' name="label" rules={[{required: true}]}>
        <Input allowClear placeholder='标题..'/>
      </Form.Item>
      <Form.Item label='密钥' name="secret" rules={[{required: true}]}>
        <Input.TextArea rows={4} allowClear autoSize placeholder='密钥..'/>
      </Form.Item>
      <Form.Item label='账号' name="issuer" tooltip='描述账号信息，便于记忆'>
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
      <Form.Item {...{wrapperCol: {offset: 8, span: 16}}}>
        <Button htmlType="submit" type="primary">保存</Button>
        <Button htmlType="button" onClick={onClickGoHome} style={{margin: '0 8px'}}>返回</Button>
      </Form.Item>
    </Form>
  </div>);
};

export default Index;
