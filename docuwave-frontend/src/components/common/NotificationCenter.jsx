import React, { useState, useEffect } from 'react';
import {
  Bell, CheckCircle, XCircle, AlertCircle, Info, Clock,
  Trash2, Check, X, Filter, Settings
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { apiService } from '../../services/api';

/**
 * 🔔 NOTIFICATION CENTER
 * ====================
 * Real-time notification system with:
 * - Bell icon with badge
 * - Dropdown panel
 * - Mark as read/unread
 * - Filter by type
 * - Clear all
 */

function NotificationCenter({ showToast }) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await apiService.getNotifications();
        if (Array.isArray(response)) {
          setNotifications(
            response.map((n) => ({
              ...n,
              timestamp: n.timestamp ? new Date(n.timestamp) : new Date()
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load notifications', error);
      }
    };

    loadNotifications();
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Filter notifications
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  // Get icon for notification type
  const getIcon = (type) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'warning': return AlertCircle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  // Get color for notification type
  const getColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Format timestamp
  const formatTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 60000); // minutes
    
    if (diff < 1) {
      return language === 'ar' ? 'الآن' : language === 'fr' ? 'Maintenant' : 'Just now';
    }
    if (diff < 60) {
      return `${diff}${language === 'ar' ? ' د' : language === 'fr' ? ' min' : ' min'}`;
    }
    const hours = Math.floor(diff / 60);
    if (hours < 24) {
      return `${hours}${language === 'ar' ? ' س' : language === 'fr' ? ' h' : ' h'}`;
    }
    const days = Math.floor(hours / 24);
    return `${days}${language === 'ar' ? ' ي' : language === 'fr' ? ' j' : ' d'}`;
  };

  // Mark as read
  const markAsRead = async (id) => {
    await apiService.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast(
      language === 'ar' ? 'تم وضع علامة مقروء على الكل' :
      language === 'fr' ? 'Tout marqué comme lu' :
      'All marked as read',
      'success'
    );
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast(
      language === 'ar' ? 'تم الحذف' :
      language === 'fr' ? 'Supprimé' :
      'Deleted',
      'success'
    );
  };

  // Clear all
  const clearAll = () => {
    setNotifications([]);
    showToast(
      language === 'ar' ? 'تم مسح جميع الإشعارات' :
      language === 'fr' ? 'Toutes les notifications supprimées' :
      'All notifications cleared',
      'info'
    );
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.notification-panel')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative notification-panel">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors"
        title={language === 'ar' ? 'الإشعارات' : language === 'fr' ? 'Notifications' : 'Notifications'}
      >
        <Bell className="w-5 h-5 text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b-2 border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">
                {language === 'ar' ? 'الإشعارات' :
                 language === 'fr' ? 'Notifications' :
                 'Notifications'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {language === 'ar' ? 'الكل' : language === 'fr' ? 'Tout' : 'All'}
                {filter === 'all' && notifications.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white bg-opacity-20 rounded text-xs">
                    {notifications.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {language === 'ar' ? 'غير مقروء' : language === 'fr' ? 'Non lu' : 'Unread'}
                {filter === 'unread' && unreadCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white bg-opacity-20 rounded text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 font-medium">
                  {language === 'ar' ? 'لا توجد إشعارات' :
                   language === 'fr' ? 'Aucune notification' :
                   'No notifications'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => {
                  const Icon = getIcon(notification.type);
                  const colorClass = getColor(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-semibold text-gray-900 text-sm">
                              {notification.title[language] || notification.title.en}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message[language] || notification.message.en}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(notification.timestamp)}
                            </span>
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                                  title={language === 'ar' ? 'وضع علامة مقروء' : language === 'fr' ? 'Marquer comme lu' : 'Mark as read'}
                                >
                                  <Check className="w-3.5 h-3.5 text-blue-600" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 hover:bg-red-100 rounded transition-colors"
                                title={language === 'ar' ? 'حذف' : language === 'fr' ? 'Supprimer' : 'Delete'}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="p-3 border-t-2 border-gray-100 bg-gray-50 flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {language === 'ar' ? 'وضع علامة مقروء على الكل' :
                   language === 'fr' ? 'Tout marquer comme lu' :
                   'Mark all as read'}
                </button>
              )}
              <button
                onClick={clearAll}
                className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                {language === 'ar' ? 'مسح الكل' :
                 language === 'fr' ? 'Tout effacer' :
                 'Clear all'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;