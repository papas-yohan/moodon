import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryProductDto, QueryProductParams, CreateProductDto, UpdateProductDto, ProductsResponse, ProductsHookResponse } from '../types/product';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || '/api/v1'}/products`;

// API 함수들
const productsApi = {
  // 상품 목록 조회
  getProducts: async (params: QueryProductParams): Promise<ProductsResponse> => {
    // 프론트엔드 파라미터를 백엔드 형식으로 변환
    const backendParams: QueryProductDto = {
      ...params,
    };

    // sortBy와 sortOrder를 sort로 변환
    if (params.sortBy && params.sortOrder) {
      backendParams.sort = `${params.sortBy}:${params.sortOrder}`;
    } else if (params.sortBy) {
      backendParams.sort = `${params.sortBy}:desc`;
    }

    // sortBy, sortOrder 제거 (백엔드에서 인식하지 못함)
    delete (backendParams as any).sortBy;
    delete (backendParams as any).sortOrder;

    const searchParams = new URLSearchParams();
    
    Object.entries(backendParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}?${searchParams}`);
    if (!response.ok) {
      throw new Error('상품 목록을 불러오는데 실패했습니다.');
    }
    return response.json();
  },

  // 상품 상세 조회
  getProduct: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error('상품 정보를 불러오는데 실패했습니다.');
    }
    return response.json();
  },

  // 상품 생성
  createProduct: async (data: CreateProductDto) => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '상품 생성에 실패했습니다.');
    }
    
    return response.json();
  },

  // 상품 수정
  updateProduct: async ({ id, data }: { id: string; data: UpdateProductDto }) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '상품 수정에 실패했습니다.');
    }
    
    return response.json();
  },

  // 상품 삭제
  deleteProduct: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      // 에러 응답이 있는 경우에만 JSON 파싱
      try {
        const error = await response.json();
        throw new Error(error.message || '상품 삭제에 실패했습니다.');
      } catch (e) {
        throw new Error('상품 삭제에 실패했습니다.');
      }
    }
    
    // 204 No Content는 응답 본문이 없으므로 그냥 성공 반환
    return { success: true };
  },

  // 이미지 업로드
  uploadImages: async (productId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
      formData.append('sequences', index.toString());
    });

    const response = await fetch(`${API_BASE_URL}/${productId}/images/multiple`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '이미지 업로드에 실패했습니다.');
    }

    return response.json();
  },

  // 이미지 합성
  composeImages: async (productId: string, templateType: 'grid' | 'highlight' | 'simple' = 'grid') => {
    const response = await fetch(`/api/v1/composer/products/${productId}/compose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ templateType }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '이미지 합성에 실패했습니다.');
    }

    return response.json();
  },
};

// 커스텀 훅들
export const useProducts = (params?: QueryProductParams) => {
  const queryClient = useQueryClient();

  // 기본 파라미터 설정
  const defaultParams: QueryProductParams = {
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...params,
  };

  // 상품 목록 조회 (기본 훅)
  const query = useQuery({
    queryKey: ['products', defaultParams],
    queryFn: () => productsApi.getProducts(defaultParams),
    staleTime: 5 * 60 * 1000, // 5분
    select: (data: ProductsResponse): ProductsHookResponse => {
      console.log('useProducts - Raw API response:', data);
      console.log('useProducts - data.data:', data.data);
      console.log('useProducts - data.meta:', data.meta);
      
      return {
        products: data.data || [],
        pagination: data.meta || { total: 0, page: 1, limit: 20, totalPages: 1 }
      };
    },
  });

  // 개별 쿼리 함수
  const getProducts = (params: QueryProductParams) => {
    return useQuery({
      queryKey: ['products', params],
      queryFn: () => productsApi.getProducts(params),
      staleTime: 5 * 60 * 1000, // 5분
    });
  };

  // 상품 상세 조회
  const getProduct = (id: string) => {
    return useQuery({
      queryKey: ['products', id],
      queryFn: () => productsApi.getProduct(id),
      enabled: !!id,
    });
  };

  // 상품 생성
  const createProduct = useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // 상품 수정
  const updateProduct = useMutation({
    mutationFn: productsApi.updateProduct,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
    },
  });

  // 상품 삭제
  const deleteProduct = useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      console.error('상품 삭제 실패:', error);
    },
  });

  // 이미지 업로드
  const uploadImages = useMutation({
    mutationFn: ({ productId, files }: { productId: string; files: File[] }) =>
      productsApi.uploadImages(productId, files),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.productId] });
    },
  });

  // 이미지 합성
  const composeImages = useMutation({
    mutationFn: ({ productId, templateType }: { productId: string; templateType?: 'grid' | 'highlight' | 'simple' }) =>
      productsApi.composeImages(productId, templateType),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.productId] });
    },
  });



  return {
    // 기본 쿼리 결과 (params가 있을 때)
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    
    // 개별 함수들
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImages,
    composeImages,
  };
};

// 개별 훅들 (기존 코드와의 호환성을 위해)
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      console.error('상품 삭제 실패:', error);
    },
  });
};

export const useToggleProductActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      productsApi.updateProduct({ id, data: { status } }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
    },
  });
};