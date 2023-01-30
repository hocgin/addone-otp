import {i18nKit, WebExtension} from '@hocgin/browser-addone-kit';
import {ServiceWorkerOptions} from '@hocgin/browser-addone-kit/dist/esm/browser/serviceWorker';
import '@/request.config';
import {ContextMenusId, MessageType} from "@/_types";

WebExtension.kit.serviceWorker(ServiceWorkerOptions.default);

let updateContextMenus = () => {
  WebExtension.contextMenus.create({
    id: ContextMenusId.ClickScanImage,
    title: '扫描二维码保存',
    contexts: ['image'],
  });
};
updateContextMenus();
WebExtension.contextMenus.onClicked.addListener(async (info: any) => {
  if (info.menuItemId === ContextMenusId.ClickScanImage) {
    let tab = await WebExtension.kit.getCurrentTab();
    WebExtension.tabs.sendMessage(tab?.id, {type: MessageType.ScanImageUrl, value: info?.srcUrl});
  }
});
