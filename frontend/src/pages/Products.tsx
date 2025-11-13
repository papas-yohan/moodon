import React, { useState } from 'react';
import { ProductsTable } from '../components/products/ProductsTable';
import { ProductForm } from '../components/products/ProductForm';
import { ProductDetailModal } from '../components/products/ProductDetailModal';
import { Product, QueryProductParams } from '../types/product';
import { Plus, Search, Filter, Download, Upload } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const Products: React.FC = () => {
  const [filters, setFilters] = useState<QueryProductParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setFilters(prev => ({
      ...prev,
      category: category || undefined,
      page: 1,
    }));
  };

  const handleEditProduct = async (product: Product) => {
    try {
      // 상품 상세 정보 조회 (모든 이미지 포함)
      const response = await fetch(`${API_BASE_URL}/products/${product.id}`);
      if (!response.ok) {
        throw new Error('상품 정보를 불러오는데 실패했습니다.');
      }
      const detailedProduct = await response.json();
      console.log('편집용 상품 상세 정보:', detailedProduct);
      
      setSelectedProduct(detailedProduct);
      setShowProductForm(true);
    } catch (error) {
      console.error('상품 상세 정보 조회 실패:', error);
      alert('상품 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleViewProduct = async (product: Product) => {
    try {
      // 상품 상세 정보 조회 (모든 이미지 포함)
      const response = await fetch(`${API_BASE_URL}/products/${product.id}`);
      if (!response.ok) {
        throw new Error('상품 정보를 불러오는데 실패했습니다.');
      }
      const detailedProduct = await response.json();
      
      setSelectedProduct(detailedProduct);
      setShowDetailModal(true);
    } catch (error) {
      console.error('상품 상세 정보 조회 실패:', error);
      alert('상품 정보를 불러오는데 실패했습니다.');
    }
  };

  const categories = ['의류', '액세서리', '신발', '가방', '화장품', '기타'];

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">상품 관리</h1>
              <p className="text-sm text-gray-500">상품을 등록하고 관리하세요</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Upload className="w-4 h-4 mr-2" />
                가져오기
              </button>
              
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Download className="w-4 h-4 mr-2" />
                내보내기
              </button>
              
              <button 
                onClick={() => setShowProductForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                새 상품
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="상품명, 카테고리로 검색..."
                  />
                </div>
              </form>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Filter className="w-4 h-4 mr-2" />
                필터
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryFilter(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">전체 카테고리</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상태
                    </label>
                    <select
                      value={filters.status || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFilters(prev => ({
                          ...prev,
                          status: value || undefined,
                          page: 1,
                        }));
                      }}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">전체 상태</option>
                      <option value="DRAFT">초안</option>
                      <option value="COMPOSING">합성중</option>
                      <option value="READY">준비됨</option>
                      <option value="ARCHIVED">보관됨</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      정렬
                    </label>
                    <select
                      value={`${filters.sortBy}-${filters.sortOrder}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split('-');
                        setFilters(prev => ({
                          ...prev,
                          sortBy: sortBy as any,
                          sortOrder: sortOrder as 'asc' | 'desc',
                          page: 1,
                        }));
                      }}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="createdAt-desc">최신순</option>
                      <option value="createdAt-asc">오래된순</option>
                      <option value="name-asc">이름순 (A-Z)</option>
                      <option value="name-desc">이름순 (Z-A)</option>
                      <option value="price-asc">가격 낮은순</option>
                      <option value="price-desc">가격 높은순</option>
                      <option value="readCount-desc">읽음 많은순</option>
                      <option value="clickCount-desc">클릭 많은순</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Products Table */}
          <ProductsTable
            filters={filters}
            onEditProduct={handleEditProduct}
            onViewProduct={handleViewProduct}
          />
        </div>

        {/* Product Form Modal */}
        <ProductForm
          isOpen={showProductForm}
          onClose={() => {
            setShowProductForm(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onSuccess={() => {
            // 강제 새로고침 - 페이지 리로드
            window.location.reload();
          }}
        />

        {/* Product Detail Modal */}
        <ProductDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onEdit={(product) => {
            setShowDetailModal(false);
            handleEditProduct(product);
          }}
        />
      </div>
    </div>
  );
};