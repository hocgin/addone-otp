import { CssPropsKit as _CssPropsKit } from '@hocgin/hkit';

export enum CssPropsKey {

}

export let cssPropsKit = _CssPropsKit.create<CssPropsKey | any, string>();

export class CssPropsKit {
  static setBackgroundColor(value: string = 'unset') {
    cssPropsKit.set('--background-color', value);
  }
}
