import {LangKit as _LangKit} from '@hocgin/hkit';

export class LangKit extends _LangKit {

  /**
   * 排序比较，数值大的在前面
   * @param a
   * @param b
   */
  static sortDesc(a: number, b: number): number {
    if (a > b) {
      return -1;
    } else if (a < b) {
      return 1
    }
    return 0;
  }

  static calNoNil<T, R>(val: T, callFunc: (val: T) => R): R {
    if (val !== undefined && val !== null) {
      try {
        return callFunc.call(this, val);
      } catch (e) {
        console.warn('LangKit.calNoNil 错误', val);
      }
    }
    return val as any;
  }

  static toLower(val: any): string {
    return `${val}`.toLowerCase();
  }

  static readFile(file: File) {
    return new Promise<string | undefined>((resolve, reject) => {
      let fr = new FileReader();
      fr.onerror = reject;
      fr.onload = () => resolve(fr?.result as string)
      fr.readAsText(file);
    });
  }

  static async resolveData(url: string) {
    return new Promise<string>((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "blob";
      xhr.onerror = reject;
      xhr.onload = () => resolve(xhr.response);
      xhr.send();
    });
  }

  static blobToBase64(blob: Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
}
