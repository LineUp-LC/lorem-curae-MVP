import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../lib/auth/AuthContext';
import Toast from '../../../components/feature/Toast';
import { CATEGORY_KEYS, getCategoryLabel } from '../../../lib/utils/categoryRegistry';
import { SLUG_TO_NAME, getIngredientSlug } from '../../../lib/utils/ingredientSlug';
import type { ActiveIngredient } from '../../../types/product';
import {
  fetchAllProducts,
  fetchProductForEdit,
  fetchProductsNeedingVerification,
  createProduct,
  updateProduct,
  updateProductStatus,
  syncIngredientLinks,
  fetchIngredientLinks,
  fetchVersionHistory,
  uploadProductImage,
  type AdminProductListItem,
  type ProductFormData,
  type ProductVersion,
  type ProductStatus,
  type VerificationItem,
} from '../../../lib/data/supabaseProductsAdmin';
import type { SupabaseProductRow } from '../../../lib/data/supabaseProducts';

// ─── Constants ───────────────────────────────────────────────

const SKIN_TYPE_OPTIONS = ['all', 'oily', 'dry', 'normal', 'combination', 'sensitive'];
const CONCERN_OPTIONS = [
  'acne', 'aging', 'brightening', 'dark spots', 'dullness', 'hydration',
  'sensitivity', 'barrier repair', 'pores', 'redness', 'wrinkles', 'oil control',
  'sun protection', 'firmness', 'texture', 'uneven tone',
];
const TEXTURE_OPTIONS = ['gel', 'cream', 'lotion', 'balm', 'oil', 'liquid', 'foam', 'paste', 'emulsion', 'mist', 'serum'];
const FORMULATION_OPTIONS = ['water-based', 'oil-based', 'silicone-based', 'anhydrous', 'emulsion'];
const SIZE_UNIT_OPTIONS = ['ml', 'oz', 'g', 'fl oz'];
const PREFERENCE_KEYS = [
  { key: 'vegan', label: 'Vegan' },
  { key: 'crueltyFree', label: 'Cruelty-Free' },
  { key: 'fragranceFree', label: 'Fragrance-Free' },
  { key: 'glutenFree', label: 'Gluten-Free' },
  { key: 'alcoholFree', label: 'Alcohol-Free' },
  { key: 'siliconeFree', label: 'Silicone-Free' },
  { key: 'plantBased', label: 'Plant-Based' },
  { key: 'chemicalFree', label: 'Chemical-Free' },
];

