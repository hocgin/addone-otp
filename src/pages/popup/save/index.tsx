import React from "react";
import classnames from "classnames";
import styles from "./index.less";
import {App, Button, Divider, Form, Input, InputNumber, Radio, Select,} from "antd";
import {Message, MessageType} from "@/_types";
import {EventEmitter} from "ahooks/lib/useEventEmitter";
import {Algorithm, Strategy} from "@/_utils/_2fa";
import {useBoolean, useRequest} from "ahooks";
import AppService from "@/_utils/_2fa/apps";
import {I18nKit} from "@hocgin/browser-addone-kit";

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
    onSuccess: () => message.success(I18nKit.getMessageOrDefault('success' as any)),
  });
  let onClickGoHome = () => event$.emit({type: MessageType.GoHomePage})

  return (<div className={classnames(styles.page, className)}>
    <Form form={form} initialValues={initialValues} colon={false} onFinish={$save.run}>
      <Form.Item label={I18nKit.getMessageOrDefault('label' as any)} name="label" rules={[{required: true}]}>
        <Input allowClear placeholder={I18nKit.getMessageOrDefault('label_placeholder' as any)}/>
      </Form.Item>
      <Form.Item label={I18nKit.getMessageOrDefault('secret' as any)} name="secret" rules={[{required: true}]}>
        <Input.TextArea rows={4} allowClear autoSize placeholder={I18nKit.getMessageOrDefault('secret_placeholder' as any)}/>
      </Form.Item>
      <Form.Item label={I18nKit.getMessageOrDefault('issuer' as any)} name="issuer"
                 tooltip={I18nKit.getMessageOrDefault('issuer_tooltip' as any)}>
        <Input allowClear placeholder={I18nKit.getMessageOrDefault('issuer_placeholder' as any)}/>
      </Form.Item>
      {/*@ts-ignore*/}
      <Divider orientation="left" onClick={toggleMore} orientationMargin={0}
               plain>{I18nKit.getMessageOrDefault('advanced_config' as any)}</Divider>
      {more && <>
        <Form.Item label={I18nKit.getMessageOrDefault('type' as any)} name="type">
          <Radio.Group buttonStyle="solid">
            {Object.keys(Strategy).map(key => <Radio.Button value={(Strategy as any)[key]}>{key}</Radio.Button>)}
          </Radio.Group>
        </Form.Item>
        <Form.Item label={I18nKit.getMessageOrDefault('period' as any)} name="period">
          <InputNumber placeholder={I18nKit.getMessageOrDefault('period_placeholder' as any)} style={{width: '100%'}}/>
        </Form.Item>
        <Form.Item label={I18nKit.getMessageOrDefault('digits' as any)} name="digits">
          <Radio.Group buttonStyle="solid">
            {[5, 6, 8].map(item => <Radio.Button
              value={item}>{item}{I18nKit.getMessageOrDefault('digits_unit' as any)}</Radio.Button>)}
          </Radio.Group>
        </Form.Item>
        <Form.Item label={I18nKit.getMessageOrDefault('algorithm' as any)} name="algorithm">
          <Select placeholder={I18nKit.getMessageOrDefault('algorithm_placeholder' as any)}
                  options={Object.keys(Algorithm).map(key => ({
                    label: key,
                    value: (Algorithm as any)[key],
                  })) as any}/>
        </Form.Item>
      </>}
      <Form.Item wrapperCol={{offset: 8, span: 16}}>
        <Button htmlType="submit" type="primary">{I18nKit.getMessageOrDefault('save' as any)}</Button>
        <Button htmlType="button" onClick={onClickGoHome}
                style={{margin: '0 8px'}}>{I18nKit.getMessageOrDefault('back' as any)}</Button>
      </Form.Item>
    </Form>
  </div>);
};

export default Index;
