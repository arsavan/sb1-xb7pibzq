import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product, ProductFormData } from '../../types/database';
import { Trash2, Plus, Save, X, Edit2, Upload, Loader2 } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

export default function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: 0,
    image_url: '',
    images: [],
    amazon_url: '',
    description: '',
    tags: [],
    discount: undefined
  });
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multipleFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(file: File, isMainImage: boolean = true) {
    try {
      setUploadProgress(0);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(Math.round(percent));
          },
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      if (isMainImage) {
        setFormData(prev => ({
          ...prev,
          image_url: publicUrl
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, publicUrl]
        }));
      }

      setUploadProgress(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Erreur lors du téléchargement de l\'image');
      setUploadProgress(null);
    }
  }

  async function handleMultipleImagesUpload(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      await handleImageUpload(files[i], false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        setEditingProduct(null);
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{
            ...formData,
            rating: 0,
            reviews: 0,
            favorites_count: 0
          }]);

        if (error) throw error;
      }

      setFormData({
        name: '',
        price: 0,
        image_url: '',
        images: [],
        amazon_url: '',
        description: '',
        tags: [],
        discount: undefined
      });
      
      await fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Erreur lors de la sauvegarde du produit');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      images: product.images || [],
      amazon_url: product.amazon_url,
      description: product.description || '',
      tags: product.tags,
      discount: product.discount
    });
  }

  function handleRemoveImage(index: number) {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  }

  async function handleDelete(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    setLoading(true);
    try {
      const { data: product } = await supabase
        .from('products')
        .select('image_url, images')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (product) {
        const imagesToDelete: string[] = [];
        
        if (product.image_url?.includes('supabase.co')) {
          const mainImagePath = product.image_url.split('/').pop();
          if (mainImagePath) {
            imagesToDelete.push('products/' + mainImagePath);
          }
        }

        if (product.images) {
          product.images.forEach(imageUrl => {
            if (imageUrl.includes('supabase.co')) {
              const path = imageUrl.split('/').pop();
              if (path) {
                imagesToDelete.push('products/' + path);
              }
            }
          });
        }

        if (imagesToDelete.length > 0) {
          await supabase.storage
            .from('images')
            .remove(imagesToDelete);
        }
      }

      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Erreur lors de la suppression du produit');
    } finally {
      setLoading(false);
    }
  }

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(newTag.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag.trim()]
        }));
      }
      setNewTag('');
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Gestion des Produits</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-card rounded-lg shadow p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">
          {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary">Nom</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-border bg-background shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">Prix (€)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-border bg-background shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Image principale</label>
              <div className="flex items-start gap-4">
                {formData.image_url && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-background">
                    <img
                      src={formData.image_url}
                      alt="Aperçu"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, true);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadProgress !== null}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-border rounded-lg text-text-secondary hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                  >
                    {uploadProgress !== null ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        {uploadProgress}%
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        Télécharger l'image principale
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Images additionnelles</label>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden bg-background">
                      <img
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div>
                  <input
                    type="file"
                    ref={multipleFileInputRef}
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        handleMultipleImagesUpload(e.target.files);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => multipleFileInputRef.current?.click()}
                    disabled={uploadProgress !== null}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-border rounded-lg text-text-secondary hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                  >
                    {uploadProgress !== null ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        {uploadProgress}%
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        Ajouter des images
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">Lien Amazon</label>
              <input
                type="url"
                required
                value={formData.amazon_url}
                onChange={e => setFormData(prev => ({ ...prev, amazon_url: e.target.value }))}
                className="mt-1 block w-full rounded-md border-border bg-background shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
              <RichTextEditor
                content={formData.description}
                onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">Réduction (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount || ''}
                onChange={e => setFormData(prev => ({ ...prev, discount: e.target.value ? parseInt(e.target.value) : undefined }))}
                className="mt-1 block w-full rounded-md border-border bg-background shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">Tags</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 inline-flex items-center p-0.5 hover:bg-primary/20 rounded-full"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Ajouter un tag..."
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            {editingProduct && (
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({
                    name: '',
                    price: 0,
                    image_url: '',
                    images: [],
                    amazon_url: '',
                    description: '',
                    tags: [],
                    discount: undefined
                  });
                }}
                className="px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-text-secondary hover:bg-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              disabled={loading || uploadProgress !== null}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {editingProduct ? (
                <>
                  <Save size={20} className="mr-2" />
                  Sauvegarder
                </>
              ) : (
                <>
                  <Plus size={20} className="mr-2" />
                  Ajouter le produit
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-card rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Favoris
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={product.image_url}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4 max-w-md">
                        <div className="text-sm font-medium text-text">
                          {product.name}
                        </div>
                        {product.description && (
                          <div 
                            className="text-sm text-text-secondary line-clamp-1"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                          />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text">{product.price}€</div>
                    {product.discount && (
                      <div className="text-xs text-secondary">-{product.discount}%</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {product.favorites_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-secondary hover:bg-secondary/10 rounded-full transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}