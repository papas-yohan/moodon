import React from 'react';
import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import { RecentEvents } from '../components/dashboard/RecentEvents';
import { BarChart3, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">대시보드</h1>
                <p className="text-sm text-gray-500">실시간 성과 분석</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span>실시간 업데이트</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Overview Cards */}
          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-4">전체 개요</h2>
            <DashboardOverview />
          </section>

          {/* Charts Section */}
          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-4">성과 분석</h2>
            <DashboardCharts />
          </section>

          {/* Recent Events */}
          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-4">실시간 활동</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentEvents />
              </div>
              
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-900">새 상품 추가</div>
                    <div className="text-sm text-gray-500">상품을 등록하고 마케팅을 시작하세요</div>
                  </button>
                  
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-900">연락처 가져오기</div>
                    <div className="text-sm text-gray-500">CSV 파일로 연락처를 일괄 등록하세요</div>
                  </button>
                  
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-900">메시지 발송</div>
                    <div className="text-sm text-gray-500">고객에게 상품 정보를 전송하세요</div>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};