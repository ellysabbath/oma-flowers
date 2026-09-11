// src/pages/admin/Products.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  Tag,
  DollarSign,
  TrendingUp,
  Layers,
  X,
  AlertCircle,
  RefreshCw,
  Save,
  Upload,
  Image as ImageIcon,
  Award,
} from 'lucide-react';
import { productAPI } from '../../api/products';
import { categoryAPI } from '../../api/categories';
import { distributorAPI } from '../../api/distributors';
import type { Product, Category, Distributor } from '../../types';

/* ------------------------------------------------------------------ */
/* Base64 helpers                                                      */
/* ------------------------------------------------------------------ */

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

/* ------------------------------------------------------------------ */
/* Reusable Image Uploader                                             */
/* ------------------------------------------------------------------ */

interface ImageUploaderProps {
  value: string;
  onChange: (base64: string) => void;
  onClear?: () => void;
  label?: string;
  error?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  onClear,
  label = 'Product Picture',
  error,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFile = async (file: File | null | undefined) => {
    setLocalError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLocalError('Only image files are allowed.');
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      onChange(base64);
    } catch (err) {
      console.error('Failed to read image:', err);
      setLocalError('Failed to read image.');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    void handleFile(file);
  };

  const handleRemove = () => {
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = '';
    onClear ? onClear() : onChange('');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex items-start gap-3"
      >
        <div className="w-24 h-24 shrink-0 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
          {value ? (
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="text-gray-300" size={28} />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload size={16} />
            {value ? 'Change image' : 'Upload image'}
          </button>
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors ml-2"
            >
              <X size={16} />
              Remove
            </button>
          )}
          <p className="text-xs text-gray-400">
            PNG, JPG, WEBP, GIF, SVG — drag &amp; drop supported.
          </p>
        </div>
      </div>

      {(localError || error) && (
        <p className="text-sm text-red-500 mt-1">{localError || error}</p>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const formatCategoryOption = (cat: Category) =>
  `${cat.code} — ${cat.name} · ${cat.type} Class ${cat.class_type} · ${cat.bv} BV · TSh ${Number(
    cat.price
  ).toLocaleString()}`;

const formatDistributorOption = (d: Distributor) =>
  `${d.full_name} (${d.rank})${d.user?.email ? ` — ${d.user.email}` : ''}`;

const formatPrice = (price: number | string | null | undefined) =>
  new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

const num = (v: number | string | null | undefined): number =>
  v === null || v === undefined ? 0 : Number(v);

/** Compose a suggested SKU like "CCA-0001" based on the picked category */
const suggestSku = (
  category: Category | undefined,
  allProducts: Product[]
): string => {
  if (!category) return '';
  const usedInCat = allProducts.filter(
    (p) => p.category === category.id
  ).length;
  const seq = String(usedInCat + 1).padStart(4, '0');
  return `${category.code}-${seq}`;
};

/* ------------------------------------------------------------------ */
/* Add Product Modal                                                   */
/* ------------------------------------------------------------------ */

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  categories: Category[];
  distributors: Distributor[];
  allProducts: Product[];
  isLoading?: boolean;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  distributors,
  allProducts,
  isLoading = false,
}) => {
  const emptyState = {
    name: '',
    sku: '',
    description: '',
    category: '',
    seller: '',
    price: '',
    bv: '',
    stock: '',
    status: 'active',
    product_picture: '',
  };
  const [formData, setFormData] = useState(emptyState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [skuTouched, setSkuTouched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(emptyState);
      setErrors({});
      setSkuTouched(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkuTouched(true);
    handleChange(e);
  };

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = e.target;
    const picked = categories.find((c) => c.id === Number(value));

    setFormData((prev) => {
      const next = { ...prev, category: value };
      if (picked && !prev.price) next.price = String(picked.price);
      if (picked && !prev.bv) next.bv = String(picked.bv);
      if (picked && !skuTouched) next.sku = suggestSku(picked, allProducts);
      return next;
    });

    if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
  };

  const previewSku = (() => {
    if (skuTouched && formData.sku) return null;
    const picked = categories.find((c) => c.id === Number(formData.category));
    return picked ? suggestSku(picked, allProducts) : null;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.bv) newErrors.bv = 'BV is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const finalSku =
        (formData.sku && formData.sku.trim()) || previewSku || '';

      await onSave({
        name: formData.name,
        sku: finalSku ? finalSku.toUpperCase() : '',
        description: formData.description,
        category: parseInt(formData.category),
        seller: formData.seller ? parseInt(formData.seller) : null,
        price: parseFloat(formData.price),
        bv: parseInt(formData.bv),
        stock: parseInt(formData.stock) || 0,
        status: formData.status,
        product_picture: formData.product_picture || null,
      });
      onClose();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-amber-100/50 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-800">Add New Product</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <ImageUploader
            value={formData.product_picture}
            onChange={(b64) =>
              setFormData((prev) => ({ ...prev, product_picture: b64 }))
            }
            onClear={() =>
              setFormData((prev) => ({ ...prev, product_picture: '' }))
            }
          />

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {formatCategoryOption(cat)}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-500 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Seller */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seller
              <span className="text-xs text-gray-400 ml-2">
                (distributor who earns the BV)
              </span>
            </label>
            <select
              name="seller"
              value={formData.seller}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            >
              <option value="">No seller (no BV credit)</option>
              {distributors.map((d) => (
                <option key={d.id} value={d.id}>
                  {formatDistributorOption(d)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Every time this product is sold, the seller's PBV and CGV rise
              automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
                <span className="text-xs text-gray-400 ml-2">
                  (auto-suggested, editable)
                </span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleSkuChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent uppercase ${
                  errors.sku ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Leave blank to auto-generate"
              />
              {!skuTouched && previewSku && (
                <p className="text-xs text-gray-400 mt-1">
                  Will use:{' '}
                  <span className="font-medium text-gray-600">
                    {previewSku}
                  </span>
                </p>
              )}
              {errors.sku && (
                <p className="text-sm text-red-500 mt-1">{errors.sku}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="Enter product description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (TSh) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.price && (
                <p className="text-sm text-red-500 mt-1">{errors.price}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BV <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="bv"
                value={formData.bv}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                  errors.bv ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.bv && (
                <p className="text-sm text-red-500 mt-1">{errors.bv}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="coming_soon">Coming Soon</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-amber-100/30">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Save size={18} />
                  Add Product
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Edit Product Modal                                                  */
/* ------------------------------------------------------------------ */

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  product: Product | null;
  categories: Category[];
  distributors: Distributor[];
  isLoading?: boolean;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  categories,
  distributors,
  isLoading = false,
}) => {
  const emptyState = {
    name: '',
    sku: '',
    description: '',
    category: '',
    seller: '',
    price: '',
    bv: '',
    stock: '',
    status: 'active',
    product_picture: '',
  };
  const [formData, setFormData] = useState(emptyState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        category: product.category?.toString() || '',
        seller: product.seller?.toString() || '',
        price: product.price?.toString() || '',
        bv: product.bv?.toString() || '',
        stock: product.stock?.toString() || '',
        status: product.status || 'active',
        product_picture: product.product_picture || '',
      });
      setErrors({});
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.sku) newErrors.sku = 'SKU is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.bv) newErrors.bv = 'BV is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave({
        id: product.id,
        name: formData.name,
        sku: formData.sku.toUpperCase(),
        description: formData.description,
        category: parseInt(formData.category),
        seller: formData.seller ? parseInt(formData.seller) : null,
        price: parseFloat(formData.price),
        bv: parseInt(formData.bv),
        stock: parseInt(formData.stock) || 0,
        status: formData.status,
        product_picture: formData.product_picture || null,
      });
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-amber-100/50 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-800">Edit Product</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <ImageUploader
            value={formData.product_picture}
            onChange={(b64) =>
              setFormData((prev) => ({ ...prev, product_picture: b64 }))
            }
            onClear={() =>
              setFormData((prev) => ({ ...prev, product_picture: '' }))
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent uppercase ${
                  errors.sku ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.sku && (
                <p className="text-sm text-red-500 mt-1">{errors.sku}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {formatCategoryOption(cat)}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-500 mt-1">{errors.category}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="coming_soon">Coming Soon</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seller
              <span className="text-xs text-gray-400 ml-2">
                (distributor who earns the BV)
              </span>
            </label>
            <select
              name="seller"
              value={formData.seller}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            >
              <option value="">No seller (no BV credit)</option>
              {distributors.map((d) => (
                <option key={d.id} value={d.id}>
                  {formatDistributorOption(d)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Every time this product is sold, the seller's PBV and CGV rise
              automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (TSh) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.price && (
                <p className="text-sm text-red-500 mt-1">{errors.price}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BV <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="bv"
                value={formData.bv}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                  errors.bv ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.bv && (
                <p className="text-sm text-red-500 mt-1">{errors.bv}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-amber-100/30">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Save size={18} />
                  Update Product
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Delete Product Modal                                                */
/* ------------------------------------------------------------------ */

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  productName: string;
  isLoading?: boolean;
}

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Delete Product</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-red-50 rounded-full">
              <Trash2 size={32} className="text-red-500" />
            </div>
          </div>

          <p className="text-center text-gray-700">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{productName}</span>?
          </p>
          <p className="text-center text-sm text-gray-500 mt-1">
            This action cannot be undone.
          </p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Trash2 size={18} />
                  Delete
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* View Product Modal                                                  */
/* ------------------------------------------------------------------ */

interface ViewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const ViewProductModal: React.FC<ViewProductModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  if (!isOpen || !product) return null;

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-red-100 text-red-700',
    coming_soon: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-amber-100/50 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg overflow-hidden border border-amber-100 bg-amber-50 flex items-center justify-center">
              {product.product_picture ? (
                <img
                  src={product.product_picture}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Layers
                  className={
                    product.category_type === 'Classic'
                      ? 'text-blue-500'
                      : 'text-purple-500'
                  }
                  size={24}
                />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {product.name}
              </h3>
              <p className="text-sm text-amber-600">SKU: {product.sku}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {product.product_picture && (
            <div className="rounded-lg overflow-hidden border border-amber-100 bg-gray-50">
              <img
                src={product.product_picture}
                alt={product.name}
                className="w-full max-h-96 object-contain bg-white"
              />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-amber-50/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">BV</p>
              <p className="text-lg font-bold text-amber-700">
                {product.effective_bv || product.bv || 0}
              </p>
            </div>
            <div className="bg-blue-50/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Price</p>
              <p className="text-lg font-bold text-blue-700">
                {formatPrice(product.effective_price || product.price || 0)}
              </p>
            </div>
            <div className="bg-green-50/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Stock</p>
              <p className="text-lg font-bold text-green-700">
                {product.stock || 0}
              </p>
            </div>
            <div className="bg-purple-50/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Sales</p>
              <p className="text-lg font-bold text-purple-700">
                {product.sales || 0}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Product Information
              </p>
              <div className="mt-2 space-y-2">
                <p className="text-sm">
                  <span className="text-gray-500">Category:</span>{' '}
                  {product.category_name || 'N/A'}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Category Code:</span>{' '}
                  {product.category_code || 'N/A'}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Type:</span>{' '}
                  {product.category_type || 'N/A'}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Class:</span>{' '}
                  {product.category_class_type || 'N/A'}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Seller:</span>{' '}
                  {product.seller_name ? (
                    <span className="inline-flex items-center gap-1">
                      <Award size={14} className="text-amber-500" />
                      {product.seller_name}
                      {product.seller_rank ? ` · ${product.seller_rank}` : ''}
                    </span>
                  ) : (
                    <span className="text-gray-400">No seller</span>
                  )}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[product.status] ||
                      'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {product.status || 'Unknown'}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="text-sm text-gray-600 mt-2">
                {product.description || 'No description available'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main Products Component                                             */
/* ------------------------------------------------------------------ */

const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterClass, setFilterClass] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSeller, setFilterSeller] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'bv'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- Load data ---------- */
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoriesData, productsData, distributorsData] = await Promise.all([
        categoryAPI.getAll(),
        productAPI.getAll(),
        distributorAPI.getAll(),
      ]);

      const normalizedCategories: Category[] = Array.isArray(categoriesData)
        ? categoriesData
        : (categoriesData as any)?.results || [];
      setCategories(normalizedCategories);

      const normalizedProducts: Product[] = Array.isArray(productsData)
        ? productsData
        : (productsData as any)?.results || [];
      setProducts(normalizedProducts);

      const normalizedDistributors: Distributor[] = Array.isArray(distributorsData)
        ? distributorsData
        : (distributorsData as any)?.results || [];
      setDistributors(normalizedDistributors);
    } catch (err: any) {
      console.error('Error loading data:', err);
      let errorMessage = 'Failed to load products.';
      if (err.response?.data?.error) errorMessage = err.response.data.error;
      else if (err.response?.data?.detail) errorMessage = err.response.data.detail;
      else if (err.message) errorMessage = err.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ---------- Stats ---------- */
  const totalProducts = products.length;
  const totalBV = products.reduce(
    (sum, p) => sum + num(p.effective_bv ?? p.bv),
    0
  );
  const totalValue = products.reduce(
    (sum, p) => sum + num(p.effective_price ?? p.price) * (p.stock || 0),
    0
  );
  const totalSales = products.reduce((sum, p) => sum + (p.sales || 0), 0);

  /* ---------- CRUD ---------- */
  const handleAddProduct = async (data: any) => {
    setIsSubmitting(true);
    try {
      await productAPI.create(data);
      await loadData();
      setAddModalOpen(false);
    } catch (error: any) {
      console.error('Error adding product:', error);
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        (error?.response?.data &&
          Object.values(error.response.data).flat().join(', ')) ||
        'Failed to add product.';
      alert(msg);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (data: any) => {
    setIsSubmitting(true);
    try {
      await productAPI.update(data.id, data);
      await loadData();
      setEditModalOpen(false);
    } catch (error: any) {
      console.error('Error updating product:', error);
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        (error?.response?.data &&
          Object.values(error.response.data).flat().join(', ')) ||
        'Failed to update product.';
      alert(msg);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      await productAPI.delete(selectedProduct.id);
      await loadData();
      setDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(
        error?.response?.data?.error ||
          error?.message ||
          'Failed to delete product.'
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Filter + sort ---------- */
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === 'All' || p.category_name === filterCategory;
      const matchesType =
        filterType === 'All' || p.category_type === filterType;
      const matchesClass =
        filterClass === 'All' || p.category_class_type === filterClass;
      const matchesStatus =
        filterStatus === 'All' || p.status === filterStatus;
      const matchesSeller =
        filterSeller === 'All' || p.seller === Number(filterSeller);
      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesClass &&
        matchesStatus &&
        matchesSeller
      );
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? (a.name || '').localeCompare(b.name || '')
          : (b.name || '').localeCompare(a.name || '');
      }
      if (sortBy === 'price') {
        const av = num(a.effective_price ?? a.price);
        const bv = num(b.effective_price ?? b.price);
        return sortOrder === 'asc' ? av - bv : bv - av;
      }
      const av = num(a.effective_bv ?? a.bv);
      const bv = num(b.effective_bv ?? b.bv);
      return sortOrder === 'asc' ? av - bv : bv - av;
    });

  /* ---------- Styles ---------- */
  const categoryColors: Record<string, string> = {
    Classic: 'bg-blue-100 text-blue-700 border-blue-300',
    Luxury: 'bg-purple-100 text-purple-700 border-purple-300',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-red-100 text-red-700',
    coming_soon: 'bg-yellow-100 text-yellow-700',
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your OMA Flowers product catalog
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {totalProducts === 0
              ? 'No products found'
              : `Total: ${totalProducts} products`}
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-600 text-sm flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {totalProducts}
              </h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <Package className="text-amber-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total BV</p>
              <h3 className="text-2xl font-bold text-blue-600">{totalBV}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Tag className="text-blue-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Stock Value</p>
              <h3 className="text-2xl font-bold text-green-600">
                {formatPrice(totalValue)}
              </h3>
            </div>
            <div className="p-2.5 bg-green-50 rounded-lg">
              <DollarSign className="text-green-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <h3 className="text-2xl font-bold text-purple-600">
                {totalSales}
              </h3>
            </div>
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <TrendingUp className="text-purple-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[140px]"
        >
          <option value="All">All Types</option>
          <option value="Classic">Classic</option>
          <option value="Luxury">Luxury</option>
        </select>

        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[120px]"
        >
          <option value="All">All Classes</option>
          <option value="A">Class A</option>
          <option value="B">Class B</option>
          <option value="C">Class C</option>
          <option value="D">Class D</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[160px]"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.code} — {cat.name}
            </option>
          ))}
        </select>

        <select
          value={filterSeller}
          onChange={(e) => setFilterSeller(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[180px]"
        >
          <option value="All">All Sellers</option>
          {distributors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.full_name}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[140px]"
        >
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="coming_soon">Coming Soon</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as 'name' | 'price' | 'bv')
          }
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[130px]"
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="bv">Sort by BV</option>
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>

        <button
          onClick={loadData}
          className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={18} className="text-gray-500" />
          Refresh
        </button>
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-12 text-center">
          <Package className="mx-auto text-gray-300" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-600">
            No products found
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            {searchTerm ||
            filterCategory !== 'All' ||
            filterType !== 'All' ||
            filterClass !== 'All' ||
            filterSeller !== 'All' ||
            filterStatus !== 'All'
              ? 'Try adjusting your filters'
              : 'Add your first product to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => {
                setSelectedProduct(product);
                setViewModalOpen(true);
              }}
            >
              <div className="h-40 bg-amber-50/50 border-b border-amber-100/30 flex items-center justify-center overflow-hidden">
                {product.product_picture ? (
                  <img
                    src={product.product_picture}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <Layers
                    className={
                      product.category_type === 'Classic'
                        ? 'text-blue-400'
                        : 'text-purple-400'
                    }
                    size={40}
                  />
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 group-hover:text-amber-600 transition-colors truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400">{product.sku}</p>

                    {product.seller_name && (
                      <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1 truncate">
                        <Award size={12} />
                        {product.seller_name}
                        {product.seller_rank
                          ? ` · ${product.seller_rank}`
                          : ''}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ml-2 ${
                      statusColors[product.status] ||
                      'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {product.status || 'Unknown'}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-amber-50/50 rounded-lg">
                    <p className="text-xs text-gray-500">BV</p>
                    <p className="text-sm font-bold text-amber-600">
                      {product.effective_bv || product.bv || 0}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-blue-50/50 rounded-lg">
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="text-sm font-bold text-blue-600">
                      {formatPrice(
                        product.effective_price || product.price || 0
                      )}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-green-50/50 rounded-lg">
                    <p className="text-xs text-gray-500">Stock</p>
                    <p className="text-sm font-bold text-green-600">
                      {product.stock || 0}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between pt-3 border-t border-amber-100/30">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 ${
                        categoryColors[product.category_type || ''] ||
                        'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {product.category_type || 'N/A'}
                    </span>
                    {product.category_class_type && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
                        Class {product.category_class_type}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                        setViewModalOpen(true);
                      }}
                      title="View"
                    >
                      <Eye
                        size={16}
                        className="text-gray-400 hover:text-amber-600"
                      />
                    </button>
                    <button
                      className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                        setEditModalOpen(true);
                      }}
                      title="Edit"
                    >
                      <Edit
                        size={16}
                        className="text-gray-400 hover:text-amber-600"
                      />
                    </button>
                    <button
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                        setDeleteModalOpen(true);
                      }}
                      title="Delete"
                    >
                      <Trash2
                        size={16}
                        className="text-gray-400 hover:text-red-600"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddProductModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddProduct}
        categories={categories}
        distributors={distributors}
        allProducts={products}
        isLoading={isSubmitting}
      />

      <EditProductModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditProduct}
        product={selectedProduct}
        categories={categories}
        distributors={distributors}
        isLoading={isSubmitting}
      />

      <DeleteProductModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteProduct}
        productName={selectedProduct?.name || ''}
        isLoading={isSubmitting}
      />

      <ViewProductModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
};

export default Products;