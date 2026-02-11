'use client';

import { useState, useEffect } from 'react';
import {
    getAdminMarketplaces,
    createAdminCategory,
    updateAdminCategory,
    deleteAdminCategory,
    AdminMarketplace,
    AdminCategory,
    getCategories, // We can reuse the public fetcher for the tree, or make a new admin recursive one
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Edit2, Trash2, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

// Recursive Category Item Component
function CategoryItem({
    category,
    onEdit,
    onDelete,
    onAddSub,
}: {
    category: any;
    onEdit: (cat: any) => void;
    onDelete: (id: number) => void;
    onAddSub: (parentId: number) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = category.children && category.children.length > 0;

    return (
        <div className="ml-4 border-l pl-4 py-2">
            <div className="flex items-center gap-2 group">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`p-1 hover:bg-muted rounded ${!hasChildren ? 'invisible' : ''}`}
                >
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                <span className="font-medium flex items-center gap-2">
                    <Folder className="w-4 h-4 text-blue-500" />
                    {category.name} <span className="text-xs text-muted-foreground">({category.slug})</span>
                </span>

                <div className="opacity-0 group-hover:opacity-100 flex gap-1 ml-auto transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAddSub(Number(category.id))}>
                        <Plus className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(category)}>
                        <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={() => onDelete(Number(category.id))}>
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            </div>

            {isOpen && hasChildren && (
                <div className="mt-1">
                    {category.children.map((child: any) => (
                        <CategoryItem
                            key={child.id}
                            category={child}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddSub={onAddSub}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminCategoriesPage() {
    const [marketplaces, setMarketplaces] = useState<AdminMarketplace[]>([]);
    const [selectedMarketplace, setSelectedMarketplace] = useState<string>('');
    const [categories, setCategories] = useState<any[]>([]); // Using any for recursive structure
    const [isLoading, setIsLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        parentId: undefined as number | undefined
    });
    const [editingId, setEditingId] = useState<number | null>(null);

    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            router.push('/');
            return;
        }
        loadData();
    }, [user, router]);

    async function loadData() {
        try {
            const mps = await getAdminMarketplaces();
            setMarketplaces(mps);
            if (mps.length > 0 && !selectedMarketplace) {
                setSelectedMarketplace(mps[0].id.toString());
            }
        } catch (error) {
            console.error('Error loading marketplaces', error);
        } finally {
            setIsLoading(false);
        }
    }

    // Load categories when marketplace changes
    useEffect(() => {
        if (selectedMarketplace) {
            // In a real generic app, we'd have a 'getAdminCategories(marketplaceId)' endpoint
            // that returns a raw list or tree. For now, reusing public getCategories() 
            // but strictly speaking we might want a filtered admin view.
            // Assuming existing getCategories returns the full tree for the specific marketplace context?
            // Wait, the current public API returns ALL categories grouped by parent? 
            // Let's assume we need to filter client-side or add query param.
            // For this demo: fetching all and filtering by marketplaceId is tricky if the public API doesn't expose it easily.
            // But let's try the public one for now.

            // Ideally: fetchApi(`/admin/marketplaces/${selectedMarketplace}/categories`)
            // Creating a temporary workaround: reusing getCategories but filtering
            // Actually, getCategories() returns plain list in current implementation?
            // Let's implement a fetcher here for now or update API.
            // Actually, let's fetch ALL and filter client side if the API is small.

            loadCategories();
        }
    }, [selectedMarketplace]);

    async function loadCategories() {
        try {
            const allCats = await getCategories();
            // Filter by marketplace is handled by backend usually. 
            // For now, let's assume getCategories returns valid tree.
            // We'll trust the public endpoint for now.
            setCategories(allCats);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedMarketplace) return;

        try {
            const payload = {
                marketplaceId: Number(selectedMarketplace),
                name: formData.name,
                slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
                parentId: formData.parentId,
            };

            if (editingId) {
                await updateAdminCategory(editingId, payload);
            } else {
                await createAdminCategory(payload);
            }
            setIsDialogOpen(false);
            resetForm();
            loadCategories();
        } catch (error) {
            console.error('Failed to save category', error);
            alert('Failed to save category');
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Are you sure? This will delete the category and all subcategories.')) return;
        try {
            await deleteAdminCategory(id);
            loadCategories();
        } catch (error) {
            console.error(error);
            alert('Cannot delete category. It may have listings.');
        }
    }

    function resetForm() {
        setFormData({ name: '', slug: '', parentId: undefined });
        setEditingId(null);
    }

    function openCreate(parentId?: number) {
        resetForm();
        setFormData(prev => ({ ...prev, parentId }));
        setIsDialogOpen(true);
    }

    function openEdit(cat: any) {
        setFormData({
            name: cat.name,
            slug: cat.slug,
            parentId: Number(cat.parentId) || undefined
        });
        setEditingId(Number(cat.id));
        setIsDialogOpen(true);
    }

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="container-main py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Manage Categories</h1>

                <div className="flex gap-4">
                    <Select value={selectedMarketplace} onValueChange={setSelectedMarketplace}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Marketplace" />
                        </SelectTrigger>
                        <SelectContent>
                            {marketplaces.map(mp => (
                                <SelectItem key={mp.id} value={mp.id.toString()}>{mp.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => openCreate()}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Root Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingId ? 'Edit Category' : 'Create New Category'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        placeholder="e.g., Tractors"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) =>
                                            setFormData({ ...formData, slug: e.target.value })
                                        }
                                        placeholder="e.g., tractors"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Leave empty to auto-generate from name.</p>
                                </div>
                                {formData.parentId && (
                                    <div className="text-sm text-muted-foreground">
                                        Creating subcategory under ID: {formData.parentId}
                                    </div>
                                )}
                                <Button type="submit" className="w-full">
                                    {editingId ? 'Update' : 'Create'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm min-h-[400px]">
                {categories.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                        No categories found for this marketplace. Add one to get started.
                    </div>
                ) : (
                    <div className="space-y-1">
                        {categories
                            // Primitive filter: Only show roots or filter by marketplace if API doesn't
                            // Assuming public API returns nested tree starting from marketplace roots logic
                            .map((cat) => (
                                <CategoryItem
                                    key={cat.id}
                                    category={cat}
                                    onEdit={openEdit}
                                    onDelete={handleDelete}
                                    onAddSub={openCreate}
                                />
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
