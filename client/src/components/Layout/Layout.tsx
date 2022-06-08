/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import Header from '../AppBar/TemporaryDrawer';
import Footer from '../Footer/Footer';

interface IProps {
  children: React.ReactNode;
}

const Layout = ({ children }: IProps) => {
  const theme = useTheme();

  const styles = {
    containerRoot: css`
      margin-bottom: 0;
      margin-top: 0;

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
      padding-top: 100;
      padding-bottom: 63px;
      backgroundcolor: purple;
    `,
  };

  return (
    <>
      <Header />
      <Container css={styles.containerRoot} sx={{}}>
        <main css={styles.root}>{children}</main>
      </Container>
      <Footer />
    </>
  );
};

export default Layout;
