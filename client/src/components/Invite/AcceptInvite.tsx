import React from 'react';
import { useLocation } from 'react-router-dom';
import { checkReceivedInvite } from 'services/InvitationService';

export default function AcceptInvite() {
  const queryParams = new URLSearchParams(useLocation().search);

  checkReceivedInvite(queryParams);

  return <div>{queryParams.toString()}</div>;
}
