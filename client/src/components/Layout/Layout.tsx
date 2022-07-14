/** @jsxImportSource @emotion/react */

import { Container, CssBaseline } from '@mui/material';
import * as React from 'react';
import Header from '../AppBar/Header';
import Footer from '../AppBar/Footer';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <CssBaseline>
      <Header />
      <Container sx={{ pt: '3rem', pb: '5rem', mt: 0, mb: 0 }}>
        <main>{children}</main>
      </Container>
      <Footer />
    </CssBaseline>
  );
};

export default Layout;
