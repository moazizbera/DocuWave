import React, { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import apiService from '../../services/api';
import { HubConnectionState } from '@microsoft/signalr';

function NotificationCenter({ showToast }) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const loadNotifications = async () => {
    try {
      const data = await apiService.getNotifications({ page, pageSize });
      if (Array.isArray(data?.items)) {
        setNotifications(data.items);
      } else if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (error) {
      showToast('Failed to load notifications', 'error');
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [page, pageSize]);

  useEffect(() => {
    const conn = apiService.createHubConnection('/hubs/notifications');
    conn.on('new', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });
    conn.on('bulkUpdate', (payload) => {
      if (!payload?.ids) return;
      setNotifications((prev) =>
        prev.map((n) => (payload.ids.includes(n.id) ? { ...n, isRead: payload.isRead } : n))
      );
    });
    conn
      .start()
      .catch(() => showToast('Realtime connection failed', 'error'));

    return () => {
      if (conn.state === HubConnectionState.Connected) {
        conn.stop();
      }
    };
  }, [showToast]);

  const markAsRead = async (id) => {
    try {
      await apiService.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (error) {
      showToast('Failed to update notification', 'error');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return XCircle;
      case 'warning':
        return AlertCircle;
      case 'info':
      default:
        return Info;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="relative notification-panel">
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

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 z-50 overflow-hidden">
          <div className="p-4 border-b-2 border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              {language === 'ar'
                ? 'الإشعارات'
                : language === 'fr'
                ? 'Notifications'
                : 'Notifications'}
            </h3>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y">
            {notifications.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                {language === 'ar'
                  ? 'لا توجد إشعارات'
                  : language === 'fr'
                  ? 'Aucune notification'
                  : 'No notifications'}
              </div>
            )}
            {notifications.map((notification) => {
              const Icon = getIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-4 flex gap-3 ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${getColor(
                      notification.type
                    )}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">{notification.title || 'Notification'}</p>
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {language === 'ar'
                            ? 'تعيين كمقروء'
                            : language === 'fr'
                            ? 'Marquer comme lu'
                            : 'Mark read'}
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTime(notification.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t bg-gray-50 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-sm px-3 py-1 border rounded"
            >
              {language === 'ar' ? 'السابق' : language === 'fr' ? 'Précédent' : 'Prev'}
            </button>
            <span className="text-sm text-gray-500">{page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="text-sm px-3 py-1 border rounded"
            >
              {language === 'ar' ? 'التالي' : language === 'fr' ? 'Suivant' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
