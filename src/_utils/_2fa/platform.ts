import {WebExtension} from "@hocgin/browser-addone-kit";
import {cloudKit, storageKit, StorageKit} from "@hocgin/browser-addone-kit";
import dayjs from "dayjs";

export function downloadText(text: string, filename: string): string {
  let url = URL.createObjectURL(new Blob([text], {
    type: "application/json",
  }));
  WebExtension.downloads.download({url, filename: `${dayjs().format('YYYYMMDD_HHmmss')}_${filename}`});
  return url;
}


export function getRemoteStorage(): StorageKit {
  return cloudKit;
}

export function getLocalStorage(): StorageKit {
  return storageKit;
}


export function uuid() {
  let randomInt = Math.floor(Math.random() * 1_000_000);
  return `${Date.now()}-${randomInt}`
}
