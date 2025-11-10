import React from 'react';
import { useDashboardStats } from '../../hooks/useTracking';
import { TrendingUp, Users, Package, MousePointer, Eye, Send } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, suffix = '' }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center mt-1 text-sm ${
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend >= 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
};

export const DashboardOverview: React.FC = () => {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">대시보드 데이터를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  if (!stats) return null;

  const { overview } = stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="총 상품 수"
        value={overview.totalProducts}
        icon={<Package className="w-6 h-6 text-blue-600" />}
      />
      
      <StatCard
        title="총 연락처 수"
        value={overview.totalContacts}
        icon={<Users className="w-6 h-6 text-green-600" />}
      />
      
      <StatCard
        title="총 발송 수"
        value={overview.totalSent}
        icon={<Send className="w-6 h-6 text-purple-600" />}
      />
      
      <StatCard
        title="총 읽음 수"
        value={overview.totalRead}
        icon={<Eye className="w-6 h-6 text-orange-600" />}
      />
      
      <StatCard
        title="총 클릭 수"
        value={overview.totalClicks}
        icon={<MousePointer className="w-6 h-6 text-red-600" />}
      />
      
      <StatCard
        title="평균 읽음률"
        value={overview.avgReadRate.toFixed(1)}
        suffix="%"
        icon={<TrendingUp className="w-6 h-6 text-indigo-600" />}
      />
    </div>
  );
};