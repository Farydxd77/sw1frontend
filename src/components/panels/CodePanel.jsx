import React from 'react';
import Button from '../ui/Button';
// import { generateReactCode } from '../../utils/codeGenerator';

import { generateReactCode } from '../../utils/codeGenerartor';

/**
 * Panel de código que muestra el código generado
 */
const CodePanel = ({ components, onExportCode }) => {
  const generatedCode = generateReactCode(components);
  
  return (
    <div className="code-panel">
      <h4>Código React generado</h4>
      <pre className="code-preview">
        {generatedCode}
      </pre>
      <Button onClick={onExportCode} className="btn">
        Exportar código
      </Button>
    </div>
  );
};

export default CodePanel;