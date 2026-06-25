/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, DollarSign, Image as ImageIcon, Plus } from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { AppState } from '../types';
import { dbService } from '../dbService';

export default function SellerAddProductScreen({ state }: { state: AppState }) {
  const navigate = useNavigate();
  const user = state.currentUser!;
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('My Shop');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddProduct = async () => {
    if (!name || !price || !imageUrl) return alert('Please fill required fields');
    setLoading(true);
    try {
      // 1. Add to global products (or seller-specific if we separate them)
      await dbService.addProduct({
        name,
        description,
        price: Number(price),
        category,
        image: imageUrl,
        stock: 99,
        sellerId: user.id,
        status: 'pending'
      } as any);

      alert('Product submitted! It will be visible once an Admin approves it.');
      navigate('/my-shop');
    } catch (err) {
      console.error(err);
      alert('Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-6 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={24} className="text-[#37474F]" />
          </button>
          <h1 className="text-xl font-black text-[#37474F] uppercase tracking-tight">Add New Product</h1>
        </div>
      </div>

      <div className="p-6 space-y-6 pb-24">
        <Card className="p-8 space-y-6 border-none shadow-2xl rounded-[40px] bg-white">
           <div className="space-y-4">
              <Input 
                label="Product Name" 
                placeholder="e.g. Trendy Cotton T-Shirt" 
                icon={Package}
                value={name}
                onChange={setName}
              />
              
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Description</label>
                 <textarea
                   placeholder="Tell customers about your product..."
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 text-sm focus:bg-white focus:border-[#FFC107] outline-none h-32 transition-all resize-none"
                 />
              </div>

              <Input 
                label="Price (BDT)" 
                placeholder="e.g. 250" 
                icon={DollarSign}
                type="number"
                value={price}
                onChange={setPrice}
              />

              <Input 
                label="Image URL" 
                placeholder="Paste product image link" 
                icon={ImageIcon}
                value={imageUrl}
                onChange={setImageUrl}
              />
              
              {imageUrl && (
                <div className="aspect-square w-32 rounded-3xl overflow-hidden border-2 border-gray-100 mx-auto">
                   <img src={imageUrl} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')} />
                </div>
              )}
           </div>

           <Button 
             onClick={handleAddProduct}
             isLoading={loading}
             className="w-full h-16 rounded-[24px] shadow-xl shadow-[#FFC107]/20"
           >
             List Product
           </Button>
        </Card>
      </div>
    </div>
  );
}
