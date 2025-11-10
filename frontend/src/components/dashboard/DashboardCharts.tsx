import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useDashboardStats } from '../../hooks/useTracking';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const DashboardCharts: React.FC = () => {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  // 일별 통계 차트 데이터
  const dailyChartData = stats.dailyStats.map(stat => ({
    date: new Date(stat.date).toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric' 
    }),
    발송: stat.sent,
    읽음: stat.read,
    클릭: stat.clicks,
  }));

  // 상위 상품 차트 데이터
  const topProductsData = stats.topProducts.slice(0, 5).map(product => ({
    name: product.productName.length > 15 
      ? product.productName.substring(0, 15) + '...' 
      : product.productName,
    클릭수: product.totalClicks,
    읽음수: product.totalRead,
    CTR: product.clickThroughRate,
  }));

  // 이벤트 타입별 분포 데이터
  const eventTypeData = [
    { name: '발송', value: stats.overview.totalSent, color: COLORS[0] },
    { name: '읽음', value: stats.overview.totalRead, color: COLORS[1] },
    { name: '클릭', value: stats.overview.totalClicks, color: COLORS[2] },
  ].filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 일별 통계 차트 */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">일별 통계</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="발송" 
              stroke={COLORS[0]} 
              strokeWidth={2}
              dot={{ fill: COLORS[0] }}
            />
            <Line 
              type="monotone" 
              dataKey="읽음" 
              stroke={COLORS[1]} 
              strokeWidth={2}
              dot={{ fill: COLORS[1] }}
            />
            <Line 
              type="monotone" 
              dataKey="클릭" 
              stroke={COLORS[2]} 
              strokeWidth={2}
              dot={{ fill: COLORS[2] }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 상위 상품 성과 */}
      {topProductsData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">상위 상품 성과</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="읽음수" fill={COLORS[1]} />
              <Bar dataKey="클릭수" fill={COLORS[2]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 이벤트 타입별 분포 */}
      {eventTypeData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">이벤트 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {eventTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};