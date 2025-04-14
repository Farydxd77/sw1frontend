
import React, { useContext } from 'react'

import '../css/chat.css';
import { InboxPeople } from '../components/InboxPeople';
import { Message } from '../components/Message';
import { ChantSelect } from '../components/ChantSelect';
import { ChatConext } from '../context/chat/ChatContext';
import Builder from './Builder';
// En ChatPage.js


export const ChatPage = () => {

  const { chatState } = useContext( ChatConext );

    return (
       <div className="messaging">
      <div className="inbox_msg">

       <InboxPeople/>
       {
            ( chatState.chatActivo )
            ?  <Message/>
            : <div className="page-builder-container"><Builder/></div>
            // : <ChantSelect/>
       }
        
      </div>


  </div>
  
  )
}