const STATUS_TABS: { value: ProductStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const INPUT_CLASS = 'w-full px-4 py-3 rounded-lg border border-blush-300 bg-white text-deep focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm';
const LABEL_CLASS = 'block text-sm font-medium text-deep mb-1.5';

function emptyFormData(): ProductFormData {
  return {
    name: '',
    slug: '',
    brand: '',
    category: 'serum',
    price: 0,
    rating: 0,
    reviewCount: 0,
    image: '',
    description: '',
    skinTypes: [],
    concerns: [],
    keyIngredients: [],
    inStock: true,
    source: 'discovery',
    sizeValue: null,
    sizeUnit: null,
    activeIngredients: [],
    preferences: {},
    timeOfDay: [],
    texture: null,
    formulation: null,
  };
}

function rowToFormData(row: SupabaseProductRow): ProductFormData {
  return {
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    category: row.category,
    price: row.price,
    rating: row.rating,
    reviewCount: row.review_count,
    image: row.image,
    description: row.description,
    skinTypes: row.skin_types ?? [],
    concerns: row.concerns ?? [],
    keyIngredients: row.key_ingredients ?? [],
    inStock: row.in_stock,
    source: row.source ?? 'discovery',
    sizeValue: row.size_value,
    sizeUnit: row.size_unit,
    activeIngredients: (row.active_ingredients as ActiveIngredient[]) ?? [],
    preferences: (row.preferences as Record<string, boolean>) ?? {},
    timeOfDay: row.time_of_day ?? [],
    texture: row.texture,
    formulation: row.formulation,
  };
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ─── Status Badge ────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-amber-100 text-amber-700',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// IngredientLinker
// ═══════════════════════════════════════════════════════════════

function IngredientLinker({
  keyIngredients,
  linkedSlugs,
  onLinksChange,
}: {
  keyIngredients: string[];
  linkedSlugs: string[];
  onLinksChange: (slugs: string[]) => void;
}) {
  const allSlugs = Object.keys(SLUG_TO_NAME);

  const handleLink = (slug: string) => {
    if (!linkedSlugs.includes(slug)) {
      onLinksChange([...linkedSlugs, slug]);
    }
  };

  const handleUnlink = (slug: string) => {
    onLinksChange(linkedSlugs.filter(s => s !== slug));
  };

  const handleLinkAll = () => {
    const resolved = keyIngredients
      .map(name => getIngredientSlug(name))
      .filter((s): s is string => s !== null);
    const merged = Array.from(new Set([...linkedSlugs, ...resolved]));
    onLinksChange(merged);
  };

  return (
    <div className="bg-cream-50 rounded-xl p-5 border border-blush-100">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-deep">Ingredient Slug Links</h4>
        <button
          type="button"
          onClick={handleLinkAll}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
        >
          Auto-link all
        </button>
      </div>

      {keyIngredients.length === 0 ? (
        <p className="text-sm text-warm-gray">Add key ingredients first to link them.</p>
      ) : (
        <div className="space-y-2">
          {keyIngredients.map((name, idx) => {
            const autoSlug = getIngredientSlug(name);
            const isLinked = autoSlug ? linkedSlugs.includes(autoSlug) : false;

            return (
              <div key={idx} className="flex items-center gap-3 py-2 border-b border-blush-100 last:border-b-0">
                <span className="text-sm text-deep flex-1">{name}</span>
                {autoSlug && isLinked ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <i className="ri-check-line" /> {autoSlug}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUnlink(autoSlug)}
                      className="text-xs text-warm-gray hover:text-red-500 cursor-pointer"
                    >
                      Unlink
                    </button>
                  </div>
                ) : autoSlug && !isLinked ? (
                  <button
                    type="button"
                    onClick={() => handleLink(autoSlug)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                  >
                    Link → {autoSlug}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-600 flex items-center gap-1">
                      <i className="ri-alert-line" /> No match
                    </span>
                    <select
                      className="text-xs border border-blush-300 rounded px-2 py-1 bg-white"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) handleLink(e.target.value);
                      }}
                    >
                      <option value="">Manual link...</option>
                      {allSlugs.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {linkedSlugs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-blush-200">
          <p className="text-xs text-warm-gray mb-1">Linked slugs ({linkedSlugs.length}):</p>
          <div className="flex flex-wrap gap-1">
            {linkedSlugs.map(slug => (
              <span key={slug} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                {slug}
                <button type="button" onClick={() => handleUnlink(slug)} className="hover:text-red-500 cursor-pointer">
                  <i className="ri-close-line text-xs" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ImageUploader
// ═══════════════════════════════════════════════════════════════

function ImageUploader({
  currentImageUrl,
  productId,
  onImageChange,
}: {
  currentImageUrl: string;
  productId: string | null;
  onImageChange: (url: string) => void;
}) {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !productId) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5 MB');
      return;
    }

    setUploading(true);
    const result = await uploadProductImage(file, productId);
    setUploading(false);

    if (typeof result === 'string') {
      onImageChange(result);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="bg-cream-50 rounded-xl p-5 border border-blush-100">
      <h4 className="text-sm font-semibold text-deep mb-3">Product Image</h4>

      {currentImageUrl && (
        <div className="mb-4">
          <img
            src={currentImageUrl}
            alt="Product preview"
            className="w-48 h-60 object-cover rounded-lg border border-blush-200"
          />
        </div>
      )}

      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`px-3 py-1.5 text-xs rounded-full font-medium cursor-pointer ${mode === 'url' ? 'bg-primary-500 text-white' : 'bg-white border border-blush-300 text-deep'}`}
        >
          URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-3 py-1.5 text-xs rounded-full font-medium cursor-pointer ${mode === 'upload' ? 'bg-primary-500 text-white' : 'bg-white border border-blush-300 text-deep'}`}
        >
          Upload
        </button>
      </div>

      {mode === 'url' ? (
        <input
          type="url"
          value={currentImageUrl}
          onChange={(e) => onImageChange(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className={INPUT_CLASS}
        />
      ) : (
        <div>
          {!productId ? (
            <p className="text-xs text-amber-600">Save the product first to enable file upload.</p>
          ) : uploading ? (
            <div className="flex items-center gap-2 text-sm text-warm-gray">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Uploading...
            </div>
          ) : (
            <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-blush-300 rounded-lg cursor-pointer hover:border-primary-400 transition-colors">
              <div className="text-center">
                <i className="ri-upload-2-line text-xl text-warm-gray" />
                <p className="text-xs text-warm-gray mt-1">Click to upload (max 5 MB)</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// VersionHistory
// ═══════════════════════════════════════════════════════════════

function VersionHistory({ productId }: { productId: string }) {
  const [versions, setVersions] = useState<ProductVersion[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchVersionHistory(productId).then(v => {
      if (cancelled) return;
      setVersions(v);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [productId]);

  function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  if (loading) {
    return (
      <div className="bg-cream-50 rounded-xl p-5 border border-blush-100">
        <h4 className="text-sm font-semibold text-deep mb-3">Version History</h4>
        <p className="text-sm text-warm-gray">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 rounded-xl p-5 border border-blush-100">
      <h4 className="text-sm font-semibold text-deep mb-4">Version History</h4>

      {versions.length === 0 ? (
        <p className="text-sm text-warm-gray">No version history yet.</p>
      ) : (
        <div className="space-y-0">
          {versions.map((v) => (
            <div key={v.id} className="relative pl-6 pb-4 last:pb-0">
              {/* Timeline line */}
              <div className="absolute left-2 top-3 bottom-0 w-px bg-blush-200 last:hidden" />
              {/* Dot */}
              <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-primary-100 border-2 border-primary-400 flex items-center justify-center">
                <span className="text-[8px] font-bold text-primary-600">{v.version_number}</span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-deep">v{v.version_number}</span>
                  <span className="text-xs text-warm-gray">{relativeTime(v.created_at)}</span>
                </div>
                {v.change_reason && (
                  <p className="text-xs text-warm-gray mb-1">{v.change_reason}</p>
                )}
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                  className="text-xs text-primary-600 hover:text-primary-700 cursor-pointer"
                >
                  {expanded === v.id ? 'Hide snapshot' : 'View snapshot'}
                </button>
                {expanded === v.id && (
                  <pre className="mt-2 bg-white rounded-lg p-3 text-xs text-deep overflow-auto max-h-60 border border-blush-200">
                    {JSON.stringify(v.snapshot, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ProductForm
// ═══════════════════════════════════════════════════════════════

function ProductForm({
  initialData,
  productId,
  linkedSlugs,
  onLinksChange,
  onSave,
  onCancel,
}: {
  initialData: ProductFormData;
  productId: string | null;
  linkedSlugs: string[];
  onLinksChange: (slugs: string[]) => void;
  onSave: (data: ProductFormData, reason?: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ProductFormData>(initialData);
  const [changeReason, setChangeReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [ingredientInput, setIngredientInput] = useState('');
  const [concernInput, setConcernInput] = useState('');

  const update = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.brand.trim()) errs.brand = 'Brand is required';
    if (!form.category) errs.category = 'Category is required';
    if (form.price < 0) errs.price = 'Price must be 0 or greater';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (form.rating < 0 || form.rating > 5) errs.rating = 'Rating must be 0–5';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await onSave(form, changeReason || undefined);
    setSaving(false);
  };

  const handleNameBlur = () => {
    if (!form.slug && form.name) {
      update('slug', generateSlug(form.name));
    }
  };

  const addIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (trimmed && !form.keyIngredients.includes(trimmed)) {
      update('keyIngredients', [...form.keyIngredients, trimmed]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (ing: string) => {
    update('keyIngredients', form.keyIngredients.filter(i => i !== ing));
  };

  const addConcern = () => {
    const trimmed = concernInput.trim();
    if (trimmed && !form.concerns.includes(trimmed)) {
      update('concerns', [...form.concerns, trimmed]);
      setConcernInput('');
    }
  };

  const removeConcern = (c: string) => {
    update('concerns', form.concerns.filter(x => x !== c));
  };

  const addActiveIngredient = () => {
    update('activeIngredients', [
      ...form.activeIngredients,
      { name: '', concentration: undefined, concentrationUnit: '%' as const, isKeyActive: false },
    ]);
  };

  const updateActiveIngredient = (idx: number, field: string, value: unknown) => {
    const updated = [...form.activeIngredients];
    updated[idx] = { ...updated[idx], [field]: value };
    update('activeIngredients', updated);
  };

  const removeActiveIngredient = (idx: number) => {
    update('activeIngredients', form.activeIngredients.filter((_, i) => i !== idx));
  };

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-xs text-red-500 mt-1">{errors[field]}</p> : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <section>
        <h3 className="text-lg font-serif font-semibold text-deep mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <label className={LABEL_CLASS}>Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              onBlur={handleNameBlur}
              className={INPUT_CLASS}
              placeholder="Brightening Vitamin C Serum"
            />
            <FieldError field="name" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => update('slug', e.target.value)}
              className={INPUT_CLASS}
              placeholder="Auto-generated from name"
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Brand *</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => update('brand', e.target.value)}
              className={INPUT_CLASS}
              placeholder="Glow Naturals"
            />
            <FieldError field="brand" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Category *</label>
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className={INPUT_CLASS}
            >
              {CATEGORY_KEYS.map(cat => (
                <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
              ))}
            </select>
            <FieldError field="category" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Price *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => update('price', parseFloat(e.target.value) || 0)}
              className={INPUT_CLASS}
            />
            <FieldError field="price" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Source</label>
            <div className="flex gap-4 mt-2">
              {['discovery', 'marketplace'].map(src => (
                <label key={src} className="flex items-center gap-2 text-sm text-deep cursor-pointer">
                  <input
                    type="radio"
                    name="source"
                    value={src}
                    checked={form.source === src}
                    onChange={() => update('source', src)}
                    className="accent-primary-500"
                  />
                  <span className="capitalize">{src}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <label className={LABEL_CLASS}>Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={4}
              className={INPUT_CLASS}
              placeholder="A gentle, pH-balanced cleanser..."
            />
            <FieldError field="description" />
          </div>
        </div>
      </section>

      {/* Image */}
      <section>
        <ImageUploader
          currentImageUrl={form.image}
          productId={productId}
          onImageChange={(url) => update('image', url)}
        />
      </section>

      {/* Rating & Stock */}
      <section>
        <h3 className="text-lg font-serif font-semibold text-deep mb-4">Rating & Availability</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div>
            <label className={LABEL_CLASS}>Rating (0–5)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={form.rating}
              onChange={(e) => update('rating', parseFloat(e.target.value) || 0)}
              className={INPUT_CLASS}
            />
            <FieldError field="rating" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Review Count</label>
            <input
              type="number"
              min="0"
              value={form.reviewCount}
              onChange={(e) => update('reviewCount', parseInt(e.target.value) || 0)}
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-3 text-sm text-deep cursor-pointer">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => update('inStock', e.target.checked)}
                className="w-5 h-5 accent-primary-500 rounded"
              />
              In Stock
            </label>
          </div>
        </div>
      </section>

      {/* Size */}
      <section>
        <h3 className="text-lg font-serif font-semibold text-deep mb-4">Size</h3>
        <div className="grid grid-cols-2 gap-5 max-w-md">
          <div>
            <label className={LABEL_CLASS}>Value</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.sizeValue ?? ''}
              onChange={(e) => update('sizeValue', e.target.value ? parseFloat(e.target.value) : null)}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Unit</label>
            <select
              value={form.sizeUnit ?? ''}
              onChange={(e) => update('sizeUnit', e.target.value || null)}
              className={INPUT_CLASS}
            >
              <option value="">—</option>
              {SIZE_UNIT_OPTIONS.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Skin Types */}
      <section>
        <h3 className="text-lg font-serif font-semibold text-deep mb-4">Skin Types</h3>
        <div className="flex flex-wrap gap-3">
          {SKIN_TYPE_OPTIONS.map(st => (
            <label key={st} className="flex items-center gap-2 text-sm text-deep cursor-pointer capitalize">
              <input
                type="checkbox"
                checked={form.skinTypes.includes(st)}
                onChange={(e) => {
                  if (e.target.checked) {
                    update('skinTypes', [...form.skinTypes, st]);
                  } else {
                    update('skinTypes', form.skinTypes.filter(s => s !== st));
                  }
                }}
                className="w-4 h-4 accent-primary-500 rounded"
              />
              {st === 'all' ? 'All Skin Types' : st}
            </label>
          ))}
        </div>
      </section>

      {/* Concerns */}
      <section>
        <h3 className="text-lg font-serif font-semibold text-deep mb-4">Concerns</h3>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {form.concerns.map(c => (
            <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 bg-cream-100 text-deep text-xs rounded-full border border-blush-200">
              {c}
              <button type="button" onClick={() => removeConcern(c)} className="hover:text-red-500 cursor-pointer"><i className="ri-close-line" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 max-w-md">
          <select
            value={concernInput}
            onChange={(e) => setConcernInput(e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">Select concern...</option>
            {CONCERN_OPTIONS.filter(c => !form.concerns.includes(c)).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addConcern}
            disabled={!concernInput}
            className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            Add
          </button>
        </div>
      </section>

      {/* Key Ingredients + Linker */}
      <section>
        <h3 className="text-lg font-serif font-semibold text-deep mb-4">Key Ingredients</h3>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {form.keyIngredients.map(ing => (
            <span key={ing} className="inline-flex items-center gap-1 px-2.5 py-1 bg-cream-100 text-deep text-xs rounded-full border border-blush-200">
              {ing}
              <button type="button" onClick={() => removeIngredient(ing)} className="hover:text-red-500 cursor-pointer"><i className="ri-close-line" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 max-w-md mb-4">
          <input
            type="text"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addIngredient(); } }}
            placeholder="Hyaluronic Acid"
            className={INPUT_CLASS}
          />
          <button
            type="button"
            onClick={addIngredient}
            disabled={!ingredientInput.trim()}
            className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            Add
          </button>
        </div>
        <IngredientLinker
          keyIngredients={form.keyIngredients}
          linkedSlugs={linkedSlugs}
          onLinksChange={onLinksChange}
        />
      </section>

      {/* Active Ingredients */}
      <section>
        <h3 className="text-lg font-serif font-semibold text-deep mb-4">Active Ingredients</h3>
        {form.activeIngredients.map((ai, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-3 mb-3 items-end">
            <div className="col-span-4">
              {idx === 0 && <label className={LABEL_CLASS}>Name</label>}
              <input
                type="text"
                value={ai.name}
                onChange={(e) => updateActiveIngredient(idx, 'name', e.target.value)}
                className={INPUT_CLASS}
                placeholder="Niacinamide"
              />
            </div>
            <div className="col-span-2">
              {idx === 0 && <label className={LABEL_CLASS}>Conc.</label>}
              <input
                type="number"
                step="0.1"
                value={ai.concentration ?? ''}
                onChange={(e) => updateActiveIngredient(idx, 'concentration', e.target.value ? parseFloat(e.target.value) : undefined)}
                className={INPUT_CLASS}
              />
            </div>
            <div className="col-span-2">
              {idx === 0 && <label className={LABEL_CLASS}>Unit</label>}
              <select
                value={ai.concentrationUnit ?? '%'}
                onChange={(e) => updateActiveIngredient(idx, 'concentrationUnit', e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="%">%</option>
                <option value="mg">mg</option>
                <option value="IU">IU</option>
              </select>
            </div>
            <div className="col-span-2 flex items-center">
              {idx === 0 && <label className={`${LABEL_CLASS} invisible`}>Key</label>}
              <label className="flex items-center gap-1.5 text-xs text-deep cursor-pointer">
                <input
                  type="checkbox"
                  checked={ai.isKeyActive ?? false}
                  onChange={(e) => updateActiveIngredient(idx, 'isKeyActive', e.target.checked)}
                  className="w-4 h-4 accent-primary-500"
                />
                Key
              </label>
            </div>
            <div className="col-span-2 flex items-center">
              <button
                type="button"
                onClick={() => removeActiveIngredient(idx)}
                className="text-sm text-warm-gray hover:text-red-500 cursor-pointer"
              >
                <i className="ri-delete-bin-line" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addActiveIngredient}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
        >
          <i className="ri-add-line mr-1" />Add active ingredient
        </button>
      </section>

      {/* Time of Day */}
      <section>
        <h3 className="text-lg font-serif font-semibold text-deep mb-4">Time of Day</h3>
        <div className="flex gap-4">
          {['am', 'pm'].map(tod => (
            <label key={tod} className="flex items-center gap-2 text-sm text-deep cursor-pointer uppercase">
              <input
                type="checkbox"
                checked={form.timeOfDay.includes(tod)}
                onChange={(e) => {
                  if (e.target.checked) {
                    update('timeOfDay', [...form.timeOfDay, tod]);
                  } else {
                    update('timeOfDay', form.timeOfDay.filter(t => t !== tod));
                  }
                }}
                className="w-4 h-4 accent-primary-500 rounded"
              />
              {tod}
            </label>
          ))}
        </div>
      </section>

      {/* Texture & Formulation */}
      <section>
        <h3 className="text-lg font-serif font-semibold text-deep mb-4">Texture & Formulation</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-2xl">
          <div>
            <label className={LABEL_CLASS}>Texture</label>
            <select
              value={form.texture ?? ''}
              onChange={(e) => update('texture', e.target.value || null)}
              className={INPUT_CLASS}
            >
              <option value="">—</option>
              {TEXTURE_OPTIONS.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Formulation</label>
            <select
              value={form.formulation ?? ''}
              onChange={(e) => update('formulation', e.target.value || null)}
              className={INPUT_CLASS}
            >
              <option value="">—</option>
              {FORMULATION_OPTIONS.map(f => (
                <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section>
        <h3 className="text-lg font-serif font-semibold text-deep mb-4">Preferences</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PREFERENCE_KEYS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm text-deep cursor-pointer">
              <input
                type="checkbox"
                checked={form.preferences[key] === true}
                onChange={(e) => {
                  update('preferences', { ...form.preferences, [key]: e.target.checked });
                }}
                className="w-4 h-4 accent-primary-500 rounded"
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {/* Change Reason (edit mode only) */}
      {productId && (
        <section>
          <label className={LABEL_CLASS}>Change reason (optional)</label>
          <input
            type="text"
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            placeholder="What changed and why?"
            className={INPUT_CLASS}
          />
        </section>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-blush-200">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 cursor-pointer transition-colors"
        >
          {saving ? 'Saving...' : productId ? 'Save Changes' : 'Create Product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-blush-300 text-deep font-medium rounded-lg hover:bg-cream-100 cursor-pointer transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════
// ProductListView
// ═══════════════════════════════════════════════════════════════

function ProductListView() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounce(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAllProducts({
      status: statusFilter,
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      search: searchDebounce || undefined,
    }).then(data => {
      if (!cancelled) {
        setProducts(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [statusFilter, categoryFilter, searchDebounce]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-semibold text-deep">Products</h2>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="px-5 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 cursor-pointer transition-colors flex items-center gap-2"
        >
          <i className="ri-add-line" /> New Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or brand..."
            className={INPUT_CLASS}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={`${INPUT_CLASS} sm:w-48`}
        >
          <option value="all">All Categories</option>
          {CATEGORY_KEYS.map(cat => (
            <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
          ))}
        </select>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-6 bg-cream-100 rounded-lg p-1 w-fit">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
              statusFilter === tab.value
                ? 'bg-white text-deep shadow-sm'
                : 'text-warm-gray hover:text-deep'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-warm-gray">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-cream-50 rounded-xl border border-blush-100">
          <i className="ri-box-3-line text-4xl text-warm-gray mb-2 block" />
          <p className="text-warm-gray">No products found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-blush-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blush-200 bg-cream-50">
                <th className="text-left px-4 py-3 font-medium text-warm-gray">Product</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray hidden md:table-cell">Price</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray">Status</th>
                <th className="text-right px-4 py-3 font-medium text-warm-gray">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-blush-100 last:border-b-0 hover:bg-cream-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image && (
                        <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-cream-100 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-deep truncate">{p.name}</p>
                        <p className="text-xs text-warm-gray truncate">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="px-2 py-0.5 bg-cream-100 text-warm-gray text-xs rounded-full capitalize">{p.category}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-deep">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/admin/products/${p.id}`)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium cursor-pointer"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ProductEditView
// ═══════════════════════════════════════════════════════════════

function ProductEditView({
  productId,
  onToast,
}: {
  productId: string | null;
  onToast: (msg: string) => void;
}) {
  const navigate = useNavigate();
  const [product, setProduct] = useState<SupabaseProductRow | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData());
  const [linkedSlugs, setLinkedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(!!productId);
  const isCreate = !productId;

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchProductForEdit(productId),
      fetchIngredientLinks(productId),
    ]).then(([prod, slugs]) => {
      if (cancelled) return;
      if (prod) {
        setProduct(prod);
        setFormData(rowToFormData(prod));
      }
      setLinkedSlugs(slugs);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [productId]);

  const handleSave = async (data: ProductFormData, reason?: string) => {
    if (isCreate) {
      const result = await createProduct(data);
      if ('error' in result) {
        onToast(`Error: ${result.error}`);
        return;
      }
      // Sync ingredient links for the new product
      await syncIngredientLinks(result.id, linkedSlugs);
      onToast('Product created');
      navigate(`/admin/products/${result.id}`);
    } else {
      const result = await updateProduct(productId!, data, reason);
      if ('error' in result) {
        onToast(`Error: ${result.error}`);
        return;
      }
      await syncIngredientLinks(productId!, linkedSlugs);
      onToast('Product updated');
      // Reload product data
      const updated = await fetchProductForEdit(productId!);
      if (updated) {
        setProduct(updated);
        setFormData(rowToFormData(updated));
      }
    }
  };

  const handleStatusChange = async (newStatus: ProductStatus) => {
    if (!productId) return;
    const result = await updateProductStatus(productId, newStatus);
    if ('error' in result) {
      onToast(`Error: ${result.error}`);
      return;
    }
    onToast(`Status changed to ${newStatus}`);
    const updated = await fetchProductForEdit(productId);
    if (updated) {
      setProduct(updated);
      setFormData(rowToFormData(updated));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-warm-gray">Loading product...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/products')}
            className="text-warm-gray hover:text-deep transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line text-xl" />
          </button>
          <h2 className="text-2xl font-serif font-semibold text-deep">
            {isCreate ? 'New Product' : `Edit: ${product?.name ?? ''}`}
          </h2>
          {product && <StatusBadge status={product.status} />}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main form — 2/3 width */}
        <div className="xl:col-span-2">
          <ProductForm
            initialData={formData}
            productId={productId}
            linkedSlugs={linkedSlugs}
            onLinksChange={setLinkedSlugs}
            onSave={handleSave}
            onCancel={() => navigate('/admin/products')}
          />
        </div>

        {/* Sidebar — 1/3 width */}
        <div className="space-y-6">
          {/* Status Actions */}
          {product && (
            <div className="bg-cream-50 rounded-xl p-5 border border-blush-100">
              <h4 className="text-sm font-semibold text-deep mb-3">Status Actions</h4>
              <div className="space-y-2">
                {product.status === 'draft' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('published')}
                      className="w-full px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 cursor-pointer transition-colors"
                    >
                      <i className="ri-check-line mr-1.5" />Publish
                    </button>
                    <button
                      onClick={() => handleStatusChange('archived')}
                      className="w-full px-4 py-2.5 border border-blush-300 text-warm-gray text-sm font-medium rounded-lg hover:bg-cream-100 cursor-pointer transition-colors"
                    >
                      <i className="ri-archive-line mr-1.5" />Archive
                    </button>
                  </>
                )}
                {product.status === 'published' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('draft')}
                      className="w-full px-4 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 cursor-pointer transition-colors"
                    >
                      <i className="ri-draft-line mr-1.5" />Revert to Draft
                    </button>
                    <button
                      onClick={() => handleStatusChange('archived')}
                      className="w-full px-4 py-2.5 border border-blush-300 text-warm-gray text-sm font-medium rounded-lg hover:bg-cream-100 cursor-pointer transition-colors"
                    >
                      <i className="ri-archive-line mr-1.5" />Archive
                    </button>
                  </>
                )}
                {product.status === 'archived' && (
                  <button
                    onClick={() => handleStatusChange('draft')}
                    className="w-full px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 cursor-pointer transition-colors"
                  >
                    <i className="ri-draft-line mr-1.5" />Revert to Draft
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Version History */}
          {productId && <VersionHistory productId={productId} />}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AdminProductsPage (main export)
// ═══════════════════════════════════════════════════════════════
// ProductVerificationView
// ═══════════════════════════════════════════════════════════════

const VERIFICATION_STATUS_CLASSES: Record<string, string> = {
  verified: 'bg-green-100 text-green-700',
  needs_review: 'bg-amber-100 text-amber-700',
  conflict: 'bg-red-100 text-red-700',
};

const ISSUE_PILL_CLASSES: Record<string, string> = {
  'Ingredient conflict — needs review': 'bg-red-100 text-red-700',
  'Pending merge available': 'bg-blue-50 text-blue-600',
  'Needs verification': 'bg-amber-100 text-amber-700',
  'No ingredients scanned': 'bg-amber-100 text-amber-700',
  'Still draft': 'bg-amber-100 text-amber-700',
  'Missing image': 'bg-red-50 text-red-600',
  'Missing description': 'bg-red-50 text-red-600',
  'No skin types': 'bg-cream-100 text-warm-gray',
  'No concerns': 'bg-cream-100 text-warm-gray',
};

const VERIFICATION_FILTERS = [
  { key: 'action',    label: 'Needs Action' },
  { key: 'missing',   label: 'Missing Data' },
  { key: 'unscanned', label: 'Unscanned' },
  { key: 'all',       label: 'All Issues' },
] as const;
type VerificationFilterKey = typeof VERIFICATION_FILTERS[number]['key'];
const ACTION_ISSUES  = new Set(['Ingredient conflict — needs review', 'Needs verification', 'Pending merge available']);
const MISSING_ISSUES = new Set(['Missing image', 'Missing description', 'No skin types', 'No concerns']);

function ProductVerificationView({ items, loading }: { items: VerificationItem[]; loading: boolean }) {
  const navigate = useNavigate();

  const [verificationFilter, setVerificationFilter] = useState<VerificationFilterKey>('action');
  const filteredItems = useMemo(() => {
    let filtered: VerificationItem[];
    if (verificationFilter === 'action')         filtered = items.filter(item => item.issues.some(i => ACTION_ISSUES.has(i)));
    else if (verificationFilter === 'missing')   filtered = items.filter(item => item.issues.some(i => MISSING_ISSUES.has(i)));
    else if (verificationFilter === 'unscanned') filtered = items.filter(item => item.issues.includes('No ingredients scanned') && item.status === 'published');
    else                                         filtered = items;

    const severityScore = (item: VerificationItem): number => {
      if (item.verification_status === 'conflict') return 0;
      if (item.issues.includes('Pending merge available')) return 1;
      if (item.verification_status === 'needs_review') return 2;
      if (!item.verification_status || item.verification_status === 'unverified') return 3;
      return 4;
    };

    return [...filtered].sort((a, b) => severityScore(a) - severityScore(b));
  }, [items, verificationFilter]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-warm-gray">Checking products...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-deep">Verification</h2>
          <p className="text-sm text-warm-gray mt-1">Products with missing data or ingredient conflicts</p>
        </div>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
          {filteredItems.length} {filteredItems.length === 1 ? 'product' : 'products'} need attention
        </span>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-blush-200 p-12 text-center">
          <i className="ri-checkbox-circle-line text-3xl text-sage mb-3 block" />
          <p className="text-deep font-medium">All products look good</p>
          <p className="text-sm text-warm-gray mt-1">No verification issues found</p>
        </div>
      ) : (
        <>
        <div className="flex gap-1 mb-6 bg-cream-100 rounded-lg p-1 w-fit">
          {VERIFICATION_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setVerificationFilter(f.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
                verificationFilter === f.key ? 'bg-white text-deep shadow-sm' : 'text-warm-gray hover:text-deep'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-blush-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blush-200 bg-cream-50">
                  <th className="text-left px-4 py-3 font-medium text-warm-gray">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-warm-gray">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-warm-gray">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-warm-gray">Verification</th>
                  <th className="text-left px-4 py-3 font-medium text-warm-gray">Confidence</th>
                  <th className="text-left px-4 py-3 font-medium text-warm-gray">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-warm-gray">Issues</th>
                  <th className="text-left px-4 py-3 font-medium text-warm-gray">Updated</th>
                  <th className="text-left px-4 py-3 font-medium text-warm-gray" />
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-warm-gray">
                    No products match this filter.
                  </td></tr>
                ) : filteredItems.map((item, i) => (
                  <tr key={item.id} className={`border-b border-blush-100 hover:bg-cream-50 transition-colors ${i === filteredItems.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-deep">{item.name}</div>
                      <div className="text-warm-gray text-xs mt-0.5">{item.brand}</div>
                    </td>
                    <td className="px-4 py-3 text-warm-gray capitalize">{item.category}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${VERIFICATION_STATUS_CLASSES[item.verification_status ?? ''] ?? 'bg-gray-100 text-gray-500'}`}>
                        {item.verification_status ?? 'unverified'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-warm-gray text-sm capitalize">
                      {item.verification_confidence ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-warm-gray text-sm">
                      {item.verification_source ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {item.issues.map(issue => (
                          <span
                            key={issue}
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${ISSUE_PILL_CLASSES[issue] ?? 'bg-cream-100 text-warm-gray'}`}
                          >
                            {issue}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-warm-gray text-xs whitespace-nowrap">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/admin/products/${item.id}`)}
                        className="px-3 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 border border-primary-200 hover:border-primary-300 rounded-lg transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════

export default function AdminProductsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [toast, setToast] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'products' | 'verification'>('products');
  const [verificationItems, setVerificationItems] = useState<VerificationItem[]>([]);
  const [verificationLoading, setVerificationLoading] = useState(true);

  const isListMode = !id;
  const isCreateMode = id === 'new';
  const editProductId = id && id !== 'new' ? id : null;

  useEffect(() => {
    if (!isListMode) return;
    let cancelled = false;
    setVerificationLoading(true);
    fetchProductsNeedingVerification().then(data => {
      if (!cancelled) {
        setVerificationItems(data);
        setVerificationLoading(false);
      }
    }).catch(() => { if (!cancelled) setVerificationLoading(false); });
    return () => { cancelled = true; };
  }, [isListMode]);

  const verificationActionCount = verificationItems.filter(
    item => item.issues.some(i => ACTION_ISSUES.has(i))
  ).length;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-blush-200 h-16 flex items-center px-6 sticky top-0 z-40">
        <Link to="/" className="font-serif text-xl font-semibold text-deep">Lorem Curae</Link>
        <span className="ml-3 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Admin</span>
        <div className="ml-auto flex items-center gap-4">
          <Link to="/" className="text-sm text-warm-gray hover:text-deep transition-colors">
            <i className="ri-arrow-left-line mr-1" />Back to Site
          </Link>
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-600">
              {user?.email?.charAt(0).toUpperCase() ?? 'A'}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        {isListMode && (
          <div className="flex gap-1 mb-6 bg-cream-100 rounded-lg p-1 w-fit">
            {(['products', 'verification'] as const).map(view => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
                  activeView === view ? 'bg-white text-deep shadow-sm' : 'text-warm-gray hover:text-deep'
                }`}
              >
                {view === 'products' ? 'Products' : (
                  <span className="flex items-center gap-1.5">
                    Verification
                    {!verificationLoading && verificationActionCount > 0 && (
                      <span className="bg-primary-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full leading-none">
                        {verificationActionCount}
                      </span>
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
        {isListMode && activeView === 'products' && <ProductListView />}
        {isListMode && activeView === 'verification' && (
          <ProductVerificationView items={verificationItems} loading={verificationLoading} />
        )}
        {(isCreateMode || editProductId) && (
          <ProductEditView
            productId={editProductId}
            onToast={setToast}
          />
        )}
      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
