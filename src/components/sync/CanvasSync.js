import React, { useContext, useEffect, useState } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';
import { ChatConext } from '../../context/chat/ChatContext';
import { types } from '../../types/types';
import { fetchConnToken } from '../../helpers/fetch';
import { SocketContext } from '../../context/SocketContext';

const CanvasSync = () => {
  const { chatState, dispatch } = useContext(ChatConext);
  const { actions, components } = useCanvasContext();
  const [lastGrupoActivo, setLastGrupoActivo] = useState(null);
  const { socket } = useContext(SocketContext);
  
  // // 1. Cargar canvas del grupo activo
  // useEffect(() => {
  //   if (chatState.grupoActivo !== lastGrupoActivo) {
  //     setLastGrupoActivo(chatState.grupoActivo);
      
  //     const cargarCanvasDeGrupo = async () => {
  //       if (chatState.grupoActivo) {
  //         try {
  //           const resp = await fetchConnToken(`grupos/${chatState.grupoActivo}`);
  //           if (resp.ok && resp.grupo) {
  //             const hasValidContent = resp.grupo.contenidoCanvas &&
  //               Array.isArray(resp.grupo.contenidoCanvas.components);
  //             if (hasValidContent) {
  //               actions.setComponents(resp.grupo.contenidoCanvas.components);
  //             } else {
  //               actions.setComponents([]);
  //             }
  //           }
  //         } catch (error) {
  //           console.error('Error al cargar el canvas del grupo:', error);
  //           actions.setComponents([]);
  //         }
  //       }
  //     };
      
  //     cargarCanvasDeGrupo();
  //   }
  // }, [chatState.grupoActivo, actions, lastGrupoActivo]);

  // 2. Emitir cambios a otros usuarios y guardar en DB automáticamente
  useEffect(() => {
    const guardarYEmitirCanvas = async () => {
      if (socket && chatState.grupoActivo && Array.isArray(components)) {
        const contenidoCanvas = {
          components,
          canvasWidth: 1000,
          canvasHeight: 2000,
        };

        // // Emitir a otros usuarios del grupo
        // socket.emit('canvas:update', {
        //   groupId: chatState.grupoActivo,
        //   components,
        // });

        // Guardar en base de datos
        try {
          await fetchConnToken(`grupos/${chatState.grupoActivo}/canvas`, {
            contenidoCanvas,
          }, 'PUT');
        } catch (error) {
          console.error('Error al guardar canvas automáticamente:', error);
        }
      }
    };

    guardarYEmitirCanvas();
  }, [components, socket, chatState.grupoActivo]);

  // // 3. Escuchar actualizaciones de otros usuarios
  // useEffect(() => {
  //   if (!socket || !chatState.grupoActivo) return;

  //   const handleRemoteUpdate = (data) => {
  //     if (data.groupId === chatState.grupoActivo) {
  //       actions.setComponents(data.components);
  //     }
  //   };

  //   socket.on('canvas:update', handleRemoteUpdate);

  //   return () => {
  //     socket.off('canvas:update', handleRemoteUpdate);
  //   };
  // }, [socket, chatState.grupoActivo, actions]);

  // // 4. Sincronizar el canvas en el chatState (para exportarlo o reutilizarlo)
  // useEffect(() => {
  //   if (chatState.grupoActivo && Array.isArray(components)) {
  //     const contenidoCanvas = {
  //       components,
  //       canvasWidth: 1000,
  //       canvasHeight: 2000,
  //     };

  //     dispatch({
  //       type: types.cargarGrupo,
  //       payload: contenidoCanvas,
  //     });
  //   }
  // }, [components, chatState.grupoActivo, dispatch]);

  return null;
};

export default CanvasSync;
