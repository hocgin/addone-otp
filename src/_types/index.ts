import {
  DataType as _DataType
} from "@/_utils/_2fa/types";

export enum MessageType {
  Pin = 'Pin',
  Unpin = 'Unpin',
  ScanPageQrCode = 'ScanPageQrCode',
  ManualInput = 'ManualInput',
  SyncWeChat = 'SyncWeChat',
  UploadQrCode = 'UploadQrCode',
  ImportBackup = 'ImportBackup',
  ExportBackup = 'ExportBackup',
  Lock = 'Lock',
  UnLock = 'UnLock',
  Delete = 'Delete',
  ResetLock = 'ResetLock',
  GoHomePage = 'GoHomePage',
  ScanPageImage = 'ScanPageImage',
  ScanImageUrl = 'ScanImageUrl',
  InsertEditableToken = 'InsertEditableToken',
  ErrorMessage = 'ErrorMessage',
  GetFile = 'GetFile',
}

export interface Message {
  type: MessageType;
  value?: any
}

export type DataType = _DataType;

export enum ContextMenusId {
  ClickScanImage = 'ClickScanImage',
  Separator = 'Separator',
  FillPrefix = 'fill-',
}
