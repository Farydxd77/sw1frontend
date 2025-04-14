import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Rect, Text, Transformer, Image as KonvaImage } from "react-konva";
import { v4 as uuidv4 } from "uuid";

// Definición de componentes con propiedades expandidas
const COMPONENTS = {
  text: { 
    width: 150, 
    height: 30, 
    props: { 
      text: "Texto de ejemplo", 
      fontSize: 18, 
      fontFamily: "Arial", 
      fill: "#000000",
      align: "left",
    } 
  },
  button: { 
    width: 150, 
    height: 40, 
    props: { 
      text: "Botón", 
      fill: "#007bff", 
      cornerRadius: 6,
      textColor: "#ffffff",
      fontSize: 14,
      fontFamily: "Arial",
    } 
  },
  input: { 
    width: 200, 
    height: 40, 
    props: { 
      placeholder: "Ingrese texto...", 
      fill: "#ffffff", 
      stroke: "#cccccc",
      cornerRadius: 4,
      fontSize: 14,
      fontFamily: "Arial",
      placeholderColor: "#888888"
    } 
  },
  rectangle: { 
    width: 100, 
    height: 100, 
    props: { 
      fill: "#cccccc", 
      stroke: "#999999",
      strokeWidth: 1,
      cornerRadius: 0,
      opacity: 1
    } 
  },
  image: {
    width: 150,
    height: 150,
    props: {
      fill: "#eeeeee",
      src: "/api/placeholder/150/150",
      cornerRadius: 0,
      opacity: 1
    }
  }
};

// Colores predefinidos para temas
const COLOR_THEMES = {
  default: {
    primary: "#007bff",
    secondary: "#6c757d",
    success: "#28a745",
    danger: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
    light: "#f8f9fa",
    dark: "#343a40",
  },
  dark: {
    primary: "#375a7f",
    secondary: "#444444",
    success: "#00bc8c",
    danger: "#e74c3c",
    warning: "#f39c12",
    info: "#3498db",
    light: "#adb5bd",
    dark: "#303030",
  },
  pastel: {
    primary: "#779ecb",
    secondary: "#a5adb8",
    success: "#87d68d",
    danger: "#f4a6b4",
    warning: "#ffe066",
    info: "#90caf9",
    light: "#f5f5f5",
    dark: "#555555",
  }
};

// Funciones de utilidad
const generateReactCode = (components) => {
  let imports = `import React from 'react';\n\n`;
  let componentCode = `const GeneratedComponent = () => {\n  return (\n    <div className="container">\n`;
  
  components.forEach(comp => {
    const baseStyle = {
      position: 'absolute',
      left: `${comp.x}px`,
      top: `${comp.y}px`,
      width: `${comp.width}px`,
      height: `${comp.height}px`
    };
  
    let style = { ...baseStyle };
    switch (comp.type) {
      case 'text':
        style = {
          ...style,
          fontSize: `${comp.props.fontSize}px`,
          fontFamily: comp.props.fontFamily,
          color: comp.props.fill,
          textAlign: comp.props.align,
        };
        componentCode += `      <p style={${JSON.stringify(style)}}>${comp.props.text}</p>\n`;
        break;
      case 'button':
        style = {
          ...style,
          backgroundColor: comp.props.fill,
          borderRadius: `${comp.props.cornerRadius}px`,
          color: comp.props.textColor,
          fontSize: `${comp.props.fontSize}px`,
          fontFamily: comp.props.fontFamily,
        };
        componentCode += `      <button style={${JSON.stringify(style)}}>${comp.props.text}</button>\n`;
        break;
      case 'input':
        style = {
          ...style,
          backgroundColor: comp.props.fill,
          borderRadius: `${comp.props.cornerRadius}px`,
          fontSize: `${comp.props.fontSize}px`,
          fontFamily: comp.props.fontFamily,
          border: `1px solid ${comp.props.stroke}`
        };
        componentCode += `      <input style={${JSON.stringify(style)}} placeholder="${comp.props.placeholder}" />\n`;
        break;
      case 'rectangle':
        style = {
          ...style,
          backgroundColor: comp.props.fill,
          borderRadius: `${comp.props.cornerRadius}px`,
          border: `${comp.props.strokeWidth}px solid ${comp.props.stroke}`,
          opacity: comp.props.opacity
        };
        componentCode += `      <div style={${JSON.stringify(style)}}></div>\n`;
        break;
      case 'image':
        style = {
          ...style,
          borderRadius: `${comp.props.cornerRadius}px`,
          opacity: comp.props.opacity
        };
        componentCode += `      <img style={${JSON.stringify(style)}} src="${comp.props.src}" alt="Imagen" />\n`;
        break;
    }
  });
}

