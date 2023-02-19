import {i18nKit, WebExtension} from '@hocgin/browser-addone-kit';
import {ServiceWorkerOptions} from '@hocgin/browser-addone-kit/dist/esm/browser/serviceWorker';
import '@/request.config';
import {ContextMenusId, MessageType} from "@/_types";
import AppsService from '@/_utils/_2fa/apps'

let updateContextMenus = async () => {
  WebExtension.contextMenus.create({
    id: ContextMenusId.ClickScanImage,
    title: i18nKit.getMessage(`scan_qrcode` as any),
    contexts: ['image'],
  });
  let list = await AppsService.listAll();
  if (!list.length) {
    return;
  }
  for (let item of list) {
    WebExtension.contextMenus.create({
      id: `${ContextMenusId.FillPrefix}${item.id}`,
      title: `${i18nKit.getMessage(`fill` as any)} ${item.label}${(item.label && item.issuer) ? `/${item.issuer}` : (item.issuer ?? '')}`,
      contexts: ['editable'],
    });
  }
};

WebExtension.kit.serviceWorker(ServiceWorkerOptions.default, updateContextMenus);

updateContextMenus();
WebExtension.contextMenus.onClicked.addListener(async (info: any, tab: any) => {
  try {
    if (info.menuItemId === ContextMenusId.ClickScanImage) {
      WebExtension.tabs.sendMessage(tab?.id, {type: MessageType.ScanImageUrl, value: info?.srcUrl});
    } else if (`${info.menuItemId}`.startsWith(ContextMenusId.FillPrefix)) {
      let id = `${info.menuItemId}`.substring(ContextMenusId.FillPrefix.length, `${info.menuItemId}`.length);
      let tokenInfo = await AppsService.getWithToken(id);
      console.log(info, tab, tokenInfo);
      WebExtension.tabs.sendMessage(tab?.id, {type: MessageType.InsertEditableToken, value: tokenInfo.token});
    }
  } catch (e: any) {
    WebExtension.tabs.sendMessage(tab?.id, {type: MessageType.ErrorMessage, value: `${i18nKit.getMessage(`error` as any)}: ${e?.message}`});
  }
});
