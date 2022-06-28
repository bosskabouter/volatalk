import { AppBar } from '@mui/material';
import { WidgetBar } from 'util/Widgets/WidgetBar';

const Footer = () => {
  return (
    <AppBar position="fixed" variant="elevation" color="primary" sx={{ top: 'auto', bottom: 0 }}>
      <WidgetBar />
    </AppBar>
  );
};

export default Footer;
