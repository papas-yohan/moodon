import React from 'react';
import { useDashboardStats } from '../../hooks/useTracking';
import { MousePointer, Eye, Send, Clock } from 'lucide-react';
import { TrackingEvent } from '../../types/tracking';

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'CLICK':
      return <MousePointer className="w-4 h-4 text-red-500" />;
    case 'READ':
      return <Eye className="w-4 h-4 text-orange-500" />;
    case 'DELIVERED':
      return <Send className="w-4 h-4 text-green-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

const getEventTypeText = (eventType: string) => {
  switch (eventType) {
    case 'CLICK':
      return '클릭';
    case 'READ':
      return '읽음';
    case 'DELIVERED':
      return '발송';
    default:
      return eventType;
  }
};

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const eventTime = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - eventTime.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}일 전`;
  
  return eventTime.toLocaleDateString('ko-KR');
};

interface EventItemProps {
  event: TrackingEvent;
}

const EventItem: React.FC<EventItemProps> = ({ event }) => {
  return (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        {getEventIcon(event.eventType)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">
            {getEventTypeText(event.eventType)}
          </span>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-sm text-gray-600 truncate">
            {event.product?.name || '알 수 없는 상품'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 mt-1">
          {event.contact && (
            <>
              <span className="text-xs text-gray-500">
                {event.contact.name}
              </span>
              <span className="text-xs text-gray-400">•</span>
            </>
          )}
          <span className="text-xs text-gray-500">
            {formatTimeAgo(event.createdAt)}
          </span>
        </div>
      </div>
      
      {event.product?.price && (
        <div className="flex-shrink-0 text-right">
          <div className="text-sm font-medium text-gray-900">
            ₩{event.product.price.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export const RecentEvents: React.FC = () => {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">최근 활동을 불러오는데 실패했습니다.</p>
        </div>
      </div>
    );
  }

  if (!stats || !stats.recentEvents.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">최근 활동이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
        <span className="text-sm text-gray-500">
          {stats.recentEvents.length}개 활동
        </span>
      </div>
      
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {stats.recentEvents.map((event) => (
          <EventItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};