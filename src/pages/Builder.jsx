import React, { useState, useContext, useEffect } from 'react';
import { generateReactCode } from '../utils/codeGenerartor';
import { useCanvasContext } from '../context/CanvasContext';
import { ChatConext } from '../context/chat/ChatContext';
import Toolbar from '../components/ui/Toolbar';
import TabPanel from '../components/ui/TabPanel';
import Canvas from '../components/canvas/Canvas';
import ComponentsPanel from '../components/panels/ComponentsPanel';
import PropertiesPanel from '../components/panels/PropertiesPanel';
import LayersPanel from '../components/panels/LayersPanel';
import CodePanel from '../components/panels/CodePanel';
import { saveDesign, loadDesign } from '../utils/storage';
import '../styles/bulder.css';
// import { GuardarCanvas } from '../components/sync/CanvasSync';

// Componente interno que usa el contexto
const BuilderContent = () => {
  const { 
    components, 
    selectedId, 
    selectedComponentIndex,
    showPreview,
    transformerRef,
    stageRef,
    layerRef,
    historyControls,
    actions
  } = useCanvasContext();
  
  const { chatState } = useContext(ChatConext);
  
  const [activePanel, setActivePanel] = useState('components');
  const [currentTheme, setCurrentTheme] = useState('default');
  
  // Verificar que los componentes sean un array válido
  const safeComponents = Array.isArray(components) ? components : [];
  
  // Obtener el componente seleccionado
  const selectedComponent = selectedComponentIndex !== -1 ? safeComponents[selectedComponentIndex] : null;

  // Mostrar el nombre del grupo activo, si existe
  const grupoActivo = chatState.grupos.find(g => g._id === chatState.grupoActivo);
  
  // Manejadores
  const handleSaveDesign = () => {
    if (!chatState.grupoActivo) {
      alert('No hay un grupo activo seleccionado');
      return;
    }
    
    const result = saveDesign(safeComponents);
    alert(result.message);
  };
  
  const handleLoadDesign = () => {
    const result = loadDesign();
    if (result.success) {
      actions.setComponents(result.components);
      actions.setSelectedId(null);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };
  
  const handleExportCode = () => {
    console.log(generateReactCode(safeComponents));
    alert('Código exportado a la consola');
  };
  
  const handleApplyTheme = (themeName) => {
    setCurrentTheme(themeName);
    // Aquí se podría implementar la lógica para aplicar los colores del tema
    // a los componentes existentes, por ejemplo cambiando colores de botones, etc.
  };

  // Renderizar panel según selección
  const renderPanelContent = () => {
    switch (activePanel) {
      case 'components':
        return (
          <ComponentsPanel 
            onAddComponent={actions.addComponent} 
            currentTheme={currentTheme} 
            onChangeTheme={handleApplyTheme} 
          />
        );
      case 'properties':
        return (
          <PropertiesPanel 
            selectedComponent={selectedComponent} 
            updateCommonProp={actions.updateComponentCommonProps} 
            updateSpecificProp={actions.updateComponentProps} 
          />
        );
      case 'layers':
        return (
          <LayersPanel 
            components={safeComponents} 
            selectedComponentIndex={selectedComponentIndex} 
            onSelectComponent={actions.setSelectedId} 
            onMoveLayer={actions.moveLayer} 
          />
        );
      case 'code':
        return (
          <CodePanel 
            components={safeComponents} 
            onExportCode={handleExportCode} 
          />
        );
      default:
        return <p>Seleccione una opción del panel</p>;
    }
  };

  return (
  
      <div className="page-builder">
        {grupoActivo && (
          <div className="group-info">
            <span>Grupo activo: <strong>{grupoActivo.nombre}</strong></span>
          </div>
        )}
        
        <Toolbar 
          canUndo={historyControls.canUndo}
          canRedo={historyControls.canRedo}
          hasSelection={selectedComponentIndex !== -1}
          showPreview={showPreview}
          onUndo={historyControls.undo}
          onRedo={historyControls.redo}
          onDuplicate={actions.duplicateComponent}
          onDelete={actions.deleteComponent}
          onSave={handleSaveDesign}
          onLoad={handleLoadDesign}
          onTogglePreview={() => actions.setShowPreview(!showPreview)}
        />

        <div className="main-container">
          <div className="left-panel">
            <TabPanel 
              activePanel={activePanel} 
              onChangePanel={setActivePanel} 
              selectedComponentIndex={selectedComponentIndex} 
            />
            <div className="panel-content">
              {renderPanelContent()}
            </div>
          </div>

          {!chatState.grupoActivo ? (
            <div className="no-group-message">
              <h3>No hay un grupo activo</h3>
              <p>Selecciona un grupo en el sidebar para comenzar a editar su canvas</p>
            </div>
          ) : (
            <Canvas 
              components={safeComponents}
              selectedId={selectedId}
              showPreview={showPreview}
              stageRef={stageRef}
              layerRef={layerRef}
              transformerRef={transformerRef}
              onSelect={actions.setSelectedId}
              onDragMove={actions.handleDragMove}
              onTransform={actions.handleTransform}
            />
          )}
        </div>
      </div>
  
  );
};

// Componente wrapper que proporciona el contexto
const Builder = () => {
  return <BuilderContent />;
};

export default Builder;