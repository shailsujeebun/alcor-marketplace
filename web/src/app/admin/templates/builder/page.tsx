'use client';

import { useState, useEffect } from 'react';
import {
    getCategories,
    createAdminTemplate,
    updateAdminTemplate,
    getCategoryTemplateByCategory,
    getAdminTemplate,
    FormTemplate,
    FormField,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Plus, Trash, GripVertical, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

export default function AdminTemplatesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [templateName, setTemplateName] = useState('');
    const [existingTemplateId, setExistingTemplateId] = useState<number | null>(null);

    // Sections and Fields state
    const [sections, setSections] = useState<string[]>(['General Information']);
    const [fields, setFields] = useState<Partial<FormField>[]>([]);

    const [isLoading, setIsLoading] = useState(false);

    const { user } = useAuthStore();
    const router = useRouter();

    // State for cascading selection
    const [categoryTree, setCategoryTree] = useState<any[]>([]);
    const [selectionPath, setSelectionPath] = useState<string[]>([]);

    useEffect(() => {
        async function load() {
            const data = await getCategories();
            setCategoryTree(data);
        }
        load();
    }, []);

    // Handle cascading selection
    const handleLevelSelect = async (level: number, id: string) => {
        const newPath = selectionPath.slice(0, level); // Keep path up to this level
        newPath.push(id);
        setSelectionPath(newPath);
        setSelectedCategory(id);

        // Fetch existing template for this category
        try {
            const template = await getCategoryTemplateByCategory(Number(id));
            if (template) {
                setExistingTemplateId(Number(template.id));
                // Load existing fields
                const loadedFields = template.fields.map(f => ({
                    id: f.id,
                    key: f.key,
                    label: f.label,
                    type: f.type,
                    isRequired: f.isRequired,
                    section: f.section || undefined,
                    options: f.options,
                }));
                setFields(loadedFields);
                // Extract unique sections
                const uniqueSections = Array.from(new Set(loadedFields.map(f => f.section).filter(Boolean))) as string[];
                if (uniqueSections.length > 0) {
                    setSections(uniqueSections);
                }
            } else {
                setExistingTemplateId(null);
                setFields([]);
                setSections(['General Information']);
            }
        } catch (error) {
            console.error('Failed to fetch template:', error);
            setExistingTemplateId(null);
        }
    };

    // Helper to get active node at a level
    const getLevelOptions = (level: number) => {
        if (level === 0) return categoryTree;
        // Traverse path
        let currentLevel = categoryTree;
        for (let i = 0; i < level; i++) {
            const node = currentLevel.find(n => n.id.toString() === selectionPath[i]);
            if (node && node.children) {
                currentLevel = node.children;
            } else {
                return [];
            }
        }
        return currentLevel;
    };

    // Determine how many levels to show
    const levels = [0];
    let currentNodes = categoryTree;
    for (let i = 0; i < selectionPath.length; i++) {
        const id = selectionPath[i];
        const node = currentNodes.find(n => n.id.toString() === id);
        if (node && node.children && node.children.length > 0) {
            levels.push(i + 1);
            currentNodes = node.children;
        } else {
            break;
        }
    }

    // Section Management
    function addSection() {
        const name = prompt('Enter section name (e.g., Engine Options, Dimensions):');
        if (name && !sections.includes(name)) {
            setSections([...sections, name]);
        }
    }

    function deleteSection(sectionName: string) {
        if (confirm(`Delete section "${sectionName}" and all its fields?`)) {
            setSections(sections.filter(s => s !== sectionName));
            setFields(fields.filter(f => f.section !== sectionName));
        }
    }

    function addField(section: string) {
        setFields([
            ...fields,
            {
                key: `field_${Date.now()}`,
                label: 'New Field',
                type: 'TEXT',
                isRequired: false,
                section: section,
                options: [],
            },
        ]);
    }

    function updateField(index: number, updates: Partial<FormField>) {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...updates };
        setFields(newFields);
    }

    function removeField(index: number) {
        const newFields = fields.filter((_, i) => i !== index);
        setFields(newFields);
    }

    function addOption(fieldIndex: number) {
        const field = fields[fieldIndex];
        const newOption = {
            id: `opt_${Date.now()}`,
            label: 'Option',
            value: 'value'
        };
        const updatedOptions = [...(field.options || []), newOption];
        updateField(fieldIndex, { options: updatedOptions as any });
    }

    function updateOption(fieldIndex: number, optIndex: number, key: 'label' | 'value', val: string) {
        const field = fields[fieldIndex];
        if (!field.options) return;
        const newOptions = [...field.options];
        newOptions[optIndex] = { ...newOptions[optIndex], [key]: val };
        updateField(fieldIndex, { options: newOptions });
    }

    async function handleSave() {
        if (!selectedCategory) return alert('Select a category');
        if (fields.length === 0) return alert('Add at least one field');

        try {
            setIsLoading(true);

            // Validate and sanitize field keys
            const sanitizeKey = (key: string | undefined, fallback: string): string => {
                if (!key) return fallback;
                return key.toLowerCase().replace(/[^a-z0-9_]/g, '_');
            };

            // Clean up fields and ensure unique keys
            const keyCount = new Map<string, number>();
            const cleanFields = fields.map((f, i) => {
                let baseKey = sanitizeKey(f.key, `field_${i}`);

                // Handle duplicate keys by adding suffix
                const count = keyCount.get(baseKey) || 0;
                keyCount.set(baseKey, count + 1);
                const finalKey = count > 0 ? `${baseKey}_${count}` : baseKey;

                return {
                    key: finalKey,
                    label: f.label || 'Unnamed Field',
                    type: f.type || 'TEXT',
                    required: f.isRequired || false,
                    section: f.section,
                    order: i,
                    options: f.options?.map(o => ({ label: o.label, value: o.value }))
                };
            });

            if (existingTemplateId) {
                // Update existing template
                await updateAdminTemplate(existingTemplateId, {
                    fields: cleanFields,
                });
            } else {
                // Create new template
                const created = await createAdminTemplate({
                    categoryId: Number(selectedCategory),
                    name: templateName || 'Default Template',
                    fields: cleanFields,
                });
                setExistingTemplateId(Number(created.id));
            }

            alert('Template saved successfully!');
            // Reset or redirect?
        } catch (error) {
            console.error(error);
            alert('Failed to save template');
        } finally {
            setIsLoading(false);
        }
    }

    // Helper to get index of a field in the main array
    const getFieldIndex = (field: Partial<FormField>) => fields.indexOf(field);

    return (
        <div className="container-main pt-20 pb-12 max-w-6xl">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">Form Template Builder</h1>
                    <p className="text-muted-foreground">Define custom fields and sections for category listings.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save Template
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar / Settings */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card rounded-xl p-6 border border-white/10 sticky top-24">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            Settings
                        </h2>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <Label className="text-muted-foreground">Category Selection</Label>

                                {levels.map((level) => {
                                    const options = getLevelOptions(level);
                                    if (!options || options.length === 0) return null;

                                    const selectedAtLevel = selectionPath[level] || '';

                                    return (
                                        <div key={level} className="space-y-1 animation-fade-in">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">
                                                {level === 0 ? 'Main Category' : level === 1 ? 'Subcategory' : `Level ${level + 1} Category`}
                                            </p>
                                            <Select
                                                key={`select-${level}-${selectedAtLevel}`} // Force remount on change to prevent stuck UI
                                                value={selectedAtLevel}
                                                onValueChange={(val) => handleLevelSelect(level, val)}
                                            >
                                                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white shadow-sm">
                                                    <SelectValue placeholder={level === 0 ? "Select Main Category" : "Select Subcategory"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {options.map((c: any) => (
                                                        <SelectItem key={c.id} value={c.id.toString()}>
                                                            {c.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    );
                                })}

                                {selectedCategory && (
                                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-200">
                                        Selected: <span className="font-semibold">{selectionPath.length} levels deep</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Template Name</Label>
                                <Input
                                    value={templateName}
                                    onChange={e => setTemplateName(e.target.value)}
                                    placeholder="e.g. Tractors V1"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Builder Area */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">Form Sections</h2>
                        <Button onClick={addSection} variant="secondary" size="sm">
                            <Plus className="w-4 h-4 mr-2" /> Add Section
                        </Button>
                    </div>

                    {sections.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                            <p className="text-muted-foreground mb-4">No sections defined.</p>
                            <Button onClick={addSection}>Create First Section</Button>
                        </div>
                    )}

                    {sections.map((section) => (
                        <div key={section} className="glass-card rounded-xl border border-white/10 overflow-hidden">
                            <div className="bg-white/5 p-4 flex justify-between items-center border-b border-white/10">
                                <h3 className="font-bold text-white">{section}</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteSection(section)}
                                    className="text-muted-foreground hover:text-red-400"
                                >
                                    <Trash className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="p-4 space-y-4 bg-black/20">
                                {fields
                                    .map((f, i) => ({ ...f, originalIndex: i }))
                                    .filter(f => f.section === section)
                                    .map((field) => {
                                        const index = field.originalIndex;
                                        return (
                                            <div
                                                key={index}
                                                className="group relative bg-card/80 hover:bg-card border border-white/5 hover:border-blue-500/50 rounded-xl p-6 transition-all duration-200"
                                            >
                                                <div className="pl-2 space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-xs uppercase text-muted-foreground">Field Label</Label>
                                                            <Input
                                                                value={field.label}
                                                                onChange={e => updateField(index, { label: e.target.value, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                                                className="bg-black/20 border-white/10"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs uppercase text-muted-foreground">Field Type</Label>
                                                            <Select
                                                                value={field.type}
                                                                onValueChange={(val: any) => updateField(index, { type: val })}
                                                            >
                                                                <SelectTrigger className="bg-black/20 border-white/10">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="TEXT">Text Input</SelectItem>
                                                                    <SelectItem value="NUMBER">Number Input</SelectItem>
                                                                    <SelectItem value="PRICE">Price (Currency)</SelectItem>
                                                                    <SelectItem value="RICHTEXT">Rich Text / Description</SelectItem>
                                                                    <SelectItem value="SELECT">Dropdown Select</SelectItem>
                                                                    <SelectItem value="MULTISELECT">Multi-Select</SelectItem>
                                                                    <SelectItem value="RADIO">Radio Buttons</SelectItem>
                                                                    <SelectItem value="CHECKBOX_GROUP">Checkbox Group</SelectItem>
                                                                    <SelectItem value="BOOLEAN">Single Switch/Checkbox</SelectItem>
                                                                    <SelectItem value="DATE">Date Picker</SelectItem>
                                                                    <SelectItem value="YEAR_RANGE">Year Range</SelectItem>
                                                                    <SelectItem value="COLOR">Color Picker</SelectItem>
                                                                    <SelectItem value="LOCATION">Map Location</SelectItem>
                                                                    <SelectItem value="MEDIA">Image/Video Upload</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>

                                                    {/* Options Editor */}
                                                    {['SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX_GROUP', 'COLOR'].includes(field.type!) && (
                                                        <div className="bg-black/20 p-4 rounded-lg space-y-3 border border-white/5">
                                                            <div className="flex justify-between items-center">
                                                                <Label className="text-xs uppercase text-blue-400">
                                                                    {field.type === 'COLOR' ? 'Color Options' : 'Options Configuration'}
                                                                </Label>
                                                                <Button size="sm" variant="ghost" onClick={() => addOption(index)} className="h-6 text-xs hover:text-blue-400">
                                                                    <Plus className="w-3 h-3 mr-1" /> Add Option
                                                                </Button>
                                                            </div>

                                                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                                                {field.options?.map((opt, optIndex) => (
                                                                    <div key={optIndex} className="flex gap-2 items-center">
                                                                        {field.type === 'COLOR' ? (
                                                                            <input
                                                                                type="color"
                                                                                value={opt.value}
                                                                                onChange={e => updateOption(index, optIndex, 'value', e.target.value)}
                                                                                className="h-8 w-12 bg-transparent border-none cursor-pointer"
                                                                            />
                                                                        ) : null}

                                                                        <Input
                                                                            value={opt.label}
                                                                            onChange={e => updateOption(index, optIndex, 'label', e.target.value)}
                                                                            placeholder="Label"
                                                                            className="h-8 text-sm bg-black/20 border-white/10"
                                                                        />
                                                                        <Input
                                                                            value={opt.value}
                                                                            onChange={e => updateOption(index, optIndex, 'value', e.target.value)}
                                                                            placeholder="Value"
                                                                            className="h-8 text-sm bg-black/20 border-white/10 font-mono text-xs"
                                                                        />
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-8 w-8 text-muted-foreground hover:text-red-400"
                                                                            onClick={() => {
                                                                                const newOpts = [...(field.options || [])];
                                                                                newOpts.splice(optIndex, 1);
                                                                                updateField(index, { options: newOpts });
                                                                            }}
                                                                        >
                                                                            <Trash className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                                {(!field.options || field.options.length === 0) && (
                                                                    <div className="text-xs text-muted-foreground text-center py-2">
                                                                        No options defined.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                                        <label className="flex items-center gap-2 text-sm cursor-pointer select-none text-muted-foreground hover:text-white transition-colors">
                                                            <input
                                                                type="checkbox"
                                                                checked={field.isRequired}
                                                                onChange={e => updateField(index, { isRequired: e.target.checked })}
                                                                className="w-4 h-4 rounded border-white/20 bg-black/20 text-blue-500 focus:ring-blue-500/20"
                                                            />
                                                            Required Field
                                                        </label>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-muted-foreground hover:text-red-400 hover:bg-red-950/20"
                                                            onClick={() => removeField(index)}
                                                        >
                                                            <Trash className="w-4 h-4 mr-2" />
                                                            Remove Field
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                <Button
                                    onClick={() => addField(section)}
                                    variant="outline"
                                    className="w-full py-4 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 text-muted-foreground hover:text-blue-400 transition-all"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Field to {section}
                                </Button>
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-center pt-8">
                        <div className="text-center">
                            <p className="text-muted-foreground mb-4">Need more organization?</p>
                            <Button onClick={addSection} variant="secondary">
                                <Plus className="w-4 h-4 mr-2" /> Add Another Section
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
