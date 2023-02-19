import {defineConfig} from 'umi';
import {WebExtension} from '@hocgin/browser-addone-kit';
import {BrowserAddoneExtensionsType} from '@hocgin/umijs-plugin-browser-addone';

export default defineConfig({
  define: {
    // api 地址
    baseUrl: '',
    // 单点登录地址
    ssoServerUrl: '/login',
  },
  plugins: ['@hocgin/umijs-plugin-browser-addone'],
  extensions: {
    name: '__MSG_extension_name__',
    description: '__MSG_extension_description__',
    defaultLocale: 'en',
    icons: '../public/logo.png',
    action: {
      defaultTitle: '__MSG_extension_action_title__',
      defaultPopup: '@/pages/popup',
    },
    background: {
      serviceWorker: '@/pages/background/index',
    },
    contentScripts: [
      {
        matches: ['<all_urls>'],
        allFrames: true,
        match_origin_as_fallback: true,
        entries: ['@/pages/contentscript/index'],
        runAt: 'document_end',
      },
    ],
    permissions: ['contextMenus', 'storage', 'downloads'],
    hostPermissions: ['<all_urls>'],
  },
});
