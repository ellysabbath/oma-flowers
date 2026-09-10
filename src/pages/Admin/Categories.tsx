// src/pages/admin/Categories.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Tag,
  Package,
  Flower2,
  Sparkles,
  Layers,
  X,
  AlertCircle,
  RefreshCw,
  Save,
  FolderTree,
} from 'lucide-react';
import { categoryAPI } from '../../api/categories';
import type { Category } from '../../types';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const TYPE_OPTIONS = [
  { value: 'Classic', label: 'Classic' },
  { value: 'Luxury', label: 'Luxury' },
] as const;

const CLASS_OPTIONS = [
  { value: 'A', label: 'A — Table / Home / Office / Church flowers' },
  { value: 'B', label: 'B — Wedding / Graduation flowers' },
  { value: 'C', label: 'C — Gift & Premium flower packages' },
  { value: 'D', label: 'D — Decoration kits & Event decoration' },
] as const;

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
};

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

/** Compose the auto-suggested code: e.g. Classic + A → CCA */
const suggestCode = (type: string, classType: string): string => {
  const t = type === 'Classic' ? 'C' : type === 'Luxury' ? 'L' : '';
  return `${t}C${classType || ''}`;
};

const formatTypeLabel = (type?: string) =>
  type === 'Classic' ? 'Classic' : type === 'Luxury' ? 'Luxury' : '—';

const formatClassLabel = (cls?: string) =>
  cls ? `Class ${cls}` : '—';

/* ------------------------------------------------------------------ */
/* Add Category Modal                                                  */
/* ------------------------------------------------------------------ */

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  isLoading?: boolean;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const emptyState = {
    name: '',
    code: '',
    description: '',
    type: 'Classic',
    class_type: 'A',
    bv: '',
    price: '',
    status: 'active',
  };
  const [formData, setFormData] = useState(emptyState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [codeTouched, setCodeTouched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(emptyState);
      setErrors({});
      setCodeTouched(false);
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
    setFormData((prev) => {
      const next = { ...prev, [name]: value } as typeof prev;

      // Auto-suggest code when type/class changes and the user hasn't
      // typed a custom code yet.
      if ((name === 'type' || name === 'class_type') && !codeTouched) {
        next.code = suggestCode(
          name === 'type' ? value : prev.type,
          name === 'class_type' ? value : prev.class_type
        );
      }
      return next;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCodeTouched(true);
    handleChange(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Category name is required';
    if (!formData.code) newErrors.code = 'Category code is required';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.class_type) newErrors.class_type = 'Class is required';
    if (!formData.bv) newErrors.bv = 'BV is required';
    if (!formData.price) newErrors.price = 'Price is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave({
        name: formData.name,
        code: formData.code.toUpperCase(),
        description: formData.description,
        type: formData.type,
        class_type: formData.class_type,
        bv: parseInt(formData.bv),
        price: parseFloat(formData.price),
        status: formData.status,
      });
      onClose();
    } catch (error) {
      console.error('Error adding category:', error);
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
          <h3 className="text-xl font-bold text-gray-800">Add New Category</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g. Classic Class A Flower"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleCodeChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent uppercase ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="CCA, CCB, LCA…"
              />
              <p className="text-xs text-gray-400 mt-1">
                Auto-suggested as {suggestCode(formData.type, formData.class_type)} —
                edit if needed.
              </p>
              {errors.code && (
                <p className="text-sm text-red-500 mt-1">{errors.code}</p>
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
              placeholder="What flowers are included in this category?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-sm text-red-500 mt-1">{errors.type}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                name="class_type"
                value={formData.class_type}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                  errors.class_type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {CLASS_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.class_type && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.class_type}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </select>
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
                  Add Category
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
/* Edit Category Modal                                                 */
/* ------------------------------------------------------------------ */

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  category: Category | null;
  isLoading?: boolean;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category,
  isLoading = false,
}) => {
  const emptyState = {
    name: '',
    code: '',
    description: '',
    type: 'Classic',
    class_type: 'A',
    bv: '',
    price: '',
    status: 'active',
  };
  const [formData, setFormData] = useState(emptyState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && category) {
      setFormData({
        name: category.name || '',
        code: category.code || '',
        description: category.description || '',
        type: category.type || 'Classic',
        class_type: category.class_type || 'A',
        bv: category.bv?.toString() || '',
        price: category.price?.toString() || '',
        status: category.status || 'active',
      });
      setErrors({});
    }
  }, [isOpen, category]);

  if (!isOpen || !category) return null;

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
    if (!formData.name) newErrors.name = 'Category name is required';
    if (!formData.code) newErrors.code = 'Category code is required';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.class_type) newErrors.class_type = 'Class is required';
    if (!formData.bv) newErrors.bv = 'BV is required';
    if (!formData.price) newErrors.price = 'Price is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave({
        id: category.id,
        name: formData.name,
        code: formData.code.toUpperCase(),
        description: formData.description,
        type: formData.type,
        class_type: formData.class_type,
        bv: parseInt(formData.bv),
        price: parseFloat(formData.price),
        status: formData.status,
      });
      onClose();
    } catch (error) {
      console.error('Error updating category:', error);
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
          <h3 className="text-xl font-bold text-gray-800">Edit Category</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name <span className="text-red-500">*</span>
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
                Category Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent uppercase ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.code && (
                <p className="text-sm text-red-500 mt-1">{errors.code}</p>
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
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-sm text-red-500 mt-1">{errors.type}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                name="class_type"
                value={formData.class_type}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                  errors.class_type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {CLASS_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.class_type && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.class_type}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </select>
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
                  Update Category
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
/* Delete Category Modal                                               */
/* ------------------------------------------------------------------ */

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  categoryName: string;
  productCount?: number;
  isLoading?: boolean;
}

const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  productCount = 0,
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
          <h3 className="text-xl font-bold text-gray-800">Delete Category</h3>
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
            <span className="font-semibold">{categoryName}</span>?
          </p>

          {productCount > 0 && (
            <p className="text-center text-sm text-red-500 mt-2">
              ⚠️ This category has {productCount} product(s). Move or delete
              them first.
            </p>
          )}

          <p className="text-center text-sm text-gray-500 mt-1">
            This action cannot be undone.
          </p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onConfirm}
              disabled={isLoading || productCount > 0}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                productCount > 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
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
/* View Category Modal                                                 */
/* ------------------------------------------------------------------ */