// Hook personalizado para historial de acciones (undo/redo)
const useHistory = (initialState) => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([initialState]);

  const setState = (action) => {
    const newState = typeof action === 'function' ? action(history[index]) : action;
    if (JSON.stringify(history[index]) === JSON.stringify(newState)) {
      return;
    }
    
    const updatedHistory = history.slice(0, index + 1);
    updatedHistory.push(newState);
    
    setHistory(updatedHistory);
    setIndex(updatedHistory.length - 1);
  };

  const undo = () => index > 0 && setIndex(prevState => prevState - 1);
  const redo = () => index < history.length - 1 && setIndex(prevState => prevState + 1);
  
  return [history[index], setState, undo, redo, { canUndo: index > 0, canRedo: index < history.length - 1 }];
};

// Componente principal
export const ChantSelect = () => {
  const [components, setComponents, undo, redo, { canUndo, canRedo }] = useHistory([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState(-1);
  const [activePanel, setActivePanel] = useState('components'); // 'components', 'properties', 'layers', 'code'
  const [showPreview, setShowPreview] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const transformerRef = useRef();
  const stageRef = useRef();
  const layerRef = useRef();

  // Actualizar transformer cuando cambia la selección
  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const selectedNode = layerRef.current.findOne(node => node.id() === selectedId);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  // Actualizar índice del componente seleccionado
  useEffect(() => {
    if (selectedId) {
      const index = components.findIndex(c => c.id === selectedId);
      setSelectedComponentIndex(index);
    } else {
      setSelectedComponentIndex(-1);
    }
  }, [selectedId, components]);

  // Agregar nuevo componente
  const addComponent = (type) => {
    const config = COMPONENTS[type];
    const newComponent = {
      id: uuidv4(),
      type,
      x: 50,
      y: 50 + (components.length % 5) * 60,
      width: config.width,
      height: config.height,
      props: { ...config.props },
      zIndex: components.length,
    };
    setComponents([...components, newComponent]);
    setSelectedId(newComponent.id);
  };

  // Manejar movimiento de componentes
  const handleDragMove = (e, id) => {
    const { x, y } = e.target.position();
    setComponents(
      components.map((comp) => (comp.id === id ? { ...comp, x, y } : comp))
    );
  };

  // Manejar cambio de tamaño
  const handleTransform = (e, id) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Restablecer la escala del nodo
    node.scaleX(1);
    node.scaleY(1);
    
    setComponents(
      components.map((comp) =>
        comp.id === id
          ? {
              ...comp,
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
            }
          : comp
      )
    );
  };

  // Actualizar propiedades del componente
  const updateComponentProps = (propName, value) => {
    if (selectedId && selectedComponentIndex !== -1) {
      setComponents(
        components.map((comp, index) =>
          index === selectedComponentIndex
            ? {
                ...comp,
                props: { ...comp.props, [propName]: value },
              }
            : comp
        )
      );
    }
  };

  // Duplicar componente
  const duplicateComponent = () => {
    if (selectedComponentIndex !== -1) {
      const comp = components[selectedComponentIndex];
      const newComponent = {
        ...comp,
        id: uuidv4(),
        x: comp.x + 20,
        y: comp.y + 20,
        zIndex: components.length,
      };
      setComponents([...components, newComponent]);
      setSelectedId(newComponent.id);
    }
  };

  // Eliminar componente
  const deleteComponent = () => {
    if (selectedComponentIndex !== -1) {
      setComponents(components.filter((_, index) => index !== selectedComponentIndex));
      setSelectedId(null);
    }
  };

  // Mover capa
  const moveLayer = (direction) => {
    if (selectedComponentIndex !== -1) {
      const newIndex = direction === 'up' 
        ? Math.min(components.length - 1, selectedComponentIndex + 1)
        : Math.max(0, selectedComponentIndex - 1);
      
      if (newIndex !== selectedComponentIndex) {
        const newComponents = [...components];
        const [removed] = newComponents.splice(selectedComponentIndex, 1);
        newComponents.splice(newIndex, 0, removed);
        
        // Actualizar zIndex
        const updatedComponents = newComponents.map((comp, idx) => ({
          ...comp,
          zIndex: idx,
        }));
        
        setComponents(updatedComponents);
      }
    }
  };

  // Guardar diseño
  const saveDesign = () => {
    const design = JSON.stringify(components);
    localStorage.setItem('savedDesign', design);
    alert('Diseño guardado correctamente');
  };

  // Cargar diseño
  const loadDesign = () => {
    try {
      const savedDesign = localStorage.getItem('savedDesign');
      if (savedDesign) {
        setComponents(JSON.parse(savedDesign));
        setSelectedId(null);
        alert('Diseño cargado correctamente');
      } else {
        alert('No hay diseños guardados');
      }
    } catch (error) {
      console.error('Error al cargar el diseño:', error);
      alert('Error al cargar el diseño');
    }
  };

  // Exportar código
  const exportCode = () => {
    const code = generateReactCode(components);
    console.log(code);
    // Aquí se podría implementar la descarga del código o mostrarlo en un modal
    alert('Código exportado a la consola');
  };

  // Aplicar tema de colores
  const applyTheme = (themeName) => {
    if (COLOR_THEMES[themeName]) {
      setCurrentTheme(themeName);
      
      // Aquí se podría implementar la lógica para aplicar los colores del tema
      // a los componentes existentes, por ejemplo cambiando colores de botones, etc.
    }
  };

  // Renderizar panel de propiedades según el tipo de componente
  const renderPropertiesPanel = () => {
    if (selectedComponentIndex === -1) return <p>Seleccione un componente para editar sus propiedades</p>;
    
    const comp = components[selectedComponentIndex];
    const props = comp.props;
    
    const commonProperties = (
      <>
        <div className="form-group">
          <label>Posición X:</label>
          <input
            type="number"
            value={comp.x}
            onChange={(e) => {
              const x = Number(e.target.value);
              setComponents(
                components.map((c, idx) =>
                  idx === selectedComponentIndex ? { ...c, x } : c
                )
              );
            }}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Posición Y:</label>
          <input
            type="number"
            value={comp.y}
            onChange={(e) => {
              const y = Number(e.target.value);
              setComponents(
                components.map((c, idx) =>
                  idx === selectedComponentIndex ? { ...c, y } : c
                )
              );
            }}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Ancho:</label>
          <input
            type="number"
            value={comp.width}
            onChange={(e) => {
              const width = Number(e.target.value);
              setComponents(
                components.map((c, idx) =>
                  idx === selectedComponentIndex ? { ...c, width } : c
                )
              );
            }}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Alto:</label>
          <input
            type="number"
            value={comp.height}
            onChange={(e) => {
              const height = Number(e.target.value);
              setComponents(
                components.map((c, idx) =>
                  idx === selectedComponentIndex ? { ...c, height } : c
                )
              );
            }}
            className="form-control"
          />
        </div>
      </>
    );
    
    let specificProperties;
    
    switch (comp.type) {
      case 'text':
        specificProperties = (
          <>
            <div className="form-group">
              <label>Texto:</label>
              <input
                type="text"
                value={props.text}
                onChange={(e) => updateComponentProps('text', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Tamaño de fuente:</label>
              <input
                type="number"
                value={props.fontSize}
                onChange={(e) => updateComponentProps('fontSize', Number(e.target.value))}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Familia de fuente:</label>
              <select
                value={props.fontFamily}
                onChange={(e) => updateComponentProps('fontFamily', e.target.value)}
                className="form-control"
              >
                <option value="Arial">Arial</option>
                <option value="Verdana">Verdana</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>
            <div className="form-group">
              <label>Color:</label>
              <input
                type="color"
                value={props.fill}
                onChange={(e) => updateComponentProps('fill', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Alineación:</label>
              <select
                value={props.align}
                onChange={(e) => updateComponentProps('align', e.target.value)}
                className="form-control"
              >
                <option value="left">Izquierda</option>
                <option value="center">Centro</option>
                <option value="right">Derecha</option>
              </select>
            </div>
          </>
        );
        break;
        
      case 'button':
        specificProperties = (
          <>
            <div className="form-group">
              <label>Texto:</label>
              <input
                type="text"
                value={props.text}
                onChange={(e) => updateComponentProps('text', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Color de fondo:</label>
              <input
                type="color"
                value={props.fill}
                onChange={(e) => updateComponentProps('fill', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Color de texto:</label>
              <input
                type="color"
                value={props.textColor}
                onChange={(e) => updateComponentProps('textColor', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Radio de esquinas:</label>
              <input
                type="number"
                value={props.cornerRadius}
                onChange={(e) => updateComponentProps('cornerRadius', Number(e.target.value))}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Tamaño de fuente:</label>
              <input
                type="number"
                value={props.fontSize}
                onChange={(e) => updateComponentProps('fontSize', Number(e.target.value))}
                className="form-control"
              />
            </div>
          </>
        );
        break;
        
      case 'input':
        specificProperties = (
          <>
            <div className="form-group">
              <label>Placeholder:</label>
              <input
                type="text"
                value={props.placeholder}
                onChange={(e) => updateComponentProps('placeholder', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Color de fondo:</label>
              <input
                type="color"
                value={props.fill}
                onChange={(e) => updateComponentProps('fill', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Color de borde:</label>
              <input
                type="color"
                value={props.stroke}
                onChange={(e) => updateComponentProps('stroke', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Radio de esquinas:</label>
              <input
                type="number"
                value={props.cornerRadius}
                onChange={(e) => updateComponentProps('cornerRadius', Number(e.target.value))}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Color del placeholder:</label>
              <input
                type="color"
                value={props.placeholderColor}
                onChange={(e) => updateComponentProps('placeholderColor', e.target.value)}
                className="form-control"
              />
            </div>
          </>
        );
        break;
        
      case 'rectangle':
        specificProperties = (
          <>
            <div className="form-group">
              <label>Color de relleno:</label>
              <input
                type="color"
                value={props.fill}
                onChange={(e) => updateComponentProps('fill', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Color de borde:</label>
              <input
                type="color"
                value={props.stroke}
                onChange={(e) => updateComponentProps('stroke', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Grosor de borde:</label>
              <input
                type="number"
                value={props.strokeWidth}
                onChange={(e) => updateComponentProps('strokeWidth', Number(e.target.value))}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Radio de esquinas:</label>
              <input
                type="number"
                value={props.cornerRadius}
                onChange={(e) => updateComponentProps('cornerRadius', Number(e.target.value))}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Opacidad:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={props.opacity}
                onChange={(e) => updateComponentProps('opacity', Number(e.target.value))}
                className="form-control"
              />
            </div>
          </>
        );
        break;
        
      case 'image':
        specificProperties = (
          <>
            <div className="form-group">
              <label>URL de la imagen:</label>
              <input
                type="text"
                value={props.src}
                onChange={(e) => updateComponentProps('src', e.target.value)}
                className="form-control"
              />
              <small className="form-text text-muted">Utiliza /api/placeholder/{comp.width}/{comp.height} para imágenes de prueba</small>
            </div>
            <div className="form-group">
              <label>Radio de esquinas:</label>
              <input
                type="number"
                value={props.cornerRadius}
                onChange={(e) => updateComponentProps('cornerRadius', Number(e.target.value))}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Opacidad:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={props.opacity}
                onChange={(e) => updateComponentProps('opacity', Number(e.target.value))}
                className="form-control"
              />
            </div>
          </>
        );
        break;
        
      default:
        specificProperties = <p>No hay propiedades específicas para este componente</p>;
    }
    
    return (
      <div className="properties-panel">
        <h4>Propiedades del {comp.type === 'text' ? 'texto' : 
                             comp.type === 'button' ? 'botón' : 
                             comp.type === 'input' ? 'campo de entrada' : 
                             comp.type === 'rectangle' ? 'rectángulo' : 
                             comp.type === 'image' ? 'imagen' : 'componente'}</h4>
        <div className="form">
          {commonProperties}
          <hr />
          {specificProperties}
        </div>
      </div>
    );
  };

  // Renderizar panel de capas
  const renderLayersPanel = () => {
    return (
      <div className="layers-panel">
        <h4>Capas</h4>
        <div className="layer-actions">
          <button 
            onClick={() => moveLayer('up')} 
            disabled={selectedComponentIndex === components.length - 1 || selectedComponentIndex === -1}
            className="btn-sm"
          >
            Subir capa
          </button>
          <button 
            onClick={() => moveLayer('down')} 
            disabled={selectedComponentIndex === 0 || selectedComponentIndex === -1}
            className="btn-sm"
          >
            Bajar capa
          </button>
        </div>
        <div className="layer-list">
          {[...components].reverse().map((comp, index) => {
            const actualIndex = components.length - index - 1;
            return (
              <div 
                key={comp.id} 
                className={`layer-item ${selectedComponentIndex === actualIndex ? 'active' : ''}`}
                onClick={() => setSelectedId(comp.id)}
              >
                <span className="layer-icon">
                  {comp.type === 'text' ? 'T' : 
                   comp.type === 'button' ? 'B' : 
                   comp.type === 'input' ? 'I' : 
                   comp.type === 'rectangle' ? 'R' :
                   comp.type === 'image' ? 'IMG' : '▢'}
                </span>
                <span className="layer-name">
                  {comp.type === 'text' ? `Texto: "${comp.props.text.substring(0, 15)}${comp.props.text.length > 15 ? '...' : ''}"` : 
                   comp.type === 'button' ? `Botón: "${comp.props.text}"` : 
                   comp.type === 'input' ? `Input: "${comp.props.placeholder}"` : 
                   comp.type === 'rectangle' ? `Rectángulo ${actualIndex + 1}` :
                   comp.type === 'image' ? `Imagen ${actualIndex + 1}` :
                   `Componente ${actualIndex + 1}`}
                </span>
                <span className="layer-visibility">👁️</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar panel de código
  const renderCodePanel = () => {
    return (
      <div className="code-panel">
        <h4>Código React generado</h4>
        <pre className="code-preview">
          {generateReactCode(components)}
        </pre>
        <button onClick={exportCode} className="btn">
          Exportar código
        </button>
      </div>
    );
  };

  // Renderizar contenido del panel según la selección
  const renderPanelContent = () => {
    switch (activePanel) {
      case 'components':
        return (
          <div className="components-panel">
            <h4>Componentes</h4>
            <div className="component-buttons">
              <button onClick={() => addComponent("text")} className="btn">
                Texto
              </button>
              <button onClick={() => addComponent("button")} className="btn">
                Botón
              </button>
              <button onClick={() => addComponent("input")} className="btn">
                Input
              </button>
              <button onClick={() => addComponent("rectangle")} className="btn">
                Rectángulo
              </button>
              <button onClick={() => addComponent("image")} className="btn">
                Imagen
              </button>
            </div>
            <hr />
            <h4>Temas de colores</h4>
            <div className="theme-selection">
              {Object.keys(COLOR_THEMES).map(theme => (
                <button
                  key={theme}
                  onClick={() => applyTheme(theme)}
                  className={`btn-theme ${currentTheme === theme ? 'active' : ''}`}
                >
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );
      case 'properties':
        return renderPropertiesPanel();
      case 'layers':
        return renderLayersPanel();
      case 'code':
        return renderCodePanel();
      default:
        return <p>Seleccione una opción del panel</p>;
    }
  };

  // Determinar cómo se renderizará el componente en el lienzo
  const renderComponent = (comp) => {
    const commonProps = {
      key: comp.id,
      id: comp.id,
      x: comp.x,
      y: comp.y,
      width: comp.width,
      height: comp.height,
      draggable: !showPreview,
      onClick: (e) => {
        if (!showPreview) {
          e.cancelBubble = true;
          setSelectedId(comp.id);
        }
      },
      onDragMove: (e) => !showPreview && handleDragMove(e, comp.id),
      onTransformEnd: (e) => !showPreview && handleTransform(e, comp.id),
      stroke: selectedId === comp.id && !showPreview ? "blue" : undefined,
      strokeWidth: selectedId === comp.id && !showPreview ? 2 : undefined,
    };

    switch (comp.type) {
      case 'text':
        return (
          <Text
            {...commonProps}
            text={comp.props.text}
            fontSize={comp.props.fontSize}
            fontFamily={comp.props.fontFamily}
            fill={comp.props.fill}
            align={comp.props.align}
          />
        );
      case 'button':
        return (
          <>
            <Rect
              {...commonProps}
              fill={comp.props.fill}
              cornerRadius={comp.props.cornerRadius}
            />
            <Text
              x={comp.x + 10}
              y={comp.y + (comp.height / 2) - (comp.props.fontSize / 2)}
              text={comp.props.text}
              fill={comp.props.textColor}
              fontSize={comp.props.fontSize}
              fontFamily={comp.props.fontFamily}
              onClick={(e) => {
                if (!showPreview) {
                  e.cancelBubble = true;
                  setSelectedId(comp.id);
                }
              }}
            />
          </>
        );
      case 'input':
        return (
          <>
            <Rect
              {...commonProps}
              fill={comp.props.fill}
              stroke={comp.props.stroke}
              cornerRadius={comp.props.cornerRadius}
            />
            <Text
              x={comp.x + 10}
              y={comp.y + (comp.height / 2) - (comp.props.fontSize / 2)}
              text={comp.props.placeholder}
              fill={comp.props.placeholderColor}
              fontSize={comp.props.fontSize}
              fontFamily={comp.props.fontFamily}
              onClick={(e) => {
                if (!showPreview) {
                  e.cancelBubble = true;
                  setSelectedId(comp.id);
                }
              }}
            />
          </>
        );
      case 'rectangle':
        return (
          <Rect
            {...commonProps}
            fill={comp.props.fill}
            stroke={comp.props.stroke}
            strokeWidth={comp.props.strokeWidth}
            cornerRadius={comp.props.cornerRadius}
            opacity={comp.props.opacity}
          />
        );
      case 'image':
        return (
          <KonvaImage
            {...commonProps}
            src={comp.props.src}
            cornerRadius={comp.props.cornerRadius}
            opacity={comp.props.opacity}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-builder">
      <div className="toolbar">
        <div className="logo">🎨 PageBuilder Pro</div>
        <div className="toolbar-actions">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Deshacer"
            className="toolbar-btn"
          >
            ↩️ Deshacer
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Rehacer"
            className="toolbar-btn"
          >
            ↪️ Rehacer
          </button>
          <div className="separator"></div>
          <button
            onClick={duplicateComponent}
            disabled={selectedComponentIndex === -1}
            title="Duplicar componente"
            className="toolbar-btn"
          >
            📋 Duplicar
          </button>
          <button
            onClick={deleteComponent}
            disabled={selectedComponentIndex === -1}
            title="Eliminar componente"
            className="toolbar-btn"
          >
            🗑️ Eliminar
          </button>
          <div className="separator"></div>
          <button
            onClick={saveDesign}
            title="Guardar diseño"
            className="toolbar-btn"
          >
            💾 Guardar
          </button>
          <button
            onClick={loadDesign}
            title="Cargar diseño"
            className="toolbar-btn"
          >
            📂 Cargar
          </button>
          <div className="separator"></div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            title={showPreview ? "Editar" : "Vista previa"}
            className={`toolbar-btn ${showPreview ? 'active' : ''}`}
          >
            👁️ {showPreview ? "Editar" : "Vista previa"}
          </button>
        </div>
      </div>

      <div className="main-container">
        <div className="left-panel">
          <div className="panel-tabs">
            <button
              onClick={() => setActivePanel('components')}
              className={`tab-btn ${activePanel === 'components' ? 'active' : ''}`}
            >
              Componentes
            </button>
            <button
              onClick={() => setActivePanel('properties')}
              className={`tab-btn ${activePanel === 'properties' ? 'active' : ''}`}
              disabled={selectedComponentIndex === -1}
            >
              Propiedades
            </button>
            <button
              onClick={() => setActivePanel('layers')}
              className={`tab-btn ${activePanel === 'layers' ? 'active' : ''}`}
            >
              Capas
            </button>
            <button
              onClick={() => setActivePanel('code')}
              className={`tab-btn ${activePanel === 'code' ? 'active' : ''}`}
            >
              Código
            </button>
          </div>
          <div className="panel-content">
            {renderPanelContent()}
          </div>
        </div>

        <div className="canvas-container">
          <Stage
            width={1000}
            height={600}
            className={`design-canvas ${showPreview ? 'preview-mode' : ''}`}
            onMouseDown={(e) => {
              if (e.target === e.target.getStage() && !showPreview) {
                setSelectedId(null);
              }
            }}
            ref={stageRef}
          >
            <Layer ref={layerRef}>
              {components
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((comp) => renderComponent(comp))}
              {selectedId && !showPreview && (
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    // Límite mínimo de tamaño
                    if (newBox.width < 5 || newBox.height < 5) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                />
              )}
            </Layer>
          </Stage>
        </div>
      </div>

      <style jsx>{`
        .page-builder {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background-color: #333;
          color: white;
        }

        .logo {
          font-size: 20px;
          font-weight: bold;
        }

        .toolbar-actions {
          display: flex;
          align-items: center;
        }

        .toolbar-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 14px;
          margin: 0 5px;
          padding: 5px 10px;
          cursor: pointer;
          border-radius: 4px;
        }

        .toolbar-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .toolbar-btn.active {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .toolbar-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .separator {
          width: 1px;
          height: 20px;
          background-color: rgba(255, 255, 255, 0.3);
          margin: 0 10px;
        }

        .main-container {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .left-panel {
          width: 300px;
          background-color: #f5f5f5;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #ddd;
        }

        .panel-tabs {
          display: flex;
          border-bottom: 1px solid #ddd;
        }

        .tab-btn {
          flex: 1;
          padding: 10px;
          text-align: center;
          background: none;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .tab-btn:hover {
          background-color: #e9e9e9;
        }

        .tab-btn.active {
          background-color: #fff;
          border-bottom: 2px solid #007bff;
          font-weight: bold;
        }

        .tab-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .panel-content {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
        }

        .component-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 15px;
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:hover {
          background-color: #e9ecef;
          border-color: #ced4da;
        }

        .btn .icon {
          margin-right: 5px;
        }

        .btn-sm {
          padding: 5px 10px;
          font-size: 12px;
          margin-right: 5px;
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-theme {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          padding: 5px 10px;
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
        }

        .btn-theme.active {
          background-color: #007bff;
          color: white;
          border-color: #007bff;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }

        .form-control {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .layer-actions {
          margin-bottom: 10px;
        }

        .layer-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .layer-item {
          display: flex;
          align-items: center;
          padding: 8px;
          border: 1px solid #ddd;
          margin-bottom: 5px;
          border-radius: 4px;
          cursor: pointer;
          background-color: #fff;
        }

        .layer-item.active {
          background-color: #e6f7ff;
          border-color: #91d5ff;
        }

        .layer-icon {
          margin-right: 8px;
          font-size: 16px;
          font-weight: bold;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f0f0f0;
          border-radius: 50%;
        }

        .layer-name {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .layer-visibility {
          margin-left: 5px;
          cursor: pointer;
        }

        .code-preview {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 4px;
          font-family: monospace;
          white-space: pre-wrap;
          overflow-x: auto;
          max-height: 400px;
          overflow-y: auto;
          font-size: 12px;
          border: 1px solid #ddd;
        }

        .canvas-container {
          flex: 1;
          padding: 20px;
          background-color: #e9e9e9;
          overflow: auto;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .design-canvas {
          background-color: #fff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .design-canvas.preview-mode {
          cursor: default;
        }

        .form-text {
          font-size: 12px;
          color: #6c757d;
          margin-top: 5px;
        }

        hr {
          border: 0;
          border-top: 1px solid #ddd;
          margin: 15px 0;
        }
      `}</style>
    </div>
  );
};

export default ChantSelect;