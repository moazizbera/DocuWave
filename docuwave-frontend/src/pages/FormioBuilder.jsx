import React, { useState, useEffect } from 'react';
import { Save, Eye, Plus, Trash2, Edit3, Sparkles, XCircle, Send, GripVertical, Copy, Link, Database, Globe, ChevronDown, ChevronRight, X } from 'lucide-react';

function FormioBuilder({ showToast = (msg, type) => console.log(msg, type) }) {
  const [formName, setFormName] = useState('Invoice Extraction Form');
  const [isEditingName, setIsEditingName] = useState(false);
  const [components, setComponents] = useState([
    { 
      id: 1, 
      type: 'textfield', 
      label: 'Invoice Number', 
      key: 'invoiceNumber', 
      placeholder: 'Enter invoice number', 
      required: true, 
      validation: { minLength: 3, maxLength: 20 },
      dependencies: []
    },
    { 
      id: 2, 
      type: 'dropdown', 
      label: 'Country', 
      key: 'country', 
      required: true,
      dataSource: {
        type: 'static',
        options: ['USA', 'Canada', 'UK', 'Germany', 'France'],
        apiConfig: { url: '', method: 'GET', headers: {}, valueField: 'id', labelField: 'name' }
      },
      dependencies: []
    },
    { 
      id: 3, 
      type: 'textfield', 
      label: 'Tax ID', 
      key: 'taxId', 
      placeholder: 'Enter tax ID', 
      required: false,
      dependencies: [{ id: Date.now(), sourceField: 'country', condition: 'equals', value: 'USA', action: 'show' }]
    },
    { 
      id: 4, 
      type: 'number', 
      label: 'Amount', 
      key: 'amount', 
      placeholder: '0.00', 
      required: true, 
      validation: { min: 0, max: 1000000 },
      dependencies: []
    }
  ]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggingComponent, setDraggingComponent] = useState(null);
  const [draggingFromPalette, setDraggingFromPalette] = useState(false);
  const [dropPosition, setDropPosition] = useState(null);
  const [showDependencies, setShowDependencies] = useState(false);
  const [showDataSource, setShowDataSource] = useState(false);
  const [dropdownData, setDropdownData] = useState({});
  const [loadingDropdowns, setLoadingDropdowns] = useState({});

  const componentTypes = [
    { type: 'textfield', label: 'Text Field', icon: '📝', defaultValue: '' },
    { type: 'email', label: 'Email', icon: '📧', defaultValue: '' },
    { type: 'number', label: 'Number', icon: '🔢', defaultValue: 0 },
    { type: 'date', label: 'Date', icon: '📅', defaultValue: '' },
    { type: 'time', label: 'Time', icon: '🕐', defaultValue: '' },
    { type: 'dropdown', label: 'Dropdown', icon: '📋', defaultValue: '', options: ['Option 1', 'Option 2', 'Option 3'] },
    { type: 'radio', label: 'Radio Buttons', icon: '🔘', defaultValue: '', options: ['Option 1', 'Option 2'] },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️', defaultValue: false },
    { type: 'textarea', label: 'Text Area', icon: '📄', defaultValue: '' },
    { type: 'file', label: 'File Upload', icon: '📎', defaultValue: null }
  ];

  const conditionTypes = [
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'greaterThan', label: 'Greater Than' },
    { value: 'lessThan', label: 'Less Than' },
    { value: 'isEmpty', label: 'Is Empty' },
    { value: 'isNotEmpty', label: 'Is Not Empty' }
  ];

  const actionTypes = [
    { value: 'show', label: 'Show Field' },
    { value: 'hide', label: 'Hide Field' },
    { value: 'enable', label: 'Enable Field' },
    { value: 'disable', label: 'Disable Field' }
  ];

  const checkDependencies = (component) => {
    if (!component.dependencies || component.dependencies.length === 0) {
      return { visible: true, enabled: true };
    }

    let visible = true;
    let enabled = true;

    component.dependencies.forEach(dep => {
      const sourceValue = formData[dep.sourceField];
      let conditionMet = false;

      switch (dep.condition) {
        case 'equals': conditionMet = sourceValue === dep.value; break;
        case 'notEquals': conditionMet = sourceValue !== dep.value; break;
        case 'contains': conditionMet = String(sourceValue || '').includes(dep.value); break;
        case 'greaterThan': conditionMet = Number(sourceValue) > Number(dep.value); break;
        case 'lessThan': conditionMet = Number(sourceValue) < Number(dep.value); break;
        case 'isEmpty': conditionMet = !sourceValue || sourceValue === ''; break;
        case 'isNotEmpty': conditionMet = sourceValue && sourceValue !== ''; break;
        default: conditionMet = false;
      }

      if (dep.action === 'show') visible = visible && conditionMet;
      else if (dep.action === 'hide') visible = visible && !conditionMet;
      else if (dep.action === 'enable') enabled = enabled && conditionMet;
      else if (dep.action === 'disable') enabled = enabled && !conditionMet;
    });

    return { visible, enabled };
  };

  const addComponent = (type, position = null) => {
    const typeConfig = componentTypes.find(t => t.type === type);
    const newComponent = {
      id: Date.now(),
      type: type,
      label: `New ${typeConfig.label}`,
      key: `field_${Date.now()}`,
      placeholder: '',
      required: false,
      validation: {},
      options: typeConfig.options || [],
      defaultValue: typeConfig.defaultValue,
      dependencies: [],
      dataSource: type === 'dropdown' ? {
        type: 'static',
        options: typeConfig.options || [],
        apiConfig: { url: '', method: 'GET', headers: {}, valueField: 'id', labelField: 'name' }
      } : undefined
    };

    if (position !== null) {
      const newComponents = [...components];
      newComponents.splice(position, 0, newComponent);
      setComponents(newComponents);
    } else {
      setComponents([...components, newComponent]);
    }
    
    showToast('Component added', 'success');
  };

  const duplicateComponent = (component) => {
    const newComponent = {
      ...component,
      id: Date.now(),
      key: `${component.key}_copy_${Date.now()}`,
      label: `${component.label} (Copy)`,
      dependencies: component.dependencies ? [...component.dependencies] : []
    };
    const index = components.findIndex(c => c.id === component.id);
    const newComponents = [...components];
    newComponents.splice(index + 1, 0, newComponent);
    setComponents(newComponents);
    showToast('Component duplicated', 'success');
  };

  const deleteComponent = (id) => {
    setComponents(components.filter(c => c.id !== id));
    setSelectedComponent(null);
    showToast('Component deleted', 'success');
  };

  const handleDragStart = (e, index, fromPalette = false) => {
    setDraggingComponent(index);
    setDraggingFromPalette(fromPalette);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggingComponent === null) return;
    setDropPosition(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggingFromPalette) {
      const typeConfig = componentTypes[draggingComponent];
      addComponent(typeConfig.type, dropIndex);
    } else {
      if (draggingComponent === null || draggingComponent === dropIndex) return;

      const newComponents = [...components];
      const draggedItem = newComponents[draggingComponent];
      newComponents.splice(draggingComponent, 1);
      
      const adjustedIndex = draggingComponent < dropIndex ? dropIndex - 1 : dropIndex;
      newComponents.splice(adjustedIndex, 0, draggedItem);
      
      setComponents(newComponents);
      showToast('Field reordered', 'info');
    }

    setDraggingComponent(null);
    setDraggingFromPalette(false);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggingComponent(null);
    setDraggingFromPalette(false);
    setDropPosition(null);
  };

  const moveComponent = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === components.length - 1)) return;
    const newComponents = [...components];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newComponents[index], newComponents[newIndex]] = [newComponents[newIndex], newComponents[index]];
    setComponents(newComponents);
    showToast(`Moved ${direction}`, 'info');
  };

  const addDependency = () => {
    if (!selectedComponent) return;
    const newDependency = { id: Date.now(), sourceField: '', condition: 'equals', value: '', action: 'show' };
    const updated = components.map(c => 
      c.id === selectedComponent.id ? { ...c, dependencies: [...(c.dependencies || []), newDependency] } : c
    );
    setComponents(updated);
    setSelectedComponent({ ...selectedComponent, dependencies: [...(selectedComponent.dependencies || []), newDependency] });
    showToast('Dependency added', 'success');
  };

  const updateDependency = (depId, field, value) => {
    const updated = components.map(c => 
      c.id === selectedComponent.id ? { 
        ...c, 
        dependencies: c.dependencies.map(d => d.id === depId ? { ...d, [field]: value } : d)
      } : c
    );
    setComponents(updated);
    setSelectedComponent({
      ...selectedComponent,
      dependencies: selectedComponent.dependencies.map(d => d.id === depId ? { ...d, [field]: value } : d)
    });
  };

  const deleteDependency = (depId) => {
    const updated = components.map(c => 
      c.id === selectedComponent.id ? { ...c, dependencies: c.dependencies.filter(d => d.id !== depId) } : c
    );
    setComponents(updated);
    setSelectedComponent({ ...selectedComponent, dependencies: selectedComponent.dependencies.filter(d => d.id !== depId) });
    showToast('Dependency removed', 'success');
  };

  const updateDataSource = (field, value) => {
    const updated = components.map(c => 
      c.id === selectedComponent.id ? { ...c, dataSource: { ...c.dataSource, [field]: value } } : c
    );
    setComponents(updated);
    setSelectedComponent({ ...selectedComponent, dataSource: { ...selectedComponent.dataSource, [field]: value } });
  };

  const updateApiConfig = (field, value) => {
    const updated = components.map(c => 
      c.id === selectedComponent.id ? { 
        ...c, 
        dataSource: { ...c.dataSource, apiConfig: { ...c.dataSource.apiConfig, [field]: value } }
      } : c
    );
    setComponents(updated);
    setSelectedComponent({
      ...selectedComponent,
      dataSource: { ...selectedComponent.dataSource, apiConfig: { ...selectedComponent.dataSource.apiConfig, [field]: value } }
    });
  };

  const validateField = (component, value) => {
    const errors = [];
    const depCheck = checkDependencies(component);
    if (!depCheck.visible || !depCheck.enabled) return errors;
    if (component.required && (!value || value.toString().trim() === '')) {
      errors.push(`${component.label} is required`);
    }
    return errors;
  };

  const handleInputChange = (component, value) => {
    setFormData({ ...formData, [component.key]: value });
    const errors = validateField(component, value);
    setFormErrors({ ...formErrors, [component.key]: errors });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allErrors = {};
    components.forEach(component => {
      const depCheck = checkDependencies(component);
      if (depCheck.visible && depCheck.enabled) {
        const errors = validateField(component, formData[component.key]);
        if (errors.length > 0) allErrors[component.key] = errors;
      }
    });
    setFormErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
      showToast('Please fix validation errors', 'error');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      showToast('Form submitted successfully!', 'success');
      setIsSubmitting(false);
      setFormData({});
      setFormErrors({});
    }, 1500);
  };

  const handleSave = () => {
    const formSchema = {
      name: formName,
      components: components.map(c => ({
        type: c.type, label: c.label, key: c.key, placeholder: c.placeholder,
        required: c.required, validation: c.validation, options: c.options,
        defaultValue: c.defaultValue, dependencies: c.dependencies, dataSource: c.dataSource
      }))
    };
    console.log('Form schema:', formSchema);
    showToast('Form schema saved!', 'success');
  };

  const renderFormComponent = (component, isPreview) => {
    const depCheck = checkDependencies(component);
    if (isPreview && !depCheck.visible) return null;
    const inputClass = `w-full px-3 py-2 border rounded ${
      formErrors[component.key]?.length > 0 ? 'border-red-500' : 'border-gray-300'
    } ${!depCheck.enabled || !isPreview ? 'bg-gray-50' : ''} ${!depCheck.enabled ? 'opacity-50 cursor-not-allowed' : ''}`;
    const value = formData[component.key] !== undefined ? formData[component.key] : component.defaultValue;
    
    switch (component.type) {
      case 'textfield':
      case 'email':
        return (
          <div>
            <input type={component.type === 'email' ? 'email' : 'text'} placeholder={component.placeholder}
              value={value} onChange={(e) => handleInputChange(component, e.target.value)}
              className={inputClass} disabled={!isPreview || !depCheck.enabled} />
            {formErrors[component.key]?.map((error, idx) => (
              <p key={idx} className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" />{error}
              </p>
            ))}
          </div>
        );
      case 'number':
        return (
          <div>
            <input type="number" placeholder={component.placeholder} value={value}
              onChange={(e) => handleInputChange(component, e.target.value)}
              className={inputClass} disabled={!isPreview || !depCheck.enabled} />
            {formErrors[component.key]?.map((error, idx) => (
              <p key={idx} className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" />{error}
              </p>
            ))}
          </div>
        );
      case 'date':
        return (
          <input type="date" value={value} onChange={(e) => handleInputChange(component, e.target.value)}
            className={inputClass} disabled={!isPreview || !depCheck.enabled} />
        );
      case 'dropdown':
        const options = component.dataSource?.type === 'api' 
          ? dropdownData[component.key] || []
          : component.dataSource?.options || component.options || [];
        return (
          <select value={value} onChange={(e) => handleInputChange(component, e.target.value)}
            className={inputClass} disabled={!isPreview || !depCheck.enabled}>
            <option value="">Select...</option>
            {options.map((option, idx) => (
              <option key={idx} value={typeof option === 'object' ? option.value : option}>
                {typeof option === 'object' ? option.label : option}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea placeholder={component.placeholder} value={value}
            onChange={(e) => handleInputChange(component, e.target.value)}
            className={inputClass} rows="3" disabled={!isPreview || !depCheck.enabled} />
        );
      case 'checkbox':
        return (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={value || false}
              onChange={(e) => handleInputChange(component, e.target.checked)}
              className="w-4 h-4" disabled={!isPreview || !depCheck.enabled} />
            <span className="text-sm">{component.label}</span>
          </label>
        );
      default:
        return null;
    }
  };

  const getAvailableSourceFields = (currentKey) => {
    return components.filter(c => c.key !== currentKey && c.key);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {isEditingName ? (
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
              onBlur={() => setIsEditingName(false)} onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
              className="text-2xl font-bold border-b-2 border-blue-500 outline-none bg-transparent" autoFocus />
          ) : (
            <h2 className="text-2xl font-bold cursor-pointer hover:text-blue-600" onClick={() => setIsEditingName(true)}>
              {formName}
            </h2>
          )}
          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">{components.length} fields</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2">
            <Eye className="w-4 h-4" />{previewMode ? 'Edit Mode' : 'Preview'}
          </button>
          <button onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Save className="w-4 h-4" />Save Schema
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {!previewMode && (
          <div className="w-64 bg-white rounded-xl shadow-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Plus className="w-5 h-5 text-blue-600" />Field Types</h3>
            <div className="space-y-2">
              {componentTypes.map((compType, index) => (
                <button key={compType.type} draggable
                  onDragStart={(e) => handleDragStart(e, index, true)} onDragEnd={handleDragEnd}
                  onClick={() => addComponent(compType.type)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 rounded-lg text-left cursor-move">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{compType.icon}</span>
                    <span className="text-sm font-medium">{compType.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
            {components.map((component, index) => {
              const depCheck = checkDependencies(component);
              if (previewMode && !depCheck.visible) return null;

              return (
                <div key={component.id}>
                  {!previewMode && dropPosition === index && (
                    <div className="border-2 border-dashed border-blue-400 bg-blue-50 rounded-lg p-3 mb-2 text-center text-sm text-blue-600">
                      Drop here to insert at position {index + 1}
                    </div>
                  )}
                  
                  <div draggable={!previewMode}
                    onDragStart={(e) => handleDragStart(e, index, false)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`border rounded-lg p-4 ${selectedComponent?.id === component.id && !previewMode ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} 
                    ${!previewMode ? 'cursor-move hover:border-blue-300' : ''} ${draggingComponent === index ? 'opacity-50' : ''}`}
                    onClick={() => !previewMode && setSelectedComponent(component)}>
                    <div className="flex items-start gap-2">
                      {!previewMode && (
                        <div className="flex flex-col gap-1 mt-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-400">#{index + 1}</span>
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">
                              {component.label}{component.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {!previewMode && component.dependencies?.length > 0 && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Link className="w-3 h-3" />{component.dependencies.length}
                              </span>
                            )}
                            {!previewMode && component.type === 'dropdown' && component.dataSource?.type === 'api' && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Globe className="w-3 h-3" />API
                              </span>
                            )}
                          </div>
                          {!previewMode && (
                            <div className="flex gap-1">
                              <button type="button" onClick={(e) => { e.stopPropagation(); moveComponent(index, 'up'); }}
                                disabled={index === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 text-xs">▲</button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); moveComponent(index, 'down'); }}
                                disabled={index === components.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 text-xs">▼</button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); duplicateComponent(component); }}
                                className="p-1 hover:bg-gray-200 rounded"><Copy className="w-4 h-4 text-gray-600" /></button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); deleteComponent(component.id); }}
                                className="p-1 hover:bg-gray-200 rounded"><Trash2 className="w-4 h-4 text-red-600" /></button>
                            </div>
                          )}
                        </div>
                        {renderFormComponent(component, previewMode)}
                        {!previewMode && <p className="text-xs text-gray-500 mt-1">Key: <code className="bg-gray-100 px-1 rounded">{component.key}</code></p>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {!previewMode && dropPosition === components.length && (
              <div className="border-2 border-dashed border-blue-400 bg-blue-50 rounded-lg p-4 text-center text-sm text-blue-600">
                Drop here to add at the end
              </div>
            )}

            {components.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed rounded-lg bg-gray-50">
                <Plus className="w-16 h-16 mx-auto mb-3 opacity-30 text-gray-400" />
                <p className="text-lg font-medium text-gray-600">Start Building Your Form</p>
                <p className="text-sm mt-2 text-gray-500">Drag field types from the left or click to add</p>
              </div>
            )}

            {previewMode && components.length > 0 && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => { setFormData({}); setFormErrors({}); showToast('Form reset', 'info'); }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50">Reset</button>
                <button type="submit" disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Submitting...</> : <><Send className="w-4 h-4" />Submit Form</>}
                </button>
              </div>
            )}
          </form>
        </div>

        {!previewMode && selectedComponent && (
          <div className="w-80 bg-white rounded-xl shadow-lg p-4 max-h-screen overflow-y-auto">
            <h3 className="font-semibold mb-4 text-lg">Field Properties</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Label</label>
                <input type="text" value={selectedComponent.label}
                  onChange={(e) => {
                    const updated = components.map(c => c.id === selectedComponent.id ? { ...c, label: e.target.value } : c);
                    setComponents(updated);
                    setSelectedComponent({ ...selectedComponent, label: e.target.value });
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">API Key</label>
                <input type="text" value={selectedComponent.key}
                  onChange={(e) => {
                    const updated = components.map(c => c.id === selectedComponent.id ? { ...c, key: e.target.value } : c);
                    setComponents(updated);
                    setSelectedComponent({ ...selectedComponent, key: e.target.value });
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono" />
              </div>

              <div className="pt-4 border-t">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedComponent.required}
                    onChange={(e) => {
                      const updated = components.map(c => c.id === selectedComponent.id ? { ...c, required: e.target.checked } : c);
                      setComponents(updated);
                      setSelectedComponent({ ...selectedComponent, required: e.target.checked });
                    }}
                    className="w-4 h-4" />
                  <span className="text-sm font-medium">Required Field</span>
                </label>
              </div>

              {selectedComponent.type === 'dropdown' && (
                <div className="pt-4 border-t">
                  <button onClick={() => setShowDataSource(!showDataSource)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg">
                    <span className="text-sm font-semibold text-green-700 flex items-center gap-2">
                      <Database className="w-4 h-4" />Data Source
                    </span>
                    {showDataSource ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  {showDataSource && (
                    <div className="mt-3 space-y-3 bg-green-50 p-3 rounded-lg">
                      <div>
                        <label className="text-xs font-medium block mb-1">Source Type</label>
                        <select value={selectedComponent.dataSource?.type || 'static'}
                          onChange={(e) => updateDataSource('type', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm">
                          <option value="static">Static Options</option>
                          <option value="api">REST API</option>
                          <option value="database">Database Query</option>
                        </select>
                      </div>

                      {selectedComponent.dataSource?.type === 'static' && (
                        <div>
                          <label className="text-xs font-medium block mb-1">Options (one per line)</label>
                          <textarea value={selectedComponent.dataSource?.options?.join('\n') || ''}
                            onChange={(e) => {
                              const options = e.target.value.split('\n').filter(o => o.trim());
                              updateDataSource('options', options);
                            }}
                            className="w-full px-2 py-1 border rounded text-sm" rows="4" />
                        </div>
                      )}

                      {selectedComponent.dataSource?.type === 'api' && (
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs font-medium block mb-1">API URL</label>
                            <input type="text" value={selectedComponent.dataSource?.apiConfig?.url || ''}
                              onChange={(e) => updateApiConfig('url', e.target.value)}
                              placeholder="https://api.example.com/data"
                              className="w-full px-2 py-1 border rounded text-sm" />
                          </div>
                          <div>
                            <label className="text-xs font-medium block mb-1">Method</label>
                            <select value={selectedComponent.dataSource?.apiConfig?.method || 'GET'}
                              onChange={(e) => updateApiConfig('method', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm">
                              <option value="GET">GET</option>
                              <option value="POST">POST</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium block mb-1">Value Field</label>
                            <input type="text" value={selectedComponent.dataSource?.apiConfig?.valueField || 'id'}
                              onChange={(e) => updateApiConfig('valueField', e.target.value)}
                              placeholder="id" className="w-full px-2 py-1 border rounded text-sm" />
                          </div>
                          <div>
                            <label className="text-xs font-medium block mb-1">Label Field</label>
                            <input type="text" value={selectedComponent.dataSource?.apiConfig?.labelField || 'name'}
                              onChange={(e) => updateApiConfig('labelField', e.target.value)}
                              placeholder="name" className="w-full px-2 py-1 border rounded text-sm" />
                          </div>
                          <button onClick={() => showToast('Test connection clicked', 'info')}
                            className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center gap-2">
                            <Globe className="w-4 h-4" />Test Connection
                          </button>
                        </div>
                      )}

                      {selectedComponent.dataSource?.type === 'database' && (
                        <div className="text-xs text-gray-600 p-2 bg-yellow-50 rounded">
                          Database queries require backend configuration
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t">
                <button onClick={() => setShowDependencies(!showDependencies)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg">
                  <span className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                    <Link className="w-4 h-4" />Dependencies ({selectedComponent.dependencies?.length || 0})
                  </span>
                  {showDependencies ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {showDependencies && (
                  <div className="mt-3 space-y-3">
                    {selectedComponent.dependencies?.map((dep) => (
                      <div key={dep.id} className="border rounded-lg p-3 bg-purple-50">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold text-purple-700">Condition</span>
                          <button onClick={() => deleteDependency(dep.id)} className="text-red-600 hover:text-red-800">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs block mb-1">When field</label>
                            <select value={dep.sourceField} onChange={(e) => updateDependency(dep.id, 'sourceField', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-xs">
                              <option value="">Select field...</option>
                              {getAvailableSourceFields(selectedComponent.key).map(field => (
                                <option key={field.key} value={field.key}>{field.label} ({field.key})</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-xs block mb-1">Condition</label>
                            <select value={dep.condition} onChange={(e) => updateDependency(dep.id, 'condition', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-xs">
                              {conditionTypes.map(ct => (
                                <option key={ct.value} value={ct.value}>{ct.label}</option>
                              ))}
                            </select>
                          </div>

                          {!['isEmpty', 'isNotEmpty'].includes(dep.condition) && (
                            <div>
                              <label className="text-xs block mb-1">Value</label>
                              <input type="text" value={dep.value} onChange={(e) => updateDependency(dep.id, 'value', e.target.value)}
                                placeholder="Enter value..." className="w-full px-2 py-1 border rounded text-xs" />
                            </div>
                          )}

                          <div>
                            <label className="text-xs block mb-1">Then</label>
                            <select value={dep.action} onChange={(e) => updateDependency(dep.id, 'action', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-xs">
                              {actionTypes.map(at => (
                                <option key={at.value} value={at.value}>{at.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button onClick={addDependency}
                      className="w-full px-3 py-2 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 text-sm flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" />Add Dependency
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FormioBuilder;