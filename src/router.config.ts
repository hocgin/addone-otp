export default [
  {
    path: '/',
    component: '@/layouts/BasicLayout',
    routes: [
      {path: '/', component: '@/pages/index'},
    ],
  },
  {component: '@/pages/404'},
];
