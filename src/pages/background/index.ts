import {i18nKit, WebExtension} from '@hocgin/browser-addone-kit';
import {ServiceWorkerOptions} from '@hocgin/browser-addone-kit/dist/esm/browser/serviceWorker';
import '@/request.config';
import {ContextMenusId, MessageType} from "@/_types";
import AppsService from '@/_utils/_2fa/apps'
import Config from "@/config";
import {stringify} from "query-string";

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

WebExtension.kit.serviceWorker({
  ...ServiceWorkerOptions.default,
  projectId: Config.getProjectId(),
  getUpdateURL: (extensionId: string, projectId: string) => {
    let queryStr = stringify({
      extensionId,
      update: true
    });
    return `https://logspot.hocgin.top/${projectId}_changelog?${queryStr}`;
  },
  getInstallURL: (extensionId: string, projectId: string) => {
    let queryStr = stringify({
      extensionId,
      install: true
    });
    return `https://logspot.hocgin.top/${projectId}?${queryStr}`;
  },
  getUninstallURL: (extensionId: string, projectId: string) => {
    let queryStr = stringify({
      extensionId, projectId,
      labels: projectId,
      title: `SuggestionsOrQuestions/建议或反馈`,
      uninstall: true
    });
    return `https://github.com/hocgin/feedback/issues/new?${queryStr}`;
  },
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
      value: `${i18nKit.getMessage(`error` as any)}: ${e?.message}`
    });
  }
});
