import ContactList from 'pages/Contacts/ContactList';

import AcceptInvite from 'components/Invite/AcceptInvite';
import { useLocation } from 'react-router-dom';

const Home = () => {
  const invite = useLocation().search || localStorage.getItem('invite');
  return invite && invite?.length > 0 ? <AcceptInvite invite={invite} /> : <ContactList />;
};

export default Home;
