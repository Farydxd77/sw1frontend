import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";
import { ChatConext } from "../context/chat/ChatContext";
import { types } from "../types/types";
import { fetchConnToken } from "../helpers/fetch";
import { useCanvasContext } from "../context/CanvasContext";

// Ejemplo de uso
const componentes = [
    {
        "id": "texto1",
        "tipo": "texto",
        "x": 100,
        "y": 50,
        "width": 300,
        "height": 40,
        "text": "Bienvenidos a nuestra página",
        "color": "#333333",
        "fontSize": 24,
        "fontFamily": "Arial",
        "zIndex": 1
    },
    // Más componentes...
];

export const SidebarGroupItem = ({ grupo }) => {
    const { chatState, dispatch } = useContext(ChatConext);
    const { socket } = useContext(SocketContext);
      const { actions, components } = useCanvasContext();
    const activarGrupo = async() => {
        dispatch({
            type: types.activarGrupo,
            payload: grupo._id
        });       
        const resp = await fetchConnToken(`grupos/${grupo._id}`);
        if (resp.ok && resp.grupo) {
            const contenido = resp.grupo.contenidoCanvas;
            dispatch({
                type: types.cargarGrupo,
                payload: contenido
            });
            
        const hasValidContent = resp.grupo.contenidoCanvas &&
                Array.isArray(resp.grupo.contenidoCanvas.components);
              if (hasValidContent) {
                actions.setComponents(contenido.components);
              } else {
                actions.setComponents([]);
              }
       
            // Unirse al grupo vía socket
            // socket.emit('unirse-grupo', grupo._id);
        }
    }

    
    return (
        <div 
            className={`chat_list ${(chatState.grupoActivo === grupo._id) && 'active_chat'}`}
            onClick={activarGrupo}
        >
            <div className="chat_people">
                <div className="chat_img"> 
                <img src="https://previews.123rf.com/images/plahotya/plahotya1709/plahotya170900012/85239556-dise%C3%B1o-de-logotipo-del-grupo-de-personas-ilustraci%C3%B3n-del-icono-de-vector-trabajo-en-equipo-s%C3%ADmbolo.jpg" alt="sunil" />
                </div>
                <div className="chat_ib">
                    <h5>{grupo.nombre}</h5>
                </div>
            </div>
        </div>
    )
}