interface ViewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onEdit?: (category: Category) => void;
  onViewProducts?: (category: Category) => void;
}

const ViewCategoryModal: React.FC<ViewCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onEdit,
  onViewProducts,
}) => {
  if (!isOpen || !category) return null;

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
            <div
              className={`p-3 rounded-lg ${
                category.type === 'Classic' ? 'bg-blue-50' : 'bg-purple-50'
              }`}
            >
              {category.type === 'Classic' ? (
                <Flower2 className="text-blue-500" size={24} />
              ) : (
                <Sparkles className="text-purple-500" size={24} />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {category.name}
              </h3>
              <p className="text-sm text-amber-600">Code: {category.code}</p>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-amber-50/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Type</p>
              <p className="text-sm font-bold text-amber-700">
                {category.type}
              </p>
            </div>
            <div className="bg-blue-50/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Class</p>
              <p className="text-sm font-bold text-blue-700">
                {category.class_type}
              </p>
            </div>
            <div className="bg-green-50/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">BV</p>
              <p className="text-sm font-bold text-green-700">
                {category.bv}
              </p>
            </div>
            <div className="bg-purple-50/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Products</p>
              <p className="text-sm font-bold text-purple-700">
                {category.product_count || 0}
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="text-sm text-gray-700 mt-1">
              {category.description || 'No description available'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Category Information
              </p>
              <div className="mt-2 space-y-2">
                <p className="text-sm">
                  <span className="text-gray-500">Name:</span> {category.name}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Code:</span> {category.code}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Type:</span>{' '}
                  {category.type}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Class:</span>{' '}
                  {category.class_type}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Full label:</span>{' '}
                  {category.type} Class {category.class_type}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Pricing Information
              </p>
              <div className="mt-2 space-y-2">
                <p className="text-sm">
                  <span className="text-gray-500">BV:</span> {category.bv}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Price:</span> TSh{' '}
                  {Number(category.price).toLocaleString()}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Products:</span>{' '}
                  {category.product_count || 0}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Status:</span>{' '}
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[category.status] ||
                      'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {category.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-amber-100/30 pt-4 flex gap-3">
            <button
              onClick={() => onEdit?.(category)}
              className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Edit Category
            </button>
            <button
              onClick={() => onViewProducts?.(category)}
              className="flex-1 px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
            >
              View Products ({category.product_count || 0})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main Categories Component                                           */
/* ------------------------------------------------------------------ */

const Categories: React.FC = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterClass, setFilterClass] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- Load categories ---------- */
  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryAPI.getAll();
      setCategories(Array.isArray(data) ? data : (data as any)?.results || []);
    } catch (err: any) {
      console.error('Error loading categories:', err);
      let errorMessage = 'Failed to load categories.';
      if (err.response?.data?.error) errorMessage = err.response.data.error;
      else if (err.response?.data?.detail)
        errorMessage = err.response.data.detail;
      else if (err.message) errorMessage = err.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /* ---------- CRUD ---------- */

  const handleAddCategory = async (data: any) => {
    setIsSubmitting(true);
    try {
      await categoryAPI.create(data);
      await loadCategories();
      setAddModalOpen(false);
    } catch (error: any) {
      console.error('Error adding category:', error);
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        (error?.response?.data &&
          Object.values(error.response.data).flat().join(', ')) ||
        'Failed to add category.';
      alert(msg);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async (data: any) => {
    setIsSubmitting(true);
    try {
      await categoryAPI.update(data.id, data);
      await loadCategories();
      setEditModalOpen(false);
    } catch (error: any) {
      console.error('Error updating category:', error);
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        (error?.response?.data &&
          Object.values(error.response.data).flat().join(', ')) ||
        'Failed to update category.';
      alert(msg);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);
    try {
      await categoryAPI.delete(selectedCategory.id);
      await loadCategories();
      setDeleteModalOpen(false);
      setSelectedCategory(null);
    } catch (error: any) {
      console.error('Error deleting category:', error);
      alert(
        error?.response?.data?.error ||
          error?.message ||
          'Failed to delete category.'
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Filter ---------- */

  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || c.type === filterType;
    const matchesClass =
      filterClass === 'All' || c.class_type === filterClass;
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchesSearch && matchesType && matchesClass && matchesStatus;
  });

  /* ---------- Stats ---------- */
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.status === 'active').length;
  const totalBV = categories.reduce((sum, c) => sum + (c.bv || 0), 0);
  const totalProducts = categories.reduce(
    (sum, c) => sum + (c.product_count || 0),
    0
  );

  /* ---------- Handlers from view modal ---------- */

  const handleViewProducts = (cat: Category) => {
    setViewModalOpen(false);
    // Navigate to admin products, filtered by this category
    navigate(`/admin/products?category=${cat.id}`);
  };

  const handleEditFromView = (cat: Category) => {
    setViewModalOpen(false);
    setSelectedCategory(cat);
    setEditModalOpen(true);
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage product categories and classifications
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {totalCategories === 0
              ? 'No categories found'
              : `Total: ${totalCategories} categories`}
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
        >
          <Plus size={16} />
          Add Category
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Categories</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {totalCategories}
              </h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <FolderTree className="text-amber-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Categories</p>
              <h3 className="text-2xl font-bold text-green-600">
                {activeCategories}
              </h3>
            </div>
            <div className="p-2.5 bg-green-50 rounded-lg">
              <Tag className="text-green-500" size={20} />
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
              <Layers className="text-blue-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <h3 className="text-2xl font-bold text-purple-600">
                {totalProducts}
              </h3>
            </div>
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <Package className="text-purple-500" size={20} />
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
            placeholder="Search categories by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[150px]"
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
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[130px]"
        >
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          onClick={loadCategories}
          className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={18} className="text-gray-500" />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-amber-50/50 border-b border-amber-200/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Class
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BV
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Products
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100/30">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {searchTerm ||
                    filterType !== 'All' ||
                    filterClass !== 'All' ||
                    filterStatus !== 'All'
                      ? 'No categories match your filters'
                      : 'No categories found. Add your first category!'}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-amber-50/30 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedCategory(category);
                      setViewModalOpen(true);
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            category.type === 'Classic'
                              ? 'bg-blue-50'
                              : 'bg-purple-50'
                          }`}
                        >
                          {category.type === 'Classic' ? (
                            <Flower2 className="text-blue-500" size={18} />
                          ) : (
                            <Sparkles
                              className="text-purple-500"
                              size={18}
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800">
                            {category.name}
                          </p>
                          <p className="text-xs text-gray-400 line-clamp-1">
                            {category.description || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {category.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          category.type === 'Classic'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {formatTypeLabel(category.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        {formatClassLabel(category.class_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-amber-600">
                      {category.bv}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">
                      TSh {Number(category.price).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-600">
                      {category.product_count || 0}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[category.status] ||
                          'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {category.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(category);
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
                            setSelectedCategory(category);
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
                            setSelectedCategory(category);
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-amber-100/30 text-sm text-gray-500">
          Showing {filteredCategories.length} of {categories.length} categories
        </div>
      </div>

      {/* Modals */}
      <AddCategoryModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddCategory}
        isLoading={isSubmitting}
      />

      <EditCategoryModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditCategory}
        category={selectedCategory}
        isLoading={isSubmitting}
      />

      <DeleteCategoryModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteCategory}
        categoryName={selectedCategory?.name || ''}
        productCount={selectedCategory?.product_count || 0}
        isLoading={isSubmitting}
      />

      <ViewCategoryModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        category={selectedCategory}
        onEdit={handleEditFromView}
        onViewProducts={handleViewProducts}
      />
    </div>
  );
};

export default Categories;