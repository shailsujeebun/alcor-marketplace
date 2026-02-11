'use client';

import { useState, useEffect } from 'react';
import {
    getCategories,
    createAdminTemplate,
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
    const [fields, setFields] = useState<Partial<FormField>[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // Initial fetch of flat categories for selection
        // Ideally we want a flat list of leaf categories, but full tree is okay
        async function load() {
            const data = await getCategories();
            // Flatten the tree for the select dropdown (simple version)
            const flat: any[] = [];
            const traverse = (cats: any[]) => {
                cats.forEach(c => {
                    flat.push(c);
                    if (c.children) traverse(c.children);
                });
            };
            traverse(data);
            setCategories(flat);
        }
        load();
    }, []);

    function addField() {
        setFields([
            ...fields,
            {
                key: `field_${Date.now()}`,
                label: 'New Field',
                type: 'TEXT',
                isRequired: false,
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
            value: 'option_value'
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
            // Clean up fields before sending
            const cleanFields = fields.map((f, i) => ({
                key: f.key, // ideally user edits this or sanitized label
                label: f.label,
                type: f.type,
                required: f.isRequired,
                order: i,
                options: f.options?.map(o => ({ label: o.label, value: o.value }))
            }));

            await createAdminTemplate({
                categoryId: Number(selectedCategory),
                name: templateName || 'Default Template',
                fields: cleanFields,
            });

            alert('Template saved successfully!');
            // Reset or redirect?
        } catch (error) {
            console.error(error);
            alert('Failed to save template');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container-main py-8 max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Form Template Builder</h1>
                    <p className="text-muted-foreground">Define custom fields for category listings.</p>
                </div>
                <Button onClick={handleSave} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Template
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar / Settings */}
                <Card className="md:col-span-1 h-fit sticky top-24">
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Category</Label>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Template Name</Label>
                            <Input
                                value={templateName}
                                onChange={e => setTemplateName(e.target.value)}
                                placeholder="e.g. Tractors V1"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Builder Area */}
                <div className="md:col-span-2 space-y-6">
                    {fields.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
                            No fields added yet. Click "Add Field" to start.
                        </div>
                    )}

                    {fields.map((field, index) => (
                        <Card key={index} className="relative group hover:border-blue-500 transition-colors">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 cursor-move">
                                <GripVertical className="w-5 h-5" />
                            </div>
                            <CardContent className="p-6 pl-10 space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <Label>Label</Label>
                                        <Input
                                            value={field.label}
                                            onChange={e => updateField(index, { label: e.target.value, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                        />
                                    </div>
                                    <div className="w-[140px]">
                                        <Label>Type</Label>
                                        <Select
                                            value={field.type}
                                            onValueChange={(val: any) => updateField(index, { type: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="TEXT">Text</SelectItem>
                                                <SelectItem value="NUMBER">Number</SelectItem>
                                                <SelectItem value="SELECT">Select</SelectItem>
                                                <SelectItem value="MULTISELECT">Multi-Select</SelectItem>
                                                <SelectItem value="BOOLEAN">Checkbox</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-center">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={field.isRequired}
                                            onChange={e => updateField(index, { isRequired: e.target.checked })}
                                            className="accent-primary"
                                        />
                                        Required Field
                                    </label>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-auto text-red-500 hover:text-red-700"
                                        onClick={() => removeField(index)}
                                    >
                                        <Trash className="w-4 h-4 mr-1" />
                                        Remove
                                    </Button>
                                </div>

                                {/* Options Editor for Select types */}
                                {(field.type === 'SELECT' || field.type === 'MULTISELECT') && (
                                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                        <Label className="text-xs uppercase text-muted-foreground">Options</Label>
                                        {field.options?.map((opt, optIndex) => (
                                            <div key={optIndex} className="flex gap-2">
                                                <Input
                                                    value={opt.label}
                                                    onChange={e => updateOption(index, optIndex, 'label', e.target.value)}
                                                    placeholder="Label"
                                                    className="h-8 text-sm"
                                                />
                                                <Input
                                                    value={opt.value}
                                                    onChange={e => updateOption(index, optIndex, 'value', e.target.value)}
                                                    placeholder="Value"
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                        ))}
                                        <Button size="sm" variant="secondary" onClick={() => addOption(index)} className="w-full h-8 mt-2">
                                            <Plus className="w-3 h-3 mr-1" /> Add Option
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    <Button onClick={addField} variant="outline" className="w-full py-8 border-dashed">
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Field
                    </Button>
                </div>
            </div>
        </div>
    );
}
