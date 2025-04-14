import React,{ createContext, useReducer } from "react";
import { ChatReducer } from "./Chateducer";


export const ChatConext = createContext();

const initialState = {
    uid: '',
    chatActivo: null, //UID del usuario al q yo quiero enviar mensajes
    grupoActivo: null, // ID del grupo activo
    modoGrupo: false,  // Indica si estamos en modo grupo o chat
    // entonces chat_activo tiene q ser el grupo al q yo quiero enviar
    usuarios: [], // Todos los usuarios de la base de datos
    grupos: [],        // Todos los grupos disponibles
    mensajes: [], // Chat seleccionado
    contenidoCanvas: null, // Contenido del canvas del grupo activo
}

export const ChatProvider = ( { children } ) => {
    const [chatState , dispatch ] = useReducer(ChatReducer, initialState);

  return (
    <ChatConext.Provider value={{
        chatState,
        dispatch
    }}>
        { children }
    </ChatConext.Provider>
  )
}
