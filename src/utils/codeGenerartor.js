/**
 * Genera código React a partir de los componentes del canvas
 * @param {Array} components - Lista de componentes
 * @returns {string} Código React generado
 */
export const generateReactCode = (components) => {
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none',
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
            border: `1px solid ${comp.props.stroke}`,
            padding: '0 10px',
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
            opacity: comp.props.opacity,
            objectFit: 'cover',
          };
          componentCode += `      <img style={${JSON.stringify(style)}} src="${comp.props.src}" alt="Imagen" />\n`;
          break;
        default:
          break;
      }
    });
    
    componentCode += `    </div>\n  );\n};\n\nexport default GeneratedComponent;`;
    
    return imports + componentCode;
  };