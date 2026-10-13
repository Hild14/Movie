import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, MapPin, User, Play, Ticket, Star, Clock, Calendar,
  ChevronLeft, ChevronRight, Film, X, Plus, Minus, CreditCard,
  Check, QrCode, Download, Home, Heart, Filter, Popcorn,
  ShoppingCart, Tag, ChevronDown, Menu, Sparkles, LogOut,
  Mail, Lock, CheckCircle, AlertCircle, Info, ExternalLink
} from 'lucide-react';
import {
  movies, cities, theaters, showtimes, snacks, seatPrices, paymentMethods
} from './data/mockData.js';

// ============================================================
// UTILITY HELPERS
// ============================================================
const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN').format(price) + 'đ';

const generateBookingId = () =>
  'CV' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

const getDayLabel = (dateStr) => {
  const today = new Date('2026-10-12');
  const target = new Date(dateStr);
  const diff = Math.floor((target - today) / 86400000);
  if (diff === 0) return 'Hôm nay';
  if (diff === 1) return 'Ngày mai';
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[target.getDay()];
};

const getDateDisplay = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

const allGenres = ['Tất cả', 'Hành Động', 'Tình Cảm', 'Hoạt Hình', 'Hài Hước', 'Giật Gân', 'Khoa Học Viễn Tưởng', 'Tâm Lý', 'Phiêu Lưu'];
const allFormats = ['Tất cả', '2D', '3D', 'IMAX'];

// Initial mock booking for demonstration
const initialSampleBookings = [
  {
    bookingId: 'CV-DEMO-2026',
    movie: movies[1], // Avengers
    showtimeInfo: {
      theater: theaters[1],
      room: { id: 204, name: 'IMAX' },
      date: '2026-10-14',
      time: '19:00',
    },
    selectedSeats: [{ id: 'E6', type: 'vip', price: 120000 }, { id: 'E7', type: 'vip', price: 120000 }],
    snackOrders: { 2: 1 },
    seatTotal: 240000,
    snackTotal: 109000,
    discount: 34900,
    grandTotal: 314100,
    paymentMethod: paymentMethods[0],
    createdAt: '2026-10-11T10:30:00Z',
    status: 'upcoming',
  },
  {
    bookingId: 'CV-PAST-1092',
    movie: movies[3], // Mai
    showtimeInfo: {
      theater: theaters[0],
      room: { id: 101, name: 'Rạp 1' },
      date: '2026-10-08',
      time: '20:15',
    },
    selectedSeats: [{ id: 'D5', type: 'vip', price: 120000 }],
    snackOrders: { 5: 1 },
    seatTotal: 120000,
    snackTotal: 32000,
    discount: 0,
    grandTotal: 152000,
    paymentMethod: paymentMethods[1],
    createdAt: '2026-10-07T14:20:00Z',
    status: 'completed',
  }
];

