import {StoreOtpOptions, TokenInfo} from "@/_utils/_2fa";

export enum MessageType {
  Pin = 'Pin',
  Unpin = 'Unpin',
  ScanPageQrCode = 'ScanPageQrCode',
  ManualInput = 'ManualInput',
  UploadQrCode = 'UploadQrCode',
  ImportBackup = 'ImportBackup',
  ExportBackup = 'ExportBackup',
  Lock = 'Lock',
  UnLock = 'UnLock',
  Delete = 'Delete',
  ResetLock = 'ResetLock',
  GoHomePage = 'GoHomePage',
  ScanPageImage = 'ScanPageImage',
}

export interface Message {
  type: MessageType;
  value?: any
}

export type DataType = (StoreOtpOptions & TokenInfo) | undefined;

export interface Lock {
  locked: boolean,
  passwd?: string
}
