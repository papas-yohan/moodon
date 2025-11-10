import api from './api';
import { Product, CreateProductDto, UpdateProductDto, QueryProductDto } from '../types/product';

export class ProductsService {
  // 상품 목록 조회
  static async getProducts(params?: QueryProductDto): Promise<{
    data: Product[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const response = await api.get('/products', { params });
    return response.data;
  }

  // 상품 상세 조회
  static async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }

  // 상품 생성
  static async createProduct(data: CreateProductDto): Promise<Product> {
    const response = await api.post('/products', data);
    return response.data;
  }

  // 상품 수정
  static async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  }

  // 상품 삭제
  static async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  }

  // 상품 이미지 업로드
  static async uploadImage(id: string, file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post(`/products/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // 상품 이미지 삭제
  static async deleteImage(id: string): Promise<void> {
    await api.delete(`/products/${id}/image`);
  }

  // 상품 활성화/비활성화
  static async toggleActive(id: string): Promise<Product> {
    const response = await api.patch(`/products/${id}/toggle-active`);
    return response.data;
  }

  // 상품 복제
  static async duplicateProduct(id: string): Promise<Product> {
    const response = await api.post(`/products/${id}/duplicate`);
    return response.data;
  }

  // 상품 통계 조회
  static async getProductStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    categories: { [key: string]: number };
  }> {
    const response = await api.get('/products/stats');
    return response.data;
  }
}