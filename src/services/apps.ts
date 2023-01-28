import {storageKit} from "@hocgin/browser-addone-kit";
import {LangKit} from "@/_utils";
import {StoreOtpOptions, TwoFaKit} from "@/_utils/_2fa";
import {DataType, Lock} from "@/_types";
import {v4 as uuidv4} from 'uuid';

let STORAGE_KEY = `OTP_LIST`;
let LOCK_KEY = `LOCK_KEY`;
export default class OptService {

  static getWebSiteImageUrl(data: DataType) {
    let title = `${data?.label}`.toLowerCase();
    if (title.includes('github')) {
      return `https://cdn.hocgin.top/file/github-mark.png`;
    } else if (title.includes('npm')) {
      return `https://cdn.hocgin.top/file/npm_logo.png`;
    } else if (title.includes('微软') || title.includes(`microsoft`)) {
      return `https://cdn.hocgin.top/file/MSFT.png`
    } else if (title.includes('google')) {
      return `https://cdn.hocgin.top/file/google_logo.png`;
    }
    return `https://cdn.hocgin.top/file/lock.png`;
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
      // @ts-ignore
      id: uuidv4(),
      ...values
    });
    // @ts-ignore
    list = LangKit.distinct(list as StoreOtpOptions[], e => e?.id);
    await storageKit.setAsync(STORAGE_KEY as any, list);
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
    let list = await storageKit.getAsync(STORAGE_KEY as any);
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
    await storageKit.setAsync(STORAGE_KEY as any, list);
  }


  static async removeById(id: string) {
    let list = await OptService.listAll();
    await storageKit.setAsync(STORAGE_KEY as any, list.filter(e => `${id}` !== `${e.id}`));
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
    return (await storageKit.getAsync(LOCK_KEY as any) ?? {locked: false}) as Lock;
  }

  /**
   * 锁定 / 解锁
   * @param locked
   * @param passwd
   */
  static async locked(locked: boolean = false, passwd?: string): Promise<[boolean, string]> {
    if (locked) {
      await storageKit.setAsync(LOCK_KEY as any, {locked, passwd} as Lock);
      return [true, 'ok'];
    } else {
      let lock = await OptService.getLock();
      if (!lock?.passwd || lock.passwd === passwd) {
        await storageKit.remove(LOCK_KEY as any);
        return [true, 'ok'];
      }
      return [false, `密码错误`];
    }
  }

  static async resetLock() {
    await storageKit.remove(LOCK_KEY as any);
    await storageKit.remove(STORAGE_KEY as any);
  }
}
