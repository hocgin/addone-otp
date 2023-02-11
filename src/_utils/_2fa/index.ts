import qs from "query-string";
import {LangKit} from "@/_utils/lang";
import qrcode from "qrcode";
// @ts-ignore
import {HOTP, TOTP} from "./lib";
import {downloadText} from "./platform";

export let defaultHOTP = HOTP.defaults;
export let defaultTOTP = TOTP.defaults;

export enum Algorithm {
  'SHA1' = 'SHA1',
  SHA224 = 'SHA224',
  'SHA256' = 'SHA256',
  SHA384 = 'SHA384',
  SHA512 = 'SHA512',
  'SHA3-224' = 'SHA3-224',
  'SHA3-256' = 'SHA3-256',
  'SHA3-384' = 'SHA3-384',
  'SHA3-512' = 'SHA3-512'
}

export enum Strategy {
  TOTP = 'TOTP',
  HOTP = 'HOTP',
}

export interface OtpOptions {
  // 密钥
  secret: string,
  // 周期
  period?: number,
  // 位数
  digits: number,
  // 算法
  algorithm: Algorithm,
  // 类型（时间/计数器）
  type: Strategy,
}

export interface TokenInfo {
  isValid: boolean,
  secret?: string,
  message?: string,
  token?: string,
  // 已过时间(秒)
  timeUsed?: number,
  // 剩余时间(秒)
  timeRemaining?: number,
  progress?: number,
}

export interface StoreOtpOptions extends OtpOptions {
  id: string,
  keyUri: string,
  label?: string,
  issuer?: string,
  // 是否置顶
  pin?: boolean;
}

export class TwoFaKit {
  private static asOtpOptions(opt: OtpOptions) {
    let result = {
      ...opt,
    } as any;
    if (opt.algorithm) {
      result.algorithm = `${opt.algorithm}`.toUpperCase();
    }
    if (opt.digits) {
      result.digits = opt.digits;
    }
    if (opt.period) {
      result.period = opt.period;
    }
    if (opt.type === Strategy.TOTP) {
      result = {
        ...defaultTOTP,
        ...result
      };
    } else if (opt.type === Strategy.HOTP) {
      result = {
        ...defaultHOTP,
        ...result
      };
    }
    return result;
  }


  /**
   * 获取配置(low级别)
   * @param secret
   */
  private static createOptions(secret: string) {
    return {
      secret,
      // createDigest: createDigestPlaceholder,
      // createHmacKey: totpCreateHmacKey,
      // ascii / hex
    } as OtpOptions;
  }

  /**
   * 获取token信息
   * @param opt
   */
  static getToken(opt: OtpOptions): TokenInfo {
    let secret = opt.secret;
    let result: TokenInfo | any = {isValid: false};
    try {
      let authenticator = TwoFaKit.getAuthenticator(opt);
      let period = authenticator?.period;
      result.secret = secret;
      result.token = authenticator.generate();
      let validate = authenticator.validate({
        token: result.token,
      });
      result.isValid = validate !== undefined || validate >= 0;
      let timeRemaining = period * (1 - ((Date.now() / 1000) / period % 1)) | 0;
      // 已用
      result.timeUsed = period - timeRemaining;
      // 剩余
      result.timeRemaining = timeRemaining;
      result.keyUri = authenticator.toString();
    } catch (e: any) {
      console.log('验证失败', e);
      result.message = `${e?.message}`;
    }
    return result;
  }

  /**
   * https://github.com/yeojz/otplib/blob/147e67637377196e3c59cf93b12ac325aca76fac/packages/otplib-core/src/authenticator.ts#L89
   * https://github.com/yeojz/otplib/blob/147e67637377196e3c59cf93b12ac325aca76fac/packages/otplib-core/src/totp.ts#L149
   * https://github.com/yeojz/otplib/blob/147e67637377196e3c59cf93b12ac325aca76fac/packages/otplib-core/src/hotp.ts#L112
   */
  static getAuthenticator(opt: OtpOptions): (typeof HOTP | typeof TOTP | any) {
    let overOpt = TwoFaKit.asOtpOptions(opt);
    let authenticator;
    switch (opt.type) {
      case Strategy.HOTP:
        authenticator = new HOTP({
          ...overOpt,
        } as any) as HOTP;
        break;
      case Strategy.TOTP:
      default:
        authenticator = new TOTP({
          ...overOpt,
        } as any) as TOTP;
    }
    return authenticator;
  }

  /**
   * 从二维码扫描的URL信息
   * - otpauth://totp/hocgin?secret=PDMYB7GNH3YMXGLVMKCLV5JTG566DI4F&issuer=npm
   * - otpauth://totp/otplib-website:otplib-demo-user?secret=52MWX3DYEXYKV4OB&period=30&digits=6&algorithm=SHA1&issuer=otplib-website
   * =============
   * algorithm: "SHA1"
   * digits: "6"
   * issuer: "otplib-website"
   * period: "30"
   * secret: "52MWX3DYEXYKV4OB"
   * @param keyUri
   */
  private static getKeyUriInfo(keyUri: string) {
    keyUri = `${keyUri}`.trim() as any;
    if (!keyUri.startsWith('otpauth://')) {
      throw new Error(`二维码或地址协议错误：${keyUri}`);
    }
    let type = Strategy.TOTP;
    if (keyUri.toLowerCase().startsWith('otpauth://totp')) {
      type = Strategy.TOTP;
    } else if (keyUri.toLowerCase().startsWith('otpauth://hotp')) {
      type = Strategy.HOTP;
    }

    let info = qs.parseUrl(keyUri);
    let queryParams = info?.query ?? {};

    let label;
    let issuer = queryParams.issuer;
    try {
      keyUri = decodeURIComponent(keyUri);
      label = LangKit.calNoNil(keyUri.match(/otp\/(\S*?)\?/)?.[1] as any, decodeURIComponent);
      if (`${label}`.includes(':')) {
        label = label.split(':');
        if (label.length === 2) {
          label = label[1];
          issuer = label[0];
        } else {
          label = label[0];
          if (typeof queryParams.issuer !== "undefined") {
            issuer = queryParams.issuer;
          }
        }
      }
    } catch (e) {
      console.log('提取字符串编号错误', keyUri, label);
      label = 'unknown';
    }
    return {
      keyUri,
      type,
      ...queryParams,
      label: queryParams?.label || label,
      issuer: queryParams?.issuer || issuer,
      secret: queryParams?.secret as string,
      algorithm: LangKit.calNoNil(queryParams?.algorithm as any, LangKit.toLower),
      digits: LangKit.calNoNil(queryParams?.digits as any, parseInt),
      period: LangKit.calNoNil((queryParams?.step || queryParams?.period) as any, parseInt)
    };
  }

  static keyUriToStoreOptions(keyUri: string) {
    let urlOpt = TwoFaKit.getKeyUriInfo(keyUri);
    let defOpt = TwoFaKit.createOptions(urlOpt.secret);
    return {
      ...defOpt,
      ...urlOpt,
    } as StoreOtpOptions;
  }

  /**
   * to data uri
   * @param keyuri
   */
  public static async asQrCodeDataURL(keyuri?: string) {
    if (!keyuri) {
      return keyuri;
    }
    return await qrcode.toDataURL(keyuri, {type: 'image/jpeg'});
  }


  static saveFile(text: string, filename: string) {
    return new Promise<string>((resolve, reject) => {
      try {
        resolve(downloadText(text, filename));
      } catch (e) {
        reject(e);
      }
    });
  }
}
