import {LangKit} from "@/_utils";
import {StoreOtpOptions, TwoFaKit} from "./index";
import {DataType, Lock} from "./types";
import icons from './IconMaps'
import memoizeOne from 'memoize-one'
import {getLocalStorage, getRemoteStorage, uuid} from "./platform";


let STORAGE_KEY = `OTP_LIST`;
let LOCK_KEY = `LOCK_KEY`;
let DEMO_FLAG_KEY = `DEMO_FLAG_KEY`;

/**
 * 两个版本后移除
 * 0.0.9 加入
 */
async function ifSyncCloud() {
  let values1 = await getLocalStorage().getAsync(STORAGE_KEY as any) ?? [];
  if (values1.length > 0) {
    await Service.saveBatchStore(values1);
    await getLocalStorage().remove(STORAGE_KEY as any);
  }
  let values2 = await getLocalStorage().getAsync(LOCK_KEY as any);
  if (values2) {
    await getRemoteStorage().setAsync(LOCK_KEY as any, values2);
    await getLocalStorage().remove(LOCK_KEY as any)
  }

}

async function ifEmptyAddTest(list: StoreOtpOptions[] = []) {
  let hasFlag = await getRemoteStorage().getAsync(DEMO_FLAG_KEY);
  console.log('hasFlag', hasFlag, list);

  // 如果没有存储过demo和并且没有数据，则存储数据
  if (!hasFlag && list.length == 0) {
    list = await Service.save(TwoFaKit.keyUriToStoreOptions(`otpauth://totp/test%40demo.com:%E7%A4%BA%E4%BE%8B(demo)?issuer=test%40demo.com&secret=DEMA&algorithm=SHA1&digits=6&period=30`));
    await getRemoteStorage().setAsync(DEMO_FLAG_KEY, true);
  }
  return list;
}

export default class Service {
  static _getWebSiteImageUrl = memoizeOne((title) => Object.entries(icons).find((item) => title.includes(item?.[0]))?.[1])

  static getWebSiteImageUrl(data: DataType) {
    let label = `${data?.label}`.toLowerCase();
    let issuer = `${data?.issuer}`.toLowerCase();
    return Service._getWebSiteImageUrl(issuer) ?? Service._getWebSiteImageUrl(label) ?? `https://cdn.hocgin.top/file/lock.png`;
  }

  static async save(values: StoreOtpOptions) {
    console.log('保存', values);
    values = {...values, secret: values?.secret ? values?.secret.trim() : values?.secret}
    let tokenData = TwoFaKit.getToken(values);
    if (!tokenData.isValid) {
      console.log(`保存失败: ${tokenData.message}`)
      throw new Error(`密钥非标准(RFC 4648)的 Base64`)
    }
    let list = await Service.listAll(false);
    list.push({
      ...values,
      id: values?.id ?? uuid(),
    });
    list = LangKit.distinct(list as StoreOtpOptions[], e => e?.id);
    await getRemoteStorage().setAsync(STORAGE_KEY as any, list);
    return list;
  }

  static async scroll(filter: any = {}, limit: number = 20, nextId: any = undefined) {
    // Google 账号
    let list = await Service.listAll();
    // Rabbit 服务
    return {
      list: list,
      hasMore: false,
      nextId: undefined
    };
  }

  static async listAllData(filter?: any): Promise<DataType[]> {
    let keyword = filter?.keyword;
    return (await this.listAll()).map(Service.appendToken)
      .filter((e) => !keyword || `${e.issuer}`.includes(keyword) || `${e.label}`.includes(keyword))
      .sort((a, b) => LangKit.sortDesc(a.pin ? 1 : 0, b.pin ? 1 : 0));
  }

  static async listAll(hook: boolean = true): Promise<StoreOtpOptions[]> {
    if (hook) {
      await ifSyncCloud();
    }
    let list = await getRemoteStorage().getAsync(STORAGE_KEY as any);
    if (hook) {
      list = ifEmptyAddTest(list ?? []);
    }
    return list;
  }

  static async get(id: string) {
    return (await Service.listAll(false) || []).find((e: any) => e.id === id) as StoreOtpOptions;
  }

  static async getWithToken(id: string) {
    return await Service.get(id).then(Service.appendToken)
  }

  static async updateById(id: string, update: any = {}) {
    let list = (await Service.listAll(false)).map(e => {
      return {
        ...e,
        ...(e.id === id ? update : {})
      }
    });
    await getRemoteStorage().setAsync(STORAGE_KEY as any, list);
  }


  static async removeById(id: string) {
    let list = await Service.listAll(false);
    await getRemoteStorage().setAsync(STORAGE_KEY as any, list.filter(e => `${id}` !== `${e.id}`));
  }

  static async saveBatchStore(storeOtp: StoreOtpOptions[] = []) {
    console.log('正在保存', storeOtp);
    let list = storeOtp.map(e => ({
      ...TwoFaKit.getToken(e),
      ...e,
    })).filter(e => e.isValid);
    for (let item of list) {
      await Service.save(item);
    }
  }

  /**
   * 获取锁信息
   */
  static async getLock() {
    return (await getRemoteStorage().getAsync(LOCK_KEY as any) ?? {locked: false}) as Lock;
  }

  /**
   * 锁定 / 解锁
   * @param locked
   * @param passwd
   */
  static async locked(locked: boolean = false, passwd?: string): Promise<[boolean, string]> {
    if (locked) {
      await getRemoteStorage().setAsync(LOCK_KEY as any, {locked, passwd} as Lock);
      return [true, 'ok'];
    } else {
      let lock = await Service.getLock();
      if (!lock?.passwd || lock.passwd === passwd) {
        await getRemoteStorage().remove(LOCK_KEY as any);
        return [true, 'ok'];
      }
      return [false, `密码错误`];
    }
  }

  static async resetLock() {
    await getRemoteStorage().remove(LOCK_KEY as any);
    await getRemoteStorage().remove(STORAGE_KEY as any);
  }

  static appendToken = (e: StoreOtpOptions) => {
    let token = TwoFaKit.getToken(e);
    return ({
      ...e,
      ...token,
      label: decodeURIComponent(`${e?.label}`),
      progress: Math.floor(((token?.timeRemaining! / (token?.timeUsed! + token?.timeRemaining!)) * 100)),
    });
  };
}
