/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, ShoppingBag, ArrowLeft, Tag, Clock, Truck, ShieldCheck, MapPin, Wallet, Package, Plus, Share2, Coins, Sparkles, TrendingUp } from 'lucide-react';
import { Card, Button, Input, Badge, BannerAdSlot } from '../components/UI';
import { AppState, OrderStatus, Coupon, Order } from '../types';
import { dbService } from '../dbService';

const ShopHome = ({ state }: { state: AppState }) => {
  const navigate = useNavigate();
  const categories = [
    { name: 'Groceries', icon: '🛒' },
    { name: 'Snacks', icon: '🥨' },
    { name: 'Cosmetics', icon: '💅' },
    { name: 'Electronics', icon: '🔌' },
    { name: 'Clothing', icon: '👕' },
    { name: 'Furniture', icon: '🏠' },
  ];

  const cartCount = useMemo(() => {
    const saved = localStorage.getItem('cart_items');
    if (!saved) return 0;
    const items = JSON.parse(saved);
    return items.reduce((acc: number, item: any) => acc + item.quantity, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-[#FFC107] p-8 pb-12 rounded-b-[40px] shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-[#37474F]">Shop</h2>
            <p className="text-[#37474F]/70 text-xs font-bold uppercase tracking-wider">Premium Quality Products</p>
          </div>
          <button onClick={() => navigate('/shop/cart')} className="relative w-14 h-14 bg-white/20 backdrop-blur-md rounded-[20px] flex items-center justify-center border border-white/30 transition-transform active:scale-95 shadow-sm">
            <ShoppingBag size={24} className="text-[#37474F]" />
            {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#37474F] text-[#FFC107] rounded-full border-2 border-[#FFC107] text-[10px] flex items-center justify-center font-black">
                    {cartCount}
                </span>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 -mt-8 space-y-8 pb-32">
        <div className="relative transform hover:scale-[1.01] transition-transform shadow-xl rounded-2xl">
          <Input placeholder="Search items @ ৳1-99..." icon={Search} className="border-none" />
        </div>

        {/* Flash Giveaway Banner */}
        <Card className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-[48px] border-none shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
           <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 w-fit rounded-full">
                 <Sparkles size={12} className="text-[#FFC107]" />
                 <span className="text-[8px] font-black text-white uppercase tracking-widest">Flash Giveaway</span>
              </div>
              <div className="space-y-1">
                 <h3 className="text-xl font-black text-white leading-tight uppercase">Win a Samsung S24!</h3>
                 <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Entry fee: ৳10 • Ends in 2 hours</p>
              </div>
              <Button onClick={() => alert('Entry successful!')} className="w-full h-12 bg-[#FFC107] text-[#37474F] rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Join Raffle</Button>
           </div>
        </Card>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h4 className="font-extrabold text-[#37474F] text-sm uppercase tracking-widest italic underline decoration-[#FFC107] decoration-4 underline-offset-4">Categories</h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate(`/shop/category/${cat.name}`)}
                className="bg-white p-5 rounded-[32px] flex flex-col items-center gap-2 shadow-sm border border-gray-50 active:scale-95 transition-transform"
              >
                <span className="text-3xl filter transition-transform hover:scale-125">{cat.icon}</span>
                <span className="text-[9px] font-black uppercase text-[#37474F] tracking-tighter">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h4 className="font-extrabold text-[#37474F] text-sm uppercase tracking-widest italic underline decoration-[#FFC107] decoration-4 underline-offset-4">Hot Deals</h4>
            <span className="bg-[#FFC107] text-[#37474F] text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Limited ৳99</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-2 px-2">
            {state.products.filter(p => p.status === 'approved').map((product) => (
               <Card key={product.id} className="min-w-[180px] p-3 space-y-3 rounded-[32px] border border-gray-50 shadow-md group" onClick={() => navigate(`/shop/product/${product.id}`)}>
                  <div className="h-32 overflow-hidden rounded-[24px] bg-gray-50 flex items-center justify-center relative">
                     <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                     <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full text-[12px] font-black text-[#37474F] shadow-sm border border-gray-100">৳{product.price}</div>
                  </div>
                  <div className="px-1">
                    <h5 className="text-[11px] font-black text-[#37474F] line-clamp-1 uppercase tracking-tight">{product.name}</h5>
                    <p className="text-[9px] text-[#FFC107] font-black uppercase tracking-widest">{product.category}</p>
                  </div>
               </Card>
            ))}
          </div>
        </div>

        {/* Banner Ad at bottom of Shop Home */}
        <div className="py-4 pb-12">
          <BannerAdSlot state={state} />
        </div>
      </div>
    </div>
  );
};

const ProductList = ({ state }: { state: AppState }) => {
  const { cat } = useParams();
  const navigate = useNavigate();
  const products = state.products.filter(p => p.category === cat && p.status === 'approved');

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white p-6 pb-10 flex items-center gap-4 rounded-b-[40px] shadow-sm z-10">
        <button onClick={() => navigate('/shop')} className="p-3 bg-gray-50 rounded-2xl shadow-sm transition-transform active:scale-95"><ArrowLeft size={20} /></button>
        <div>
           <h2 className="text-xl font-black text-[#37474F] uppercase tracking-tight">{cat}</h2>
           <p className="text-[9px] font-black text-[#FFC107] uppercase tracking-widest">Handpicked for you</p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-2 gap-4">
        {products.map((product) => (
           <Card key={product.id} className="p-3 space-y-3 rounded-3xl border border-gray-50 group" onClick={() => navigate(`/shop/product/${product.id}`)}>
                <div className="h-40 overflow-hidden rounded-[24px] relative bg-gray-50">
                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           const items = JSON.parse(localStorage.getItem('cart_items') || '[]');
                           const existing = items.find((i: any) => i.id === product.id);
                           if (existing) existing.quantity++;
                           else items.push({ id: product.id, quantity: 1 });
                           localStorage.setItem('cart_items', JSON.stringify(items));
                           alert('Added to cart!');
                         }}
                         className="p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg text-[#FFC107] hover:scale-110 active:scale-95 transition-all"
                       >
                         <Plus size={16} strokeWidth={3} />
                       </button>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-md p-2 rounded-xl flex justify-between items-center shadow-sm">
                       <div className="flex flex-col">
                          <span className="text-base font-black text-[#37474F]">৳{dbService.getDynamicPrice(product)}</span>
                          <span className="text-[7px] text-gray-400 font-bold uppercase line-through leading-none">৳{product.price}</span>
                       </div>
                       <span className="text-[8px] text-[#FFC107] font-black uppercase text-right">{product.stock} left</span>
                    </div>
                </div>
                <h5 className="text-[10px] font-black text-[#37474F] line-clamp-1 uppercase px-1 leading-tight">{product.name}</h5>
                <Button className="w-full h-10 text-[9px] font-black uppercase tracking-widest rounded-2xl" variant="secondary">Add To Cart</Button>
           </Card>
        ))}
      </div>
    </div>
  );
};

const ProductDetail = ({ state }: { state: AppState }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adTimeLeft, setAdTimeLeft] = useState(5);
  const product = state.products.find(p => p.id === id);

  if (!product) return <div className="p-12 text-center font-bold">Product not found</div>;

  const isOwner = product.sellerId === state.currentUser?.id;
  const isAdmin = state.currentUser?.isAdmin;
  const isApproved = product.status === 'approved';

  if (!isApproved && !isOwner && !isAdmin) {
    return <div className="p-12 text-center font-bold">This product is pending approval</div>;
  }

  const user = state.currentUser!;
  const currentPrice = dbService.getDynamicPrice(product);
  const hasEnough = user.balance >= currentPrice;

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out this product on EarnShop: ${product.name} at only ৳${product.price}!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Product link copied to clipboard!');
      }
    } catch (err) {
      console.error('Sharing failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="relative h-[40vh]">
        <img src={product.image} className="w-full h-full object-cover" />
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <button onClick={() => navigate('/shop')} className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white"><ArrowLeft size={24} /></button>
          <div className="flex gap-3">
            <button 
              onClick={handleShare}
              className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white transition-transform active:scale-90"
            >
              <Share2 size={24} />
            </button>
            <button 
              onClick={() => navigate('/shop/cart')}
              className="p-3 bg-[#FFC107] rounded-2xl text-[#37474F] shadow-lg transition-transform active:scale-95"
            >
              <ShoppingBag size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 -mt-8 bg-white rounded-t-[40px] p-8 space-y-6 relative shadow-2xl">
        <div className="space-y-1">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[#FFC107] uppercase tracking-widest">{product.category}</span>
            <div className="flex items-center gap-1 text-green-500 text-[10px] font-black uppercase">
              <ShieldCheck size={12} /> In Stock
            </div>
          </div>
          <h1 className="text-3xl font-black text-[#37474F]">{product.name}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-gray-100 px-4 py-2 rounded-2xl flex flex-col">
             <span className="text-2xl font-black text-[#37474F]">৳{currentPrice}</span>
             <span className="text-[8px] font-bold text-gray-400 uppercase line-through">৳{product.price}</span>
          </div>
          <p className="text-gray-400 text-xs font-medium">Inclusive of all local taxes. Pay with your EarnShop balance.</p>
        </div>

        <div className="space-y-4">
          <h4 className="font-extrabold text-[#37474F]">Description</h4>
          <p className="text-gray-500 font-medium leading-relaxed italic border-l-4 border-[#FFC107] pl-4">
            {product.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-orange-50 p-4 rounded-2xl flex items-center gap-3">
             <Clock className="text-[#FFC107]" size={20} />
             <div className="text-[10px] font-bold text-orange-800">2h Fast Delivery</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-2xl flex items-center gap-3">
             <Truck className="text-blue-500" size={20} />
             <div className="text-[10px] font-bold text-blue-800">Cash on Delivery</div>
          </div>
        </div>
      </div>

      <div className="p-8 pb-12 flex flex-col gap-4">
        {/* Special Actions */}
        <div className="grid grid-cols-1 gap-4 mb-2">
           <button 
             onClick={() => navigate('/tasks')}
             className="bg-blue-50 p-4 rounded-2xl flex flex-col items-center gap-1 border border-blue-100 active:scale-95 transition-transform"
           >
              <Coins className="text-blue-500" size={24} />
              <span className="text-[8px] font-black uppercase text-blue-600">Earn to Buy</span>
              <span className="text-[7px] font-bold text-blue-400">Complete Tasks</span>
           </button>
        </div>

        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="flex-1 h-16 rounded-2xl font-black text-[10px] uppercase tracking-widest border-gray-100"
            onClick={() => {
              const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
              if (!wishlist.includes(product.id)) {
                  wishlist.push(product.id);
                  localStorage.setItem('wishlist', JSON.stringify(wishlist));
                  alert('Added to wishlist!');
              }
            }}
          >
            Wishlist
          </Button>
          <Button 
            onClick={() => {
              if (!hasEnough) {
                if (confirm('Insufficient balance. Earn now?')) {
                  navigate('/tasks');
                }
                return;
              }
              const items = JSON.parse(localStorage.getItem('cart_items') || '[]');
              const existing = items.find((i: any) => i.id === product.id);
              if (existing) {
                  existing.quantity++;
                  existing.price = currentPrice; // Update to latest price
              } else {
                  items.push({ id: product.id, quantity: 1, price: currentPrice });
              }
              localStorage.setItem('cart_items', JSON.stringify(items));
              navigate('/shop/cart');
            }} 
            className={`flex-[2] h-16 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-100 ${!hasEnough ? 'opacity-50' : ''}`}
          >
            {hasEnough ? 'Buy Now' : 'Low Balance'}
          </Button>
        </div>
      </div>

      {/* Ad Overlay Removed */}
    </div>
  );
};

const Cart = ({ state, onOrder }: { state: AppState; onOrder: () => void }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<{ id: string; quantity: number; discount?: number; price?: number }[]>(() => {
    const saved = localStorage.getItem('cart_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const deliveryCharge = 120;

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  const cartProducts = items.map(item => {
    const product = state.products.find(p => p.id === item.id);
    if (!product) return null;
    return { ...product, quantity: item.quantity };
  }).filter(Boolean) as any[];

  const subtotal = cartProducts.reduce((acc, p) => {
    const item = items.find(i => i.id === p.id);
    const price = item?.price || p.price;
    const itemDiscount = item?.discount || 0;
    return acc + (price - itemDiscount) * p.quantity;
  }, 0);
  
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.minSpend && subtotal < appliedCoupon.minSpend) {
        return 0;
    }
    if (appliedCoupon.discountType === 'fixed') return appliedCoupon.value;
    return Math.floor((subtotal * appliedCoupon.value) / 100);
  }, [appliedCoupon, subtotal]);

  const total = subtotal + deliveryCharge - discount;

  const handleApplyCoupon = () => {
    const coupon = state.coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    if (coupon) {
      if (coupon.minSpend && subtotal < coupon.minSpend) {
        alert(`Minimum spend of ৳${coupon.minSpend} required`);
      } else {
        setAppliedCoupon(coupon);
        alert('Coupon applied!');
      }
    } else {
      alert('Invalid coupon code');
    }
  };

  const handleCheckout = () => {
    if (cartProducts.length === 0) return;
    navigate('/shop/checkout', { 
        state: { 
            orderItems: cartProducts.map(p => ({ productId: p.id, quantity: p.quantity, price: p.price })),
            subtotal,
            deliveryCharge,
            discount,
            total
        } 
    });
  };

  return (
    <div className="p-6 pb-32 space-y-8 bg-white min-h-screen">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/shop')} className="p-2 bg-gray-50 rounded-xl"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black text-[#37474F]">Shopping Cart</h2>
      </div>

      <div className="space-y-4">
        {cartProducts.length === 0 ? (
          <div className="py-20 text-center text-gray-300 font-black uppercase text-xs tracking-widest flex flex-col items-center gap-4">
            <ShoppingBag size={48} className="opacity-10" />
            Your cart is empty
          </div>
        ) : (
          cartProducts.map((p) => (
            <Card key={p.id} className="p-3 flex gap-4 border border-gray-50 shadow-none rounded-[1.5rem]">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
                <img src={p.image} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <h5 className="font-bold text-[#37474F] text-sm">{p.name}</h5>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-[#FFC107]">৳{items.find(i => i.id === p.id)?.price || p.price}</span>
                    {items.find(i => i.id === p.id)?.discount && (
                      <span className="text-[9px] font-black text-green-500 uppercase">-৳{items.find(i => i.id === p.id)?.discount} Watch Bonus</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                    <button 
                      onClick={() => {
                        const newItems = items.map(i => i.id === p.id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i).filter(i => i.quantity > 0);
                        setItems(newItems);
                      }}
                      className="w-6 h-6 flex items-center justify-center font-black"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold">{p.quantity}</span>
                    <button 
                      onClick={() => {
                        const newItems = items.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
                        setItems(newItems);
                      }}
                      className="w-6 h-6 flex items-center justify-center font-black"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {cartProducts.length > 0 && (
        <>
            <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Have a coupon?</h4>
                <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="ENTER CODE" 
                      className="flex-1 bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold uppercase focus:ring-2 focus:ring-[#FFC107]"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button onClick={handleApplyCoupon} className="px-6 h-12 rounded-2xl text-[10px]">APPLY</Button>
                </div>
                {appliedCoupon && (
                   <div className="text-[10px] font-bold text-green-500 uppercase px-2">Coupon "{appliedCoupon.code}" Applied!</div>
                )}
            </div>

            <Card className="space-y-4 shadow-2xl shadow-orange-100 p-8 rounded-[2.5rem] border-none bg-white">
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="font-bold text-gray-400">Subtotal</span>
                        <span className="font-black text-[#37474F]">৳{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="font-bold text-gray-400">Delivery Fee</span>
                        <span className="font-black text-[#37474F]">৳{deliveryCharge}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-green-500">Discount</span>
                            <span className="font-black text-green-500">-৳{discount}</span>
                        </div>
                    )}
                    <div className="h-px bg-gray-100 my-2" />
                    <div className="flex justify-between items-center">
                        <div>
                          <span className="font-black text-[#37474F] text-lg block leading-none">Total</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Incl. all taxes</span>
                        </div>
                        <span className="font-black text-[#FFC107] text-2xl">৳{total}</span>
                    </div>
                </div>
                <Button onClick={handleCheckout} className="w-full h-16 rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-xl shadow-orange-100 mt-2">
                    Proceed to Checkout
                </Button>
            </Card>
        </>
      )}
    </div>
  );
};

const Checkout = ({ state, onOrder }: { state: AppState; onOrder: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const checkoutData = location.state as any;
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(state.currentUser?.phone || '');
  const [method, setMethod] = useState<'wallet' | 'cod'>('cod');
  const [loading, setLoading] = useState(false);

  if (!checkoutData) return <Navigate to="/shop/cart" />;

  const handleOrder = async () => {
    if (!address) return alert('Please enter delivery address');
    if (!phone) return alert('Please enter mobile number');
    setLoading(true);
    try {
      const orderData: Partial<Order> = {
        userId: state.currentUser!.id,
        items: checkoutData.orderItems,
        totalPrice: checkoutData.total,
        deliveryCharge: checkoutData.deliveryCharge,
        discount: checkoutData.discount,
        address,
        phone,
        paymentMethod: method,
        status: OrderStatus.PENDING,
        createdAt: new Date().toISOString()
      };

      const success = await dbService.createOrder(orderData, state.currentUser!);
      
      if (success) {
        localStorage.removeItem('cart_items');
        onOrder();
        alert('Order Placed Successfully!');
        navigate('/shop');
      } else {
        alert('Insufficient Wallet Balance!');
      }
    } catch (err) {
      console.error(err);
      alert('Error placing order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
       <div className="p-6 bg-white flex items-center gap-4 border-b border-gray-100">
        <button onClick={() => navigate('/shop/cart')} className="p-2 bg-gray-50 rounded-xl"><ArrowLeft size={20} /></button>
        <span className="text-sm font-black uppercase tracking-wider text-gray-900">Checkout</span>
      </div>

      <div className="p-6 space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Mobile Number</label>
          <Input 
            placeholder="017xxxxxxxx" 
            className="w-full bg-white border border-gray-100 rounded-3xl p-6 h-14 text-sm font-bold focus:ring-2 focus:ring-[#FFC107] outline-none shadow-sm transition-all"
            value={phone}
            onChange={(val) => setPhone(val)}
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Delivery Address</label>
          <textarea 
            placeholder="House #, Street #, Area, City" 
            className="w-full bg-white border border-gray-100 rounded-3xl p-6 text-sm font-bold min-h-[140px] focus:ring-2 focus:ring-[#FFC107] outline-none shadow-sm transition-all"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Payment Method</label>
          <div className="grid grid-cols-2 gap-4">
            <button
               onClick={() => setMethod('cod')}
               className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${method === 'cod' ? 'border-[#FFC107] bg-orange-50' : 'bg-white border-white'}`}
            >
              <div className={`p-3 rounded-full ${method === 'cod' ? 'bg-[#FFC107] text-[#37474F]' : 'bg-gray-100 text-gray-400'}`}>
                <ShoppingBag size={20} />
              </div>
              <span className="text-[10px] font-black uppercase">Cash on Delivery</span>
            </button>

            <button
               onClick={() => setMethod('wallet')}
               className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${method === 'wallet' ? 'border-[#FFC107] bg-orange-50' : 'bg-white border-white'}`}
            >
              <div className={`p-3 rounded-full ${method === 'wallet' ? 'bg-[#FFC107] text-[#37474F]' : 'bg-gray-100 text-gray-400'}`}>
                <Wallet size={20} />
              </div>
              <span className="text-[10px] font-black uppercase">Pay with Wallet</span>
            </button>
          </div>
        </div>

        <div className="bg-[#37474F] p-8 rounded-[3rem] text-white space-y-6 shadow-2xl">
           <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-400">
                <span>Total Amount</span>
                <span>৳{checkoutData.total}</span>
              </div>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Security verified by EarnShop Shield™</p>
           </div>
           <Button 
             disabled={loading}
             onClick={handleOrder} 
             className="w-full h-16 rounded-2xl bg-[#FFC107] text-[#37474F] text-sm font-black uppercase tracking-widest shadow-xl shadow-orange-950/20"
           >
             {loading ? 'Processing...' : 'Confirm Order'}
           </Button>
        </div>
      </div>
    </div>
  );
};

const OrderList = ({ state }: { state: AppState }) => {
  const navigate = useNavigate();
  const orders = state.orders;

  return (
    <div className="p-6 pb-32 space-y-8 bg-white min-h-screen">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/profile')} className="p-2 bg-gray-50 rounded-xl"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black text-[#37474F]">My Orders</h2>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="py-20 text-center text-gray-300 font-black uppercase text-xs tracking-widest flex flex-col items-center gap-4">
            <ShoppingBag size={48} className="opacity-10" />
            No orders yet
          </div>
        ) : (
          orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order) => (
            <Card key={order.id} className="p-5 space-y-4 border border-gray-50 shadow-none rounded-[2rem]">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order ID</div>
                  <div className="text-xs font-black text-gray-900">#{order.id.slice(-8).toUpperCase()}</div>
                </div>
                <Badge className={`border-none rounded-full px-4 py-1 text-[8px] font-black uppercase tracking-tighter ${
                  order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-600' :
                  order.status === OrderStatus.SHIPPED ? 'bg-blue-100 text-blue-600' :
                  order.status === OrderStatus.REJECTED ? 'bg-red-100 text-red-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {order.status}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                 <div className="flex -space-x-3 overflow-hidden">
                    {order.items.slice(0, 3).map((item, i) => {
                       const p = state.products.find(prod => prod.id === item.productId);
                       return <img key={i} src={p?.image} className="w-8 h-8 rounded-full border-2 border-white object-cover" />;
                    })}
                 </div>
                 <div className="text-[10px] font-bold text-gray-400">
                    {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                 </div>
              </div>

              <div className="h-[1px] bg-gray-50" />

              <div className="flex justify-between items-center">
                 <div className="text-sm font-black text-[#FFC107]">৳{order.totalPrice}</div>
                 <Button 
                   variant="ghost" 
                   className="text-[10px] font-black uppercase tracking-widest text-blue-500 h-8 p-0"
                   onClick={() => navigate(`/shop/order-tracking/${order.id}`)}
                 >
                   Details
                 </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const Tracking = ({ state }: { state: AppState }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const order = state.orders.find(o => o.id === id);

  if (!order) return <Navigate to="/shop" />;

  const steps = [
    { label: 'Order Placed', status: true, time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    { label: 'Processing', status: order.status !== OrderStatus.PENDING, time: '--:--' },
    { label: 'Shipped', status: [OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status), time: '--:--' },
    { label: 'Delivered', status: order.status === OrderStatus.DELIVERED, time: '--:--' },
  ];

  return (
    <div className="p-6 space-y-12 bg-white min-h-screen">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-xl"><ArrowLeft size={20} /></button>
        <span className="text-sm font-black uppercase tracking-wider text-gray-900">Order Tracking</span>
      </div>

      <div className="flex flex-col items-center justify-center pt-8">
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 bg-[#FFC107]/10 rounded-full flex items-center justify-center p-6 relative mb-8"
        >
            <Truck size={64} className="text-[#FFC107]" />
            {order.status === OrderStatus.SHIPPED && (
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, type: 'tween' }}
                    className="absolute -top-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg"
                >
                    <Package size={16} />
                </motion.div>
            )}
        </motion.div>

        <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl font-black text-[#37474F] capitalize">{order.status}</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Order ID: #{order.id.slice(-8).toUpperCase()}</p>
        </div>

        {(order.carrier || order.trackingNumber || order.estimatedDeliveryDate) && (
          <Card className="w-full p-6 space-y-4 rounded-3xl border border-gray-100 bg-gray-50/30 shadow-none mb-8">
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Truck size={12} /> Shipping details
             </h4>
             <div className="grid grid-cols-2 gap-4">
                {order.carrier && (
                  <div>
                    <div className="text-[9px] font-black text-gray-400 uppercase">Carrier</div>
                    <div className="text-xs font-black text-[#37474F]">{order.carrier}</div>
                  </div>
                )}
                {order.trackingNumber && (
                  <div>
                    <div className="text-[9px] font-black text-gray-400 uppercase">Tracking #</div>
                    <div className="text-xs font-black text-[#37474F]">{order.trackingNumber}</div>
                  </div>
                )}
                {order.estimatedDeliveryDate && (
                  <div className="col-span-2 pt-2 border-t border-gray-100">
                    <div className="text-[9px] font-black text-gray-400 uppercase">Est. Delivery</div>
                    <div className="text-sm font-black text-[#FFC107]">{new Date(order.estimatedDeliveryDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                )}
             </div>
          </Card>
        )}

        <div className="w-full space-y-6 relative">
            <div className="absolute left-[14px] top-2 bottom-6 w-[2px] bg-gray-100" />
            {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-6 relative z-10">
                <div className={`w-2 h-2 rounded-full outline outline-[6px] transition-all ${
                    step.status ? 'bg-green-500 outline-green-50' : 'bg-gray-300 outline-gray-50'
                }`} />
                <div className={`flex-1 flex justify-between items-center p-4 rounded-3xl border transition-all ${
                    step.status ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50/50 border-transparent opacity-50'
                }`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${step.status ? 'text-[#37474F]' : 'text-gray-400'}`}>{step.label}</span>
                <span className="text-[8px] font-bold text-gray-300">{step.time}</span>
                </div>
            </div>
            ))}
        </div>
      </div>

      <Button variant="outline" onClick={() => navigate('/shop')} className="w-full h-14 rounded-2xl border-gray-100 text-gray-400 mt-12 font-black uppercase text-[10px] tracking-widest">Continue Shopping</Button>
    </div>
  );
};

export default { Home: ShopHome, List: ProductList, ProductDetail, Cart, Checkout, Tracking, OrderList };
