import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard, Film, Clock, Ticket, Popcorn, Users,
  Plus, Edit, Trash2, CheckCircle2, XCircle, Search, DollarSign,
  TrendingUp, Award, Calendar, ChevronRight, X, AlertTriangle,
  Eye, Check, ArrowUpRight, Shield, ShieldAlert, ShieldCheck,
  RefreshCw, Play, Filter, Lock, Unlock, ArrowLeft
} from 'lucide-react';
import { theaters } from './data/mockData.js';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN').format(price) + 'đ';

export default function AdminDashboard({
  onExitAdmin,
  moviesList,
  setMoviesList,
  showtimesData,
  setShowtimesData,
  seatPricesData,
  setSeatPricesData,
  bookingsList,
  setBookingsList,
  snacksList,
  setSnacksList,
  usersList,
  setUsersList,
  currentUser,
  setCurrentUser,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, movies, showtimes, bookings, snacks, users

  // ==========================================
  // TAB 1: OVERVIEW STATS & CHARTS
  // ==========================================
  const totalRevenue = useMemo(() => {
    return bookingsList.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
  }, [bookingsList]);

  const totalTicketsSold = useMemo(() => {
    return bookingsList.reduce((sum, b) => sum + (b.selectedSeats ? b.selectedSeats.length : 0), 0);
  }, [bookingsList]);

  const activeMoviesCount = useMemo(() => {
    return moviesList.filter(m => m.isNowShowing).length;
  }, [moviesList]);

  // Top 5 highest revenue movies
  const topMovies = useMemo(() => {
    const movieRev = {};
    bookingsList.forEach(b => {
      if (!b.movie) return;
      const id = b.movie.id;
      if (!movieRev[id]) {
        movieRev[id] = {
          title: b.movie.title,
          poster: b.movie.poster,
          revenue: 0,
          ticketCount: 0
        };
      }
      movieRev[id].revenue += (b.grandTotal || 0);
      movieRev[id].ticketCount += (b.selectedSeats ? b.selectedSeats.length : 0);
    });

    // Merge with any current movies that have 0 bookings
    moviesList.forEach(m => {
      if (!movieRev[m.id]) {
        movieRev[m.id] = {
          title: m.title,
          poster: m.poster,
          revenue: 0,
          ticketCount: 0
        };
      }
    });

    return Object.values(movieRev)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [bookingsList, moviesList]);

  const recentBookings = useMemo(() => {
    return [...bookingsList].slice(0, 5);
  }, [bookingsList]);

  // ==========================================
  // TAB 2: MOVIE CRUD MODAL STATE
  // ==========================================
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    originalTitle: '',
    duration: 120,
    rating: 8.0,
    ageRating: 'C13',
    genre: 'Hành Động, Viễn Tưởng',
    format: '2D, 3D, IMAX',
    director: '',
    cast: '',
    synopsis: '',
    poster: '',
    banner: '',
    trailerUrl: '',
    isNowShowing: true
  });
  const [deletingMovieId, setDeletingMovieId] = useState(null);

  const handleOpenMovieAdd = () => {
    setEditingMovie(null);
    setMovieForm({
      title: '',
      originalTitle: '',
      duration: 120,
      rating: 8.5,
      ageRating: 'C13',
      genre: 'Hành Động, Phiêu Lưu',
      format: '2D, 3D, IMAX',
      director: '',
      cast: '',
      synopsis: '',
      poster: 'https://picsum.photos/seed/' + Math.floor(Math.random()*1000) + '/400/600',
      banner: 'https://picsum.photos/seed/' + Math.floor(Math.random()*1000) + '/1200/500',
      trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      isNowShowing: true
    });
    setIsMovieModalOpen(true);
  };

  const handleOpenMovieEdit = (movie) => {
    setEditingMovie(movie);
    setMovieForm({
      title: movie.title,
      originalTitle: movie.originalTitle || movie.title,
      duration: movie.duration,
      rating: movie.rating,
      ageRating: movie.ageRating,
      genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre,
      format: Array.isArray(movie.format) ? movie.format.join(', ') : movie.format,
      director: movie.director || '',
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : (movie.cast || ''),
      synopsis: movie.synopsis || '',
      poster: movie.poster || '',
      banner: movie.banner || '',
      trailerUrl: movie.trailerUrl || '',
      isNowShowing: movie.isNowShowing ?? true
    });
    setIsMovieModalOpen(true);
  };

  const handleSaveMovie = (e) => {
    e.preventDefault();
    if (!movieForm.title.trim()) {
      showToast('Vui lòng nhập tên phim', 'error');
      return;
    }

    const formattedMovie = {
      ...editingMovie,
      id: editingMovie ? editingMovie.id : Date.now(),
      title: movieForm.title.trim(),
      originalTitle: movieForm.originalTitle.trim() || movieForm.title.trim(),
      duration: Number(movieForm.duration) || 120,
      rating: Number(movieForm.rating) || 8.0,
      ageRating: movieForm.ageRating,
      genre: movieForm.genre.split(',').map(s => s.trim()).filter(Boolean),
      format: movieForm.format.split(',').map(s => s.trim()).filter(Boolean),
      director: movieForm.director.trim() || 'Đang cập nhật',
      cast: movieForm.cast.split(',').map(s => s.trim()).filter(Boolean),
      synopsis: movieForm.synopsis.trim() || 'Chưa có tóm tắt nội dung.',
      poster: movieForm.poster || 'https://picsum.photos/seed/movie/400/600',
      banner: movieForm.banner || 'https://picsum.photos/seed/banner/1200/500',
      trailerUrl: movieForm.trailerUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      isNowShowing: movieForm.isNowShowing,
      releaseDate: editingMovie ? editingMovie.releaseDate : new Date().toISOString().split('T')[0]
    };

    if (editingMovie) {
      setMoviesList(prev => prev.map(m => m.id === editingMovie.id ? formattedMovie : m));
      showToast(`Đã cập nhật phim "${formattedMovie.title}"`, 'success');
    } else {
      setMoviesList(prev => [formattedMovie, ...prev]);
      showToast(`Đã thêm phim mới "${formattedMovie.title}"`, 'success');
    }
    setIsMovieModalOpen(false);
  };

  const confirmDeleteMovie = () => {
    if (deletingMovieId) {
      setMoviesList(prev => prev.filter(m => m.id !== deletingMovieId));
      showToast('Đã xóa phim thành công', 'info');
      setDeletingMovieId(null);
    }
  };

  // ==========================================
  // TAB 3: SHOWTIMES MANAGEMENT
  // ==========================================
  const [selectedShowtimeMovieId, setSelectedShowtimeMovieId] = useState(moviesList[0]?.id || 1);
  const [selectedShowtimeTheaterId, setSelectedShowtimeTheaterId] = useState(theaters[0]?.id || 1);
  const [selectedShowtimeDate, setSelectedShowtimeDate] = useState(() => {
    return Object.keys(showtimesData)[0] || '2026-10-12';
  });
  const [newTimeSlot, setNewTimeSlot] = useState('');

  const currentSlots = showtimesData[selectedShowtimeDate] || [];

  const handleAddTimeSlot = () => {
    if (!newTimeSlot || !/^\d{2}:\d{2}$/.test(newTimeSlot)) {
      showToast('Vui lòng nhập định dạng giờ hợp lệ (VD: 14:30)', 'error');
      return;
    }
    if (currentSlots.includes(newTimeSlot)) {
      showToast('Suất chiếu này đã tồn tại', 'error');
      return;
    }
    const updated = [...currentSlots, newTimeSlot].sort();
    setShowtimesData(prev => ({
      ...prev,
      [selectedShowtimeDate]: updated
    }));
    setNewTimeSlot('');
    showToast(`Đã thêm suất chiếu ${newTimeSlot}`, 'success');
  };

  const handleDeleteTimeSlot = (time) => {
    const updated = currentSlots.filter(t => t !== time);
    setShowtimesData(prev => ({
      ...prev,
      [selectedShowtimeDate]: updated
    }));
    showToast(`Đã xóa suất chiếu ${time}`, 'info');
  };

  const handlePriceChange = (seatType, val) => {
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      setSeatPricesData(prev => ({
        ...prev,
        [seatType]: num
      }));
    }
  };

  // ==========================================
  // TAB 4: BOOKINGS & CHECK-IN
  // ==========================================
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState('all');

  const filteredBookings = useMemo(() => {
    return bookingsList.filter(b => {
      const matchSearch =
        b.bookingId.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        (b.movie && b.movie.title.toLowerCase().includes(bookingSearch.toLowerCase())) ||
        (b.userEmail && b.userEmail.toLowerCase().includes(bookingSearch.toLowerCase()));
      const matchStatus = bookingFilterStatus === 'all' || b.status === bookingFilterStatus;
      return matchSearch && matchStatus;
    });
  }, [bookingsList, bookingSearch, bookingFilterStatus]);

  const handleToggleCheckIn = (bookingId) => {
    setBookingsList(prev => prev.map(b => {
      if (b.bookingId === bookingId) {
        const nextStatus = b.status === 'completed' ? 'upcoming' : 'completed';
        showToast(
          nextStatus === 'completed'
            ? `Vé #${bookingId} đã được Soát vé (Check-in thành công)!`
            : `Vé #${bookingId} chuyển về Chưa soát vé`,
          'success'
        );
        return { ...b, status: nextStatus };
      }
      return b;
    }));
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm(`Bạn có chắc muốn hủy đơn đặt vé #${bookingId}?`)) {
      setBookingsList(prev => prev.map(b => b.bookingId === bookingId ? { ...b, status: 'cancelled' } : b));
      showToast(`Đã hủy vé #${bookingId}`, 'info');
    }
  };

  // ==========================================
  // TAB 5: SNACKS & COMBOS CRUD
  // ==========================================
  const [isSnackModalOpen, setIsSnackModalOpen] = useState(false);
  const [editingSnack, setEditingSnack] = useState(null);
  const [snackForm, setSnackForm] = useState({
    name: '',
    description: '',
    price: 50000,
    image: '🍿'
  });

  const handleOpenSnackAdd = () => {
    setEditingSnack(null);
    setSnackForm({ name: '', description: '', price: 59000, image: '🍿' });
    setIsSnackModalOpen(true);
  };

  const handleOpenSnackEdit = (snack) => {
    setEditingSnack(snack);
    setSnackForm({
      name: snack.name,
      description: snack.description,
      price: snack.price,
      image: snack.image
    });
    setIsSnackModalOpen(true);
  };

  const handleSaveSnack = (e) => {
    e.preventDefault();
    if (!snackForm.name.trim()) {
      showToast('Vui lòng nhập tên combo', 'error');
      return;
    }

    if (editingSnack) {
      setSnacksList(prev => prev.map(s => s.id === editingSnack.id ? { ...editingSnack, ...snackForm, price: Number(snackForm.price) } : s));
      showToast(`Đã cập nhật ${snackForm.name}`, 'success');
    } else {
      const newSnack = {
        id: Date.now(),
        ...snackForm,
        price: Number(snackForm.price)
      };
      setSnacksList(prev => [...prev, newSnack]);
      showToast(`Đã thêm mới ${snackForm.name}`, 'success');
    }
    setIsSnackModalOpen(false);
  };

  const handleDeleteSnack = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa combo bắp nước này?')) {
      setSnacksList(prev => prev.filter(s => s.id !== id));
      showToast('Đã xóa combo bắp nước', 'info');
    }
  };

  // ==========================================
  // TAB 6: USERS MANAGEMENT
  // ==========================================
  const [userSearch, setUserSearch] = useState('');

  const filteredUsers = useMemo(() => {
    return usersList.filter(u =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [usersList, userSearch]);

  const handleToggleUserStatus = (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        if (u.role === 'admin' && u.id === 'admin1') {
          showToast('Không thể khóa tài khoản Admin chính!', 'error');
          return u;
        }
        const nextStatus = u.status === 'locked' ? 'active' : 'locked';
        showToast(nextStatus === 'locked' ? `Đã khóa tài khoản ${u.name}` : `Đã mở khóa tài khoản ${u.name}`, 'info');
        const updated = { ...u, status: nextStatus };
        if (currentUser && currentUser.id === u.id) {
          setCurrentUser(prevUser => ({ ...prevUser, status: nextStatus }));
        }
        return updated;
      }
      return u;
    }));
  };

  const handleToggleUserRole = (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        if (u.id === 'admin1' && u.role === 'admin') {
          showToast('Không thể giáng chức tài khoản Admin chính!', 'error');
          return u;
        }
        const nextRole = u.role === 'admin' ? 'user' : 'admin';
        showToast(`Đã đổi vai trò ${u.name} thành ${nextRole === 'admin' ? 'QUẢN TRỊ VIÊN' : 'KHÁCH HÀNG'}`, 'success');
        const updated = { ...u, role: nextRole };
        if (currentUser && currentUser.id === u.id) {
          setCurrentUser(prevUser => ({ ...prevUser, role: nextRole }));
        }
        return updated;
      }
      return u;
    }));
  };

  return (
    <div className="min-h-screen bg-cinema-darker text-zinc-100 flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cinema-red to-cinema-gold flex items-center justify-center shadow-lg shadow-red-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base bg-gradient-to-r from-cinema-red to-cinema-gold bg-clip-text text-transparent">
                CineVerse
              </span>
              <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                Bảng Quản Trị
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="p-3 space-y-1.5 flex-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-cinema-red text-white shadow-lg shadow-red-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Tổng quan
          </button>

          <button
            onClick={() => setActiveTab('movies')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'movies'
                ? 'bg-cinema-red text-white shadow-lg shadow-red-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Film className="w-4 h-4" />
            Quản lý Phim
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
              {moviesList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('showtimes')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'showtimes'
                ? 'bg-cinema-red text-white shadow-lg shadow-red-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            Quản lý Suất chiếu
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'bookings'
                ? 'bg-cinema-red text-white shadow-lg shadow-red-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Ticket className="w-4 h-4" />
            Quản lý Vé & Soát vé
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
              {bookingsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('snacks')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'snacks'
                ? 'bg-cinema-red text-white shadow-lg shadow-red-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Popcorn className="w-4 h-4" />
            Bắp nước & Combos
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-cinema-red text-white shadow-lg shadow-red-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Quản lý Người dùng
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
              {usersList.length}
            </span>
          </button>
        </nav>

        {/* Back to Client Mode Button */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40">
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-bold transition-all border border-zinc-700/80 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Về giao diện Khách
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto max-h-screen p-4 sm:p-8">
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-zinc-800">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              {activeTab === 'overview' && <LayoutDashboard className="w-6 h-6 text-cinema-red" />}
              {activeTab === 'movies' && <Film className="w-6 h-6 text-cinema-red" />}
              {activeTab === 'showtimes' && <Clock className="w-6 h-6 text-cinema-gold" />}
              {activeTab === 'bookings' && <Ticket className="w-6 h-6 text-cinema-neon" />}
              {activeTab === 'snacks' && <Popcorn className="w-6 h-6 text-yellow-500" />}
              {activeTab === 'users' && <Users className="w-6 h-6 text-emerald-400" />}
              {activeTab === 'overview' && 'Tổng quan hệ thống'}
              {activeTab === 'movies' && 'Quản lý kho phim'}
              {activeTab === 'showtimes' && 'Lịch chiếu & Bảng giá'}
              {activeTab === 'bookings' && 'Quản lý vé & Soát vé'}
              {activeTab === 'snacks' && 'Menu Bắp nước'}
              {activeTab === 'users' && 'Danh sách khách hàng'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Dữ liệu được tự động đồng bộ hóa thời gian thực với LocalStorage
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Chế độ Quản trị viên
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-400 font-semibold uppercase">Tổng doanh thu</p>
                    <p className="text-2xl font-black text-cinema-gold mt-1">{formatPrice(totalRevenue)}</p>
                  </div>
                  <div className="w-11 h-11 bg-cinema-gold/10 border border-cinema-gold/30 rounded-xl flex items-center justify-center text-cinema-gold">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-[11px] text-emerald-400 gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18.4% so với tuần trước</span>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-400 font-semibold uppercase">Tổng số vé đã bán</p>
                    <p className="text-2xl font-black text-white mt-1">{totalTicketsSold} vé</p>
                  </div>
                  <div className="w-11 h-11 bg-cinema-red/10 border border-cinema-red/30 rounded-xl flex items-center justify-center text-cinema-red">
                    <Ticket className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-[11px] text-zinc-400 gap-1">
                  <span>Trong {bookingsList.length} lượt giao dịch</span>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-400 font-semibold uppercase">Phim đang chiếu</p>
                    <p className="text-2xl font-black text-white mt-1">{activeMoviesCount} / {moviesList.length}</p>
                  </div>
                  <div className="w-11 h-11 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400">
                    <Film className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-[11px] text-zinc-400 gap-1">
                  <span>{moviesList.length - activeMoviesCount} phim sắp ra mắt</span>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-400 font-semibold uppercase">Người dùng đăng ký</p>
                    <p className="text-2xl font-black text-white mt-1">{usersList.length} thành viên</p>
                  </div>
                  <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-[11px] text-emerald-400 gap-1">
                  <span>Hoạt động tích cực</span>
                </div>
              </div>
            </div>

            {/* Charts & Trending Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top 5 Movies by Revenue */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Award className="w-4 h-4 text-cinema-gold" />
                    Top 5 phim doanh thu cao nhất
                  </h3>
                  <span className="text-xs text-zinc-500">Xếp hạng</span>
                </div>

                <div className="space-y-3">
                  {topMovies.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                          idx === 0 ? 'bg-cinema-gold text-black' :
                          idx === 1 ? 'bg-zinc-300 text-black' :
                          idx === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <img src={m.poster} alt={m.title} className="w-9 h-12 rounded object-cover border border-zinc-700" />
                        <div>
                          <p className="text-sm font-bold text-white line-clamp-1">{m.title}</p>
                          <p className="text-xs text-zinc-400">{m.ticketCount} vé đã bán</p>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-cinema-gold">
                        {formatPrice(m.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-cinema-neon" />
                    Giao dịch đặt vé mới nhất
                  </h3>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs text-cinema-red hover:underline flex items-center gap-1 font-semibold"
                  >
                    Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {recentBookings.map((b) => (
                    <div key={b.bookingId} className="flex items-center justify-between p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-mono font-bold text-cinema-neon">#{b.bookingId}</span>
                          <span className={`px-2 py-0.2 text-[10px] rounded-full font-bold ${
                            b.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {b.status === 'completed' ? 'Đã xem' : 'Sắp chiếu'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-white truncate">{b.movie?.title}</p>
                        <p className="text-[11px] text-zinc-400">{b.showtimeInfo?.theater?.name} • {b.showtimeInfo?.time}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-cinema-gold">{formatPrice(b.grandTotal)}</p>
                        <p className="text-[10px] text-zinc-500">
                          {b.selectedSeats?.length || 0} ghế ({b.selectedSeats?.map(s=>s.id).join(', ')})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MOVIE MANAGEMENT (CRUD) */}
        {/* ========================================================= */}
        {activeTab === 'movies' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Kho phim CineVerse</h2>
                <p className="text-xs text-zinc-400">Quản lý thêm, sửa, xóa thông tin phim chiếu rạp</p>
              </div>
              <button
                onClick={handleOpenMovieAdd}
                className="px-4 py-2.5 bg-gradient-to-r from-cinema-red to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Thêm phim mới
              </button>
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-950 text-xs uppercase text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="p-4">Phim</th>
                      <th className="p-4">Thời lượng & Đạo diễn</th>
                      <th className="p-4">Độ tuổi & Điểm</th>
                      <th className="p-4">Định dạng</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {moviesList.map((movie) => (
                      <tr key={movie.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={movie.poster} alt={movie.title} className="w-12 h-16 rounded-lg object-cover border border-zinc-700 shrink-0" />
                            <div>
                              <p className="font-bold text-white text-sm line-clamp-1">{movie.title}</p>
                              <p className="text-xs text-zinc-400">{Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-zinc-200 font-semibold">{movie.duration} phút</p>
                          <p className="text-xs text-zinc-400">{movie.director}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-xs font-bold bg-zinc-800 text-white rounded border border-zinc-700">
                              {movie.ageRating}
                            </span>
                            <span className="text-xs font-bold text-cinema-gold">★ {movie.rating}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(movie.format) ? movie.format : ['2D']).map(f => (
                              <span key={f} className="px-1.5 py-0.5 text-[10px] bg-zinc-800 rounded text-zinc-400">
                                {f}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-xs rounded-full font-bold ${
                            movie.isNowShowing
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {movie.isNowShowing ? 'Đang chiếu' : 'Sắp chiếu'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenMovieEdit(movie)}
                              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors"
                              title="Chỉnh sửa phim"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingMovieId(movie.id)}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                              title="Xóa phim"
                            >
                              <Trash2 className="w-4 h-4" />
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
        )}

        {/* ========================================================= */}
        {/* TAB 3: SHOWTIMES MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'showtimes' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Base Seat Pricing Setting */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-bold text-white text-base mb-2">Bảng giá vé cơ bản (VND)</h3>
              <p className="text-xs text-zinc-400 mb-4">Áp dụng cho toàn bộ các suất chiếu tiêu chuẩn và phòng chiếu</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Ghế Thường (Standard)</label>
                  <input
                    type="number"
                    value={seatPricesData.standard}
                    onChange={(e) => handlePriceChange('standard', e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white font-bold text-sm focus:border-cinema-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cinema-gold mb-1">Ghế VIP</label>
                  <input
                    type="number"
                    value={seatPricesData.vip}
                    onChange={(e) => handlePriceChange('vip', e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-800 border border-cinema-gold/40 rounded-xl text-cinema-gold font-bold text-sm focus:border-cinema-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-pink-400 mb-1">Ghế Đôi (Sweetbox)</label>
                  <input
                    type="number"
                    value={seatPricesData.sweetbox}
                    onChange={(e) => handlePriceChange('sweetbox', e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-800 border border-pink-500/40 rounded-xl text-pink-400 font-bold text-sm focus:border-pink-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Showtime Config */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5">
              <h3 className="font-bold text-white text-base">Cấu hình khung giờ chiếu</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 font-semibold mb-1">1. Chọn Phim</label>
                  <select
                    value={selectedShowtimeMovieId}
                    onChange={(e) => setSelectedShowtimeMovieId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white outline-none"
                  >
                    {moviesList.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 font-semibold mb-1">2. Chọn Cụm Rạp</label>
                  <select
                    value={selectedShowtimeTheaterId}
                    onChange={(e) => setSelectedShowtimeTheaterId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white outline-none"
                  >
                    {theaters.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 font-semibold mb-1">3. Chọn Ngày Chiếu</label>
                  <select
                    value={selectedShowtimeDate}
                    onChange={(e) => setSelectedShowtimeDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white outline-none"
                  >
                    {Object.keys(showtimesData).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Slots List & Add Form */}
              <div className="border-t border-zinc-800 pt-4">
                <h4 className="text-sm font-bold text-zinc-200 mb-3">
                  Danh sách khung giờ khả dụng cho ngày {selectedShowtimeDate}:
                </h4>

                <div className="flex flex-wrap gap-2.5 mb-5">
                  {currentSlots.length === 0 ? (
                    <p className="text-xs text-zinc-500">Chưa có khung giờ chiếu nào cho ngày này.</p>
                  ) : (
                    currentSlots.map(time => (
                      <div
                        key={time}
                        className="flex items-center gap-2 px-3.5 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-bold text-white group hover:border-cinema-red transition-colors"
                      >
                        <span>{time}</span>
                        <button
                          onClick={() => handleDeleteTimeSlot(time)}
                          className="text-zinc-500 hover:text-red-400 transition-colors"
                          title="Xóa suất chiếu này"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add new time slot */}
                <div className="flex items-center gap-3 max-w-sm">
                  <input
                    type="text"
                    placeholder="VD: 18:45 hoặc 22:30"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white outline-none focus:border-cinema-red"
                  />
                  <button
                    onClick={handleAddTimeSlot}
                    className="px-4 py-2 bg-cinema-red hover:bg-red-600 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm giờ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: BOOKINGS & CHECK-IN */}
        {/* ========================================================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Tìm theo mã vé hoặc tên phim..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-cinema-red"
                />
              </div>

              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'upcoming', label: 'Đã thanh toán / Chờ chiếu' },
                  { id: 'completed', label: 'Đã soát vé' },
                  { id: 'cancelled', label: 'Đã hủy' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setBookingFilterStatus(s.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                      bookingFilterStatus === s.id
                        ? 'bg-cinema-red text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-950 text-xs uppercase text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="p-4">Mã vé</th>
                      <th className="p-4">Phim & Rạp</th>
                      <th className="p-4">Suất chiếu & Ghế</th>
                      <th className="p-4">Tổng tiền</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right">Thao tác Soát vé</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-500">
                          Không tìm thấy đơn đặt vé nào phù hợp.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => (
                        <tr key={b.bookingId} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="p-4">
                            <span className="font-mono font-bold text-white text-xs bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-700">
                              #{b.bookingId}
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-white text-sm line-clamp-1">{b.movie?.title}</p>
                            <p className="text-xs text-zinc-400">{b.showtimeInfo?.theater?.name}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-xs text-zinc-300 font-semibold">{b.showtimeInfo?.time} ({b.showtimeInfo?.date})</p>
                            <p className="text-xs text-cinema-gold font-bold">
                              Ghế: {b.selectedSeats?.map(s => s.id).join(', ')}
                            </p>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-cinema-gold">{formatPrice(b.grandTotal)}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-xs rounded-full font-bold inline-flex items-center gap-1 ${
                              b.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : b.status === 'cancelled'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {b.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                              {b.status === 'completed' ? 'Đã soát vé' : b.status === 'cancelled' ? 'Đã hủy' : 'Đã thanh toán'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {b.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleToggleCheckIn(b.bookingId)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    b.status === 'completed'
                                      ? 'bg-zinc-800 text-zinc-400 hover:text-white'
                                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  {b.status === 'completed' ? 'Hủy check-in' : 'Quét vé'}
                                </button>
                              )}
                              {b.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleCancelBooking(b.bookingId)}
                                  className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors"
                                  title="Hủy vé"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SNACKS & COMBOS CRUD */}
        {/* ========================================================= */}
        {activeTab === 'snacks' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Menu Bắp Nước & Combos</h2>
                <p className="text-xs text-zinc-400">Tùy chỉnh danh sách đồ ăn, thức uống và bảng giá</p>
              </div>
              <button
                onClick={handleOpenSnackAdd}
                className="px-4 py-2.5 bg-gradient-to-r from-cinema-red to-red-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Thêm Combo mới
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {snacksList.map((snack) => (
                <div
                  key={snack.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="text-3xl p-2.5 bg-zinc-800/80 rounded-2xl shrink-0">
                      {snack.image}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-base truncate">{snack.name}</h4>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{snack.description}</p>
                      <p className="text-base font-extrabold text-cinema-gold mt-2">{formatPrice(snack.price)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-800/80">
                    <button
                      onClick={() => handleOpenSnackEdit(snack)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteSnack(snack.id)}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: USERS MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Quản lý tài khoản</h2>
                <p className="text-xs text-zinc-400">Xem danh sách, phân quyền và khóa/mở khóa người dùng</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-cinema-red"
                />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-950 text-xs uppercase text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="p-4">Người dùng</th>
                      <th className="p-4">Vai trò</th>
                      <th className="p-4">Ngày đăng ký</th>
                      <th className="p-4">Vé đã đặt</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-zinc-700" />
                            <div>
                              <p className="font-bold text-white text-sm">{u.name}</p>
                              <p className="text-xs text-zinc-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                            u.role === 'admin'
                              ? 'bg-cinema-red/20 text-cinema-red border border-cinema-red/40'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {u.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-zinc-400">{u.createdAt || u.joinedDate || '2026-10-13'}</td>
                        <td className="p-4">
                          <span className="font-semibold text-white">{u.ticketsCount ?? u.bookingCount ?? 0} vé</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-xs rounded-full font-bold ${
                            u.status === 'locked' || u.status === 'blocked'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {u.status === 'locked' || u.status === 'blocked' ? 'Đã khóa' : 'Hoạt động'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleUserRole(u.id)}
                              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg text-zinc-300 hover:text-white transition-colors"
                            >
                              Đổi vai trò
                            </button>
                            {u.id !== 'admin1' && (
                              <button
                                onClick={() => handleToggleUserStatus(u.id)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  u.status === 'locked' || u.status === 'blocked'
                                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                }`}
                                title={u.status === 'locked' || u.status === 'blocked' ? 'Mở khóa' : 'Khóa tài khoản'}
                              >
                                {u.status === 'locked' || u.status === 'blocked' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT MOVIE */}
      {/* ========================================================= */}
      {isMovieModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
              <h3 className="font-bold text-white text-lg">
                {editingMovie ? 'Chỉnh sửa thông tin phim' : 'Thêm phim mới vào rạp'}
              </h3>
              <button
                onClick={() => setIsMovieModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovie} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Tên phim (*)</label>
                  <input
                    type="text"
                    required
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-cinema-red"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Tên gốc (Tiếng Anh/Quốc tế)</label>
                  <input
                    type="text"
                    value={movieForm.originalTitle}
                    onChange={(e) => setMovieForm({ ...movieForm, originalTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-cinema-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Thời lượng (Phút)</label>
                  <input
                    type="number"
                    value={movieForm.duration}
                    onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-cinema-red"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Điểm đánh giá (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={movieForm.rating}
                    onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-cinema-red"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Độ tuổi</label>
                  <select
                    value={movieForm.ageRating}
                    onChange={(e) => setMovieForm({ ...movieForm, ageRating: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none"
                  >
                    <option value="P">P (Mọi lứa tuổi)</option>
                    <option value="C13">C13 (Trên 13 tuổi)</option>
                    <option value="C16">C16 (Trên 16 tuổi)</option>
                    <option value="C18">C18 (Trên 18 tuổi)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Thể loại (Phân cách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    value={movieForm.genre}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                    placeholder="Hành Động, Viễn Tưởng..."
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-cinema-red"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Định dạng (2D, 3D, IMAX)</label>
                  <input
                    type="text"
                    value={movieForm.format}
                    onChange={(e) => setMovieForm({ ...movieForm, format: e.target.value })}
                    placeholder="2D, 3D, IMAX"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-cinema-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Đạo diễn</label>
                  <input
                    type="text"
                    value={movieForm.director}
                    onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-cinema-red"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Diễn viên</label>
                  <input
                    type="text"
                    value={movieForm.cast}
                    onChange={(e) => setMovieForm({ ...movieForm, cast: e.target.value })}
                    placeholder="Diễn viên 1, Diễn viên 2..."
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-cinema-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Link Poster Ảnh Dọc (URL)</label>
                <input
                  type="text"
                  value={movieForm.poster}
                  onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-cinema-red text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Link Banner Ngang (URL)</label>
                <input
                  type="text"
                  value={movieForm.banner}
                  onChange={(e) => setMovieForm({ ...movieForm, banner: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-cinema-red text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Link YouTube Embed Trailer</label>
                <input
                  type="text"
                  value={movieForm.trailerUrl}
                  onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-cinema-red text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Tóm tắt nội dung</label>
                <textarea
                  rows={3}
                  value={movieForm.synopsis}
                  onChange={(e) => setMovieForm({ ...movieForm, synopsis: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-cinema-red text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isNowShowing"
                  checked={movieForm.isNowShowing}
                  onChange={(e) => setMovieForm({ ...movieForm, isNowShowing: e.target.checked })}
                  className="w-4 h-4 accent-cinema-red rounded cursor-pointer"
                />
                <label htmlFor="isNowShowing" className="text-zinc-200 cursor-pointer font-semibold">
                  Đang chiếu tại rạp (Hiển thị ngay cho khách hàng đặt vé)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsMovieModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-cinema-red to-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/25"
                >
                  {editingMovie ? 'Lưu thay đổi' : 'Thêm phim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {deletingMovieId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">Xác nhận xóa phim?</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Phim sẽ bị gỡ bỏ khỏi hệ thống và không còn khả dụng cho khách hàng.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeletingMovieId(null)}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDeleteMovie}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SNACK */}
      {isSnackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">
                {editingSnack ? 'Chỉnh sửa combo bắp nước' : 'Thêm combo bắp nước mới'}
              </h3>
              <button
                onClick={() => setIsSnackModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSnack} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Tên Combo / Bắp nước</label>
                <input
                  type="text"
                  required
                  value={snackForm.name}
                  onChange={(e) => setSnackForm({ ...snackForm, name: e.target.value })}
                  placeholder="VD: Combo Bắp Phô Mai + 2 Pepsi"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-cinema-red"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Biểu tượng / Emoji</label>
                <input
                  type="text"
                  value={snackForm.image}
                  onChange={(e) => setSnackForm({ ...snackForm, image: e.target.value })}
                  placeholder="🍿 hoặc 🍿🥤"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-cinema-red"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Giá bán (VND)</label>
                <input
                  type="number"
                  required
                  value={snackForm.price}
                  onChange={(e) => setSnackForm({ ...snackForm, price: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-cinema-red"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={2}
                  value={snackForm.description}
                  onChange={(e) => setSnackForm({ ...snackForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-cinema-red text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsSnackModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-cinema-red hover:bg-red-600 text-white rounded-xl font-bold"
                >
                  Lưu combo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

