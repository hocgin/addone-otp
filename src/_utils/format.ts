import {FormatKit as _FormatKit} from "@hocgin/hkit";

export class FormatKit extends _FormatKit {

  static formatAmt(val: number, def = '空') {
    if (val === null || val === undefined) {
      return def;
    }
    let valt = val.toFixed(2);
    return `¥ ${valt}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}
