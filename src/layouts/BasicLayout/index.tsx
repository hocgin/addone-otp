import styles from './index.less';
import React from 'react';
import { Footer } from '@hocgin/ui';
import { Theme } from '@/components';

const BasicLayout: React.FC<{ children: any }> = ({ children }) => {
  return (<Theme>
    <div className={styles.normal}>
      <h1 className={styles.title}>Yay! Welcome to umi!</h1>
      {children}
      <Footer />
    </div>
  </Theme>);
};
export default BasicLayout;
