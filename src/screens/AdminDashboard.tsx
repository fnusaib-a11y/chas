/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Users,
  CreditCard,
  ShoppingBag,
  CheckCircle,
  XCircle,
  ChevronRight,
  TrendingUp,
  Settings,
  ArrowLeft,
  Plus,
  Trash2,
  Package,
  Layers,
  Bell,
  HelpCircle,
  Sparkles,
  Loader2,
  Zap,
  Edit2,
  Wrench,
  Truck,
  BookOpen,
  MapPin,
  Clock,
  ShieldCheck,
  GraduationCap,
  Trophy,
  Terminal,
} from "lucide-react";
import {
  AppState,
  User,
  Withdrawal,
  Order,
  OrderStatus,
  Task,
  Product,
  TaskType,
  Coupon,
  GlobalNotification,
  TaskLog,
  Mission,
  Post,
  SecretDeal,
  ServiceProvider,
  ServiceBooking,
  CourierOrder,
  StudentResource,
} from "../types";
import { Card, Button, Badge, Input, Textarea } from "../components/UI";
import { dbService } from "../dbService";
import { generateProductImage } from "../services/geminiService";
import { resizeBase64Image } from "../lib/imageUtils";
import { ImagePicker } from "../components/ImagePicker";

interface AdminDashboardProps {
  state: AppState;
}

