import {cloudKit, storageKit} from "@hocgin/browser-addone-kit";
import {LangKit} from "@/_utils";
import {StoreOtpOptions, TwoFaKit} from "@/_utils/_2fa";
import {DataType, Lock} from "@/_types";
import {v4 as uuidv4} from 'uuid';
import icons from '@/_utils/icons.json'
import memoizeOne from 'memoize-one'


let STORAGE_KEY = `OTP_LIST`;
let LOCK_KEY = `LOCK_KEY`;

/**
 * 两个版本后移除
 * 0.0.9 加入
 */
async function ifSyncCloud() {
  let values1 = await storageKit.getAsync(STORAGE_KEY as any) ?? [];
  if (values1.length > 0) {
    await OptService.saveBatchStore(values1);
    await storageKit.remove(STORAGE_KEY as any);
  }
  let values2 = await storageKit.getAsync(LOCK_KEY as any);
  if (values2) {
    await cloudKit.setAsync(LOCK_KEY as any, values2);
    await storageKit.remove(LOCK_KEY as any)
  }
}

export default class OptService {
  static _getWebSiteImageUrl = memoizeOne((title) => Object.entries(icons).find((item) => title.includes(item?.[0]))?.[1])

  static getWebSiteImageUrl(data: DataType) {
    let label = `${data?.label}`.toLowerCase();
    let issuer = `${data?.issuer}`.toLowerCase();
    return OptService._getWebSiteImageUrl(issuer) ?? OptService._getWebSiteImageUrl(label) ?? `https://cdn.hocgin.top/file/lock.png`;
  }

  static async save(values: StoreOtpOptions) {
    console.log('保存', values);
    let tokenData = TwoFaKit.getToken(values);
    if (!tokenData.isValid) {
      console.log(`保存失败: ${tokenData.message}`)
      throw new Error(`保存失败: ${tokenData.message}`)
    }
    let list = await OptService.listAll();
    list.push({
      ...values,
      id: values?.id ?? uuidv4(),
    });
    list = LangKit.distinct(list as StoreOtpOptions[], e => e?.id);
    await cloudKit.setAsync(STORAGE_KEY as any, list);
  }

  static async scroll(filter: any = {}, limit: number = 20, nextId: any = undefined) {
    // Google 账号
    let list = await OptService.listAll();
    // Rabbit 服务
    return {
      list: list,
      hasMore: false,
      nextId: undefined
    };
  }

  static async listAllData(filter?: any): Promise<DataType[]> {
    let keyword = filter.keyword;
    return (await this.listAll()).map(e => {
      let token = TwoFaKit.getToken(e);
      return ({
        ...e,
        ...token,
        label: decodeURIComponent(`${e?.label}`),
        progress: Math.floor(((token?.timeRemaining! / (token?.timeUsed! + token?.timeRemaining!)) * 100)),
      });
    }).filter((e) => !keyword || `${e.issuer}`.includes(keyword) || `${e.label}`.includes(keyword))
      .sort((a, b) => LangKit.sortDesc(a.pin ? 1 : 0, b.pin ? 1 : 0));
  }

  static async listAll(): Promise<StoreOtpOptions[]> {
    await ifSyncCloud()
    let list = await cloudKit.getAsync(STORAGE_KEY as any);
    return list ?? [];
  }

  static async get(id: number) {
    return (await OptService.listAll() || []).find((e: any) => e.id === id);
  }

  static async updateById(id: string, update: any = {}) {
    let list = (await OptService.listAll()).map(e => {
      return {
        ...e,
        ...(e.id === id ? update : {})
      }
    });
    await cloudKit.setAsync(STORAGE_KEY as any, list);
  }


  static async removeById(id: string) {
    let list = await OptService.listAll();
    await cloudKit.setAsync(STORAGE_KEY as any, list.filter(e => `${id}` !== `${e.id}`));
  }

  static async saveBatchStore(storeOtp: StoreOtpOptions[] = []) {
    console.log('正在保存', storeOtp);
    let list = storeOtp.map(e => ({
      ...TwoFaKit.getToken(e),
      ...e,
    })).filter(e => e.isValid);
    for (let item of list) {
      await OptService.save(item);
    }
  }

  /**
   * 获取锁信息
   */
  static async getLock() {
    return (await cloudKit.getAsync(LOCK_KEY as any) ?? {locked: false}) as Lock;
  }

  /**
   * 锁定 / 解锁
   * @param locked
   * @param passwd
   */
  static async locked(locked: boolean = false, passwd?: string): Promise<[boolean, string]> {
    if (locked) {
      await cloudKit.setAsync(LOCK_KEY as any, {locked, passwd} as Lock);
      return [true, 'ok'];
    } else {
      let lock = await OptService.getLock();
      if (!lock?.passwd || lock.passwd === passwd) {
        await cloudKit.remove(LOCK_KEY as any);
        return [true, 'ok'];
      }
      return [false, `密码错误`];
    }
  }

  static async resetLock() {
    await cloudKit.remove(LOCK_KEY as any);
    await cloudKit.remove(STORAGE_KEY as any);
  }
}
