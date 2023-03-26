import {I18nKit, RequestKit, WebExtension} from '@hocgin/browser-addone-kit';
import {ServiceWorkerOptions} from '@hocgin/browser-addone-kit/dist/esm/browser/serviceWorker';
import {ContextMenusId, Message, MessageType} from "@/_types";
import AppsService from '@/_utils/_2fa/apps'
import Config from "@/config";
import {LangKit} from "@/_utils";

let updateContextMenus = async () => {
  WebExtension.contextMenus.create({
    id: ContextMenusId.ClickScanImage,
    title: I18nKit.getMessageOrDefault(`scan_qrcode` as any),
    contexts: ['image'],
  });
  let list = await AppsService.listAll();
  if (!list.length) {
    return;
  }
  for (let item of list) {
    WebExtension.contextMenus.create({
      id: `${ContextMenusId.FillPrefix}${item.id}`,
      title: `${I18nKit.getMessageOrDefault(`fill` as any)} ${item.label}${(item.label && item.issuer) ? `/${item.issuer}` : (item.issuer ?? '')}`,
      contexts: ['editable'],
    });
  }
};

WebExtension.kit.serviceWorker({
  ...ServiceWorkerOptions.default,
  projectId: Config.getProjectId(),
}, updateContextMenus);

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
    WebExtension.tabs.sendMessage(tab?.id, {
      type: MessageType.ErrorMessage,
      value: `${I18nKit.getMessageOrDefault(`error` as any)}: ${e?.message}`
    });
  }
});

WebExtension.runtime.onMessage.addListener((message: Message, sender: any, sendResponse: any) => {
  if (message?.type === MessageType.GetFile) {
    (async () => {
      let blob = await (await fetch(message?.value, {method: 'GET'})).blob();
      sendResponse((await LangKit.blobToBase64(blob)))
    })();
    return true;
  }
});
