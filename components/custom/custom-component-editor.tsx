'use client';

import { useState, useCallback } from 'react';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  Plus,
  Trash2,
  Copy,
  Edit3,
  Save,
  Image,
  Box,
  Palette,
  Settings2,
  Upload,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface CustomComponentDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string; // emoji or URL
  iconType: 'emoji' | 'url' | 'svg';
  defaultWidth: number;
  defaultHeight: number;
  style: {
    backgroundColor: string;
    borderColor: string;
    borderRadius: number;
    borderWidth: number;
    textColor: string;
    fontSize: number;
  };
  properties: CustomProperty[];
  terraformResource?: string;
  cloudformationResource?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomProperty {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color';
  defaultValue: string | number | boolean;
  options?: string[]; // For select type
  required: boolean;
  description?: string;
}

interface CustomComponentEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  component?: CustomComponentDefinition;
  onSave: (component: CustomComponentDefinition) => void;
}

interface CustomComponentLibraryProps {
  components: CustomComponentDefinition[];
  onSelect: (component: CustomComponentDefinition) => void;
  onEdit: (component: CustomComponentDefinition) => void;
  onDelete: (componentId: string) => void;
  onDuplicate: (component: CustomComponentDefinition) => void;
  onCreate: () => void;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_COMPONENT: CustomComponentDefinition = {
  id: '',
  name: 'New Component',
  description: 'A custom component',
  category: 'Custom',
  icon: '📦',
  iconType: 'emoji',
  defaultWidth: 150,
  defaultHeight: 60,
  style: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 2,
    textColor: '#374151',
    fontSize: 14,
  },
  properties: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const PRESET_ICONS = ['📦', '🔧', '⚙️', '🌐', '💾', '🔒', '📊', '🚀', '💻', '☁️', '🔥', '⚡', '🎯', '📡', '🔌'];

const PRESET_CATEGORIES = ['Custom', 'Compute', 'Storage', 'Database', 'Network', 'Security', 'Integration', 'Analytics', 'DevOps'];

// ============================================================================
// Property Editor
// ============================================================================

function PropertyEditor({
  property,
  onChange,
  onDelete,
}: {
  property: CustomProperty;
  onChange: (property: CustomProperty) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 p-2 border rounded bg-gray-50">
      <Input
        value={property.name}
        onChange={(e) => onChange({ ...property, name: e.target.value })}
        placeholder="Property name"
        className="flex-1 h-8 text-sm"
      />
      <select
        value={property.type}
        onChange={(e) =>
          onChange({ ...property, type: e.target.value as CustomProperty['type'] })
        }
        className="h-8 px-2 border rounded text-sm"
      >
        <option value="string">Text</option>
        <option value="number">Number</option>
        <option value="boolean">Boolean</option>
        <option value="select">Select</option>
        <option value="color">Color</option>
      </select>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ============================================================================
// Component Preview
// ============================================================================

function ComponentPreview({ component }: { component: CustomComponentDefinition }) {
  return (
    <div
      className="flex items-center justify-center p-2 transition-all"
      style={{
        width: component.defaultWidth,
        height: component.defaultHeight,
        backgroundColor: component.style.backgroundColor,
        borderColor: component.style.borderColor,
        borderWidth: component.style.borderWidth,
        borderStyle: 'solid',
        borderRadius: component.style.borderRadius,
        color: component.style.textColor,
        fontSize: component.style.fontSize,
      }}
    >
      <span className="mr-2">{component.icon}</span>
      <span className="truncate">{component.name}</span>
    </div>
  );
}

// ============================================================================
// Component Editor Dialog
// ============================================================================

export function CustomComponentEditor({
  open,
  onOpenChange,
  component,
  onSave,
}: CustomComponentEditorProps) {
  const [formData, setFormData] = useState<CustomComponentDefinition>(
    component || { ...DEFAULT_COMPONENT, id: crypto.randomUUID() }
  );
  const [activeTab, setActiveTab] = useState<'basic' | 'style' | 'properties'>('basic');

  const handleSave = useCallback(() => {
    onSave({
      ...formData,
      updatedAt: new Date(),
    });
    onOpenChange(false);
  }, [formData, onSave, onOpenChange]);

  const addProperty = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      properties: [
        ...prev.properties,
        {
          id: crypto.randomUUID(),
          name: `property${prev.properties.length + 1}`,
          type: 'string',
          defaultValue: '',
          required: false,
        },
      ],
    }));
  }, []);

  const updateProperty = useCallback((index: number, property: CustomProperty) => {
    setFormData((prev) => ({
      ...prev,
      properties: prev.properties.map((p, i) => (i === index ? property : p)),
    }));
  }, []);

  const removeProperty = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      properties: prev.properties.filter((_, i) => i !== index),
    }));
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            {component ? 'Edit Component' : 'Create Custom Component'}
          </DialogTitle>
          <DialogDescription>
            Design your own cloud architecture component
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'basic'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
            onClick={() => setActiveTab('basic')}
          >
            <Settings2 className="h-4 w-4 inline mr-1" />
            Basic
          </button>
          <button
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'style'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
            onClick={() => setActiveTab('style')}
          >
            <Palette className="h-4 w-4 inline mr-1" />
            Style
          </button>
          <button
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'properties'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
            onClick={() => setActiveTab('properties')}
          >
            <Edit3 className="h-4 w-4 inline mr-1" />
            Properties
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full h-10 px-3 border rounded-md"
                >
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded">
                  {PRESET_ICONS.map((icon) => (
                    <button
                      key={icon}
                      className={cn(
                        'w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100',
                        formData.icon === icon && 'bg-blue-100 ring-2 ring-blue-500'
                      )}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, icon, iconType: 'emoji' }))
                      }
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Default Width</Label>
                  <Input
                    id="width"
                    type="number"
                    value={formData.defaultWidth}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        defaultWidth: parseInt(e.target.value) || 100,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Default Height</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.defaultHeight}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        defaultHeight: parseInt(e.target.value) || 50,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Style Tab */}
          {activeTab === 'style' && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <ComponentPreview component={formData} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bgColor">Background Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.style.backgroundColor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          style: { ...prev.style, backgroundColor: e.target.value },
                        }))
                      }
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      id="bgColor"
                      value={formData.style.backgroundColor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          style: { ...prev.style, backgroundColor: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderColor">Border Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.style.borderColor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          style: { ...prev.style, borderColor: e.target.value },
                        }))
                      }
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      id="borderColor"
                      value={formData.style.borderColor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          style: { ...prev.style, borderColor: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.style.textColor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          style: { ...prev.style, textColor: e.target.value },
                        }))
                      }
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      id="textColor"
                      value={formData.style.textColor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          style: { ...prev.style, textColor: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Input
                    id="fontSize"
                    type="number"
                    value={formData.style.fontSize}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        style: { ...prev.style, fontSize: parseInt(e.target.value) || 14 },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderRadius">Border Radius</Label>
                  <Input
                    id="borderRadius"
                    type="number"
                    value={formData.style.borderRadius}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        style: { ...prev.style, borderRadius: parseInt(e.target.value) || 0 },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderWidth">Border Width</Label>
                  <Input
                    id="borderWidth"
                    type="number"
                    value={formData.style.borderWidth}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        style: { ...prev.style, borderWidth: parseInt(e.target.value) || 1 },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Custom Properties</Label>
                <Button variant="outline" size="sm" onClick={addProperty}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Property
                </Button>
              </div>

              {formData.properties.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  <Edit3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No custom properties defined</p>
                  <p className="text-xs text-gray-400">
                    Add properties to configure this component
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.properties.map((property, index) => (
                    <PropertyEditor
                      key={property.id}
                      property={property}
                      onChange={(p) => updateProperty(index, p)}
                      onDelete={() => removeProperty(index)}
                    />
                  ))}
                </div>
              )}

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="terraform">Terraform Resource (optional)</Label>
                <Input
                  id="terraform"
                  value={formData.terraformResource || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, terraformResource: e.target.value }))
                  }
                  placeholder="e.g., aws_instance"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cloudformation">CloudFormation Resource (optional)</Label>
                <Input
                  id="cloudformation"
                  value={formData.cloudformationResource || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cloudformationResource: e.target.value,
                    }))
                  }
                  placeholder="e.g., AWS::EC2::Instance"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Save Component
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Component Library
// ============================================================================

