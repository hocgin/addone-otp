import { getAllLocales } from 'umi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '@/request.config';

dayjs.extend(relativeTime);

// 国际化配置
getAllLocales().forEach((locale) => {
});

// 全局状态配置
export async function getInitialState() {
  return {
    author: 'hocgin',
  };
}