// ============================================================
// TOAST NOTIFICATION CONTAINER
// ============================================================
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'success'
              ? 'bg-zinc-900/95 border-emerald-500/40 text-emerald-400'
              : toast.type === 'error'
              ? 'bg-zinc-900/95 border-red-500/40 text-red-400'
              : 'bg-zinc-900/95 border-amber-500/40 text-amber-400'
          }`}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />}
          <div className="flex-1 text-xs sm:text-sm text-zinc-100 font-medium">
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-zinc-500 hover:text-zinc-300 p-0.5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// AUTH MODAL (Login / Register)
// ============================================================
function AuthModal({ isOpen, onClose, onLoginSuccess, showToast }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || (tab === 'register' && !name)) {
      showToast('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    const displayName = tab === 'register' ? name : (email.split('@')[0] || 'Cinephile');
    const user = {
      name: displayName,
      email: email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`,
    };

    onLoginSuccess(user);
    showToast(tab === 'login' ? `Đăng nhập thành công! Chào ${displayName}` : `Đăng ký thành công! Chào mừng ${displayName}`, 'success');
    onClose();
  };

  const handleDemoLogin = () => {
    const demoUser = {
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    };
    onLoginSuccess(demoUser);
    showToast('Đăng nhập dùng thử thành công!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-cinema-card border border-cinema-border rounded-2xl w-full max-w-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-cinema-red to-cinema-gold rounded-xl flex items-center justify-center mb-2 shadow-lg shadow-red-500/20">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Chào mừng đến CineVerse</h2>
          <p className="text-xs text-zinc-400 mt-1">Đăng nhập để xem lịch sử vé và phim yêu thích</p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 bg-zinc-800/80 p-1 rounded-xl mb-6 border border-zinc-700/60">
          <button
            onClick={() => setTab('login')}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === 'login' ? 'bg-cinema-red text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setTab('register')}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === 'register' ? 'bg-cinema-red text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/70 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cinema-red transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/70 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cinema-red transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/70 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cinema-red transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 mt-2 bg-gradient-to-r from-cinema-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
          >
            {tab === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản'}
          </button>
        </form>

        <div className="relative my-5 text-center">
          <div className="border-t border-zinc-700/80" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cinema-card px-3 text-xs text-zinc-500">
            hoặc
          </span>
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 text-zinc-200 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 group"
        >
          <Sparkles className="w-4 h-4 text-cinema-gold group-hover:rotate-12 transition-transform" />
          Đăng nhập dùng thử (Demo Account)
        </button>
      </div>
    </div>
  );
}

// ============================================================
// TRAILER MODAL
// ============================================================
function TrailerModal({ movie, onClose }) {
  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <Play className="w-5 h-5 text-cinema-red fill-cinema-red" />
            <h3 className="font-bold text-white text-base truncate">
              Trailer: {movie.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Responsive Container */}
        <div className="relative aspect-video w-full bg-black">
          {movie.trailerUrl ? (
            <iframe
              src={`${movie.trailerUrl}?autoplay=1&rel=0`}
              title={`Trailer ${movie.title}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
              Trailer đang được cập nhật...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MY BOOKINGS MODAL
// ============================================================
function MyBookingsModal({ isOpen, onClose, bookings, onViewTicketDetail, onBookNewMovie }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'upcoming' | 'completed'

  if (!isOpen) return null;

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-cinema-card border border-cinema-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-cinema-border flex items-center justify-between shrink-0 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-cinema-red" />
            <h2 className="text-xl font-bold text-white">Vé của tôi</h2>
            <span className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-400 rounded-full font-medium">
              {bookings.length} vé
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex px-5 pt-3 border-b border-zinc-800 gap-2 shrink-0 bg-zinc-900/30">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'upcoming', label: 'Sắp chiếu' },
            { id: 'completed', label: 'Đã xem' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`pb-2.5 px-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === t.id
                  ? 'border-cinema-red text-cinema-red'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-14">
              <Ticket className="w-16 h-16 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 font-medium">Không tìm thấy vé xem phim nào</p>
              <p className="text-zinc-600 text-xs mt-1">Hãy đặt ngay một bộ phim hấp dẫn để trải nghiệm rạp nhé!</p>
              <button
                onClick={() => {
                  onClose();
                  onBookNewMovie();
                }}
                className="mt-4 px-5 py-2 bg-cinema-red text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                Khám phá phim ngay
              </button>
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div
                key={b.bookingId}
                className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-all hover:shadow-lg flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
              >
                <div className="flex gap-3.5 items-center">
                  <img
                    src={b.movie.poster}
                    alt={b.movie.title}
                    className="w-16 h-24 object-cover rounded-lg border border-zinc-800 shrink-0 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        b.status === 'upcoming'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {b.status === 'upcoming' ? 'Sắp chiếu' : 'Đã xem'}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">#{b.bookingId}</span>
                    </div>
                    <h4 className="font-bold text-white text-base line-clamp-1">{b.movie.title}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {b.showtimeInfo.theater.name} • {b.showtimeInfo.room.name}
                    </p>
                    <p className="text-xs text-cinema-gold font-medium mt-1">
                      {getDateDisplay(b.showtimeInfo.date)} - {b.showtimeInfo.time} | Ghế: {b.selectedSeats.map(s => s.id).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-zinc-800">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-zinc-500 block uppercase">Tổng tiền</span>
                    <span className="text-base font-bold text-cinema-gold">{formatPrice(b.grandTotal)}</span>
                  </div>
                  <button
                    onClick={() => {
                      onViewTicketDetail(b);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-cinema-red/20 hover:bg-cinema-red text-cinema-red hover:text-white border border-cinema-red/40 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Xem E-Ticket
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FAVORITES MODAL
// ============================================================
function FavoritesModal({ isOpen, onClose, favoriteIds, onBookMovie, onToggleFavorite }) {
  if (!isOpen) return null;

  const favoriteMovies = movies.filter((m) => favoriteIds.includes(m.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-cinema-card border border-cinema-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-cinema-border flex items-center justify-between shrink-0 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-cinema-red fill-cinema-red" />
            <h2 className="text-xl font-bold text-white">Phim yêu thích</h2>
            <span className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-400 rounded-full font-medium">
              {favoriteMovies.length} phim
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {favoriteMovies.length === 0 ? (
            <div className="text-center py-14">
              <Heart className="w-16 h-16 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 font-medium">Chưa có phim nào trong danh sách yêu thích</p>
              <p className="text-zinc-600 text-xs mt-1">Bấm vào biểu tượng trái tim trên thẻ phim để lưu lại nhé!</p>
            </div>
          ) : (
            favoriteMovies.map((m) => (
              <div
                key={m.id}
                className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3.5 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img src={m.poster} alt={m.title} className="w-14 h-20 object-cover rounded-lg border border-zinc-800 shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">{m.title}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{m.duration} phút • {m.genre.join(', ')}</p>
                    <div className="flex items-center gap-1 text-xs text-cinema-gold mt-1">
                      <Star className="w-3.5 h-3.5 fill-cinema-gold" />
                      <span>{m.rating}/10</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onToggleFavorite(m.id)}
                    className="p-2 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors"
                    title="Xóa khỏi yêu thích"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onBookMovie(m);
                    }}
                    className="px-3.5 py-1.5 bg-cinema-red text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors flex items-center gap-1"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    Đặt vé
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HEADER COMPONENT
// ============================================================
function Header({
  searchQuery, setSearchQuery, selectedCity, setSelectedCity, onLogoClick,
  currentUser, onOpenAuth, onLogout, onOpenBookings, onOpenFavorites,
  favoriteCount, bookingCount
}) {
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cinema-darker/90 backdrop-blur-xl border-b border-cinema-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <button onClick={onLogoClick} className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 bg-gradient-to-br from-cinema-red to-cinema-gold rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-red-500/20">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xl font-extrabold bg-gradient-to-r from-cinema-red via-red-500 to-cinema-gold bg-clip-text text-transparent block leading-tight">
              CineVerse
            </span>
          </div>
        </button>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm phim, thể loại, đạo diễn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800/60 border border-zinc-700/80 rounded-full text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cinema-red focus:ring-1 focus:ring-cinema-red transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* City Selector, Favorites shortcut & Auth */}
        <div className="flex items-center gap-2.5">
          {/* City Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800/60 border border-zinc-700/80 rounded-full text-xs sm:text-sm hover:border-cinema-gold transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-cinema-gold" />
              <span className="hidden sm:inline text-zinc-300">{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>
            {showCityDropdown && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => { setSelectedCity(city); setShowCityDropdown(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-zinc-700 transition-colors ${
                      city === selectedCity ? 'text-cinema-gold bg-zinc-700/50 font-medium' : 'text-zinc-300'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Favorites Button Shortcut */}
          <button
            onClick={onOpenFavorites}
            className="relative p-2 bg-zinc-800/60 border border-zinc-700/80 hover:border-red-500/50 rounded-full text-zinc-300 hover:text-red-400 transition-colors"
            title="Phim yêu thích"
          >
            <Heart className="w-4 h-4" />
            {favoriteCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-cinema-red text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                {favoriteCount}
              </span>
            )}
          </button>

          {/* User Profile / Login */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-zinc-800/80 border border-zinc-700 rounded-full hover:border-zinc-500 transition-all"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-zinc-600"
                />
                <span className="text-xs sm:text-sm font-medium text-zinc-200 max-w-[100px] truncate hidden sm:inline">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {/* Profile Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-800 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in py-1">
                  <div className="px-4 py-3 border-b border-zinc-700/60">
                    <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{currentUser.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenBookings();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-700 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Ticket className="w-4 h-4 text-cinema-red" />
                      Vé đã đặt
                    </span>
                    <span className="text-xs bg-zinc-700 px-2 py-0.5 rounded-full text-zinc-300">
                      {bookingCount}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenFavorites();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-700 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Heart className="w-4 h-4 text-red-400" />
                      Phim yêu thích
                    </span>
                    <span className="text-xs bg-zinc-700 px-2 py-0.5 rounded-full text-zinc-300">
                      {favoriteCount}
                    </span>
                  </button>

                  <div className="border-t border-zinc-700/60 my-1" />

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cinema-red to-red-600 rounded-full text-xs sm:text-sm font-semibold text-white hover:shadow-lg hover:shadow-red-500/25 transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-3 border-t border-zinc-800">
          <div className="relative mt-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Tìm phim, thể loại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800/80 border border-zinc-700 rounded-full text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cinema-red transition-all"
            />
          </div>
        </div>
      )}
    </header>
  );
}

// ============================================================
// HERO BANNER COMPONENT
// ============================================================
function HeroBanner({ onBookNow, onViewDetail, onPlayTrailer, isFavorite, onToggleFavorite }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const featuredMovies = movies.filter(m => m.isNowShowing).slice(0, 3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredMovies.length]);

  const movie = featuredMovies[currentSlide];
  const favorited = isFavorite(movie.id);

  return (
    <div className="relative w-full h-[430px] md:h-[520px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 transition-all duration-700">
        <img
          src={movie.banner}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="banner-overlay absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex flex-col justify-end pb-12">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2.5 py-0.5 text-xs font-bold rounded ${
            movie.ageRating === 'P' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
            movie.ageRating === 'C13' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
            movie.ageRating === 'C16' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
            'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {movie.ageRating}
          </span>
          {movie.format.map(f => (
            <span key={f} className="px-2 py-0.5 text-xs font-medium bg-zinc-800/70 text-zinc-300 rounded border border-zinc-700">
              {f}
            </span>
          ))}
          <span className="px-2 py-0.5 text-xs font-semibold bg-cinema-gold/20 text-cinema-gold rounded border border-cinema-gold/30 flex items-center gap-1">
            <Star className="w-3 h-3 fill-cinema-gold" />
            {movie.rating}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-xl max-w-2xl leading-tight">
          {movie.title}
        </h1>

        <div className="flex items-center gap-4 text-xs sm:text-sm text-zinc-300 mb-5">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-zinc-400" />
            {movie.duration} phút
          </span>
          <span>•</span>
          <span className="truncate max-w-xs">{movie.genre.join(', ')}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onPlayTrailer(movie)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-semibold hover:bg-white/25 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            Xem Trailer
          </button>
          <button
            onClick={() => onBookNow(movie)}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cinema-red to-red-600 rounded-full text-white text-sm font-bold hover:shadow-lg hover:shadow-red-500/30 hover:scale-105 transition-all"
          >
            <Ticket className="w-4 h-4" />
            Đặt Vé Ngay
          </button>
          <button
            onClick={() => onToggleFavorite(movie.id)}
            className={`p-2.5 rounded-full border transition-all ${
              favorited
                ? 'bg-red-500/20 border-red-500 text-red-500'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`}
            title={favorited ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {featuredMovies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'w-8 bg-cinema-red' : 'w-3 bg-zinc-500/70 hover:bg-zinc-400'
            }`}
          />
        ))}
      </div>

      {/* Nav Arrows */}
      <button
        onClick={() => setCurrentSlide((currentSlide - 1 + featuredMovies.length) % featuredMovies.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 bg-black/40 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-black/60 transition-all hidden md:block"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => setCurrentSlide((currentSlide + 1) % featuredMovies.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 bg-black/40 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-black/60 transition-all hidden md:block"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}

// ============================================================
// MOVIE CARD COMPONENT
// ============================================================
function MovieCard({ movie, onBook, onViewDetail, onPlayTrailer, isFavorite, onToggleFavorite }) {
  const favorited = isFavorite(movie.id);

  return (
    <div className="group bg-cinema-card rounded-2xl overflow-hidden border border-cinema-border hover:border-cinema-red/50 transition-all duration-300 hover:shadow-xl hover:shadow-cinema-red/10 hover:-translate-y-1 flex flex-col">
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden cursor-pointer" onClick={() => onViewDetail(movie)}>
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Age Rating Badge */}
        <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 text-[11px] font-bold rounded ${
          movie.ageRating === 'P' ? 'bg-green-500 text-white' :
          movie.ageRating === 'C13' ? 'bg-yellow-500 text-black' :
          movie.ageRating === 'C16' ? 'bg-orange-500 text-white' :
          'bg-red-500 text-white'
        }`}>
          {movie.ageRating}
        </span>

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(movie.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all ${
            favorited
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-black/50 text-white hover:bg-red-500/80 hover:text-white'
          }`}
          title={favorited ? 'Bỏ thích' : 'Yêu thích'}
        >
          <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-current' : ''}`} />
        </button>

        {/* Rating */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-lg">
          <Star className="w-3 h-3 text-cinema-gold fill-cinema-gold" />
          <span className="text-xs font-bold text-white">{movie.rating}</span>
        </div>

        {/* Play Trailer overlay icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayTrailer(movie);
          }}
          className="absolute inset-0 m-auto w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
          title="Xem trailer"
        >
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <h3
            onClick={() => onViewDetail(movie)}
            className="font-bold text-white text-sm mb-1 line-clamp-1 group-hover:text-cinema-red transition-colors cursor-pointer"
          >
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {movie.duration}p
            </span>
            <span>•</span>
            <span className="truncate">{movie.genre.join(', ')}</span>
          </div>
          <div className="flex gap-1 mb-3">
            {movie.format.map(f => (
              <span key={f} className="px-1.5 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
                {f}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => onBook(movie)}
          className="w-full py-2 bg-cinema-red/10 border border-cinema-red/30 text-cinema-red hover:bg-cinema-red hover:text-white text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5"
        >
          <Ticket className="w-3.5 h-3.5" />
          Đặt vé
        </button>
      </div>
    </div>
  );
}

// ============================================================
// MOVIE DETAIL MODAL
// ============================================================
function MovieDetailModal({ movie, onClose, onBook, onPlayTrailer, isFavorite, onToggleFavorite }) {
  if (!movie) return null;
  const favorited = isFavorite(movie.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-cinema-card border border-cinema-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="relative h-48 md:h-64">
          <img src={movie.banner} alt={movie.title} className="w-full h-full object-cover rounded-t-2xl" />
          <div className="banner-overlay absolute inset-0 rounded-t-2xl" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white hover:bg-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={() => onPlayTrailer(movie)}
            className="absolute bottom-4 right-4 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full text-xs font-semibold hover:bg-white/30 flex items-center gap-2 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Xem Trailer
          </button>
        </div>

        {/* Content */}
        <div className="p-6 -mt-16 relative">
          <div className="flex gap-4">
            <img src={movie.poster} alt={movie.title} className="w-24 h-36 object-cover rounded-xl shadow-xl border-2 border-cinema-border shrink-0" />
            <div className="pt-12 flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{movie.title}</h2>
              {movie.originalTitle !== movie.title && (
                <p className="text-xs text-zinc-400 mb-2">{movie.originalTitle}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                  movie.ageRating === 'P' ? 'bg-green-500 text-white' :
                  movie.ageRating === 'C13' ? 'bg-yellow-500 text-black' :
                  movie.ageRating === 'C16' ? 'bg-orange-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {movie.ageRating}
                </span>
                <span className="flex items-center gap-1 text-xs text-cinema-gold">
                  <Star className="w-3.5 h-3.5 fill-cinema-gold" /> {movie.rating}/10
                </span>
                <span className="flex items-center gap-1 text-xs text-zinc-400">
                  <Clock className="w-3.5 h-3.5" /> {movie.duration} phút
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Thể loại</span>
              <p className="text-sm text-zinc-300">{movie.genre.join(', ')}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Đạo diễn</span>
              <p className="text-sm text-zinc-300">{movie.director}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Diễn viên</span>
              <p className="text-sm text-zinc-300">{movie.cast.join(', ')}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Nội dung</span>
              <p className="text-sm text-zinc-300 leading-relaxed">{movie.synopsis}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Định dạng</span>
              <div className="flex gap-2 mt-1">
                {movie.format.map(f => (
                  <span key={f} className="px-3 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700">{f}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onToggleFavorite(movie.id)}
              className={`p-3 rounded-xl border transition-all ${
                favorited
                  ? 'bg-red-500/20 border-red-500 text-red-500'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
              title={favorited ? 'Bỏ thích' : 'Yêu thích'}
            >
              <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => onBook(movie)}
              className="flex-1 py-3 bg-gradient-to-r from-cinema-red to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Ticket className="w-5 h-5" />
              Đặt Vé Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SHOWTIME SELECTION COMPONENT
// ============================================================
function ShowtimeSelection({ movie, selectedCity, onSelectShowtime, onBack }) {
  const availableDates = Object.keys(showtimes);
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const cityTheaters = theaters.filter(t => t.city === selectedCity);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm">Quay lại danh sách phim</span>
      </button>

      <div className="flex gap-4 mb-8 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
        <img src={movie.poster} alt={movie.title} className="w-20 h-28 object-cover rounded-xl border border-cinema-border shadow-md" />
        <div>
          <h2 className="text-xl font-bold text-white">{movie.title}</h2>
          <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-zinc-400">
            <span className={`px-2 py-0.5 font-bold rounded ${
              movie.ageRating === 'P' ? 'bg-green-500 text-white' :
              movie.ageRating === 'C13' ? 'bg-yellow-500 text-black' :
              movie.ageRating === 'C16' ? 'bg-orange-500 text-white' :
              'bg-red-500 text-white'
            }`}>{movie.ageRating}</span>
            <span>{movie.duration} phút</span>
            <span>•</span>
            <span>{movie.genre.join(', ')}</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Đạo diễn: {movie.director}
          </p>
        </div>
      </div>

      {/* Date Selection */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cinema-red" />
          Chọn ngày chiếu
        </h3>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {availableDates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center min-w-[76px] px-4 py-3 rounded-xl border transition-all ${
                date === selectedDate
                  ? 'bg-cinema-red/20 border-cinema-red text-cinema-red shadow-lg shadow-red-500/10'
                  : 'bg-zinc-800/60 border-zinc-700/80 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              <span className="text-xs font-medium">{getDayLabel(date)}</span>
              <span className="text-lg font-bold text-white">{getDateDisplay(date)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Theater & Showtime */}
      <div>
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Film className="w-4 h-4 text-cinema-gold" />
          Rạp chiếu tại {selectedCity}
        </h3>
        {cityTheaters.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-40 text-cinema-gold" />
            <p className="font-medium text-zinc-400">Không có rạp chiếu tại thành phố này</p>
            <p className="text-xs mt-1 text-zinc-600">Vui lòng đổi thành phố khác ở thanh trên cùng</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cityTheaters.map((theater) => (
              <div key={theater.id} className="bg-cinema-card border border-cinema-border rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-base">{theater.name}</h4>
                  <span className="text-xs text-zinc-400">{selectedCity}</span>
                </div>
                <p className="text-xs text-zinc-500 mb-3.5">{theater.rooms.map(r => r.name).join(' • ')}</p>
                <div className="flex flex-wrap gap-2.5">
                  {(showtimes[selectedDate] || []).map((time) => (
                    <button
                      key={time}
                      onClick={() => onSelectShowtime({
                        theater,
                        room: theater.rooms[Math.floor(Math.random() * theater.rooms.length)],
                        date: selectedDate,
                        time,
                      })}
                      className="px-4 py-2 bg-zinc-800/80 border border-zinc-700 rounded-xl text-sm text-zinc-200 hover:bg-cinema-red hover:border-cinema-red hover:text-white transition-all font-semibold shadow-sm"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SEAT SELECTION COMPONENT
// ============================================================
function SeatSelection({ movie, showtimeInfo, onConfirmSeats, onBack }) {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const cols = Array.from({ length: 12 }, (_, i) => i + 1);

  const reservedSeats = useMemo(() => {
    const reserved = new Set();
    const seed = movie.id * 17;
    for (let i = 0; i < 20; i++) {
      const r = rows[(seed + i * 7) % rows.length];
      const c = ((seed + i * 13) % 12) + 1;
      reserved.add(`${r}${c}`);
    }
    return reserved;
  }, [movie.id]);

  const getSeatType = (row) => {
    if (row === 'G' || row === 'H') return 'sweetbox';
    if (row === 'D' || row === 'E' || row === 'F') return 'vip';
    return 'standard';
  };

  const getSeatPrice = (row) => seatPrices[getSeatType(row)];

  const toggleSeat = (seatId, row) => {
    if (reservedSeats.has(seatId)) return;
    setSelectedSeats((prev) =>
      prev.find(s => s.id === seatId)
        ? prev.filter(s => s.id !== seatId)
        : [...prev, { id: seatId, type: getSeatType(row), price: getSeatPrice(row) }]
    );
  };

  const totalSeatPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm">Chọn lại suất chiếu</span>
      </button>

      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white">{movie.title}</h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          {showtimeInfo.theater.name} • {showtimeInfo.room.name} • {getDateDisplay(showtimeInfo.date)} - {showtimeInfo.time}
        </p>
      </div>

      {/* Screen */}
      <div className="mx-auto max-w-lg my-8">
        <div className="screen-glow h-9 flex items-center justify-center text-xs text-zinc-300 font-bold tracking-[0.3em] uppercase">
          MÀN HÌNH CHIẾU
        </div>
        <div className="h-6 bg-gradient-to-b from-white/10 to-transparent" />
      </div>

      {/* Seat Matrix */}
      <div className="overflow-x-auto no-scrollbar py-2">
        <div className="min-w-[520px] max-w-lg mx-auto space-y-2">
          {rows.map((row) => {
            const type = getSeatType(row);
            const isSweetbox = type === 'sweetbox';
            return (
              <div key={row} className="flex items-center gap-2 justify-center">
                <span className="w-5 text-xs text-zinc-500 text-center font-bold">{row}</span>
                <div className="flex gap-1.5 flex-1 justify-center">
                  {cols.map((col) => {
                    if (isSweetbox && col % 2 === 0) return null;

                    const seatId = isSweetbox ? `${row}${col}-${col + 1}` : `${row}${col}`;
                    const isReserved = isSweetbox
                      ? reservedSeats.has(`${row}${col}`) || reservedSeats.has(`${row}${col + 1}`)
                      : reservedSeats.has(seatId);
                    const isSelected = selectedSeats.find(s => s.id === seatId);

                    return (
                      <button
                        key={seatId}
                        disabled={isReserved}
                        onClick={() => toggleSeat(seatId, row)}
                        className={`
                          ${isSweetbox ? 'w-14 h-8' : 'w-7 h-7 sm:w-8 sm:h-8'}
                          rounded-t-lg text-[10px] font-semibold transition-all duration-200
                          ${isReserved
                            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-800'
                            : isSelected
                            ? type === 'vip'
                              ? 'bg-cinema-gold text-black seat-selected shadow-cinema-gold/30'
                              : type === 'sweetbox'
                              ? 'bg-pink-500 text-white seat-selected shadow-pink-500/30'
                              : 'bg-cinema-neon text-black seat-selected shadow-cinema-neon/30'
                            : type === 'vip'
                            ? 'bg-zinc-800/80 border border-cinema-gold/50 text-cinema-gold/70 hover:bg-cinema-gold/20'
                            : type === 'sweetbox'
                            ? 'bg-zinc-800/80 border border-pink-500/50 text-pink-400/70 hover:bg-pink-500/20'
                            : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                          }
                        `}
                        title={`${seatId} - ${type.toUpperCase()} - ${formatPrice(getSeatPrice(row))}`}
                      >
                        {isSweetbox ? `${col}-${col+1}` : col}
                      </button>
                    );
                  })}
                </div>
                <span className="w-5 text-xs text-zinc-500 text-center font-bold">{row}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-8 text-xs text-zinc-400 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-t-md bg-zinc-800 border border-zinc-700" />
          <span>Thường ({formatPrice(seatPrices.standard)})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-t-md bg-zinc-800 border border-cinema-gold/50" />
          <span>VIP ({formatPrice(seatPrices.vip)})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-4 rounded-t-md bg-zinc-800 border border-pink-500/50" />
          <span>Sweetbox ({formatPrice(seatPrices.sweetbox)})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-t-md bg-cinema-neon" />
          <span>Đang chọn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-t-md bg-zinc-800 text-zinc-600" />
          <span>Đã đặt</span>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-cinema-darker/95 backdrop-blur-xl border-t border-cinema-border p-4 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-zinc-400">
                Ghế ({selectedSeats.length}): <span className="text-white font-bold">{selectedSeats.map(s => s.id).join(', ')}</span>
              </p>
              <p className="text-lg font-extrabold text-cinema-gold">{formatPrice(totalSeatPrice)}</p>
            </div>
            <button
              onClick={() => onConfirmSeats(selectedSeats)}
              className="px-6 py-2.5 bg-gradient-to-r from-cinema-red to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all text-sm"
            >
              Tiếp tục chọn bắp nước
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SNACK SELECTION COMPONENT
// ============================================================
function SnackSelection({ onConfirmSnacks, onBack, initialSnacks }) {
  const [snackOrders, setSnackOrders] = useState(initialSnacks || {});

  const updateQty = (snackId, delta) => {
    setSnackOrders((prev) => {
      const current = prev[snackId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [snackId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [snackId]: next };
    });
  };

  const totalSnackPrice = Object.entries(snackOrders).reduce((sum, [id, qty]) => {
    const snack = snacks.find(s => s.id === Number(id));
    return sum + (snack ? snack.price * qty : 0);
  }, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm">Chọn lại ghế</span>
      </button>

      <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
        <Popcorn className="w-6 h-6 text-cinema-gold" />
        Bắp nước & Combo ưu đãi
      </h2>
      <p className="text-xs text-zinc-400 mb-6">Thêm bắp giòn thơm và nước ngọt mát lạnh xem phim cực đã!</p>

      <div className="space-y-3">
        {snacks.map((snack) => {
          const qty = snackOrders[snack.id] || 0;
          return (
            <div key={snack.id} className="flex items-center gap-4 bg-cinema-card border border-cinema-border rounded-2xl p-4 hover:border-zinc-700 transition-colors">
              <div className="text-3xl shrink-0 p-2 bg-zinc-800/80 rounded-xl">{snack.image}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-sm">{snack.name}</h4>
                <p className="text-xs text-zinc-400 mt-0.5">{snack.description}</p>
                <p className="text-sm font-bold text-cinema-gold mt-1.5">{formatPrice(snack.price)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateQty(snack.id, -1)}
                  disabled={qty === 0}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    qty === 0
                      ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                      : 'bg-zinc-700 text-white hover:bg-cinema-red'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-bold text-white">{qty}</span>
                <button
                  onClick={() => updateQty(snack.id, 1)}
                  className="w-8 h-8 rounded-lg bg-zinc-700 text-white hover:bg-cinema-green flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-cinema-darker/95 backdrop-blur-xl border-t border-cinema-border p-4 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400">Tiền bắp nước</p>
            <p className="text-lg font-bold text-cinema-gold">{formatPrice(totalSnackPrice)}</p>
          </div>
          <button
            onClick={() => onConfirmSnacks(snackOrders)}
            className="px-6 py-2.5 bg-gradient-to-r from-cinema-red to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all text-sm"
          >
            {totalSnackPrice > 0 ? 'Tiếp tục thanh toán' : 'Bỏ qua bắp nước'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CHECKOUT COMPONENT
// ============================================================
function Checkout({ movie, showtimeInfo, selectedSeats, snackOrders, onPaymentSuccess, onBack, showToast }) {
  const [voucher, setVoucher] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].id);
  const [processing, setProcessing] = useState(false);

  const seatTotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const snackTotal = Object.entries(snackOrders).reduce((sum, [id, qty]) => {
    const snack = snacks.find(s => s.id === Number(id));
    return sum + (snack ? snack.price * qty : 0);
  }, 0);

  const discount = voucherApplied ? Math.floor((seatTotal + snackTotal) * 0.1) : 0;
  const grandTotal = seatTotal + snackTotal - discount;

  const applyVoucher = () => {
    if (voucher.trim().toUpperCase() === 'DISCOUNT10') {
      setVoucherApplied(true);
      setVoucherError('');
      showToast('Áp dụng voucher DISCOUNT10 thành công! Giảm 10%', 'success');
    } else {
      setVoucherError('Mã voucher không hợp lệ (Dùng thử: DISCOUNT10)');
      setVoucherApplied(false);
      showToast('Mã voucher không hợp lệ', 'error');
    }
  };

  const handlePayment = () => {
    if (!selectedPayment) {
      showToast('Vui lòng chọn phương thức thanh toán', 'error');
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      const bookingData = {
        bookingId: generateBookingId(),
        movie,
        showtimeInfo,
        selectedSeats,
        snackOrders,
        seatTotal,
        snackTotal,
        discount,
        grandTotal,
        paymentMethod: paymentMethods.find(p => p.id === selectedPayment),
        createdAt: new Date().toISOString(),
        status: 'upcoming',
      };
      onPaymentSuccess(bookingData);
    }, 1800);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-36">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm">Quay lại bắp nước</span>
      </button>

      <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-cinema-gold" />
        Xác nhận & Thanh toán
      </h2>

      {/* Summary Box */}
      <div className="bg-cinema-card border border-cinema-border rounded-2xl p-5 mb-4 shadow-xl">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400">
          <Ticket className="w-4 h-4 text-cinema-red" />
          Thông tin vé đặt
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-400">Phim</span>
            <span className="text-white font-bold text-right">{movie.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Rạp chiếu</span>
            <span className="text-white">{showtimeInfo.theater.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Phòng chiếu</span>
            <span className="text-white">{showtimeInfo.room.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Suất chiếu</span>
            <span className="text-white font-medium">{getDateDisplay(showtimeInfo.date)} • {showtimeInfo.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Ghế đã chọn</span>
            <span className="text-cinema-gold font-bold">{selectedSeats.map(s => s.id).join(', ')}</span>
          </div>
          <div className="border-t border-zinc-800 pt-3 flex justify-between">
            <span className="text-zinc-400">Tiền vé ({selectedSeats.length} ghế)</span>
            <span className="text-white font-bold">{formatPrice(seatTotal)}</span>
          </div>
        </div>

        {/* Snacks summary */}
        {Object.keys(snackOrders).length > 0 && (
          <div className="border-t border-zinc-800 mt-3 pt-3">
            <h4 className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold mb-2">Bắp nước kèm theo</h4>
            {Object.entries(snackOrders).map(([id, qty]) => {
              const snack = snacks.find(s => s.id === Number(id));
              return snack ? (
                <div key={id} className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-300">{snack.image} {snack.name} x{qty}</span>
                  <span className="text-zinc-200">{formatPrice(snack.price * qty)}</span>
                </div>
              ) : null;
            })}
            <div className="flex justify-between text-sm mt-2 pt-2 border-t border-zinc-800/60">
              <span className="text-zinc-400">Tổng bắp nước</span>
              <span className="text-white font-semibold">{formatPrice(snackTotal)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Voucher Box */}
      <div className="bg-cinema-card border border-cinema-border rounded-2xl p-5 mb-4 shadow-xl">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-sm">
          <Tag className="w-4 h-4 text-cinema-gold" />
          Mã giảm giá / Voucher
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Mã voucher (Nhập DISCOUNT10)"
            value={voucher}
            onChange={(e) => setVoucher(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cinema-gold transition-colors uppercase font-mono"
          />
          <button
            onClick={applyVoucher}
            className="px-5 py-2.5 bg-cinema-gold/20 border border-cinema-gold/40 text-cinema-gold text-sm font-bold rounded-xl hover:bg-cinema-gold/30 transition-colors"
          >
            Áp dụng
          </button>
        </div>
        {voucherApplied && (
          <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Giảm 10% - Bạn tiết kiệm được {formatPrice(discount)}
          </p>
        )}
        {voucherError && (
          <p className="mt-2 text-xs text-red-400">{voucherError}</p>
        )}
      </div>

      {/* Payment Selection */}
      <div className="bg-cinema-card border border-cinema-border rounded-2xl p-5 mb-4 shadow-xl">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-sm">
          <CreditCard className="w-4 h-4 text-cinema-red" />
          Phương thức thanh toán
        </h3>
        <div className="space-y-2.5">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedPayment(method.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border transition-all text-left ${
                selectedPayment === method.id
                  ? 'border-cinema-gold bg-cinema-gold/10'
                  : 'border-zinc-800 bg-zinc-800/40 hover:border-zinc-700'
              }`}
            >
              <span className="text-2xl">{method.icon}</span>
              <span className={`text-sm font-semibold flex-1 ${
                selectedPayment === method.id ? 'text-cinema-gold' : 'text-zinc-300'
              }`}>
                {method.name}
              </span>
              {selectedPayment === method.id && (
                <Check className="w-4 h-4 text-cinema-gold" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Sticky Payment Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-cinema-darker/95 backdrop-blur-xl border-t border-cinema-border p-4 z-40">
        <div className="max-w-2xl mx-auto">
          {discount > 0 && (
            <div className="flex justify-between text-xs mb-1 text-emerald-400">
              <span>Đã giảm giá (DISCOUNT10)</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Tổng thanh toán</p>
              <p className="text-2xl font-black text-cinema-gold">{formatPrice(grandTotal)}</p>
            </div>
            <button
              onClick={handlePayment}
              disabled={processing}
              className={`px-7 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                processing
                  ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cinema-red to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-xl shadow-red-500/25 active:scale-95'
              }`}
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Xác nhận & Thanh toán
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// E-TICKET MODAL COMPONENT
// ============================================================
function ETicket({ booking, onGoHome, onClose }) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md my-auto">
        {/* Ticket Box */}
        <div className="bg-cinema-card border border-cinema-border rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-cinema-red via-red-600 to-cinema-gold p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-white" />
                <span className="font-extrabold text-base tracking-wide">CineVerse</span>
              </div>
              <span className="text-xs bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full font-mono uppercase">
                Vé điện tử
              </span>
            </div>
            <h3 className="text-xl font-black mt-3 leading-tight">{booking.movie.title}</h3>
            <p className="text-xs text-white/80 mt-0.5">{booking.showtimeInfo.theater.name}</p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-zinc-500 mb-0.5">Phòng chiếu</p>
                <p className="text-white font-bold text-sm">{booking.showtimeInfo.room.name}</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-0.5">Suất chiếu</p>
                <p className="text-white font-bold text-sm">
                  {booking.showtimeInfo.time} ({getDateDisplay(booking.showtimeInfo.date)})
                </p>
              </div>
              <div>
                <p className="text-zinc-500 mb-0.5">Danh sách ghế</p>
                <p className="text-cinema-gold font-black text-base">
                  {booking.selectedSeats.map(s => s.id).join(', ')}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 mb-0.5">Tổng tiền thanh toán</p>
                <p className="text-cinema-gold font-bold text-sm">{formatPrice(booking.grandTotal)}</p>
              </div>
            </div>

            {/* Snacks if any */}
            {booking.snackOrders && Object.keys(booking.snackOrders).length > 0 && (
              <div className="border-t border-zinc-800 pt-3">
                <p className="text-zinc-500 text-[11px] mb-1 font-semibold uppercase">Bắp nước</p>
                <div className="space-y-0.5">
                  {Object.entries(booking.snackOrders).map(([id, qty]) => {
                    const snack = snacks.find(s => s.id === Number(id));
                    return snack ? (
                      <p key={id} className="text-xs text-zinc-300">
                        {snack.image} {snack.name} x{qty}
                      </p>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Notch divider */}
            <div className="relative py-2">
              <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 w-6 h-6 bg-cinema-dark rounded-full" />
              <div className="absolute right-[-24px] top-1/2 -translate-y-1/2 w-6 h-6 bg-cinema-dark rounded-full" />
              <div className="border-t-2 border-dashed border-zinc-700" />
            </div>

            {/* QR Mock */}
            <div className="text-center py-1">
              <div className="inline-flex p-3 bg-white rounded-2xl mb-2 shadow-inner">
                <QrCode className="w-24 h-24 text-black" />
              </div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">MÃ ĐẶT VÉ</p>
              <p className="text-base font-mono font-bold text-white tracking-widest mt-0.5">
                {booking.bookingId}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onGoHome}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Trang chủ
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="py-3 px-5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold rounded-xl text-sm transition-all"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP COMPONENT
// ============================================================
export default function App() {
  // Navigation states
  const [currentView, setCurrentView] = useState('home'); // home | showtime | seats | snacks | checkout
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showtimeInfo, setShowtimeInfo] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [snackOrders, setSnackOrders] = useState({});
  const [currentBooking, setCurrentBooking] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [selectedGenre, setSelectedGenre] = useState('Tất cả');
  const [selectedFormat, setSelectedFormat] = useState('Tất cả');

  // Modals
  const [detailMovie, setDetailMovie] = useState(null);
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [inspectBooking, setInspectBooking] = useState(null);

  // Persistent States (localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cineverse_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('cineverse_favorites');
      return saved ? JSON.parse(saved) : [1, 2];
    } catch {
      return [1, 2];
    }
  });

  const [userBookings, setUserBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('cineverse_bookings');
      return saved ? JSON.parse(saved) : initialSampleBookings;
    } catch {
      return initialSampleBookings;
    }
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cineverse_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cineverse_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cineverse_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('cineverse_bookings', JSON.stringify(userBookings));
  }, [userBookings]);

  // Favorite toggle helper
  const isFavorite = (movieId) => favorites.includes(movieId);

  const toggleFavorite = (movieId) => {
    setFavorites(prev => {
      const exists = prev.includes(movieId);
      const next = exists ? prev.filter(id => id !== movieId) : [...prev, movieId];
      const movie = movies.find(m => m.id === movieId);
      showToast(
        exists ? `Đã bỏ thích "${movie?.title}"` : `Đã thêm "${movie?.title}" vào danh sách yêu thích ❤️`,
        exists ? 'info' : 'success'
      );
      return next;
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Đã đăng xuất tài khoản', 'info');
  };

  // Filtered movies
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchSearch =
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.cast.some(actor => actor.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchGenre = selectedGenre === 'Tất cả' || movie.genre.includes(selectedGenre);
      const matchFormat = selectedFormat === 'Tất cả' || movie.format.includes(selectedFormat);
      return matchSearch && matchGenre && matchFormat;
    });
  }, [searchQuery, selectedGenre, selectedFormat]);

  // Navigation handlers
  const handleBookMovie = (movie) => {
    setSelectedMovie(movie);
    setDetailMovie(null);
    setCurrentView('showtime');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectShowtime = (info) => {
    setShowtimeInfo(info);
    setCurrentView('seats');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmSeats = (seats) => {
    setSelectedSeats(seats);
    setCurrentView('snacks');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmSnacks = (orders) => {
    setSnackOrders(orders);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = (bookingData) => {
    setUserBookings(prev => [bookingData, ...prev]);
    setCurrentBooking(bookingData);
    showToast(`Đặt vé thành công! Mã vé: ${bookingData.bookingId}`, 'success');
  };

  const goHome = () => {
    setCurrentView('home');
    setSelectedMovie(null);
    setShowtimeInfo(null);
    setSelectedSeats([]);
    setSnackOrders({});
    setCurrentBooking(null);
    setInspectBooking(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-cinema-dark text-white selection:bg-cinema-red selection:text-white">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Main Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        onLogoClick={goHome}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenBookings={() => setIsBookingsOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        favoriteCount={favorites.length}
        bookingCount={userBookings.length}
      />

      {/* ====== HOME VIEW ====== */}
      {currentView === 'home' && (
        <>
          <HeroBanner
            onBookNow={handleBookMovie}
            onViewDetail={(movie) => setDetailMovie(movie)}
            onPlayTrailer={(movie) => setTrailerMovie(movie)}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />

          {/* Movie Catalog */}
          <section className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-cinema-gold" />
                  Phim đang chiếu tại rạp
                </h2>
                <p className="text-xs text-zinc-400 mt-1">Chọn phim, chọn suất chiếu và tận hưởng công nghệ điện ảnh đỉnh cao</p>
              </div>

              {/* Quick actions for user */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFavoritesOpen(true)}
                  className="px-3.5 py-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 text-zinc-300 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  Yêu thích ({favorites.length})
                </button>
                <button
                  onClick={() => setIsBookingsOpen(true)}
                  className="px-3.5 py-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 text-zinc-300 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Ticket className="w-3.5 h-3.5 text-cinema-red" />
                  Vé của tôi ({userBookings.length})
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-col md:flex-row gap-3 mb-8">
              {/* Genre Pills */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {allGenres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                      genre === selectedGenre
                        ? 'bg-cinema-red text-white shadow-lg shadow-red-500/25'
                        : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700/70'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              {/* Format Pills */}
              <div className="flex gap-2">
                {allFormats.map((format) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      format === selectedFormat
                        ? 'bg-cinema-gold/20 text-cinema-gold border border-cinema-gold/40'
                        : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/70 hover:border-zinc-500'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            {/* Movies Grid */}
            {filteredMovies.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-zinc-800">
                <Film className="w-16 h-16 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-400 font-semibold text-lg">Không tìm thấy phim phù hợp</p>
                <p className="text-zinc-600 text-sm mt-1">Thử xóa từ khóa tìm kiếm hoặc chọn thể loại khác</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedGenre('Tất cả'); setSelectedFormat('Tất cả'); }}
                  className="mt-4 px-4 py-2 bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onBook={handleBookMovie}
                    onViewDetail={(m) => setDetailMovie(m)}
                    onPlayTrailer={(m) => setTrailerMovie(m)}
                    isFavorite={isFavorite}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Footer */}
          <footer className="border-t border-cinema-border mt-16 bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 py-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-cinema-red to-cinema-gold rounded-xl flex items-center justify-center">
                    <Film className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-extrabold text-base bg-gradient-to-r from-cinema-red to-cinema-gold bg-clip-text text-transparent">
                      CineVerse
                    </span>
                    <p className="text-[11px] text-zinc-500">Nền tảng đặt vé xem phim trực tuyến hiện đại</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 text-center">
                  © 2026 CineVerse Cinema Group. Thiết kế chuẩn phong cách rạp chiếu phim Dark Mode.
                </p>
                <div className="flex gap-4 text-xs text-zinc-500">
                  <span className="hover:text-white cursor-pointer transition-colors">Điều khoản dịch vụ</span>
                  <span className="hover:text-white cursor-pointer transition-colors">Chính sách bảo mật</span>
                  <span className="hover:text-white cursor-pointer transition-colors">Hotline: 1900 6017</span>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* ====== SHOWTIME VIEW ====== */}
      {currentView === 'showtime' && selectedMovie && (
        <ShowtimeSelection
          movie={selectedMovie}
          selectedCity={selectedCity}
          onSelectShowtime={handleSelectShowtime}
          onBack={() => setCurrentView('home')}
        />
      )}

      {/* ====== SEAT SELECTION VIEW ====== */}
      {currentView === 'seats' && selectedMovie && showtimeInfo && (
        <SeatSelection
          movie={selectedMovie}
          showtimeInfo={showtimeInfo}
          onConfirmSeats={handleConfirmSeats}
          onBack={() => setCurrentView('showtime')}
        />
      )}

      {/* ====== SNACK SELECTION VIEW ====== */}
      {currentView === 'snacks' && (
        <SnackSelection
          onConfirmSnacks={handleConfirmSnacks}
          onBack={() => setCurrentView('seats')}
          initialSnacks={snackOrders}
        />
      )}

      {/* ====== CHECKOUT VIEW ====== */}
      {currentView === 'checkout' && selectedMovie && showtimeInfo && (
        <Checkout
          movie={selectedMovie}
          showtimeInfo={showtimeInfo}
          selectedSeats={selectedSeats}
          snackOrders={snackOrders}
          onPaymentSuccess={handlePaymentSuccess}
          onBack={() => setCurrentView('snacks')}
          showToast={showToast}
        />
      )}

      {/* ====== MODALS ====== */}

      {/* Movie Details Modal */}
      {detailMovie && (
        <MovieDetailModal
          movie={detailMovie}
          onClose={() => setDetailMovie(null)}
          onBook={handleBookMovie}
          onPlayTrailer={(m) => setTrailerMovie(m)}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* YouTube Trailer Modal */}
      {trailerMovie && (
        <TrailerModal
          movie={trailerMovie}
          onClose={() => setTrailerMovie(null)}
        />
      )}

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
        showToast={showToast}
      />

      {/* My Bookings History Modal */}
      <MyBookingsModal
        isOpen={isBookingsOpen}
        onClose={() => setIsBookingsOpen(false)}
        bookings={userBookings}
        onViewTicketDetail={(b) => setInspectBooking(b)}
        onBookNewMovie={() => setCurrentView('home')}
      />

      {/* Favorites Modal */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favoriteIds={favorites}
        onBookMovie={handleBookMovie}
        onToggleFavorite={toggleFavorite}
      />

      {/* E-Ticket Modal after immediate booking */}
      {currentBooking && (
        <ETicket
          booking={currentBooking}
          onGoHome={goHome}
        />
      )}

      {/* E-Ticket inspection from My Bookings history */}
      {inspectBooking && !currentBooking && (
        <ETicket
          booking={inspectBooking}
          onGoHome={goHome}
          onClose={() => setInspectBooking(null)}
        />
      )}
    </div>
  );
}
