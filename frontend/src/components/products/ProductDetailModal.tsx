import React from 'react';
import { X, Edit, ExternalLink, Calendar, Package, Tag, Palette, Ruler } from 'lucide-react';
import { Product } from '../../types/product';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  onEdit,
}) => {
  if (!isOpen || !product) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* 배경 오버레이 */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* 모달 컨텐츠 */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* 헤더 */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                상품 상세 정보
              </h3>
              <div className="flex items-center space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(product)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    수정
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* 본문 */}
          <div className="bg-white px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 이미지 섹션 */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">상품 이미지</h4>
                {product.images && product.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {product.images.map((image, index) => {
                      // URL 정규화
                      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
                      const baseUrl = API_BASE_URL.replace('/api/v1', '');
                      const normalizedUrl = image.imageUrl.startsWith('http') 
                        ? image.imageUrl 
                        : `${baseUrl}${image.imageUrl.startsWith('/') ? '' : '/'}${image.imageUrl}`;
                      return (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={normalizedUrl}
                            alt={`${product.name} 이미지 ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('이미지 로드 실패:', normalizedUrl);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">이미지가 없습니다</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 정보 섹션 */}
              <div className="space-y-6">
                {/* 기본 정보 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">기본 정보</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">상품명</label>
                      <p className="mt-1 text-sm text-gray-900">{product.name}</p>
                    </div>

                    {product.description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">설명</label>
                        <p className="mt-1 text-sm text-gray-900">{product.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">가격</label>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{formatPrice(product.price)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">상태</label>
                        <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.status === 'READY' 
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status === 'READY' ? '준비됨' : 
                           product.status === 'DRAFT' ? '초안' : '보관됨'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 상품 속성 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">상품 속성</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <span className="text-xs text-gray-500">카테고리</span>
                        <p className="text-sm text-gray-900">{product.category}</p>
                      </div>
                    </div>

                    {product.size && (
                      <div className="flex items-center">
                        <Ruler className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <span className="text-xs text-gray-500">사이즈</span>
                          <p className="text-sm text-gray-900">{product.size}</p>
                        </div>
                      </div>
                    )}

                    {product.color && (
                      <div className="flex items-center">
                        <Palette className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <span className="text-xs text-gray-500">색상</span>
                          <p className="text-sm text-gray-900">{product.color}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 마켓 링크 */}
                {(product.marketLink || product.marketUrl) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">마켓 정보</h4>
                    <div className="space-y-2">
                      {product.marketLink && (
                        <a
                          href={product.marketLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          마켓 링크
                        </a>
                      )}
                      {product.marketUrl && (
                        <a
                          href={product.marketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          상품 URL
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* 통계 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">통계</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-900">{product.sendCount}</p>
                      <p className="text-xs text-gray-500">발송</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-900">{product.readCount}</p>
                      <p className="text-xs text-gray-500">읽음</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-900">{product.clickCount}</p>
                      <p className="text-xs text-gray-500">클릭</p>
                    </div>
                  </div>
                </div>

                {/* 날짜 정보 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">날짜 정보</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <span className="text-xs text-gray-500">등록일</span>
                        <p className="text-sm text-gray-900">{formatDate(product.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <span className="text-xs text-gray-500">수정일</span>
                        <p className="text-sm text-gray-900">{formatDate(product.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 합성 이미지 섹션 (별도 영역) */}
            {product.composedImageUrl && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">✨ 합성 이미지 (프리미엄 디자인)</h4>
                <div className="max-w-2xl mx-auto">
                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={(() => {
                        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
                        const baseUrl = API_BASE_URL.replace('/api/v1', '');
                        return product.composedImageUrl.startsWith('http') 
                          ? product.composedImageUrl 
                          : `${baseUrl}${product.composedImageUrl.startsWith('/') ? '' : '/'}${product.composedImageUrl}`;
                      })()}
                      alt={`${product.name} 합성 이미지`}
                      className="w-full h-auto object-contain"
                      onError={(e) => {
                        console.error('합성 이미지 로드 실패:', product.composedImageUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    그라데이션 배경 · 라운드 코너 · 프리미엄 헤더 · CTA 버튼
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="bg-gray-50 px-6 py-3">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};