export interface ProductImage {
  id: string;
  imageUrl: string;
  sequence: number;
  size?: number;
  mimeType?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category?: string;
  size?: string;
  color?: string;
  imageUrl?: string;
  marketLink?: string;
  marketUrl?: string;
  composedImageUrl?: string;
  status: string;
  tags?: string[];
  sendCount: number;
  readCount: number;
  clickCount: number;
  images?: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category: string;
  size?: string;
  color?: string;
  marketUrl?: string;
  tags?: string[];
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  category?: string;
  size?: string;
  color?: string;
  marketLink?: string;
  marketUrl?: string;
  tags?: string[];
  status?: string;
}

export interface QueryProductDto {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  sort?: string; // 백엔드 형식에 맞게 수정: "createdAt:desc"
  minPrice?: number;
  maxPrice?: number;
}

// 프론트엔드에서 사용할 확장된 타입
export interface QueryProductParams extends Omit<QueryProductDto, 'sort'> {
  sortBy?: 'name' | 'price' | 'createdAt' | 'readCount' | 'clickCount';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductsHookResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}