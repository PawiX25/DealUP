'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { detectStore } from '@/utils/stores';

export default function CreateDealButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    comparisonPrice: '',
    imageUrl: '',
    link: ''
  });
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedStore, setDetectedStore] = useState<string | null>(null);

  const handleLinkChange = async (url: string) => {
    setFormData({...formData, link: url});
    setDetectedStore(detectStore(url));
    
    if (url.startsWith('http')) {
      setScraping(true);
      setError(null);
      
      try {
        const response = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setFormData(prev => ({
            ...prev,
            link: url,
            title: result.data.title || prev.title,
            description: result.data.description || prev.description,
            price: result.data.price?.toString() || prev.price,
            comparisonPrice: result.data.comparisonPrice?.toString() || prev.comparisonPrice,
            imageUrl: result.data.imageUrl || prev.imageUrl
          }));
        }
      } catch (err) {
        console.error('Failed to scrape URL:', err);
      } finally {
        setScraping(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!formData.title || !formData.description || !formData.price || !formData.link) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          userId: 'temp-user-id',
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create deal');
      }
      
      if (result.success) {
        setIsModalOpen(false);
        setFormData({ title: '', description: '', price: '', comparisonPrice: '', imageUrl: '', link: '' });
        window.location.reload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePreview = (url: string) => {
    if (url) {
      const img = new Image();
      img.onerror = () => setError('Invalid image URL');
      img.src = url;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-8 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
      >
        + Create New Deal
      </button>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background p-6 rounded-xl w-full max-w-md shadow-xl border border-border"
            >
              <h2 className="text-2xl font-bold mb-6 text-foreground">Create New Deal</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="url"
                    placeholder="Paste product URL to auto-fill details"
                    className="w-full p-2 border rounded"
                    value={formData.link}
                    onChange={(e) => handleLinkChange(e.target.value)}
                  />
                  {detectedStore && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-secondary px-2 py-1 rounded-full text-sm">
                      {detectedStore}
                    </div>
                  )}
                  {scraping && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Title"
                  className="w-full p-2 border rounded"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
                <textarea
                  placeholder="Description"
                  className="w-full p-2 border rounded"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
                  <input
                    type="url"
                    placeholder="Image URL"
                    className="w-full p-2 border rounded"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      const url = e.target.value;
                      setFormData({...formData, imageUrl: url});
                      handleImagePreview(url);
                    }}
                  />
                  {formData.imageUrl && (
                    <div className="mt-2 relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="object-cover w-full h-full"
                        onError={() => setError('Failed to load image')}
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Deal Price</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Your price"
                      className="w-full p-2 border rounded"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Regular Price</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Compare to"
                      className="w-full p-2 border rounded"
                      value={formData.comparisonPrice}
                      onChange={(e) => setFormData({...formData, comparisonPrice: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-foreground/70 hover:bg-secondary rounded-lg transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Deal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
