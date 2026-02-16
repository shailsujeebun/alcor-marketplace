'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    createAdminTemplate,
    FormField,
    FormTemplate,
    getAdminTemplate,
    getCategories,
    getCategoryTemplateByCategory,
    updateAdminTemplate,
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
import { Plus, Save, Trash } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface CategoryNode {
    id: string;
    name: string;
    children?: CategoryNode[];
}

const DEFAULT_SECTION = 'General Information';

export default function AdminTemplatesPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [templateName, setTemplateName] = useState('');
    const [existingTemplateId, setExistingTemplateId] = useState<number | null>(null);

    const [sections, setSections] = useState<string[]>([DEFAULT_SECTION]);
    const [fields, setFields] = useState<Partial<FormField>[]>([]);

    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryIdParam = searchParams.get('categoryId');
    const templateIdParam = searchParams.get('templateId');

    const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
    const [selectionPath, setSelectionPath] = useState<string[]>([]);

    const getSectionsFromFields = (nextFields: Partial<FormField>[]) => {
        const uniqueSections = Array.from(
            new Set(nextFields.map((field) => field.section).filter(Boolean)),
        ) as string[];

        return uniqueSections.length > 0 ? uniqueSections : [DEFAULT_SECTION];
    };

    const resetTemplateEditor = () => {
        setExistingTemplateId(null);
        setTemplateName('');
        setFields([]);
        setSections([DEFAULT_SECTION]);
    };

    const applyTemplateToEditor = (template: FormTemplate) => {
        const loadedFields: Partial<FormField>[] = (template.fields ?? []).map((field) => ({
            id: field.id,
            key: field.key,
            label: field.label,
            type: field.type,
            isRequired: field.isRequired,
            section: field.section ?? undefined,
            validationRules: field.validationRules,
            options: field.options ?? [],
        }));

        setExistingTemplateId(Number(template.id));
        setTemplateName(`Template v${template.version}`);
        setSelectedCategory(template.categoryId.toString());
        setFields(loadedFields);
        setSections(getSectionsFromFields(loadedFields));
    };

    const findPath = (nodes: CategoryNode[], targetId: string): string[] | null => {
        for (const node of nodes) {
            if (node.id.toString() === targetId) return [node.id.toString()];
            if (node.children?.length) {
                const childPath = findPath(node.children, targetId);
                if (childPath) return [node.id.toString(), ...childPath];
            }
        }
        return null;
    };

    const loadTemplateForCategory = async (categoryId: string) => {
        try {
            const template = await getCategoryTemplateByCategory(Number(categoryId));
            if (!template) {
                resetTemplateEditor();
                return;
            }
            applyTemplateToEditor(template);
        } catch (error) {
            console.error('Failed to fetch template:', error);
            resetTemplateEditor();
        }
    };

    useEffect(() => {
        let isActive = true;

        async function load() {
            try {
                const data = await getCategories();
                if (!isActive) return;

                setCategoryTree(data as CategoryNode[]);

                if (templateIdParam) {
                    const template = await getAdminTemplate(Number(templateIdParam));
                    if (!isActive || !template) return;

                    applyTemplateToEditor(template);

                    const path = findPath(data as CategoryNode[], template.categoryId.toString());
                    if (path) {
                        setSelectionPath(path);
                    } else {
                        setSelectionPath([template.categoryId.toString()]);
                    }
                    return;
                }

                if (categoryIdParam) {
                    setSelectedCategory(categoryIdParam);

                    const path = findPath(data as CategoryNode[], categoryIdParam.toString());
                    if (path) setSelectionPath(path);

                    await loadTemplateForCategory(categoryIdParam);
                }
            } catch (error) {
                console.error('Failed to load categories/templates:', error);
            }
        }

        load();

        return () => {
            isActive = false;
        };
    }, [templateIdParam, categoryIdParam]);

    const handleLevelSelect = async (level: number, id: string) => {
        const newPath = selectionPath.slice(0, level);
        newPath.push(id);
        setSelectionPath(newPath);
        setSelectedCategory(id);

        await loadTemplateForCategory(id);
    };

    const getLevelOptions = (level: number): CategoryNode[] => {
        if (level === 0) return categoryTree;

        let currentLevel: CategoryNode[] = categoryTree;
        for (let i = 0; i < level; i++) {
            const node = currentLevel.find((item) => item.id.toString() === selectionPath[i]);
            if (node?.children) {
                currentLevel = node.children;
            } else {
                return [];
            }
        }

        return currentLevel;
    };

    const levels = useMemo(() => {
        const calculatedLevels = [0];
        let currentNodes: CategoryNode[] = categoryTree;

        for (let i = 0; i < selectionPath.length; i++) {
            const id = selectionPath[i];
            const node = currentNodes.find((item) => item.id.toString() === id);

            if (node?.children?.length) {
                calculatedLevels.push(i + 1);
                currentNodes = node.children;
            } else {
                break;
            }
        }

        return calculatedLevels;
    }, [categoryTree, selectionPath]);

    function addSection() {
        const name = prompt('Enter section name (e.g., Engine Options, Dimensions):');
        if (name && !sections.includes(name)) {
            setSections([...sections, name]);
        }
    }

    function deleteSection(sectionName: string) {
        if (confirm(`Delete section "${sectionName}" and all its fields?`)) {
            setSections(sections.filter((section) => section !== sectionName));
            setFields(fields.filter((field) => field.section !== sectionName));
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
                section,
                options: [],
            },
        ]);
    }

    function updateField(index: number, updates: Partial<FormField>) {
        const nextFields = [...fields];
        nextFields[index] = { ...nextFields[index], ...updates };
        setFields(nextFields);
    }

    function removeField(index: number) {
        setFields(fields.filter((_, fieldIndex) => fieldIndex !== index));
    }

    function addOption(fieldIndex: number) {
        const field = fields[fieldIndex];
        const newOption = {
            id: `opt_${Date.now()}`,
            label: 'Option',
            value: 'value',
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

    async function handleSave(asNew = false) {
        if (!selectedCategory) return alert('Select a category');
        if (fields.length === 0) return alert('Add at least one field');

        try {
            setIsLoading(true);

            const sanitizeKey = (key: string | undefined, fallback: string): string => {
                if (!key) return fallback;
                return key.toLowerCase().replace(/[^a-z0-9_]/g, '_');
            };

            const keyCount = new Map<string, number>();
            const cleanFields = fields.map((field, index) => {
                const baseKey = sanitizeKey(field.key, `field_${index}`);
                const count = keyCount.get(baseKey) || 0;
                keyCount.set(baseKey, count + 1);
                const finalKey = count > 0 ? `${baseKey}_${count}` : baseKey;

                return {
                    key: finalKey,
                    label: field.label || 'Unnamed Field',
                    type: field.type || 'TEXT',
                    required: field.isRequired || false,
                    section: field.section,
                    order: index,
                    options: field.options?.map((option) => ({
                        label: option.label,
                        value: option.value,
                    })),
                };
            });

            if (existingTemplateId && !asNew) {
                await updateAdminTemplate(existingTemplateId, {
                    fields: cleanFields,
                });
                alert('Template updated successfully!');
                return;
            }

            const created = await createAdminTemplate({
                categoryId: Number(selectedCategory),
                name: templateName || 'Default Template',
                fields: cleanFields,
            });

            setExistingTemplateId(Number(created.id));
            setTemplateName(`Template v${created.version}`);
            alert(asNew ? 'New version created successfully!' : 'Template created successfully!');
            router.replace(`/admin/templates/builder?templateId=${created.id}`);
        } catch (error) {
            console.error(error);
            alert('Failed to save template');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container-main pt-20 pb-12 max-w-6xl">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">Form Template Builder</h1>
                    <p className="text-muted-foreground">Define custom fields and sections for category listings.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => handleSave(true)}
                        disabled={isLoading}
                        variant="outline"
                        className="bg-transparent border-white/20 hover:bg-white/10 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Save as New Version
                    </Button>
                    <Button
                        onClick={() => handleSave(false)}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                                                key={`select-${level}-${selectedAtLevel}`}
                                                value={selectedAtLevel}
                                                onValueChange={(value) => handleLevelSelect(level, value)}
                                            >
                                                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white shadow-sm">
                                                    <SelectValue placeholder={level === 0 ? 'Select Main Category' : 'Select Subcategory'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {options.map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            {category.name}
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
                                    onChange={(event) => setTemplateName(event.target.value)}
                                    placeholder="e.g. Tractors V1"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50"
                                />
                            </div>
                        </div>
                    </div>
                </div>

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
                                    .map((field, index) => ({ ...field, originalIndex: index }))
                                    .filter((field) => field.section === section)
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
                                                                onChange={(event) =>
                                                                    updateField(index, {
                                                                        label: event.target.value,
                                                                        key: event.target.value.toLowerCase().replace(/\s+/g, '_'),
                                                                    })
                                                                }
                                                                className="bg-black/20 border-white/10"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs uppercase text-muted-foreground">Field Type</Label>
                                                            <Select
                                                                value={field.type || 'TEXT'}
                                                                onValueChange={(value: any) => updateField(index, { type: value })}
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

                                                    {['SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX_GROUP', 'COLOR'].includes(field.type || '') && (
                                                        <div className="bg-black/20 p-4 rounded-lg space-y-3 border border-white/5">
                                                            <div className="flex justify-between items-center">
                                                                <Label className="text-xs uppercase text-blue-400">
                                                                    {field.type === 'COLOR' ? 'Color Options' : 'Options Configuration'}
                                                                </Label>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => addOption(index)}
                                                                    className="h-6 text-xs hover:text-blue-400"
                                                                >
                                                                    <Plus className="w-3 h-3 mr-1" /> Add Option
                                                                </Button>
                                                            </div>

                                                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                                                {field.options?.map((option, optIndex) => (
                                                                    <div key={optIndex} className="flex gap-2 items-center">
                                                                        {field.type === 'COLOR' ? (
                                                                            <input
                                                                                type="color"
                                                                                value={option.value}
                                                                                onChange={(event) => updateOption(index, optIndex, 'value', event.target.value)}
                                                                                className="h-8 w-12 bg-transparent border-none cursor-pointer"
                                                                            />
                                                                        ) : null}

                                                                        <Input
                                                                            value={option.label}
                                                                            onChange={(event) => updateOption(index, optIndex, 'label', event.target.value)}
                                                                            placeholder="Label"
                                                                            className="h-8 text-sm bg-black/20 border-white/10"
                                                                        />
                                                                        <Input
                                                                            value={option.value}
                                                                            onChange={(event) => updateOption(index, optIndex, 'value', event.target.value)}
                                                                            placeholder="Value"
                                                                            className="h-8 text-sm bg-black/20 border-white/10 font-mono text-xs"
                                                                        />
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-8 w-8 text-muted-foreground hover:text-red-400"
                                                                            onClick={() => {
                                                                                const newOptions = [...(field.options || [])];
                                                                                newOptions.splice(optIndex, 1);
                                                                                updateField(index, { options: newOptions });
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
                                                                checked={Boolean(field.isRequired)}
                                                                onChange={(event) => updateField(index, { isRequired: event.target.checked })}
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