export function CustomComponentLibrary({
  components,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onCreate,
  className,
}: CustomComponentLibraryProps) {
  const groupedComponents = components.reduce(
    (acc, comp) => {
      const category = comp.category || 'Custom';
      if (!acc[category]) acc[category] = [];
      acc[category].push(comp);
      return acc;
    },
    {} as Record<string, CustomComponentDefinition[]>
  );

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="p-3 border-b flex items-center justify-between bg-gray-50">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Box className="h-4 w-4" />
          Custom Components
        </h3>
        <Button size="sm" variant="outline" onClick={onCreate}>
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {Object.keys(groupedComponents).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Box className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No custom components yet</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={onCreate}
            >
              Create your first component
            </Button>
          </div>
        ) : (
          Object.entries(groupedComponents).map(([category, comps]) => (
            <div key={category} className="mb-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                {category}
              </h4>
              <div className="space-y-2">
                {comps.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-3 border rounded-lg bg-white hover:border-blue-300 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        className="flex items-center gap-2 flex-1 text-left"
                        onClick={() => onSelect(comp)}
                      >
                        <span className="text-xl">{comp.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{comp.name}</div>
                          <div className="text-xs text-gray-400">
                            {comp.description}
                          </div>
                        </div>
                      </button>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => onEdit(comp)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => onDuplicate(comp)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                          onClick={() => onDelete(comp.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Export helper to create node from component
// ============================================================================

export function createNodeFromComponent(
  component: CustomComponentDefinition,
  position: { x: number; y: number }
): Node {
  return {
    id: `${component.id}-${Date.now()}`,
    type: 'custom',
    position,
    data: {
      label: component.name,
      icon: component.icon,
      componentId: component.id,
      properties: component.properties.reduce(
        (acc, prop) => {
          acc[prop.name] = prop.defaultValue;
          return acc;
        },
        {} as Record<string, unknown>
      ),
    },
    style: {
      width: component.defaultWidth,
      height: component.defaultHeight,
      backgroundColor: component.style.backgroundColor,
      borderColor: component.style.borderColor,
      borderWidth: component.style.borderWidth,
      borderRadius: component.style.borderRadius,
      color: component.style.textColor,
      fontSize: component.style.fontSize,
    },
  };
}

export default CustomComponentLibrary;
