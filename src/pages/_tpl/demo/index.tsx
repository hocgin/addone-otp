import React from 'react';
import { Container } from '@/components';
import {
  useModel,
  useIntl,
  Link,
  SelectLang,
  getAllLocales,
  getLocale,
} from 'umi';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { FormatKit } from '@hocgin/ui';

const Index: React.FC<{
  className?: string;
}> = (props) => {
  // 全局状态管理
  const { initialState, loading, error, refresh, setInitialState } = useModel('@@initialState');
  const { user, fetchUser } = useModel('apps');
  let intl = useIntl();

  console.log('->', dayjs.locale());
  console.log('->', getAllLocales(), getLocale());
  console.log('00', intl.formatRelativeTime(1, 'day'));
  console.debug('console.debug');
  console.log('console.log');
  console.info('console.info');
  console.warn('console.warn');
  console.error('console.error');

  return (
    <Container>
      <h1>全局状态</h1>
      <div>{JSON.stringify(initialState)}</div>
      <h1>
        i18n
        <SelectLang />
      </h1>
      <div>多语言文本: {intl.formatMessage({ id: 'demo.title' })}</div>
      <div>多语言时间(code): {dayjs.unix(1316116057189).fromNow()}</div>
      <div>多语言时间(intl): {intl.formatRelativeTime(1, 'day')}</div>
      <div onClick={() => dayjs.locale('zh-cn')}>
        多语言时间(hkit):{FormatKit.toRelativeDateStr(new Date().getTime() - 1000)}
      </div>
      <div>
        多语言时间: <DatePicker />
      </div>
      <h1>页面</h1>
      <div>
        <Link to={'/ssr'}>SSR</Link>
        <br />
        <Link to={'/404'}>404</Link>
      </div>
    </Container>
  );
};

export default Index;