export default function AdminDashboard({ state }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<
    | "users"
    | "withdrawals"
    | "recharges"
    | "orders"
    | "tasks"
    | "products"
    | "coupons"
    | "notifications"
    | "task-review"
    | "product-review"
    | "settings"
    | "faqs"
    | "missions"
    | "community"
    | "deals"
    | "service-hub"
    | "logistics-hub"
    | "education-hub"
    | "referrals"
    | "kyc"
    | "banners"
  >("withdrawals");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form states
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    price: 0,
    category: "Groceries",
    stock: 100,
    image: "https://images.unsplash.com/photo-1518977676601-b53f02bad675?w=400",
  });
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    type: TaskType.LINK,
    reward: 1,
    category: "Link",
    url: "",
    adCode: "",
    minDurationRequired: 30,
  });
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: "",
    discountType: "fixed",
    value: 0,
    minSpend: 0,
  });
  const [newNotif, setNewNotif] = useState<Partial<GlobalNotification>>({
    title: "",
    message: "",
    type: "info",
    imageUrl: "",
    showAsPopup: false,
  });
  const [newFAQ, setNewFAQ] = useState({ question: "", answer: "", order: 0 });
  const [newMission, setNewMission] = useState<Partial<Mission>>({
    title: "",
    description: "",
    reward: 1,
    goal: 5,
    type: "tasks",
    status: "active",
  });
  const [newDeal, setNewDeal] = useState<Partial<SecretDeal>>({
    title: "",
    description: "",
    price: 0,
    originalPrice: 0,
    stock: 10,
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400",
  });
  const [newServiceProvider, setNewServiceProvider] = useState<
    Partial<ServiceProvider>
  >({
    name: "",
    category: "plumber",
    rating: 5,
    reviewsCount: 0,
    basePrice: 500,
    availability: true,
    isVerified: true,
    bio: "",
    location: { address: "Dhaka" },
  });
  const [newStudentResource, setNewStudentResource] = useState<
    Partial<StudentResource>
  >({
    title: "",
    description: "",
    price: 0,
    type: "Note",
    category: "Science",
    userName: "Admin",
  });
  const [newBanner, setNewBanner] = useState<{
    id?: string;
    imageUrl: string;
    targetUrl: string;
    title: string;
  }>({ imageUrl: "", targetUrl: "", title: "" });
  const [targetUser, setTargetUser] = useState<Partial<User>>({
    name: "",
    balance: 0,
    isAdmin: false,
  });
  const [localSettings, setLocalSettings] = useState(state.settings);

  // Custom modals/prompts for robust iframe-compatible interactions
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [customConfirm, setCustomConfirm] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [promptInput, setPromptInput] = useState<{
    title: string;
    message: string;
    defaultValue: string;
    placeholder: string;
    onSubmit: (val: string) => void;
  } | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const [adminKycLightboxImg, setAdminKycLightboxImg] = useState<string | null>(
    null,
  );

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
  ) => {
    setCustomConfirm({ title, message, onConfirm });
  };

  const showPrompt = (
    title: string,
    message: string,
    defaultValue: string,
    placeholder: string,
    onSubmit: (val: string) => void,
  ) => {
    setPromptValue(defaultValue);
    setPromptInput({ title, message, defaultValue, placeholder, onSubmit });
  };

  useEffect(() => {
    if (editingItem) {
      if (tab === "tasks") setNewTask(editingItem);
      if (tab === "products") setNewProduct(editingItem);
      if (tab === "missions") setNewMission(editingItem);
      if (tab === "deals") setNewDeal(editingItem);
      if (tab === "faqs") setNewFAQ(editingItem);
      if (tab === "coupons") setNewCoupon(editingItem);
      if (tab === "notifications") setNewNotif(editingItem);
      if (tab === "users") setTargetUser(editingItem);
      if (tab === "service-hub") setNewServiceProvider(editingItem);
      if (tab === "education-hub") setNewStudentResource(editingItem);
      if (tab === "banners") setNewBanner(editingItem);
    }
  }, [editingItem, tab]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setNewTask({
      title: "",
      description: "",
      type: TaskType.LINK,
      reward: 1,
      category: "Link",
      url: "",
      adCode: "",
    });
    setNewProduct({
      name: "",
      price: 0,
      category: "Groceries",
      stock: 100,
      image:
        "https://images.unsplash.com/photo-1518977676601-b53f02bad675?w=400",
    });
    setNewMission({
      title: "",
      description: "",
      reward: 1,
      goal: 5,
      type: "tasks",
      status: "active",
    });
    setNewDeal({
      title: "",
      description: "",
      price: 0,
      originalPrice: 0,
      stock: 10,
      image:
        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400",
    });
    setNewFAQ({ question: "", answer: "", order: 0 });
    setNewCoupon({ code: "", discountType: "fixed", value: 0, minSpend: 0 });
    setNewNotif({
      title: "",
      message: "",
      type: "info",
      imageUrl: "",
      showAsPopup: false,
    });
    setNewServiceProvider({
      name: "",
      category: "plumber",
      rating: 5,
      reviewsCount: 0,
      basePrice: 500,
      availability: true,
      isVerified: true,
      bio: "",
      location: { address: "Dhaka" },
    });
    setNewStudentResource({
      title: "",
      description: "",
      price: 0,
      type: "Note",
      category: "Science",
      userName: "Admin",
    });
    setNewBanner({ imageUrl: "", targetUrl: "", title: "" });
    setShowAddModal(true);
  };

  useEffect(() => {
    setLocalSettings(state.settings);
  }, [state.settings]);

  const categories = [
    "Groceries",
    "Snacks",
    "Cosmetics",
    "Electronics",
    "Clothing",
    "Furniture",
    "Others",
  ];

  const pendingWithdrawals = state.withdrawals.filter(
    (w) => w.status === "pending",
  );
  const pendingRecharges = state.rechargeRequests.filter(
    (r) => r.status === "pending",
  );
  const pendingOrders = state.orders.filter(
    (o) => o.status === OrderStatus.PENDING,
  );
  const pendingTasks = state.taskLogs.filter((l) => l.status === "pending");
  const pendingProducts = state.products.filter((p) => p.status === "pending");
  const totalPendingAmount = pendingWithdrawals.reduce(
    (sum, w) => sum + w.amount,
    0,
  );

  const stats = [
    {
      label: "Total Users",
      value: state.users.length,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Pending Payout",
      value: `৳${totalPendingAmount}`,
      icon: CreditCard,
      color: "bg-orange-500",
    },
    {
      label: "Pending Tasks",
      value: pendingTasks.length,
      icon: CheckCircle,
      color: "bg-green-500",
    },
  ];

  const handleUpdateWithdrawal = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    try {
      await dbService.updateWithdrawalStatus(id, status);
      alert(`Withdrawal ${status}`);
    } catch (err) {
      alert("Error updating withdrawal");
    }
  };

  const handleUpdateOrderStatus = async (
    id: string,
    status: OrderStatus,
    extra?: any,
  ) => {
    try {
      await dbService.updateOrderStatus(id, status, extra);
      alert(`Order ${status}`);
    } catch (err) {
      console.error(err);
      alert("Error updating order");
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    if (editingItem) {
      await dbService.updateProduct(editingItem.id, newProduct);
    } else {
      await dbService.addProduct(newProduct as Product);
    }
    setShowAddModal(false);
    setEditingItem(null);
    setNewProduct({
      name: "",
      price: 0,
      category: "Groceries",
      stock: 100,
      image:
        "https://images.unsplash.com/photo-1518977676601-b53f02bad675?w=400",
    });
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.reward) return;
    if (editingItem) {
      await dbService.updateTask(editingItem.id, newTask);
    } else {
      await dbService.addTask(newTask as Task);
    }
    setShowAddModal(false);
    setEditingItem(null);
    setNewTask({
      title: "",
      description: "",
      type: TaskType.LINK,
      reward: 1,
      category: "Link",
      url: "",
      adCode: "",
    });
  };

  const handleAddCoupon = async () => {
    if (!newCoupon.code || !newCoupon.value) return;
    if (editingItem) {
      await dbService.updateCoupon(editingItem.id, newCoupon);
    } else {
      await dbService.addCoupon(newCoupon as Coupon);
    }
    setShowAddModal(false);
    setEditingItem(null);
    setNewCoupon({ code: "", discountType: "fixed", value: 0, minSpend: 0 });
  };

  const handleSendNotif = async () => {
    if (!newNotif.title || !newNotif.message) return;
    if (editingItem) {
      await dbService.updateGlobalNotification(editingItem.id, newNotif);
    } else {
      await dbService.sendGlobalNotification({
        ...(newNotif as GlobalNotification),
        createdAt: new Date().toISOString(),
      });
    }
    setShowAddModal(false);
    setEditingItem(null);
    setNewNotif({
      title: "",
      message: "",
      type: "info",
      imageUrl: "",
      showAsPopup: false,
    });
  };

  const handleAddFAQ = async () => {
    if (!newFAQ.question || !newFAQ.answer) return;
    if (editingItem) {
      await dbService.updateFAQ(editingItem.id, newFAQ);
    } else {
      await dbService.addFAQ(newFAQ);
    }
    setShowAddModal(false);
    setEditingItem(null);
    setNewFAQ({ question: "", answer: "", order: 0 });
  };

  const handleAddBanner = async () => {
    if (!newBanner.imageUrl) return;
    if (editingItem) {
      await dbService.updatePromoBanner(editingItem.id, newBanner);
    } else {
      await dbService.addPromoBanner({
        ...newBanner,
        createdAt: new Date().toISOString(),
      });
    }
    setShowAddModal(false);
    setEditingItem(null);
    setNewBanner({ imageUrl: "", targetUrl: "", title: "" });
  };

  const handleGenerateImage = async () => {
    if (!newProduct.name) {
      alert("Please enter a product name first");
      return;
    }
    setIsGenerating(true);
    const imageUrl = await generateProductImage(newProduct.name);
    if (imageUrl) {
      try {
        const compressedImageUrl = await resizeBase64Image(imageUrl);
        setNewProduct({ ...newProduct, image: compressedImageUrl });
      } catch (err) {
        console.error("Error resizing image:", err);
        setNewProduct({ ...newProduct, image: imageUrl }); // Fallback
      }
    } else {
      alert(
        "Failed to generate image. Please check your API key or try again.",
      );
    }
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                Admin Control
              </h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                CASH Ecosystem
              </p>
            </div>
          </div>
          <button className="p-2 bg-gray-100 rounded-lg text-gray-600">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2"
            >
              <div
                className={`${stat.color} w-8 h-8 rounded-lg flex items-center justify-center`}
              >
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-xl font-black text-gray-900">
                {stat.value}
              </div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 flex gap-2 overflow-x-auto bg-white border-b border-gray-100">
        {[
          {
            id: "referrals",
            label: "Referrals (সাকসেস)",
            icon: Users,
            count: state.users.filter((u) => u.referralStatus === "pending")
              .length,
          },
          {
            id: "withdrawals",
            label: "Withdrawals",
            icon: CreditCard,
            count: pendingWithdrawals.length,
          },
          {
            id: "kyc",
            label: "KYC Requests",
            icon: ShieldCheck,
            count: state.users.filter((u) => u.kycStatus === "pending").length,
          },
          {
            id: "recharges",
            label: "Recharges",
            icon: Zap,
            count: pendingRecharges.length,
          },
          {
            id: "task-review",
            label: "Task Review",
            icon: CheckCircle,
            count: pendingTasks.length,
          },
          {
            id: "product-review",
            label: "Shop Approval",
            icon: ShoppingBag,
            count: pendingProducts.length,
          },
          { id: "users", label: "Users", icon: Users },
          {
            id: "orders",
            label: "Orders",
            icon: ShoppingBag,
            count: pendingOrders.length,
          },
          { id: "products", label: "Products", icon: Package },
          { id: "tasks", label: "Tasks", icon: Layers },
          { id: "missions", label: "Missions", icon: Sparkles },
          { id: "community", label: "Feed", icon: Bell },
          { id: "deals", label: "Secret Deals", icon: ShoppingBag },
          { id: "coupons", label: "Coupons", icon: CheckCircle },
          { id: "service-hub", label: "Service Hub", icon: Wrench },
          { id: "logistics-hub", label: "Logistics Hub", icon: Truck },
          { id: "education-hub", label: "Education Hub", icon: BookOpen },
          { id: "faqs", label: "Help Desk", icon: HelpCircle },
          { id: "banners", label: "Ad Banners", icon: Layers },
          { id: "notifications", label: "Broadcast", icon: Bell },
          { id: "settings", label: "Settings", icon: Settings },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all whitespace-nowrap relative ${
              tab === t.id
                ? "bg-[#FFC107] text-white shadow-lg shadow-orange-100"
                : "bg-gray-50 text-gray-400"
            }`}
          >
            <t.icon className="w-3 h-3" />
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] border-2 border-white ${tab === t.id ? "bg-red-500 text-white" : "bg-[#FFC107] text-white"}`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-800 capitalize">
            {tab === "banners" ? "Ad Banners" : tab}
          </h2>
          {[
            "products",
            "tasks",
            "coupons",
            "notifications",
            "faqs",
            "missions",
            "deals",
            "service-hub",
            "education-hub",
            "banners",
          ].includes(tab) && (
            <Button
              onClick={handleOpenAdd}
              className="w-10 h-10 rounded-full flex items-center justify-center p-0"
            >
              <Plus className="w-5 h-5" />
            </Button>
          )}
        </div>

        {tab === "service-hub" && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Wrench size={16} className="text-orange-500" />
                Service Providers
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {state.serviceProviders.length === 0 ? (
                  <p className="text-xs text-gray-400 p-4 bg-white rounded-2xl border border-dashed text-center">
                    No providers added yet. Use the + button to add local
                    experts.
                  </p>
                ) : (
                  state.serviceProviders.map((p) => (
                    <Card
                      key={p.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                          <Wrench size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-900">
                            {p.name}{" "}
                            {p.isVerified && (
                              <Badge className="bg-blue-100 text-blue-600 text-[8px] py-0 px-1">
                                VERIFIED
                              </Badge>
                            )}
                          </h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">
                            {p.category} • ৳{p.basePrice} • Rating: {p.rating}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingItem(p);
                            setShowAddModal(true);
                          }}
                          className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => dbService.deleteServiceProvider(p.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                Service Bookings
              </h3>
              <div className="space-y-3">
                {state.serviceBookings.length === 0 ? (
                  <p className="text-xs text-gray-400 p-4 bg-white rounded-2xl border border-dashed text-center">
                    No active service bookings.
                  </p>
                ) : (
                  state.serviceBookings.map((b) => (
                    <Card key={b.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge
                            className={`${b.status === "completed" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}
                          >
                            {b.status}
                          </Badge>
                          <h4 className="text-sm font-black text-gray-900 mt-2">
                            {b.providerName}
                          </h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">
                            {b.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-gray-900">
                            ৳{b.price}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} /> {b.address}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />{" "}
                          {new Date(b.scheduledAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {b.status === "pending" && (
                          <Button
                            className="flex-1 bg-green-500 h-9 text-[10px]"
                            onClick={() =>
                              dbService.updateServiceBooking(b.id, {
                                status: "accepted",
                              })
                            }
                          >
                            Accept
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          className="flex-1 text-red-500 h-9 text-[10px]"
                          onClick={() => dbService.deleteServiceBooking(b.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "logistics-hub" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Truck size={16} className="text-blue-500" />
                Courier Orders
              </h3>
              <div className="space-y-3">
                {state.courierOrders.length === 0 ? (
                  <p className="text-xs text-gray-400 p-4 bg-white rounded-2xl border border-dashed text-center">
                    No logistics orders yet.
                  </p>
                ) : (
                  state.courierOrders.map((order) => (
                    <Card key={order.id} className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <Badge
                            className={`${order.status === "delivered" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}
                          >
                            {order.status}
                          </Badge>
                          <h4 className="text-sm font-black text-gray-900">
                            {order.recipientName}
                          </h4>
                          <p className="text-[10px] font-black text-blue-500 uppercase">
                            {order.trackingId}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-gray-900">
                            ৳{order.price}
                          </span>
                          <p className="text-[8px] font-bold text-gray-400 uppercase">
                            {order.weight}kg Parcel
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 border-t border-gray-50 pt-4">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <div className="w-0.5 h-4 bg-gray-100" />
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                          </div>
                          <div className="space-y-2 flex-1">
                            <p className="text-[9px] font-bold text-gray-600 truncate">
                              From: {order.pickupAddress}
                            </p>
                            <p className="text-[9px] font-bold text-gray-600 truncate">
                              To: {order.deliveryAddress}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none"
                          value={order.status}
                          onChange={(e) =>
                            dbService.updateCourierOrder(order.id, {
                              status: e.target.value as any,
                            })
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="picked_up">On Way</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        <Button
                          variant="ghost"
                          className="p-2 text-red-500"
                          onClick={() => dbService.deleteCourierOrder(order.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "education-hub" && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-500" />
                Study Resources
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {state.studentResources.length === 0 ? (
                  <p className="text-xs text-gray-400 p-4 bg-white rounded-2xl border border-dashed text-center">
                    No resources uploaded yet.
                  </p>
                ) : (
                  state.studentResources.map((r) => (
                    <Card
                      key={r.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                          <GraduationCap size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-900">
                            {r.title}
                          </h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">
                            {r.type} • {r.category} • ৳{r.price}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingItem(r);
                            setShowAddModal(true);
                          }}
                          className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => dbService.deleteStudentResource(r.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                MCQ Sets
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {state.mcqSets.length === 0 ? (
                  <p className="text-xs text-gray-400 p-4 bg-white rounded-2xl border border-dashed text-center">
                    No MCQ sets created.
                  </p>
                ) : (
                  state.mcqSets.map((set) => (
                    <Card
                      key={set.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                          <CheckCircle size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-900">
                            {set.title}
                          </h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">
                            {set.subject} • {set.questions.length} Questions
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => dbService.deleteMCQSet(set.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4 mt-8">
          <h2 className="text-lg font-black text-gray-800 capitalize">
            General Management
          </h2>
        </div>

        {tab === "settings" && (
          <div className="space-y-6">
            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                    <CheckCircle size={18} />
                  </span>
                  Ads Configuration
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Configure your Start.io advertisement ID here.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                    Start.io App ID
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. 202456789"
                      value={localSettings.startioAppId || ""}
                      onChange={(val: string) => {
                        setLocalSettings({
                          ...localSettings,
                          startioAppId: val,
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                      Banner Ad Unit ID
                    </label>
                    <Input
                      placeholder="e.g. banner_123"
                      value={localSettings.bannerAdUnitId || ""}
                      onChange={(val: string) => {
                        setLocalSettings({
                          ...localSettings,
                          bannerAdUnitId: val,
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                      Interstitial Ad Unit ID
                    </label>
                    <Input
                      placeholder="e.g. interstitial_456"
                      value={localSettings.interstitialAdUnitId || ""}
                      onChange={(val: string) => {
                        setLocalSettings({
                          ...localSettings,
                          interstitialAdUnitId: val,
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="h-px bg-gray-100 my-4" />

                <div className="space-y-2">
                  <h4 className="text-xs font-black text-gray-900 uppercase">
                    Monetag Settings
                  </h4>
                  <p className="text-[10px] font-bold text-gray-400">
                    Put Monetag IDs/Codes here
                  </p>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Monetag General Tag Script"
                    placeholder="Paste main script tag or ID"
                    value={localSettings.monetagId || ""}
                    onChange={(val: string) =>
                      setLocalSettings({ ...localSettings, monetagId: val })
                    }
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Banner Zone ID"
                      placeholder="Zone ID"
                      value={localSettings.monetagBannerZoneId || ""}
                      onChange={(val: string) =>
                        setLocalSettings({
                          ...localSettings,
                          monetagBannerZoneId: val,
                        })
                      }
                    />
                    <Input
                      label="Interstitial Zone ID"
                      placeholder="Zone ID"
                      value={localSettings.monetagInterstitialZoneId || ""}
                      onChange={(val: string) =>
                        setLocalSettings({
                          ...localSettings,
                          monetagInterstitialZoneId: val,
                        })
                      }
                    />
                  </div>
                </div>

                <p className="text-[8px] text-gray-400 font-bold italic">
                  These IDs will be used for ad placements throughout the
                  application.
                </p>

                <Button
                  onClick={async () => {
                    await dbService.updateSettings(localSettings);
                    alert("Ads Configuration Saved!");
                  }}
                  className="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs"
                >
                  Save Ads Config
                </Button>
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
                    <Layers size={18} />
                  </span>
                  Ecosystem Hubs
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Toggle visibility and labels of your hubs.
                </p>
              </div>

              <div className="space-y-6">
                {(
                  [
                    "serviceHub",
                    "logisticsHub",
                    "educationHub",
                    "aiStudio",
                  ] as const
                ).map((hubKey) => {
                  const hub = localSettings.hubs?.[hubKey] || {
                    visible: true,
                    label: "",
                    subLabel: "",
                    icon: "",
                    color: "",
                    bg: "",
                  };
                  const displayLabel = hubKey
                    .replace(/Hub$/, "")
                    .replace(/([A-Z])/g, " $1")
                    .trim()
                    .toUpperCase();

                  return (
                    <div
                      key={hubKey}
                      className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-gray-800 uppercase">
                          {displayLabel}
                        </label>
                        <button
                          onClick={() => {
                            const hubs = { ...localSettings.hubs };
                            hubs[hubKey] = { ...hub, visible: !hub.visible };
                            setLocalSettings({ ...localSettings, hubs });
                          }}
                          className={`w-12 h-6 rounded-full transition-colors relative ${hub.visible ? "bg-green-500" : "bg-gray-200"}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${hub.visible ? "left-7" : "left-1"}`}
                          />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">
                            Display Title
                          </label>
                          <Input
                            value={hub.label}
                            onChange={(val: string) => {
                              const hubs = { ...localSettings.hubs };
                              hubs[hubKey] = { ...hub, label: val };
                              setLocalSettings({ ...localSettings, hubs });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">
                            Sub Label
                          </label>
                          <Input
                            value={hub.subLabel}
                            onChange={(val: string) => {
                              const hubs = { ...localSettings.hubs };
                              hubs[hubKey] = { ...hub, subLabel: val };
                              setLocalSettings({ ...localSettings, hubs });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">
                            Tailwind Color (e.g. text-blue-500)
                          </label>
                          <Input
                            value={hub.color || ""}
                            onChange={(val: string) => {
                              const hubs = { ...localSettings.hubs };
                              hubs[hubKey] = { ...hub, color: val };
                              setLocalSettings({ ...localSettings, hubs });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">
                            Tailwind BG (e.g. bg-blue-50)
                          </label>
                          <Input
                            value={hub.bg || ""}
                            onChange={(val: string) => {
                              const hubs = { ...localSettings.hubs };
                              hubs[hubKey] = { ...hub, bg: val };
                              setLocalSettings({ ...localSettings, hubs });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Button
                  onClick={async () => {
                    await dbService.updateSettings(localSettings);
                    alert("Hub Settings Saved!");
                  }}
                  className="w-full h-12 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-black uppercase tracking-widest text-xs"
                >
                  Save Hub Config
                </Button>
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                    <Settings size={18} />
                  </span>
                  App Controls
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <h4 className="text-sm font-black text-gray-900">
                      Maintenance Mode
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      Hide core features from users
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setLocalSettings({
                        ...localSettings,
                        maintenanceMode: !localSettings.maintenanceMode,
                      });
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.maintenanceMode ? "bg-orange-500" : "bg-gray-200"}`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${localSettings.maintenanceMode ? "left-7" : "left-1"}`}
                    />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                      Min Withdrawal Amount (৳)
                    </label>
                    <Input
                      type="number"
                      value={localSettings.minWithdrawal ?? 0}
                      onChange={(val: string) => {
                        setLocalSettings({
                          ...localSettings,
                          minWithdrawal: parseFloat(val) || 0,
                        });
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                      Referral Commission Rate (%)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 20"
                      value={localSettings.referralCommissionRate ?? 20}
                      onChange={(val: string) => {
                        setLocalSettings({
                          ...localSettings,
                          referralCommissionRate: parseFloat(val) || 0,
                        });
                      }}
                    />
                    <p className="text-[8px] text-gray-400 font-bold italic">
                      Leaders receive this % of their members' approved task
                      rewards.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={async () => {
                    await dbService.updateSettings(localSettings);
                    alert("App Controls Saved!");
                  }}
                  className="w-full h-12 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-xs"
                >
                  Save App Controls
                </Button>
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                    <Terminal size={18} />
                  </span>
                  Developer Settings
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">
                  Isolated system and debugging configuration parameters.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <h4 className="text-sm font-black text-gray-900 font-sans">
                      Developer Debug Mode
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase font-sans">
                      Enable verbose system and console logging
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setLocalSettings({
                        ...localSettings,
                        devDebugMode: !localSettings.devDebugMode,
                      });
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.devDebugMode ? "bg-orange-500" : "bg-gray-200"}`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${localSettings.devDebugMode ? "left-7" : "left-1"}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <h4 className="text-sm font-black text-gray-900 font-sans">
                      Bypass Task Duration Timers
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase font-sans">
                      Instantly complete tasks for fast feature testing
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setLocalSettings({
                        ...localSettings,
                        devBypassTaskTimer: !localSettings.devBypassTaskTimer,
                      });
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.devBypassTaskTimer ? "bg-orange-500" : "bg-gray-200"}`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${localSettings.devBypassTaskTimer ? "left-7" : "left-1"}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <h4 className="text-sm font-black text-gray-900 font-sans">
                      Mock SDK Advertisements
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase font-sans">
                      Simulate third-party ad networks offline
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setLocalSettings({
                        ...localSettings,
                        devMockAdsEnabled: !localSettings.devMockAdsEnabled,
                      });
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.devMockAdsEnabled ? "bg-orange-500" : "bg-gray-200"}`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${localSettings.devMockAdsEnabled ? "left-7" : "left-1"}`}
                    />
                  </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
                  <h5 className="text-xs font-black text-gray-700 uppercase font-sans">
                    Future Configuration Pipeline
                  </h5>
                  <p className="text-[10px] text-gray-400 font-sans">
                    Additional developer settings such as live DB schema
                    synchronizers, environment overrides, and diagnostic
                    webhooks can be appended inside this card seamlessly.
                  </p>
                </div>

                <Button
                  onClick={async () => {
                    await dbService.updateSettings(localSettings);
                    alert("Developer Settings Saved Successfully!");
                  }}
                  className="w-full h-12 rounded-2xl bg-gray-700 hover:bg-gray-800 text-white font-black uppercase tracking-widest text-xs font-sans"
                >
                  Save Developer Settings
                </Button>
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Zap size={18} />
                  </span>
                  Earning Channels & Coin Tabs
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Configure the 8-grid / coin tab buttons displayed on the Home
                  screen (Dashboard).
                </p>
              </div>

              <div className="space-y-4">
                {(localSettings.earningChannels || []).map((ch, idx) => (
                  <div
                    key={ch.id || idx}
                    className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{ch.emoji}</span>
                        <span className="text-xs font-black text-gray-700 uppercase tracking-wider">
                          {ch.name || "Unnamed Channel"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                          Active
                        </span>
                        <button
                          onClick={() => {
                            const updated = [
                              ...(localSettings.earningChannels || []),
                            ];
                            updated[idx] = { ...ch, enabled: !ch.enabled };
                            setLocalSettings({
                              ...localSettings,
                              earningChannels: updated,
                            });
                          }}
                          className={`w-10 h-5 rounded-full transition-colors relative ${ch.enabled !== false ? "bg-green-500" : "bg-gray-200"}`}
                        >
                          <div
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${ch.enabled !== false ? "left-5.5" : "left-0.5"}`}
                          />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this earning channel?",
                              )
                            ) {
                              const updated = (
                                localSettings.earningChannels || []
                              ).filter((_, i) => i !== idx);
                              setLocalSettings({
                                ...localSettings,
                                earningChannels: updated,
                              });
                            }
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">
                          Emoji Icon
                        </label>
                        <Input
                          placeholder="✨"
                          value={ch.emoji || ""}
                          onChange={(val: string) => {
                            const updated = [
                              ...(localSettings.earningChannels || []),
                            ];
                            updated[idx] = { ...ch, emoji: val };
                            setLocalSettings({
                              ...localSettings,
                              earningChannels: updated,
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">
                          Display Name
                        </label>
                        <Input
                          placeholder="e.g. YouTube"
                          value={ch.name || ""}
                          onChange={(val: string) => {
                            const updated = [
                              ...(localSettings.earningChannels || []),
                            ];
                            updated[idx] = { ...ch, name: val };
                            setLocalSettings({
                              ...localSettings,
                              earningChannels: updated,
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">
                          Page Path / Category
                        </label>
                        <Input
                          placeholder="e.g. /tasks"
                          value={ch.path || ""}
                          onChange={(val: string) => {
                            const updated = [
                              ...(localSettings.earningChannels || []),
                            ];
                            updated[idx] = { ...ch, path: val };
                            setLocalSettings({
                              ...localSettings,
                              earningChannels: updated,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const newCh = {
                      id: `channel_${Date.now()}`,
                      name: "New Channel",
                      emoji: "🎁",
                      path: "/tasks",
                      enabled: true,
                    };
                    setLocalSettings({
                      ...localSettings,
                      earningChannels: [
                        ...(localSettings.earningChannels || []),
                        newCh,
                      ],
                    });
                  }}
                  className="w-full h-11 border-2 border-dashed border-gray-200 hover:border-amber-400 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-amber-500 transition-colors bg-white font-sans uppercase tracking-widest"
                >
                  <Plus size={16} /> Add Earning Channel
                </button>

                <Button
                  onClick={async () => {
                    await dbService.updateSettings(localSettings);
                    alert("Earning Channels Configuration Saved Successfully!");
                  }}
                  className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-xs"
                >
                  Save Earning Channels
                </Button>
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Trophy size={18} strokeWidth={2.5} />
                  </span>
                  Home Page Coin Tabs (কয়েন ট্যাব কন্ট্রোল)
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Configure the horizontal scroll tabs for the tasks grid on the
                  Home Screen. Select what kind of tasks each tab should show.
                </p>
              </div>

              <div className="space-y-4">
                {(localSettings.coinTabs || []).map((tabItem, idx) => (
                  <div
                    key={tabItem.id || idx}
                    className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-700 uppercase tracking-wider">
                          {tabItem.name || "Unnamed Tab"}
                        </span>
                        <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">
                          {tabItem.filterType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                          Active
                        </span>
                        <button
                          onClick={() => {
                            const updated = [...(localSettings.coinTabs || [])];
                            updated[idx] = {
                              ...tabItem,
                              enabled: !tabItem.enabled,
                            };
                            setLocalSettings({
                              ...localSettings,
                              coinTabs: updated,
                            });
                          }}
                          className={`w-10 h-5 rounded-full transition-colors relative ${tabItem.enabled !== false ? "bg-green-500" : "bg-gray-200"}`}
                        >
                          <div
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${tabItem.enabled !== false ? "left-5.5" : "left-0.5"}`}
                          />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this coin tab?",
                              )
                            ) {
                              const updated = (
                                localSettings.coinTabs || []
                              ).filter((_, i) => i !== idx);
                              setLocalSettings({
                                ...localSettings,
                                coinTabs: updated,
                              });
                            }
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">
                          Display Name (নাম)
                        </label>
                        <Input
                          placeholder="e.g. Survey Tasks"
                          value={tabItem.name || ""}
                          onChange={(val: string) => {
                            const updated = [...(localSettings.coinTabs || [])];
                            updated[idx] = { ...tabItem, name: val };
                            setLocalSettings({
                              ...localSettings,
                              coinTabs: updated,
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">
                          Task Category Filter (কাজ সিলেক্ট করুন)
                        </label>
                        <select
                          value={tabItem.filterType || "featured"}
                          onChange={(e) => {
                            const updated = [...(localSettings.coinTabs || [])];
                            updated[idx] = {
                              ...tabItem,
                              filterType: e.target.value as any,
                            };
                            setLocalSettings({
                              ...localSettings,
                              coinTabs: updated,
                            });
                          }}
                          className="w-full h-11 px-4 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                        >
                          <option value="featured">Featured Tasks</option>
                          <option value="survey">
                            Survey Tasks (সার্ভে কাজ)
                          </option>
                          <option value="trending">
                            Trending (সবচেয়ে বেশি কয়েন কাজ)
                          </option>
                          <option value="install">
                            App Installs (অ্যাপ ইন্সটল)
                          </option>
                          <option value="link">
                            Web Visits (ওয়েবসাইট ভিজিট)
                          </option>
                          <option value="special">
                            Special Work (বিশেষ কাজ)
                          </option>
                          <option value="social">
                            Social Work (সোশ্যাল কাজ)
                          </option>
                          <option value="all">All Tasks (সকল কাজ)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const newTab = {
                      id: `tab_${Date.now()}`,
                      name: "New Tab",
                      filterType: "all" as const,
                      enabled: true,
                    };
                    setLocalSettings({
                      ...localSettings,
                      coinTabs: [...(localSettings.coinTabs || []), newTab],
                    });
                  }}
                  className="w-full h-11 border-2 border-dashed border-gray-200 hover:border-amber-400 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-amber-500 transition-colors bg-white font-sans uppercase tracking-widest"
                >
                  <Plus size={16} /> Add New Coin Tab
                </button>

                <Button
                  onClick={async () => {
                    await dbService.updateSettings(localSettings);
                    alert("Coin Tabs Configuration Saved Successfully!");
                  }}
                  className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-xs"
                >
                  Save Coin Tabs Settings
                </Button>
              </div>
            </Card>
          </div>
        )}

        {tab === "referrals" && (
          <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest px-1">
              Pending Referrals for Admin Success
            </h4>
            {state.users.filter((u) => u.referralStatus === "pending")
              .length === 0 ? (
              <div className="py-12 bg-gray-50 rounded-3xl text-center text-gray-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest font-sans">
                  পেন্ডিং রেফারেল নেই
                </p>
              </div>
            ) : (
              state.users
                .filter((u) => u.referralStatus === "pending")
                .map((candidateUser) => {
                  const sponsorUser = state.users.find(
                    (u) => u.id === candidateUser.pendingReferredBy,
                  );
                  return (
                    <Card
                      key={candidateUser.id}
                      className="p-5 border-l-4 border-l-[#FFC107] space-y-4 bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase text-[#FFC107] bg-yellow-50 px-2 py-0.5 rounded-full font-sans">
                              পেন্ডিং যাচাইকরণ
                            </span>
                            <span className="text-[9px] font-bold text-gray-400">
                              Joined:{" "}
                              {new Date(
                                candidateUser.createdAt,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-gray-900 uppercase">
                            New Candidate: {candidateUser.name}
                          </h4>
                          <p className="text-xs text-gray-400 font-bold uppercase">
                            Phone: {candidateUser.phone}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-[#FFC107] bg-yellow-50 px-3 py-1 rounded-lg">
                            ৳5.00 Bonus
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                            Sponsor / Inviter Information
                          </p>
                          <h5 className="text-xs font-black text-[#37474F] uppercase">
                            {sponsorUser ? sponsorUser.name : "Unknown User"}
                          </h5>
                          <p className="text-[8px] font-bold text-[#FFC107] uppercase">
                            Code used:{" "}
                            {sponsorUser
                              ? sponsorUser.referralCode
                              : candidateUser.pendingReferredBy}
                          </p>
                        </div>
                        <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center text-[#FFC107]">
                          <Users size={16} />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            showConfirm(
                              "Approve Referral",
                              `Approve referral link for ${candidateUser.name}? Both will receive ৳5 bonus!`,
                              async () => {
                                const result = await dbService.approveReferral(
                                  candidateUser.id,
                                );
                                showToast(result.message);
                              },
                            );
                          }}
                          className="flex-grow h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-md font-sans"
                        >
                          Success (সাকসেস)
                        </button>
                        <button
                          onClick={() => {
                            showConfirm(
                              "Reject Referral",
                              `Reject referral code entry for ${candidateUser.name}?`,
                              async () => {
                                const result = await dbService.rejectReferral(
                                  candidateUser.id,
                                );
                                showToast(result.message);
                              },
                            );
                          }}
                          className="flex-1 h-12 bg-white hover:bg-gray-50 border border-gray-250 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all font-sans"
                        >
                          Reject
                        </button>
                      </div>
                    </Card>
                  );
                })
            )}
          </div>
        )}

        {tab === "task-review" && (
          <div className="space-y-4">
            {pendingTasks.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">
                  No pending tasks
                </p>
              </div>
            ) : (
              pendingTasks.map((log) => {
                const user = state.users.find((u) => u.id === log.userId);
                const task = state.tasks.find((t) => t.id === log.taskId);
                return (
                  <Card
                    key={log.id}
                    className="p-4 space-y-4 border-l-4 border-l-orange-400"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
                            Pending Approval
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            {new Date(log.completedAt).toLocaleString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-gray-900">
                          {task?.title || "Unknown Task"}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[8px] font-black text-gray-500">
                            {user?.name[0]}
                          </div>
                          <span className="text-[10px] font-bold text-gray-500">
                            {user?.name} ({user?.phone})
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-gray-900">
                          ৳{log.reward.toFixed(2)}
                        </div>
                        <p className="text-[8px] font-bold text-gray-400 uppercase">
                          Reward
                        </p>
                      </div>
                    </div>

                    {log.surveyAnswers && log.surveyAnswers.length > 0 && (
                      <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 text-left space-y-3">
                        <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                          Survey Responses (সার্ভে উত্তরসমূহ)
                        </span>
                        <div className="space-y-3">
                          {log.surveyAnswers.map(
                            (ansItem: any, ansIdx: number) => (
                              <div
                                key={ansItem.questionId || ansIdx}
                                className="text-xs"
                              >
                                <p className="font-bold text-gray-700">
                                  {ansIdx + 1}. {ansItem.questionText}
                                </p>
                                <p className="font-medium text-amber-800 ml-3 bg-white/80 px-2.5 py-1 rounded-xl border border-amber-200/30 mt-1 inline-block shadow-sm">
                                  {Array.isArray(ansItem.answer)
                                    ? ansItem.answer.join(", ")
                                    : ansItem.answer || "No Answer"}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 bg-green-500 hover:bg-green-600 h-10 text-xs font-black uppercase tracking-widest"
                        onClick={async () => {
                          await dbService.adminApproveTask(log);
                          showToast("Task Approved");
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex-1 text-red-500 h-10 text-xs font-black uppercase tracking-widest"
                        onClick={() => {
                          showConfirm(
                            "Reject Task",
                            "Are you sure you want to reject this task submission?",
                            async () => {
                              await dbService.adminRejectTask(log);
                              showToast("Task Rejected");
                            },
                          );
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {tab === "kyc" && (
          <div className="space-y-4">
            {state.users.filter((u) => u.kycStatus === "pending").length ===
            0 ? (
              <div className="py-12 text-center text-gray-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">
                  All clear!
                </p>
                <p className="text-[10px] text-gray-400 font-bold">
                  No pending KYC applications
                </p>
              </div>
            ) : (
              state.users
                .filter((u) => u.kycStatus === "pending")
                .map((user) => (
                  <Card
                    key={user.id}
                    className="p-5 space-y-4 bg-white rounded-3xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 font-black rounded-2xl flex items-center justify-center text-lg shadow-inner">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-900">
                            {user.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-bold">
                            {user.phone}
                          </p>
                        </div>
                      </div>
                      {user.kycSubmittedAt && (
                        <span className="text-[9px] font-black text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg uppercase">
                          {new Date(user.kycSubmittedAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3 text-left">
                      <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                        KYC Verification Details
                      </h5>

                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div>
                          <p className="text-[8px] font-black uppercase text-gray-400">
                            Full Name (NID)
                          </p>
                          <p className="font-bold text-gray-800">
                            {user.kycFullName || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase text-gray-400">
                            Date of Birth
                          </p>
                          <p className="font-bold text-gray-800">
                            {user.kycDob || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase text-gray-400">
                            Mobile Number
                          </p>
                          <p className="font-bold text-gray-800">
                            {user.kycPhone || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase text-gray-400">
                            Email Address
                          </p>
                          <p className="font-bold text-gray-800 break-all">
                            {user.kycEmail || "N/A"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[8px] font-black uppercase text-gray-400">
                            Current Address
                          </p>
                          <p className="font-bold text-gray-800">
                            {user.kycAddress || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase text-gray-400">
                            Document Type
                          </p>
                          <p className="font-bold text-gray-800">
                            {user.kycDocType || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase text-gray-400">
                            Payment Number
                          </p>
                          <p className="font-bold text-gray-800">
                            {user.kycPaymentNumber || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Image Attachments Gallery */}
                      <div className="pt-2 border-t border-gray-200/50 space-y-1.5">
                        <p className="text-[8px] font-black uppercase text-gray-400">
                          Uploaded Documents (Click to Zoom)
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {user.kycFrontImage ? (
                            <div
                              onClick={() =>
                                setAdminKycLightboxImg(user.kycFrontImage)
                              }
                              className="aspect-video bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:border-[#FFC107] transition-all relative group"
                            >
                              <img
                                src={user.kycFrontImage}
                                alt="Front ID"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                              <div className="absolute bottom-0 inset-x-0 bg-black/50 text-[7px] font-black uppercase tracking-wider text-white text-center py-0.5">
                                Front ID
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-video bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-[8px] font-black text-gray-400 uppercase">
                              No Front
                            </div>
                          )}

                          {user.kycBackImage ? (
                            <div
                              onClick={() =>
                                setAdminKycLightboxImg(user.kycBackImage)
                              }
                              className="aspect-video bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:border-[#FFC107] transition-all relative group"
                            >
                              <img
                                src={user.kycBackImage}
                                alt="Back ID"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                              <div className="absolute bottom-0 inset-x-0 bg-black/50 text-[7px] font-black uppercase tracking-wider text-white text-center py-0.5">
                                Back ID
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-video bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-[8px] font-black text-gray-400 uppercase">
                              No Back
                            </div>
                          )}

                          {user.kycSelfie ? (
                            <div
                              onClick={() =>
                                setAdminKycLightboxImg(user.kycSelfie)
                              }
                              className="aspect-video bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:border-[#FFC107] transition-all relative group"
                            >
                              <img
                                src={user.kycSelfie}
                                alt="Selfie"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                              <div className="absolute bottom-0 inset-x-0 bg-black/50 text-[7px] font-black uppercase tracking-wider text-white text-center py-0.5">
                                Selfie
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-video bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-[8px] font-black text-gray-400 uppercase">
                              No Selfie
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-green-500 hover:bg-green-600 h-11 text-xs font-black uppercase tracking-wider"
                        onClick={async () => {
                          if (confirm(`Approve KYC for ${user.name}?`)) {
                            await dbService.updateUser(user.id, {
                              kycStatus: "approved",
                              isVerified: true,
                            });
                            alert("KYC Approved successfully!");
                          }
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-200 text-red-500 hover:bg-red-50 h-11 text-xs font-black uppercase tracking-wider"
                        onClick={async () => {
                          const reason = prompt(
                            "Rejection reason (ঐচ্ছিক):",
                            "তথ্য সঠিক নয়।",
                          );
                          if (reason !== null) {
                            await dbService.updateUser(user.id, {
                              kycStatus: "rejected",
                              kycRejectReason: reason,
                            });
                            alert("KYC Rejected successfully!");
                          }
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </Card>
                ))
            )}
          </div>
        )}

        {tab === "withdrawals" && (
          <div className="space-y-4">
            {pendingWithdrawals.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">
                  All clear!
                </p>
              </div>
            ) : (
              pendingWithdrawals.map((w) => (
                <Card key={w.id} className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-600 border-none"
                        >
                          {w.method}
                        </Badge>
                        <span className="text-[10px] font-bold text-gray-400">
                          {new Date(w.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-lg font-black text-gray-900">
                        ৳{w.amount}
                      </div>
                      <div className="text-xs font-bold text-gray-500 break-all">
                        {w.details}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 bg-green-500 hover:bg-green-600 h-10 text-xs"
                      onClick={() => handleUpdateWithdrawal(w.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-200 text-red-500 h-10 text-xs"
                      onClick={() => handleUpdateWithdrawal(w.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {tab === "recharges" && (
          <div className="space-y-4">
            {pendingRecharges.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">
                  No pending recharges
                </p>
              </div>
            ) : (
              pendingRecharges.map((r) => (
                <Card
                  key={r.id}
                  className="p-5 space-y-4 border-l-4 border-l-[#FFC107]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase bg-[#37474F] text-[#FFC107] px-2 py-0.5 rounded-lg">
                          {r.operator}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          {r.type}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-gray-900">
                        ৳{r.amount}
                      </h3>
                      <p className="text-sm font-black text-blue-500 mt-1">
                        {r.mobileNumber}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-black">
                          {r.userName[0]}
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">
                          {r.userName} ({r.userPhone})
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 bg-green-500 hover:bg-green-600 h-12 text-xs font-black uppercase tracking-widest"
                      onClick={async () => {
                        if (
                          confirm(
                            "Confirm that you have manually processed this recharge?",
                          )
                        ) {
                          await dbService.adminApproveRecharge(r);
                          alert("Recharge Approved");
                        }
                      }}
                    >
                      Process Success
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 text-red-500 h-12 text-xs font-black uppercase tracking-widest"
                      onClick={async () => {
                        if (
                          confirm("Reject this recharge and refund the user?")
                        ) {
                          await dbService.adminRejectRecharge(r);
                          alert("Recharge Rejected");
                        }
                      }}
                    >
                      Reject & Refund
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-3">
            {state.users.map((user) => (
              <div
                key={user.id}
                className="bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                        {user.name}
                        {user.isVerified && (
                          <span className="text-[9px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-black uppercase">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400">
                          {user.phone}
                        </span>
                        {user.kycStatus === "pending" && (
                          <span className="text-[8px] bg-amber-50 text-amber-600 px-1 py-0.5 rounded font-black uppercase">
                            KYC Pending
                          </span>
                        )}
                        {user.kycStatus === "approved" && (
                          <span className="text-[8px] bg-green-50 text-green-600 px-1 py-0.5 rounded font-black uppercase">
                            KYC Approved
                          </span>
                        )}
                        {user.kycStatus === "rejected" && (
                          <span className="text-[8px] bg-red-50 text-red-600 px-1 py-0.5 rounded font-black uppercase">
                            KYC Rejected
                          </span>
                        )}
                        {(!user.kycStatus || user.kycStatus === "none") && (
                          <span className="text-[8px] bg-gray-50 text-gray-400 px-1 py-0.5 rounded font-black uppercase">
                            No KYC
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingItem(user);
                      setShowAddModal(true);
                    }}
                    className="p-2 text-blue-300 hover:bg-blue-50 hover:text-blue-500 rounded-xl"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-[#FFC107]">
                    ৳{user.balance.toFixed(1)}
                  </div>
                  <div className="text-[8px] font-bold text-gray-400 uppercase">
                    Balance
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-4">
            {pendingOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <p className="text-xs font-bold uppercase tracking-widest">
                  No active orders
                </p>
              </div>
            ) : (
              pendingOrders.map((order) => (
                <Card key={order.id} className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-gray-400">
                      ID: {order.id}
                    </span>
                    <Badge className="bg-blue-100 text-blue-600 border-none">
                      ৳{order.totalPrice}
                    </Badge>
                  </div>
                  <div className="text-xs font-bold text-gray-600 line-clamp-2">
                    Address: {order.address}
                  </div>
                  <div className="text-xs font-black text-[#FFC107]">
                    Mobile: {order.phone}
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">
                    Status: {order.status}
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-2 border-t border-gray-50 mt-2">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-gray-400">
                        Carrier
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pathao"
                        className="w-full bg-gray-50 rounded-lg p-2 text-[10px] font-bold outline-none border border-transparent focus:border-[#FFC107]"
                        defaultValue={order.carrier || ""}
                        id={`carrier-${order.id}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-gray-400">
                        Tracking #
                      </label>
                      <input
                        type="text"
                        placeholder="Track ID"
                        className="w-full bg-gray-50 rounded-lg p-2 text-[10px] font-bold outline-none border border-transparent focus:border-[#FFC107]"
                        defaultValue={order.trackingNumber || ""}
                        id={`tracking-${order.id}`}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[8px] font-black uppercase text-gray-400">
                        Est. Delivery Date
                      </label>
                      <input
                        type="date"
                        className="w-full bg-gray-50 rounded-lg p-2 text-[10px] font-bold outline-none border border-transparent focus:border-[#FFC107]"
                        defaultValue={
                          order.estimatedDeliveryDate
                            ? new Date(order.estimatedDeliveryDate)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        id={`date-${order.id}`}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-9 text-[10px] uppercase font-black tracking-widest"
                      onClick={() => {
                        const carrier = (
                          document.getElementById(
                            `carrier-${order.id}`,
                          ) as HTMLInputElement
                        ).value;
                        const trackingNumber = (
                          document.getElementById(
                            `tracking-${order.id}`,
                          ) as HTMLInputElement
                        ).value;
                        const estimatedDeliveryDate = (
                          document.getElementById(
                            `date-${order.id}`,
                          ) as HTMLInputElement
                        ).value;
                        handleUpdateOrderStatus(order.id, OrderStatus.SHIPPED, {
                          carrier,
                          trackingNumber,
                          estimatedDeliveryDate: estimatedDeliveryDate
                            ? new Date(estimatedDeliveryDate).toISOString()
                            : null,
                        });
                      }}
                    >
                      Ship Order
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-9 text-[10px] uppercase font-black tracking-widest border-green-200 text-green-600"
                      onClick={() => {
                        const carrier = (
                          document.getElementById(
                            `carrier-${order.id}`,
                          ) as HTMLInputElement
                        ).value;
                        const trackingNumber = (
                          document.getElementById(
                            `tracking-${order.id}`,
                          ) as HTMLInputElement
                        ).value;
                        const estimatedDeliveryDate = (
                          document.getElementById(
                            `date-${order.id}`,
                          ) as HTMLInputElement
                        ).value;
                        handleUpdateOrderStatus(
                          order.id,
                          OrderStatus.DELIVERED,
                          {
                            carrier,
                            trackingNumber,
                            estimatedDeliveryDate: estimatedDeliveryDate
                              ? new Date(estimatedDeliveryDate).toISOString()
                              : null,
                          },
                        );
                      }}
                    >
                      Delivered
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {tab === "product-review" && (
          <div className="space-y-4">
            {pendingProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">
                  No products pending approval
                </p>
              </div>
            ) : (
              pendingProducts.map((p) => {
                const seller = state.users.find((u) => u.id === p.sellerId);
                return (
                  <Card
                    key={p.id}
                    className="p-4 space-y-4 border-l-4 border-l-orange-400 bg-white"
                  >
                    <div className="flex gap-4">
                      <img
                        src={p.image}
                        className="w-20 h-20 rounded-2xl object-cover"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-black text-gray-900">
                            {p.name}
                          </h4>
                          <span className="text-xs font-black text-[#FFC107]">
                            ৳{p.price}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          {p.category}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[8px] font-black text-gray-500">
                            {seller?.name?.[0] || "S"}
                          </div>
                          <span className="text-[9px] font-bold text-gray-500">
                            Seller: {seller?.name || "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-green-500 hover:bg-green-600 h-10 text-xs font-black uppercase"
                        onClick={async () => {
                          await dbService.adminApproveProduct(p.id);
                          alert("Product Approved");
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex-1 text-red-500 h-10 text-xs font-black uppercase"
                        onClick={async () => {
                          if (confirm("Reject this product?")) {
                            await dbService.adminRejectProduct(p.id);
                            alert("Product Rejected");
                          }
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {tab === "products" && (
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50/50 rounded-xl">
              <span className="text-[10px] font-black uppercase text-blue-600 px-2">
                Live Store Catalog
              </span>
            </div>
            {state.products
              .filter((p) => p.status === "approved")
              .map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-3 rounded-2xl flex items-center gap-4 border border-gray-100 shadow-sm"
                >
                  <img
                    src={p.image}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-black text-gray-900">
                      {p.name}
                    </div>
                    <div className="text-[10px] font-bold text-[#FFC107]">
                      ৳{p.price} • Stock: {p.stock}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(p);
                        setShowAddModal(true);
                      }}
                      className="p-2 text-blue-300 hover:bg-blue-50 hover:text-blue-500 rounded-xl transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => dbService.deleteProduct(p.id)}
                      className="p-2 text-red-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {tab === "tasks" && (
          <div className="space-y-3">
            {state.tasks.map((t) => (
              <div
                key={t.id}
                className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm"
              >
                <div className="flex-1">
                  <div className="text-sm font-black text-gray-900">
                    {t.title}
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {t.type} • ৳{t.reward}
                  </div>
                  {t.adCode && (
                    <div className="text-[9px] text-[#FFC107] font-bold mt-1 uppercase truncate max-w-[200px]">
                      Ad Code: {t.adCode}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingItem(t);
                      setShowAddModal(true);
                    }}
                    className="p-2 text-blue-300 hover:bg-blue-50 hover:text-blue-500 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => dbService.deleteTask(t.id)}
                    className="p-2 text-red-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "missions" && (
          <div className="space-y-3">
            {state.missions.map((m) => (
              <div
                key={m.id}
                className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm"
              >
                <div className="flex-1">
                  <div className="text-sm font-black text-gray-900">
                    {m.title}
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {m.type} • Goal: {m.goal} • Reward: ৳{m.reward}
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1 uppercase font-bold">
                    {m.description}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingItem(m);
                      setShowAddModal(true);
                    }}
                    className="p-2 text-blue-300 hover:bg-blue-50 hover:text-blue-500 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => dbService.deleteMission(m.id)}
                    className="p-2 text-red-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "community" && (
          <div className="space-y-3">
            {state.posts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[8px] font-black">
                      {post.userName[0]}
                    </div>
                    <div className="text-[10px] font-black text-gray-900">
                      {post.userName}
                    </div>
                    <div className="text-[8px] font-bold text-gray-400">
                      {new Date(post.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {post.content}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Delete this post?"))
                      dbService.deletePost(post.id);
                  }}
                  className="p-2 text-red-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors ml-4"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "deals" && (
          <div className="grid grid-cols-1 gap-3">
            {state.secretDeals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white p-3 rounded-2xl flex items-center gap-4 border border-gray-100 shadow-sm"
              >
                <img
                  src={deal.image}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="text-sm font-black text-gray-900 line-clamp-1">
                    {deal.title}
                  </div>
                  <div className="text-[10px] font-bold text-[#FFC107]">
                    ৳{deal.price}{" "}
                    <span className="text-gray-300 line-through">
                      ৳{deal.originalPrice}
                    </span>{" "}
                    • Stock: {deal.stock}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingItem(deal);
                      setShowAddModal(true);
                    }}
                    className="p-2 text-blue-300 hover:bg-blue-50 hover:text-blue-500 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => dbService.deleteSecretDeal(deal.id)}
                    className="p-2 text-red-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "coupons" && (
          <div className="space-y-3">
            {state.coupons.map((c) => (
              <div
                key={c.id}
                className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm"
              >
                <div>
                  <div className="text-sm font-black text-gray-900 uppercase">
                    {c.code}
                  </div>
                  <div className="text-[10px] font-bold text-[#FFC107] uppercase tracking-widest">
                    {c.discountType === "fixed" ? `৳${c.value}` : `${c.value}%`}{" "}
                    Off
                    {c.minSpend ? ` • Min Spend: ৳${c.minSpend}` : ""}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingItem(c);
                      setShowAddModal(true);
                    }}
                    className="p-2 text-blue-300 hover:bg-blue-50 hover:text-blue-500 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => dbService.deleteCoupon(c.id)}
                    className="p-2 text-red-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "notifications" && (
          <div className="space-y-3">
            {state.globalNotifications.map((n) => (
              <div
                key={n.id}
                className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm"
              >
                <div>
                  <div className="text-sm font-black text-gray-900">
                    {n.title}
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {n.type} • {new Date(n.createdAt).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingItem(n);
                      setShowAddModal(true);
                    }}
                    className="p-2 text-blue-300 hover:bg-blue-50 hover:text-blue-500 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => dbService.deleteGlobalNotification(n.id)}
                    className="p-2 text-red-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "faqs" && (
          <div className="space-y-3">
            {state.faqs.map((f) => (
              <div
                key={f.id}
                className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm"
              >
                <div className="flex-1">
                  <div className="text-sm font-black text-gray-900">
                    {f.question}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{f.answer}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingItem(f);
                      setShowAddModal(true);
                    }}
                    className="p-2 text-blue-300 hover:bg-blue-50 hover:text-blue-500 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => dbService.deleteFAQ(f.id)}
                    className="p-2 text-red-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors ml-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "banners" && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs font-bold leading-relaxed mb-2">
              ব্যানারগুলো হোম পেজে ১৯:৬ এ্যাসপেক্ট রেশিওতে শো করবে। প্রতিটি
              ব্যানার ৬ সেকেন্ড পর পর স্লাইড হবে। এডমিন প্যানেল থেকে আপনি যেকোনো
              ব্যানার যোগ করতে, এডিট করতে এবং ডিলিট করতে পারবেন।
            </div>

            <div className="space-y-3">
              {!state.promoBanners || state.promoBanners.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                  কোনো ব্যানার নেই। নতুন ব্যানার যোগ করতে ডান পাশের + বাটনে
                  ক্লিক করুন।
                </div>
              ) : (
                state.promoBanners.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 justify-between shadow-sm"
                  >
                    <img
                      src={b.imageUrl}
                      alt={b.title || "Banner"}
                      className="w-20 aspect-[19/6] object-cover rounded-xl bg-gray-50 border border-gray-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-black text-gray-900 truncate">
                        {b.title || "Unnamed Banner"}
                      </div>
                      {b.targetUrl && (
                        <div className="text-[10px] font-bold text-gray-400 truncate mt-0.5">
                          Target: {b.targetUrl}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingItem(b);
                          setShowAddModal(true);
                        }}
                        className="p-2 text-blue-300 hover:bg-blue-50 hover:text-blue-500 rounded-xl transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => dbService.deletePromoBanner(b.id)}
                        className="p-2 text-red-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 space-y-6"
          >
            <h3 className="text-xl font-black text-gray-900">
              {editingItem ? "Edit" : "Add"} {tab.slice(0, -1)}
            </h3>

            {tab === "users" && (
              <div className="space-y-4">
                <Input
                  label="User Name"
                  value={targetUser.name}
                  onChange={(val: string) =>
                    setTargetUser({ ...targetUser, name: val })
                  }
                />
                <Input
                  label="Balance (৳)"
                  type="number"
                  value={targetUser.balance}
                  onChange={(val: string) =>
                    setTargetUser({ ...targetUser, balance: Number(val) })
                  }
                />

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                    KYC Status
                  </label>
                  <select
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-[#FFC107] outline-none h-[52px]"
                    value={targetUser.kycStatus || "none"}
                    onChange={(e) => {
                      const status = e.target.value as any;
                      setTargetUser({
                        ...targetUser,
                        kycStatus: status,
                        isVerified:
                          status === "approved" ? true : targetUser.isVerified,
                      });
                    }}
                  >
                    <option value="none">No KYC / None</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                {targetUser.kycStatus === "rejected" && (
                  <Input
                    label="KYC Reject Reason"
                    value={targetUser.kycRejectReason || ""}
                    onChange={(val: string) =>
                      setTargetUser({ ...targetUser, kycRejectReason: val })
                    }
                  />
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <h4 className="text-sm font-black text-gray-900">
                      Verified User Badge
                    </h4>
                  </div>
                  <button
                    onClick={() =>
                      setTargetUser({
                        ...targetUser,
                        isVerified: !targetUser.isVerified,
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative ${targetUser.isVerified ? "bg-green-500" : "bg-gray-200"}`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${targetUser.isVerified ? "left-7" : "left-1"}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <h4 className="text-sm font-black text-gray-900">
                      Admin Privileges
                    </h4>
                  </div>
                  <button
                    onClick={() =>
                      setTargetUser({
                        ...targetUser,
                        isAdmin: !targetUser.isAdmin,
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative ${targetUser.isAdmin ? "bg-orange-500" : "bg-gray-200"}`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${targetUser.isAdmin ? "left-7" : "left-1"}`}
                    />
                  </button>
                </div>
                <Button
                  onClick={async () => {
                    if (editingItem) {
                      await dbService.updateUser(editingItem.id, targetUser);
                      alert("User Updated");
                    }
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                  className="w-full h-14 rounded-2xl"
                >
                  Update User
                </Button>
              </div>
            )}

            {tab === "products" && (
              <div className="space-y-4">
                <Input
                  label="Product Name"
                  value={newProduct.name}
                  onChange={(val: string) =>
                    setNewProduct({ ...newProduct, name: val })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price (৳)"
                    type="number"
                    value={newProduct.price}
                    onChange={(val: string) =>
                      setNewProduct({ ...newProduct, price: Number(val) })
                    }
                  />
                  <Input
                    label="Stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(val: string) =>
                      setNewProduct({ ...newProduct, stock: Number(val) })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                    Category
                  </label>
                  <select
                    className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-[#FFC107] outline-none h-[52px]"
                    value={newProduct.category}
                    onChange={(e: any) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <ImagePicker
                    label="Product Image"
                    value={newProduct.image || ""}
                    onChange={(val: string) =>
                      setNewProduct({ ...newProduct, image: val })
                    }
                    folder="products"
                  />
                  <div className="flex items-center justify-end">
                    <button
                      onClick={handleGenerateImage}
                      disabled={isGenerating}
                      className="text-[10px] font-black text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-1.5 flex items-center gap-1 uppercase tracking-wider"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      AI দিয়ে ছবি তৈরি করুন
                    </button>
                  </div>
                </div>
                <Button
                  onClick={handleAddProduct}
                  className="w-full h-14 rounded-2xl"
                >
                  Create Product
                </Button>
              </div>
            )}

            {tab === "tasks" && (
              <div className="space-y-4">
                <Input
                  label="Task Title"
                  value={newTask.title}
                  onChange={(val: string) =>
                    setNewTask({ ...newTask, title: val })
                  }
                />
                <Input
                  label="Description"
                  value={newTask.description}
                  onChange={(val: string) =>
                    setNewTask({ ...newTask, description: val })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Reward (৳)"
                    type="number"
                    value={newTask.reward}
                    onChange={(val: string) =>
                      setNewTask({ ...newTask, reward: Number(val) })
                    }
                  />
                  <Input
                    label="Min Duration (sec)"
                    type="number"
                    value={newTask.minDurationRequired || 0}
                    onChange={(val: string) =>
                      setNewTask({
                        ...newTask,
                        minDurationRequired: Number(val),
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                      Type (টাইপ)
                    </label>
                    <select
                      className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-[#FFC107] outline-none h-[52px]"
                      value={newTask.type}
                      onChange={(e: any) => {
                        const nextType = e.target.value as TaskType;
                        let nextCat = newTask.category || "Link";
                        if (nextType === TaskType.SURVEY) nextCat = "Survey";
                        if (nextType === TaskType.INSTALL) nextCat = "Install";
                        if (nextType === TaskType.LINK && nextCat === "Survey")
                          nextCat = "Link";
                        setNewTask({
                          ...newTask,
                          type: nextType,
                          category: nextCat,
                        });
                      }}
                    >
                      <option value={TaskType.LINK}>Link (লিংক ভিজিট)</option>
                      <option value={TaskType.INSTALL}>Install (অ্যাপ ইনস্টল)</option>
                      <option value={TaskType.SURVEY}>Survey (সার্ভে কাজ)</option>
                      <option value={TaskType.VIDEO}>Video (ভিডিও ভিউ)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                      Category (ক্যাটাগরি)
                    </label>
                    <select
                      className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-[#FFC107] outline-none h-[52px]"
                      value={newTask.category || "Link"}
                      onChange={(e: any) =>
                        setNewTask({ ...newTask, category: e.target.value })
                      }
                    >
                      <option value="Link">Link (লিংক ভিজিট)</option>
                      <option value="Install">Install (অ্যাপ ইন্সটল)</option>
                      <option value="Survey">Survey (সার্ভে কাজ)</option>
                      <option value="Special">Special (বিশেষ কাজ)</option>
                      <option value="Social">Social (সোশ্যাল কাজ)</option>
                    </select>
                  </div>
                </div>
                <Input
                  label="URL (Optional)"
                  value={newTask.url || ""}
                  onChange={(val: string) =>
                    setNewTask({ ...newTask, url: val })
                  }
                />
                <Input
                  label="Ad Code / Direct Link"
                  placeholder="Paste ad script or direct link here"
                  value={newTask.adCode || ""}
                  onChange={(val: string) =>
                    setNewTask({ ...newTask, adCode: val })
                  }
                />

                {/* Dynamic Questions Builder for Surveys */}
                {newTask.type === TaskType.SURVEY && (
                  <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/60 space-y-4 text-left">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">
                        Survey Questions Builder (প্রশ্নাবলী সেট করুন)
                      </h4>
                      <p className="text-[9px] font-bold text-amber-700/60 uppercase tracking-widest">
                        Add custom fields, multiple choice options or checkboxes
                        that the user must answer before claiming.
                      </p>
                    </div>

                    <div className="space-y-4 max-h-[260px] overflow-y-auto no-scrollbar pr-1">
                      {(newTask.questions || []).map((q, qIdx) => (
                        <div
                          key={q.id || qIdx}
                          className="p-3 bg-white border border-gray-100 rounded-xl space-y-2 relative"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              const updatedQuestions = (
                                newTask.questions || []
                              ).filter((_, idx) => idx !== qIdx);
                              setNewTask({
                                ...newTask,
                                questions: updatedQuestions,
                              });
                            }}
                            className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors"
                            title="Delete Question"
                          >
                            <Trash2 size={12} />
                          </button>

                          <div className="grid grid-cols-1 gap-2">
                            {/* Question Text */}
                            <div className="space-y-1">
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                Question Text (প্রশ্ন)
                              </span>
                              <input
                                type="text"
                                placeholder="e.g. What is your age?"
                                value={q.questionText || ""}
                                onChange={(e) => {
                                  const updated = [
                                    ...(newTask.questions || []),
                                  ];
                                  updated[qIdx] = {
                                    ...q,
                                    questionText: e.target.value,
                                  };
                                  setNewTask({
                                    ...newTask,
                                    questions: updated,
                                  });
                                }}
                                className="w-full h-8 px-2 text-[11px] font-bold text-gray-700 border border-gray-100 rounded-lg focus:outline-none focus:border-amber-400 bg-gray-50"
                              />
                            </div>

                            {/* Question Type & Required */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                  Type
                                </span>
                                <select
                                  value={q.type || "text"}
                                  onChange={(e) => {
                                    const updated = [
                                      ...(newTask.questions || []),
                                    ];
                                    updated[qIdx] = {
                                      ...q,
                                      type: e.target.value as any,
                                      options:
                                        e.target.value === "text"
                                          ? undefined
                                          : q.options || ["Option 1"],
                                    };
                                    setNewTask({
                                      ...newTask,
                                      questions: updated,
                                    });
                                  }}
                                  className="w-full h-8 px-2 text-[11px] font-bold text-gray-700 border border-gray-100 rounded-lg focus:outline-none focus:border-amber-400 bg-gray-50"
                                >
                                  <option value="text">Text Input</option>
                                  <option value="mcq">
                                    Multiple Choice (Single Select)
                                  </option>
                                  <option value="checkbox">
                                    Checkboxes (Multi Select)
                                  </option>
                                </select>
                              </div>

                              <div className="flex items-center gap-2 pt-4">
                                <input
                                  type="checkbox"
                                  id={`req_${qIdx}`}
                                  checked={q.required || false}
                                  onChange={(e) => {
                                    const updated = [
                                      ...(newTask.questions || []),
                                    ];
                                    updated[qIdx] = {
                                      ...q,
                                      required: e.target.checked,
                                    };
                                    setNewTask({
                                      ...newTask,
                                      questions: updated,
                                    });
                                  }}
                                  className="w-4 h-4 text-amber-500 focus:ring-amber-400 border-gray-200 rounded"
                                />
                                <label
                                  htmlFor={`req_${qIdx}`}
                                  className="text-[10px] font-black text-gray-500 uppercase tracking-wider select-none cursor-pointer"
                                >
                                  Required *
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Options if MCQ or Checkbox */}
                          {(q.type === "mcq" || q.type === "checkbox") && (
                            <div className="mt-2 p-2 bg-gray-50/50 rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                  Options (উত্তর সমূহ)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [
                                      ...(newTask.questions || []),
                                    ];
                                    const currentOpts = q.options || [];
                                    updated[qIdx] = {
                                      ...q,
                                      options: [
                                        ...currentOpts,
                                        `Option ${currentOpts.length + 1}`,
                                      ],
                                    };
                                    setNewTask({
                                      ...newTask,
                                      questions: updated,
                                    });
                                  }}
                                  className="text-[8px] font-black text-amber-600 hover:text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded"
                                >
                                  + Add Option
                                </button>
                              </div>

                              <div className="space-y-1.5">
                                {(q.options || []).map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className="flex items-center gap-1.5"
                                  >
                                    <input
                                      type="text"
                                      value={opt || ""}
                                      onChange={(e) => {
                                        const updated = [
                                          ...(newTask.questions || []),
                                        ];
                                        const nextOpts = [...(q.options || [])];
                                        nextOpts[optIdx] = e.target.value;
                                        updated[qIdx] = {
                                          ...q,
                                          options: nextOpts,
                                        };
                                        setNewTask({
                                          ...newTask,
                                          questions: updated,
                                        });
                                      }}
                                      className="flex-1 h-7 px-2 text-[10px] font-semibold text-gray-600 border border-gray-100 rounded bg-white focus:outline-none focus:border-amber-400"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [
                                          ...(newTask.questions || []),
                                        ];
                                        const nextOpts = (
                                          q.options || []
                                        ).filter((_, idx) => idx !== optIdx);
                                        updated[qIdx] = {
                                          ...q,
                                          options: nextOpts,
                                        };
                                        setNewTask({
                                          ...newTask,
                                          questions: updated,
                                        });
                                      }}
                                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newQ = {
                          id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                          questionText: "New Question",
                          type: "text" as const,
                          required: true,
                        };
                        setNewTask({
                          ...newTask,
                          questions: [...(newTask.questions || []), newQ],
                        });
                      }}
                      className="w-full h-9 border-2 border-dashed border-amber-200 hover:border-amber-400 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-black text-amber-600 hover:text-amber-700 transition-colors bg-white font-sans uppercase tracking-widest"
                    >
                      <Plus size={14} /> Add Survey Question
                    </button>
                  </div>
                )}

                <Button
                  onClick={handleAddTask}
                  className="w-full h-14 rounded-2xl"
                >
                  Create Task
                </Button>
              </div>
            )}

            {tab === "coupons" && (
              <div className="space-y-4">
                <Input
                  label="Coupon Code"
                  value={newCoupon.code}
                  onChange={(val: string) =>
                    setNewCoupon({ ...newCoupon, code: val.toUpperCase() })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Discount Value"
                    type="number"
                    value={newCoupon.value}
                    onChange={(val: string) =>
                      setNewCoupon({ ...newCoupon, value: Number(val) })
                    }
                  />
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                      Type
                    </label>
                    <select
                      className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-[#FFC107] outline-none h-[52px]"
                      value={newCoupon.discountType}
                      onChange={(e: any) =>
                        setNewCoupon({
                          ...newCoupon,
                          discountType: e.target.value as any,
                        })
                      }
                    >
                      <option value="fixed">Fixed (৳)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                </div>
                <Input
                  label="Min Spend (৳)"
                  type="number"
                  value={newCoupon.minSpend}
                  onChange={(val: string) =>
                    setNewCoupon({ ...newCoupon, minSpend: Number(val) })
                  }
                />
                <Button
                  onClick={handleAddCoupon}
                  className="w-full h-14 rounded-2xl"
                >
                  Create Coupon
                </Button>
              </div>
            )}

            {tab === "notifications" && (
              <div className="space-y-4">
                <Input
                  label="Notification Title"
                  value={newNotif.title}
                  onChange={(val: string) =>
                    setNewNotif({ ...newNotif, title: val })
                  }
                />
                <Textarea
                  label="Message (নিউজ বা নোটিশের বড় টেক্সট)"
                  value={newNotif.message}
                  onChange={(val: string) =>
                    setNewNotif({ ...newNotif, message: val })
                  }
                  rows={6}
                />
                <Input
                  label="Notification Image URL (পিকচার লিংক - ঐচ্ছিক)"
                  value={newNotif.imageUrl || ""}
                  placeholder="https://images.unsplash.com/..."
                  onChange={(val: string) =>
                    setNewNotif({ ...newNotif, imageUrl: val })
                  }
                />

                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                    Type
                  </label>
                  <select
                    className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-[#FFC107] outline-none h-[52px]"
                    value={newNotif.type}
                    onChange={(e: any) =>
                      setNewNotif({ ...newNotif, type: e.target.value as any })
                    }
                  >
                    <option value="info">Info</option>
                    <option value="alert">Alert</option>
                    <option value="update">Update</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <h4 className="text-xs font-black text-gray-900 font-sans">
                      Show as Start Popup (স্টার্টআপ পপআপ হিসেবে দেখান)
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase font-sans">
                      App চালু হওয়া মাত্রই এই নোটিশটি পপআপে দেখাবে
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewNotif({
                        ...newNotif,
                        showAsPopup: !newNotif.showAsPopup,
                      });
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${newNotif.showAsPopup ? "bg-[#FFC107]" : "bg-gray-200"}`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${newNotif.showAsPopup ? "left-7" : "left-1"}`}
                    />
                  </button>
                </div>

                <Button
                  onClick={handleSendNotif}
                  className="w-full h-14 rounded-2xl"
                >
                  Send Broadcast
                </Button>
              </div>
            )}

            {tab === "faqs" && (
              <div className="space-y-4">
                <Input
                  label="Question"
                  value={newFAQ.question}
                  onChange={(val: string) =>
                    setNewFAQ({ ...newFAQ, question: val })
                  }
                />
                <Input
                  label="Answer"
                  value={newFAQ.answer}
                  onChange={(val: string) =>
                    setNewFAQ({ ...newFAQ, answer: val })
                  }
                />
                <Input
                  label="Sort Order"
                  type="number"
                  value={newFAQ.order}
                  onChange={(val: string) =>
                    setNewFAQ({ ...newFAQ, order: Number(val) })
                  }
                />
                <Button
                  onClick={handleAddFAQ}
                  className="w-full h-14 rounded-2xl"
                >
                  Create FAQ
                </Button>
              </div>
            )}

            {tab === "banners" && (
              <div className="space-y-4">
                <Input
                  label="Banner Title (ঐচ্ছিক)"
                  placeholder="যেমন: স্পেশাল বোনাস টাস্ক!"
                  value={newBanner.title || ""}
                  onChange={(val: string) =>
                    setNewBanner({ ...newBanner, title: val })
                  }
                />
                <ImagePicker
                  label="Banner Image"
                  value={newBanner.imageUrl || ""}
                  onChange={(val: string) =>
                    setNewBanner({ ...newBanner, imageUrl: val })
                  }
                  folder="banners"
                />
                <Input
                  label="Target Action URL (ঐচ্ছিক)"
                  placeholder="যেমন: /tasks বা external link"
                  value={newBanner.targetUrl || ""}
                  onChange={(val: string) =>
                    setNewBanner({ ...newBanner, targetUrl: val })
                  }
                />
                <Button
                  onClick={handleAddBanner}
                  className="w-full h-14 rounded-2xl"
                >
                  {editingItem ? "Update Banner" : "Create Banner"}
                </Button>
              </div>
            )}

            {tab === "missions" && (
              <div className="space-y-4">
                <Input
                  label="Mission Title"
                  value={newMission.title}
                  onChange={(val: string) =>
                    setNewMission({ ...newMission, title: val })
                  }
                />
                <Input
                  label="Description"
                  value={newMission.description}
                  onChange={(val: string) =>
                    setNewMission({ ...newMission, description: val })
                  }
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Goal"
                    type="number"
                    value={newMission.goal}
                    onChange={(val: string) =>
                      setNewMission({ ...newMission, goal: Number(val) })
                    }
                  />
                  <Input
                    label="Reward"
                    type="number"
                    value={newMission.reward}
                    onChange={(val: string) =>
                      setNewMission({ ...newMission, reward: Number(val) })
                    }
                  />
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                      Type
                    </label>
                    <select
                      className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-[#FFC107] outline-none h-[52px]"
                      value={newMission.type}
                      onChange={(e: any) =>
                        setNewMission({
                          ...newMission,
                          type: e.target.value as any,
                        })
                      }
                    >
                      <option value="tasks">Tasks</option>
                      <option value="referrals">Referrals</option>
                      <option value="spend">Spend</option>
                    </select>
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    if (editingItem) {
                      await dbService.updateMission(editingItem.id, newMission);
                    } else {
                      await dbService.addMission(newMission as any);
                    }
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-widest"
                >
                  {editingItem ? "Update" : "Create"} Mission
                </Button>
              </div>
            )}

            {tab === "deals" && (
              <div className="space-y-4">
                <Input
                  label="Deal Title"
                  value={newDeal.title}
                  onChange={(val: string) =>
                    setNewDeal({ ...newDeal, title: val })
                  }
                />
                <Input
                  label="Description"
                  value={newDeal.description}
                  onChange={(val: string) =>
                    setNewDeal({ ...newDeal, description: val })
                  }
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Price (৳)"
                    type="number"
                    value={newDeal.price}
                    onChange={(val: string) =>
                      setNewDeal({ ...newDeal, price: Number(val) })
                    }
                  />
                  <Input
                    label="Original Price"
                    type="number"
                    value={newDeal.originalPrice}
                    onChange={(val: string) =>
                      setNewDeal({ ...newDeal, originalPrice: Number(val) })
                    }
                  />
                  <Input
                    label="Stock"
                    type="number"
                    value={newDeal.stock}
                    onChange={(val: string) =>
                      setNewDeal({ ...newDeal, stock: Number(val) })
                    }
                  />
                </div>
                <ImagePicker
                  label="Secret Deal Image"
                  value={newDeal.image || ""}
                  onChange={(val: string) =>
                    setNewDeal({ ...newDeal, image: val })
                  }
                  folder="deals"
                />
                <Button
                  onClick={async () => {
                    if (editingItem) {
                      await dbService.updateSecretDeal(editingItem.id, newDeal);
                    } else {
                      await dbService.addSecretDeal(newDeal as any);
                    }
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-widest"
                >
                  {editingItem ? "Update" : "Create"} Secret Deal
                </Button>
              </div>
            )}

            {tab === "service-hub" && (
              <div className="space-y-4">
                <Input
                  label="Provider Name"
                  value={newServiceProvider.name}
                  onChange={(val: string) =>
                    setNewServiceProvider({ ...newServiceProvider, name: val })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400">
                      Category
                    </label>
                    <select
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold h-[52px]"
                      value={newServiceProvider.category}
                      onChange={(e) =>
                        setNewServiceProvider({
                          ...newServiceProvider,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="plumber">Plumber</option>
                      <option value="electrician">Electrician</option>
                      <option value="cleaner">Cleaner</option>
                      <option value="repair">Repair</option>
                    </select>
                  </div>
                  <Input
                    label="Base Price (৳)"
                    type="number"
                    value={newServiceProvider.basePrice}
                    onChange={(val: string) =>
                      setNewServiceProvider({
                        ...newServiceProvider,
                        basePrice: Number(val),
                      })
                    }
                  />
                </div>
                <Input
                  label="Bio / Experience"
                  value={newServiceProvider.bio}
                  onChange={(val: string) =>
                    setNewServiceProvider({ ...newServiceProvider, bio: val })
                  }
                />
                <Input
                  label="Location (e.g. Mirpur, Dhaka)"
                  value={newServiceProvider.location?.address}
                  onChange={(val: string) =>
                    setNewServiceProvider({
                      ...newServiceProvider,
                      location: { address: val },
                    })
                  }
                />

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <span className="text-xs font-black uppercase text-gray-900">
                    Verified Pro
                  </span>
                  <button
                    onClick={() =>
                      setNewServiceProvider({
                        ...newServiceProvider,
                        isVerified: !newServiceProvider.isVerified,
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative ${newServiceProvider.isVerified ? "bg-blue-500" : "bg-gray-200"}`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${newServiceProvider.isVerified ? "left-7" : "left-1"}`}
                    />
                  </button>
                </div>

                <Button
                  onClick={async () => {
                    if (editingItem) {
                      await dbService.updateServiceProvider(
                        editingItem.id,
                        newServiceProvider,
                      );
                    } else {
                      await dbService.addServiceProvider(
                        newServiceProvider as any,
                      );
                    }
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-widest"
                >
                  {editingItem ? "Update" : "Add"} Provider
                </Button>
              </div>
            )}

            {tab === "education-hub" && (
              <div className="space-y-4">
                <Input
                  label="Resource Title"
                  value={newStudentResource.title}
                  onChange={(val: string) =>
                    setNewStudentResource({ ...newStudentResource, title: val })
                  }
                />
                <Input
                  label="Description"
                  value={newStudentResource.description}
                  onChange={(val: string) =>
                    setNewStudentResource({
                      ...newStudentResource,
                      description: val,
                    })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400">
                      Type
                    </label>
                    <select
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold h-[52px]"
                      value={newStudentResource.type}
                      onChange={(e) =>
                        setNewStudentResource({
                          ...newStudentResource,
                          type: e.target.value as any,
                        })
                      }
                    >
                      <option value="Note">Note</option>
                      <option value="PDF">PDF</option>
                      <option value="Book">Book</option>
                      <option value="Question">Question</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400">
                      Category
                    </label>
                    <select
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold h-[52px]"
                      value={newStudentResource.category}
                      onChange={(e) =>
                        setNewStudentResource({
                          ...newStudentResource,
                          category: e.target.value,
                        })
                      }
                    >
                      <option>Science</option>
                      <option>Commerce</option>
                      <option>Arts</option>
                      <option>IT</option>
                      <option>General</option>
                    </select>
                  </div>
                </div>
                <Input
                  label="Price (৳)"
                  type="number"
                  value={newStudentResource.price}
                  onChange={(val: string) =>
                    setNewStudentResource({
                      ...newStudentResource,
                      price: Number(val),
                    })
                  }
                />
                <ImagePicker
                  label="Preview Image"
                  value={newStudentResource.previewUrl || ""}
                  onChange={(val: string) =>
                    setNewStudentResource({
                      ...newStudentResource,
                      previewUrl: val,
                    })
                  }
                  folder="resources"
                />

                <Button
                  onClick={async () => {
                    if (editingItem) {
                      await dbService.updateStudentResource(
                        editingItem.id,
                        newStudentResource,
                      );
                    } else {
                      await dbService.uploadResource(newStudentResource as any);
                    }
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-widest"
                >
                  {editingItem ? "Update" : "Upload"} Resource
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              onClick={() => setShowAddModal(false)}
              className="w-full text-gray-400"
            >
              Cancel
            </Button>
          </motion.div>
        </div>
      )}
      {/* Custom Confirmation Dialog */}
      {customConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setCustomConfirm(null)}
          />
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl border border-gray-100 flex flex-col space-y-4">
            <h3 className="text-base font-black text-[#37474F] uppercase tracking-wider">
              {customConfirm.title}
            </h3>
            <p className="text-xs font-semibold text-gray-500 leading-relaxed">
              {customConfirm.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCustomConfirm(null)}
                className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  customConfirm.onConfirm();
                  setCustomConfirm(null);
                }}
                className="flex-grow h-12 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md font-sans"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Input/Prompt Dialog */}
      {promptInput && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setPromptInput(null)}
          />
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl border border-gray-100 flex flex-col space-y-4">
            <h3 className="text-base font-black text-[#37474F] uppercase tracking-wider">
              {promptInput.title}
            </h3>
            <p className="text-xs font-semibold text-gray-500 leading-relaxed">
              {promptInput.message}
            </p>
            <input
              type="text"
              placeholder={promptInput.placeholder}
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3 px-4 outline-none focus:border-[#FFC107] transition-all text-xs font-bold"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setPromptInput(null)}
                className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  promptInput.onSubmit(promptValue);
                  setPromptInput(null);
                }}
                className="flex-grow h-12 bg-[#FFC107] hover:bg-[#FFB300] text-[#37474F] rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Elegant Native Toasts */}
      {toast && (
        <div className="fixed bottom-6 left-6 right-6 max-w-sm mx-auto z-[120] pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gray-900 text-white rounded-2xl px-5 py-4 shadow-xl border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#FFC107] animate-ping shrink-0" />
              <p className="text-xs font-bold leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-[10px] text-gray-400 hover:text-white font-bold uppercase px-2 py-1 bg-white/5 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* KYC Image Lightbox Overlay */}
      {adminKycLightboxImg && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setAdminKycLightboxImg(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-gray-900 flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={adminKycLightboxImg}
              alt="KYC Document Zoomed"
              className="max-w-full max-h-[80vh] object-contain"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setAdminKycLightboxImg(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white w-9 h-9 rounded-full flex items-center justify-center transition-all font-black text-sm border border-white/10"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
