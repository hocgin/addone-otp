import React, {useState} from "react";
import {useEventEmitter, useRequest} from "ahooks";
import styles from './index.less';
import {Theme} from "@/components";
import AppService from '@/_utils/_2fa/apps';
import {Message, MessageType} from "@/_types";
import HomePage from "@/pages/popup/home";
import LockPage from "@/pages/popup/lock";
import SavePage from "@/pages/popup/save";
import {App, Spin} from "antd";

enum RouteType {
  LockPage = 'LockPage',
  HomePage = 'HomePage',
  SavePage = 'SavePage',
  LoadPage = 'LoadPage',
}

const Index: React.FC<{
  className?: string;
}> = (props) => {
  let {message} = App.useApp();
  let [route, setRoute] = useState<RouteType>(RouteType.LoadPage);
  const event$ = useEventEmitter<Message>();
  let $getLock = useRequest(AppService.getLock, {
    onSuccess: (lock) => setRoute(lock?.locked ? RouteType.LockPage : RouteType.HomePage),
  }), $locked = useRequest((locked: boolean, passwd?: string) => AppService.locked(locked, passwd), {
    manual: true,
    onSuccess: (data: [boolean, string]) => {
      let result = data[0];
      if (result) {
        message.success(`操作成功`);
        $getLock.refresh();
      } else {
        let errorMessage = data[1];
        message.error(`${errorMessage}`);
      }
    }
  }), $resetLock = useRequest(AppService.resetLock, {
    manual: true,
    onError: e => message.error(`${e?.message}`),
    onSuccess: () => {
      message.success(`重置成功`);
      $getLock.refresh();
    },
  });

  event$.useSubscription(async (message: Message) => {
    console.log('消息接收', message);
    if (message?.type === MessageType.Lock) {
      $locked.run(true, message.value);
    } else if (message?.type === MessageType.UnLock) {
      $locked.run(false, message.value);
    } else if (message.type === MessageType.ResetLock) {
      $resetLock.run();
    } else if (message.type === MessageType.ManualInput) {
      setRoute(RouteType.SavePage);
    } else if (message.type === MessageType.GoHomePage) {
      setRoute(RouteType.LockPage);
      $getLock.refresh();
    }
  });

  return <>
    {route === RouteType.HomePage && <HomePage className={styles.page} event$={event$}/>}
    {route === RouteType.LockPage && <LockPage className={styles.page} event$={event$}/>}
    {route === RouteType.SavePage && <SavePage className={styles.page} event$={event$}/>}
    {route === RouteType.LoadPage &&
      <div className={styles.page} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Spin/>
      </div>}
  </>;
}
export default function () {
  return <Theme>
    <Index/>
  </Theme>
};
