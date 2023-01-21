import { defineConfig } from 'umi';
import { WebExtension } from '@hocgin/browser-addone-kit';
import { BrowserAddoneExtensionsType } from '@hocgin/umijs-plugin-browser-addone';

export default defineConfig({
  define: {
    // api 地址
    baseUrl: '',
    // 单点登录地址
    ssoServerUrl: '/login',
  },
  plugins: ['@hocgin/umijs-plugin-browser-addone'],
  extensions: {
    icons: '../public/logo.jpg',
    contentScripts: [
      WebExtension.kit.tbkScriptConfig(['@/pages/_tpl/contentscripts/tbk']),
      WebExtension.kit.authorizationScriptConfig([
        '@/pages/_tpl/contentscripts/authorization',
      ]),
      {
        matches: ['https://baidu.com/*'],
        entries: ['@/pages/_tpl/contentscripts/github'],
      },
      {
        matches: ['https://baidu.com/*', 'https://www.baidu.com/*'],
        entries: ['@/pages/_tpl/contentscripts/baidu'],
        runAt: 'document_end',
      },
    ],
    background: {
      serviceWorker: '@/pages/_tpl/background/index',
    },
    permissions: ['contextMenus', 'webRequest', 'storage', 'notifications'],
    hostPermissions: ['<all_urls>'],
  } as BrowserAddoneExtensionsType,
});
