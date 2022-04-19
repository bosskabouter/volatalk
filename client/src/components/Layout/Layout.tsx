/** @jsxImportSource @emotion/react */
/*
 * Layout.tsx
 * Layout component.
 *
 * Created by firstName lastName on date.
 *
 * pwa-starter
 *
 * Copyright © 2009-2021 United States Government as represented by
 * the Program Manager of the DHA: Web and Mobile Technology Program Management Office.
 * All Rights Reserved.
 *
 * Copyright © 2009-2021 Contributors. All Rights Reserved.
 *
 * THIS OPEN SOURCE AGREEMENT ("AGREEMENT") DEFINES THE RIGHTS OF USE,
 * REPRODUCTION, DISTRIBUTION, MODIFICATION AND REDISTRIBUTION OF CERTAIN
 * COMPUTER SOFTWARE ORIGINALLY RELEASED BY THE UNITED STATES GOVERNMENT
 * AS REPRESENTED BY THE GOVERNMENT AGENCY LISTED BELOW ("GOVERNMENT AGENCY").
 * THE UNITED STATES GOVERNMENT, AS REPRESENTED BY GOVERNMENT AGENCY, IS AN
 * INTENDED THIRD-PARTY BENEFICIARY OF ALL SUBSEQUENT DISTRIBUTIONS OR
 * REDISTRIBUTIONS OF THE SUBJECT SOFTWARE. ANYONE WHO USES, REPRODUCES,
 * DISTRIBUTES, MODIFIES OR REDISTRIBUTES THE SUBJECT SOFTWARE, AS DEFINED
 * HEREIN, OR ANY PART THEREOF, IS, BY THAT ACTION, ACCEPTING IN FULL THE
 * RESPONSIBILITIES AND OBLIGATIONS CONTAINED IN THIS AGREEMENT.
 *
 * Government Agency: DHA: Web and Mobile Technology Program Management Office
 * Government Agency Original Software Designation: pwa-starter
 * Government Agency Original Software Title: pwa-starter
 * User Registration Requested. Please send email
 * with your contact information to: robert.a.kayl.civ@mail.mil
 * Government Agency Point of Contact for Original Software - Program Manager: robert.a.kayl.civ@mail.mil
 */
import { css } from '@emotion/react';
import { Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import AppBar from '../AppBar/AppBar';
import Footer from '../Footer/Footer';

interface IProps {
  children: React.ReactNode;
}

const Layout = ({ children }: IProps) => {
  const theme = useTheme();

  const styles = {
    containerRoot: css`
      margin-bottom: 56px;
      margin-top: 64px;

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
    root: css``,
  };

  return (
    <>
      <AppBar />
      <Container css={styles.containerRoot}>
        <main css={styles.root}>{children}</main>
      </Container>
      <Footer />
    </>
  );
};

export default Layout;
