import { stringify } from 'query-string';
import { useGet, RabbitKit } from '@hocgin/hkit';

export default class {
  static ssr({ id, ...payload }: any): Promise<string> {
    let queryString = stringify(payload);
    return useGet(`/api/ssr?${queryString}`)
      .then(RabbitKit.thenDataTryErrorIfExits);
  }
}
