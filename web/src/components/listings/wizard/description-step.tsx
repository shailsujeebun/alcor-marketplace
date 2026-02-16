'use client';

import { useEffect, useMemo, useState } from 'react';
import { DynamicForm } from '../dynamic-form';
import { useWizard } from './wizard-context';
import {
  useCategories,
  useCategoryTemplate,
  useCities,
  useCountries,
  useMarketplaces,
} from '@/lib/queries';

export function DescriptionStep() {
  const { form, setForm, setCurrentStep } = useWizard();

  const { data: marketplaces = [] } = useMarketplaces();
  const { data: categories = [] } = useCategories();
  const { data: countries } = useCountries();
  const { data: citiesData } = useCities(form.countryId || undefined);
  const cities = citiesData?.data ?? [];

  const [selectedMarketplaceId, setSelectedMarketplaceId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const activeMarketplaces = useMemo(() => {
    const active = marketplaces.filter((marketplace) => marketplace.isActive);
    return active.length > 0 ? active : marketplaces;
  }, [marketplaces]);

  const marketplaceCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.marketplaceId === selectedMarketplaceId &&
          (category.parentId === null || category.parentId === undefined),
      ),
    [categories, selectedMarketplaceId],
  );

  const selectedCategoryNode = useMemo(
    () => marketplaceCategories.find((category) => category.id === selectedCategoryId),
    [marketplaceCategories, selectedCategoryId],
  );

  const subCategories = useMemo(() => {
    if (!selectedCategoryId) return [];

    const fromTree = selectedCategoryNode?.children ?? [];
    if (fromTree.length > 0) return fromTree;

    return categories.filter((category) => category.parentId === selectedCategoryId);
  }, [categories, selectedCategoryId, selectedCategoryNode]);

  const hasSubcategories = subCategories.length > 0;

  // Sync marketplace/category selectors when editing an existing listing
  // or when category id comes from query params.
  useEffect(() => {
    if (!form.categoryId || categories.length === 0) return;

    let matchedMarketplaceId = '';
    let matchedCategoryId = '';

    for (const rootCategory of categories) {
      if (rootCategory.id === form.categoryId) {
        matchedMarketplaceId = rootCategory.marketplaceId;
        matchedCategoryId = rootCategory.id;
        break;
      }

      const childMatch = rootCategory.children?.find((child) => child.id === form.categoryId);
      if (childMatch) {
        matchedMarketplaceId = rootCategory.marketplaceId;
        matchedCategoryId = rootCategory.id;
        break;
      }
    }

    if (!matchedMarketplaceId) {
      const directMatch = categories.find((category) => category.id === form.categoryId);
      if (directMatch) {
        matchedMarketplaceId = directMatch.marketplaceId;
        matchedCategoryId = directMatch.parentId ?? directMatch.id;
      }
    }

    if (matchedMarketplaceId) setSelectedMarketplaceId(matchedMarketplaceId);
    if (matchedCategoryId) setSelectedCategoryId(matchedCategoryId);
  }, [form.categoryId, categories]);

  const { data: template, isFetching: isTemplateLoading } = useCategoryTemplate(form.categoryId);

  const handleMarketplaceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const marketplaceId = event.target.value;
    setSelectedMarketplaceId(marketplaceId);
    setSelectedCategoryId('');

    setForm((prev) => ({
      ...prev,
      categoryId: '',
      dynamicAttributes: {},
    }));
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = event.target.value;
    setSelectedCategoryId(categoryId);

    const category = marketplaceCategories.find((item) => item.id === categoryId);
    const nestedChildren = category?.children ?? [];
    const childCategories =
      nestedChildren.length > 0
        ? nestedChildren
        : categories.filter((item) => item.parentId === categoryId);

    if (!categoryId) {
      setForm((prev) => ({ ...prev, categoryId: '', dynamicAttributes: {} }));
      return;
    }

    if (childCategories.length === 0) {
      setForm((prev) => ({ ...prev, categoryId, dynamicAttributes: {} }));
      return;
    }

    setForm((prev) => ({ ...prev, categoryId: '', dynamicAttributes: {} }));
  };

  const handleSubcategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const subcategoryId = event.target.value;
    setForm((prev) => ({
      ...prev,
      categoryId: subcategoryId,
      dynamicAttributes: {},
    }));
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'countryId' ? { cityId: '' } : {}),
    }));
  };

  const handleNext = () => {
    if (!form.title.trim() || !selectedMarketplaceId || !selectedCategoryId || !form.categoryId) {
      alert('Please select marketplace, category, subcategory, and fill in ad title.');
      return;
    }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-bright outline-none transition-colors';
  const labelClass = 'block text-sm font-medium text-[var(--text-secondary)] mb-1.5';
  const selectClass = `${inputClass} appearance-none`;
  const sectionClass = 'glass-card p-6 sm:p-8 space-y-5 mb-6';
  const sectionTitleClass = 'text-lg font-heading font-bold text-[var(--text-primary)] mb-4';

  return (
    <div className="space-y-6">
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Basic information</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Marketplace *</label>
              <select
                value={selectedMarketplaceId}
                onChange={handleMarketplaceChange}
                className={selectClass}
              >
                <option value="">Choose marketplace</option>
                {activeMarketplaces.map((marketplace) => (
                  <option key={marketplace.id} value={marketplace.id}>
                    {marketplace.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Category *</label>
              <select
                value={selectedCategoryId}
                onChange={handleCategoryChange}
                className={`${selectClass} disabled:opacity-50`}
                disabled={!selectedMarketplaceId}
              >
                <option value="">Choose category</option>
                {marketplaceCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Subcategory {hasSubcategories ? '*' : ''}</label>
              <select
                name="categoryId"
                value={hasSubcategories ? form.categoryId : selectedCategoryId}
                onChange={hasSubcategories ? handleSubcategoryChange : handleChange}
                className={`${selectClass} disabled:opacity-50`}
                disabled={!selectedCategoryId || !hasSubcategories}
              >
                {hasSubcategories ? (
                  <>
                    <option value="">Choose subcategory</option>
                    {subCategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </>
                ) : (
                  <option value={selectedCategoryId || ''}>
                    {selectedCategoryId
                      ? 'No subcategories for this category'
                      : 'Choose category first'}
                  </option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Ad name *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className={inputClass}
              placeholder="For example: CAT 320 2019 excavator"
            />
          </div>
        </div>
      </div>

      {form.categoryId && (
        <div className={sectionClass}>
          <h2 className={sectionTitleClass}>Details</h2>
          {isTemplateLoading ? (
            <div className="flex items-center space-x-2 text-[var(--text-secondary)]">
              <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading form fields...</span>
            </div>
          ) : template ? (
            <DynamicForm
              categoryId={form.categoryId}
              template={template}
              values={form.dynamicAttributes}
              onChange={(values) => setForm((prev) => ({ ...prev, dynamicAttributes: values }))}
            />
          ) : (
            <p className="text-[var(--text-secondary)] text-sm">
              Additional fields are not configured for this category yet.
            </p>
          )}
        </div>
      )}

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Description</h2>
        <div>
          <label className={labelClass}>Detailed description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={6}
            className={inputClass}
            placeholder="Describe the equipment, its condition, and key features..."
          />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Country</label>
            <select
              name="countryId"
              value={form.countryId}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">Choose country</option>
              {countries?.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>City</label>
            <select
              name="cityId"
              value={form.cityId}
              onChange={handleChange}
              disabled={!form.countryId}
              className={`${selectClass} disabled:opacity-50`}
            >
              <option value="">Choose city</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="px-8 py-3 rounded-lg gradient-cta text-white font-medium hover:opacity-90 transition-opacity"
        >
          Next: Photos and videos →
        </button>
      </div>
    </div>
  );
}
