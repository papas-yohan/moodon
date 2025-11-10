import React from 'react';
import { useDashboardStats } from '../hooks/useTracking';
import { useProducts } from '../hooks/useProducts';

export const TestPage: React.FC = () => {
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboardStats();
  const { data: productsData, isLoading: productsLoading, error: productsError } = useProducts();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">API 연동 테스트</h1>
        
        {/* Dashboard Stats Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">대시보드 통계</h2>
          {dashboardLoading && <p>로딩 중...</p>}
          {dashboardError && <p className="text-red-600">에러: {dashboardError.message}</p>}
          {dashboardData && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardData.overview.totalProducts}
                </div>
                <div className="text-sm text-gray-600">총 상품</div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-2xl font-bold text-green-600">
                  {dashboardData.overview.totalContacts}
                </div>
                <div className="text-sm text-gray-600">총 연락처</div>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardData.overview.totalSent}
                </div>
                <div className="text-sm text-gray-600">총 발송</div>
              </div>
              <div className="bg-orange-50 p-4 rounded">
                <div className="text-2xl font-bold text-orange-600">
                  {dashboardData.overview.totalRead}
                </div>
                <div className="text-sm text-gray-600">총 읽음</div>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <div className="text-2xl font-bold text-red-600">
                  {dashboardData.overview.totalClicks}
                </div>
                <div className="text-sm text-gray-600">총 클릭</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded">
                <div className="text-2xl font-bold text-indigo-600">
                  {dashboardData.overview.avgReadRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">평균 읽음률</div>
              </div>
            </div>
          )}
        </div>

        {/* Products Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">상품 목록</h2>
          {productsLoading && <p>로딩 중...</p>}
          {productsError && <p className="text-red-600">에러: {productsError.message}</p>}
          {productsData && (
            <div>
              <p className="mb-4 text-gray-600">
                총 {productsData.pagination.total}개 상품 중 {productsData.products.length}개 표시
              </p>
              <div className="space-y-4">
                {productsData?.products?.map((product: any) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.category}</p>
                        <p className="text-lg font-bold text-blue-600">
                          ₩{product.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          읽음: {product.readCount} | 클릭: {product.clickCount}
                        </div>
                        <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? '활성' : '비활성'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Events Test */}
        {dashboardData?.recentEvents && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">최근 이벤트</h2>
            <div className="space-y-3">
              {dashboardData.recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{event.eventType}</span>
                    <span className="mx-2">•</span>
                    <span className="text-gray-600">{event.product?.name}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(event.createdAt).toLocaleString('ko-KR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};