import { DatabaseContext } from 'providers/DatabaseProvider';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IContact } from 'types';
import CallComponent from './CallComponent';

const CallPage = (props: { videoOn: boolean }) => {
  const contactId = useParams().contactid ?? '';

  const db = useContext(DatabaseContext);

  const [contact, setContact] = useState<IContact | null>(null);
  useEffect(() => {
    if (db)
      db.getContact(contactId).then((ctc) => {
        setContact(ctc);
      });
  }, [contactId, db]);

  return contact ? (
    <CallComponent contact={contact} videoOn={props.videoOn}></CallComponent>
  ) : (
    <>No contact selected</>
  );
};

export default CallPage;
