import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '@/request.config';

dayjs.extend(relativeTime);
