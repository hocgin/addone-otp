import {StoreOtpOptions, TokenInfo} from "./index";

export type DataType = (StoreOtpOptions & TokenInfo);

export interface Lock {
  locked: boolean,
  passwd?: string
}
