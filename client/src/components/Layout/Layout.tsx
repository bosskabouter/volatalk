/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { Container, CssBaseline } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import Header from '../AppBar/Header';
import Footer from '../Footer/Footer';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();

  const styles = {
    containerRoot: css`
      margin-bottom: 63px;
      margin-top: 63px;

      //Equivalent to [theme.breakpoints.only('xs')]: {}
      @media (width: ${theme.breakpoints.values.xs}) {
        padding-bottom: ${theme.spacing(2)};
        padding-top: ${theme.spacing(2)};
      }

      //Equivalent to [theme.breakpoints.only('sm')]: {}
      @media (width: ${theme.breakpoints.values.sm}) {
        padding-bottom: ${theme.spacing(3)};
        padding-top: ${theme.spacing(3)};
      }

      //Equivalent to [theme.breakpoints.up('md')]: {}
      @media (min-width: ${theme.breakpoints.values.md}) {
        padding-bottom: ${theme.spacing(4)};
        padding-top: ${theme.spacing(4)};
      }
    `,
    root: css`
      position: relative;
      max-height: 90hv;
    `,
  };

  return (
    <CssBaseline>
      <Header />
      <Container css={styles.containerRoot} sx={{}}>
        <main css={styles.root}>{children}</main>
      </Container>
      <Footer />
    </CssBaseline>
  );
};

export default Layout;
