import React, { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, SelectionChangedEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useProducts, useDeleteProduct, useToggleProductActive } from '../../hooks/useProducts';
import { Product, QueryProductParams } from '../../types/product';
import { Edit, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface ProductsTableProps {
  filters: QueryProductParams;
  onEditProduct: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  filters,
  onEditProduct,
  onViewProduct,
}) => {
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);
  const { data: productsData, isLoading } = useProducts(filters);
  const deleteProductMutation = useDeleteProduct();
  const toggleActiveMutation = useToggleProductActive();

  // 디버깅: 데이터 구조 확인
  React.useEffect(() => {
    if (productsData) {
      console.log('ProductsTable - productsData:', productsData);
      console.log('ProductsTable - products array:', productsData.products);
    }
  }, [productsData]);

  // 액션 버튼 렌더러
  const ActionCellRenderer = ({ data }: { data: Product }) => {
    const handleDelete = async () => {
      if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
        try {
          await deleteProductMutation.mutateAsync(data.id);
          toast.success('상품이 삭제되었습니다.');
        } catch (error) {
          toast.error(error instanceof Error ? error.message : '상품 삭제에 실패했습니다.');
        }
      }
    };

    const handleToggleActive = async () => {
      try {
        const newStatus = data.status === 'READY' ? 'ARCHIVED' : 'READY';
        await toggleActiveMutation.mutateAsync({ 
          id: data.id, 
          status: newStatus
        });
      } catch (error) {
        // 에러는 hook에서 처리됨
      }
    };

    const handleCompose = async (e: React.MouseEvent) => {
      e.stopPropagation(); // 이벤트 버블링 방지
      
      console.log('handleCompose 시작:', data.id);
      console.log('data.images:', data.images);
      
      // 상세 정보 조회하여 모든 이미지 확인
      try {
        const detailResponse = await fetch(`${API_BASE_URL}/products/${data.id}`);
        if (!detailResponse.ok) {
          throw new Error('상품 정보를 불러올 수 없습니다.');
        }
        
        const detailData = await detailResponse.json();
        console.log('상세 정보:', detailData);
        
        if (!detailData.images || detailData.images.length === 0) {
          toast.error('이미지가 없는 상품은 합성할 수 없습니다.');
          return;
        }
        
        toast.loading('이미지 합성 중...', { id: 'compose' });
        
        const response = await fetch(`${API_BASE_URL}/composer/products/${data.id}/compose`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            templateType: 'grid',
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || '이미지 합성에 실패했습니다.');
        }

        const result = await response.json();
        console.log('합성 작업 생성:', result);
        
        toast.success('이미지 합성이 시작되었습니다!', { id: 'compose' });
        
        // 3초 후 새로고침
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } catch (error) {
        console.error('이미지 합성 실패:', error);
        toast.error(error instanceof Error ? error.message : '이미지 합성에 실패했습니다.', { id: 'compose' });
      }
    };

    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onViewProduct(data)}
          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
          title="상세보기"
        >
          <Eye className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onEditProduct(data)}
          className="p-1 text-green-600 hover:text-green-800 transition-colors"
          title="수정"
        >
          <Edit className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleCompose}
          className="p-1 text-purple-600 hover:text-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="이미지 합성"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        
        <button
          onClick={handleToggleActive}
          className={`p-1 transition-colors ${
            data.status === 'READY'
              ? 'text-orange-600 hover:text-orange-800' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          title={data.status === 'READY' ? '보관하기' : '활성화하기'}
          disabled={toggleActiveMutation.isPending}
        >
          {data.status === 'READY' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        
        {data.marketLink && (
          <a
            href={data.marketLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-purple-600 hover:text-purple-800 transition-colors"
            title="마켓 링크"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        
        <button
          onClick={handleDelete}
          className="p-1 text-red-600 hover:text-red-800 transition-colors"
          title="삭제"
          disabled={deleteProductMutation.isPending}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // 이미지 렌더러
  const ImageCellRenderer = ({ data }: { data: Product }) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    // 우선순위: composedImageUrl > images[0] > imageUrl
    let thumbnailUrl = '';
    
    if (data.composedImageUrl) {
      thumbnailUrl = data.composedImageUrl;
    } else if (data.images && data.images.length > 0) {
      thumbnailUrl = data.images[0].imageUrl;
    } else if (data.imageUrl) {
      thumbnailUrl = data.imageUrl;
    }

    // URL 정규화 (절대 URL로 변환)
    const normalizeUrl = (url: string) => {
      if (!url) return '';
      
      // 이미 절대 URL인 경우
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      
      // 상대 경로를 절대 경로로 변환
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const baseUrl = API_BASE_URL.replace('/api/v1', '');
      const cleanUrl = url.startsWith('/') ? url : `/${url}`;
      return `${baseUrl}${cleanUrl}`;
    };

    const fullUrl = normalizeUrl(thumbnailUrl);

    // 이미지 없거나 로드 실패 시
    if (!fullUrl || imageError) {
      return (
        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-xs text-gray-500">
            {imageError ? 'Error' : 'No Image'}
          </span>
        </div>
      );
    }

    return (
      <div className="relative w-10 h-10">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 rounded animate-pulse" />
        )}
        <img
          src={fullUrl}
          alt={data.name}
          className={`w-10 h-10 object-cover rounded ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            console.error('이미지 로드 실패:', fullUrl);
            setImageError(true);
          }}
        />
      </div>
    );
  };

  // 가격 렌더러
  const PriceCellRenderer = ({ data }: { data: Product }) => {
    return (
      <div>
        <div className="font-medium">₩{data.price.toLocaleString()}</div>
        {data.originalPrice && data.originalPrice > data.price && (
          <div className="text-xs text-gray-500 line-through">
            ₩{data.originalPrice.toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  // 상태 렌더러
  const StatusCellRenderer = ({ data }: { data: Product }) => {
    const getStatusInfo = (status: string) => {
      switch (status) {
        case 'READY':
          return { label: '준비됨', className: 'bg-green-100 text-green-800' };
        case 'DRAFT':
          return { label: '초안', className: 'bg-yellow-100 text-yellow-800' };
        case 'COMPOSING':
          return { label: '합성중', className: 'bg-blue-100 text-blue-800' };
        case 'ARCHIVED':
          return { label: '보관됨', className: 'bg-gray-100 text-gray-800' };
        default:
          return { label: '알 수 없음', className: 'bg-gray-100 text-gray-800' };
      }
    };

    const statusInfo = getStatusInfo(data.status || 'DRAFT');

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  // 통계 렌더러
  const StatsCellRenderer = ({ data, colDef }: { data: Product; colDef: any }) => {
    const value = colDef.field === 'readCount' ? data.readCount : data.clickCount;
    return (
      <div className="text-center">
        <span className="font-medium">{value.toLocaleString()}</span>
      </div>
    );
  };

  const columnDefs: ColDef[] = [
    {
      headerName: '이미지',
      field: 'images',
      cellRenderer: ImageCellRenderer,
      width: 80,
      sortable: false,
      filter: false,
    },
    {
      headerName: '상품명',
      field: 'name',
      flex: 1,
      minWidth: 200,
      cellRenderer: ({ data }: { data: Product }) => (
        <div>
          <div className="font-medium text-gray-900">{data.name}</div>
          {data.description && (
            <div className="text-sm text-gray-500 truncate">
              {data.description}
            </div>
          )}
        </div>
      ),
    },
    {
      headerName: '카테고리',
      field: 'category',
      width: 120,
    },
    {
      headerName: '가격',
      field: 'price',
      width: 120,
      cellRenderer: PriceCellRenderer,
      comparator: (valueA: number, valueB: number) => valueA - valueB,
    },
    {
      headerName: '상태',
      field: 'status',
      width: 80,
      cellRenderer: StatusCellRenderer,
    },
    {
      headerName: '읽음',
      field: 'readCount',
      width: 80,
      cellRenderer: StatsCellRenderer,
      comparator: (valueA: number, valueB: number) => valueA - valueB,
    },
    {
      headerName: '클릭',
      field: 'clickCount',
      width: 80,
      cellRenderer: StatsCellRenderer,
      comparator: (valueA: number, valueB: number) => valueA - valueB,
    },
    {
      headerName: '등록일',
      field: 'createdAt',
      width: 120,
      valueFormatter: ({ value }) => new Date(value).toLocaleDateString('ko-KR'),
    },
    {
      headerName: '작업',
      field: 'actions',
      cellRenderer: ActionCellRenderer,
      width: 150,
      sortable: false,
      filter: false,
      pinned: 'right',
    },
  ];

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  };

  const onSelectionChanged = (event: SelectionChangedEvent) => {
    setSelectedRows(event.api.getSelectedRows());
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 선택된 항목 정보 */}
      {selectedRows.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedRows.length}개 항목이 선택됨
            </span>
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                onClick={() => {
                  // 일괄 작업 구현
                  toast('일괄 작업 기능은 곧 추가될 예정입니다.', { icon: 'ℹ️' });
                }}
              >
                일괄 수정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 테이블 */}
      <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          rowData={productsData?.products || []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onSelectionChanged={onSelectionChanged}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          pagination={true}
          paginationPageSize={20}
          animateRows={true}
          domLayout="normal"
        />
      </div>

      {/* 페이지네이션 정보 */}
      {productsData?.pagination && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              총 {productsData.pagination.total.toLocaleString()}개 중{' '}
              {((productsData.pagination.page - 1) * productsData.pagination.limit + 1).toLocaleString()}-
              {Math.min(
                productsData.pagination.page * productsData.pagination.limit,
                productsData.pagination.total
              ).toLocaleString()}개 표시
            </span>
            <span>
              {productsData.pagination.page} / {productsData.pagination.totalPages} 페이지
            </span>
          </div>
        </div>
      )}
    </div>
  );
};