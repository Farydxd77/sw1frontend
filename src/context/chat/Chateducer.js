import { types } from "../../types/types";



export const ChatReducer = ( state, action ) => {

    switch ( action.type ) {

        case types.usuairiosCargados:
            return {
                ...state,
                usuarios: [ ...action.payload ]
            }

        case types.activarChat: 
        if ( state.chatActivo === action.payload ) return state;
        return {
            ...state,
            chatActivo: action.payload,
            mensaje: []
        }

        case types.nuevoMensaje:
            if ( state.chatActivo === action.payload.de  ||
                state.chatActivo === action.payload.para
            ) {
                return{
                    ...state,
                    mensajes: [ ...state.mensajes, action.payload ]
                }
            } else {
                return state;
            }
        
        case types.cargarMensajes:
            return{
                ...state,
                mensajes: [...action.payload]
            }
                // Nuevos casos para grupos
        case types.gruposCargados:
            return {
                ...state,
                grupos: [...action.payload]
            }
        // En tu reducer
        case types.agregarGrupo:
             return {
                 ...state,
              grupos: [ action.payload]
             }

        case types.activarGrupo:
                return {
                    ...state,
                    grupoActivo: action.payload
                }
        case types.cargarGrupo: 
                return {
                    ...state,
                    contenidoCanvas: action.payload
                }
        default:
            return state;
    }
}