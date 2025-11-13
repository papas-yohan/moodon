import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, Loader2 } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { Product } from '../../types/product';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const productSchema = z.object({
  name: z.string().min(1, '상품명을 입력해주세요'),
  price: z.number().min(0, '가격은 0 이상이어야 합니다'),
  description: z.string().optional(),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  size: z.string().optional(),
  color: z.string().optional(),
  marketUrl: z.union([
    z.string().url('올바른 URL을 입력해주세요'),
    z.literal(''),
  ]).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  product?: Product | null; // 편집할 상품 (없으면 새 상품 등록)
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product,
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const { createProduct, updateProduct } = useProducts();
  const isEditMode = !!product;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      description: '',
      category: '',
      size: '',
      color: '',
      marketUrl: '',
    },
  });

  // 편집 모드일 때 폼 데이터 설정
  useEffect(() => {
    console.log('ProductForm useEffect 실행:', { isEditMode, product: product?.name, imagesCount: product?.images?.length });
    
    if (isEditMode && product) {
      setValue('name', product.name);
      setValue('price', product.price);
      setValue('description', product.description || '');
      setValue('category', product.category || '');
      setValue('size', product.size || '');
      setValue('color', product.color || '');
      setValue('marketUrl', product.marketUrl || '');
      
      // 기존 이미지 미리보기 설정
      if (product.images && product.images.length > 0) {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
        const baseUrl = API_BASE_URL.replace('/api/v1', '');
        const existingImageUrls = product.images.map(img => 
          img.imageUrl.replace(baseUrl, '')
        );
        console.log('이미지 URL 설정 전:', imagePreviewUrls);
        setImagePreviewUrls(existingImageUrls);
        console.log('이미지 URL 설정 후:', existingImageUrls);
        
        // selectedImages는 편집 모드에서는 빈 배열로 유지 (기존 이미지는 서버에 있음)
        setSelectedImages([]);
      } else {
        console.log('편집 모드이지만 이미지가 없음');
        setImagePreviewUrls([]);
        setSelectedImages([]);
      }
    } else {
      // 새 상품 등록 모드일 때 초기화
      console.log('새 상품 등록 모드 - 초기화');
      reset();
      setImagePreviewUrls([]);
      setSelectedImages([]);
    }
  }, [isEditMode, product, setValue, reset]);

  const categories = [
    '의류',
    '액세서리',
    '신발',
    '가방',
    '화장품',
    '기타',
  ];

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // 최대 6개 이미지 제한
    const newImages = [...selectedImages, ...files].slice(0, 6);
    setSelectedImages(newImages);

    // 미리보기 URL 생성
    const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
    
    // 기존 URL 정리
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setImagePreviewUrls(newPreviewUrls);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    
    // 제거된 URL 정리
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setSelectedImages(newImages);
    setImagePreviewUrls(newPreviewUrls);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsUploading(true);

      const productData = {
        ...data,
        price: Number(data.price),
      };

      let resultProduct;

      if (isEditMode && product) {
        // 상품 수정
        resultProduct = await updateProduct.mutateAsync({
          id: product.id,
          data: productData,
        });
      } else {
        // 상품 생성
        resultProduct = await createProduct.mutateAsync(productData);
      }
      
      // 새 이미지 업로드 (있는 경우)
      if (selectedImages.length > 0 && resultProduct.id) {
        const formData = new FormData();
        selectedImages.forEach((file) => {
          formData.append('images', file);
        });

        const response = await fetch(`${API_BASE_URL}/products/${resultProduct.id}/images/multiple`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('이미지 업로드 오류:', errorData);
          throw new Error(errorData.message || '이미지 업로드에 실패했습니다.');
        }

        // 편집 모드에서 이미지 변경 시 재합성 트리거
        if (isEditMode) {
          console.log('편집 완료 - 이미지 재합성 시작');
          try {
            const composeResponse = await fetch(`${API_BASE_URL}/composer/products/${resultProduct.id}/compose?templateType=grid`, {
              method: 'POST',
            });
            
            if (composeResponse.ok) {
              console.log('이미지 재합성 작업이 시작되었습니다.');
            } else {
              console.warn('이미지 재합성 시작에 실패했습니다.');
            }
          } catch (composeError) {
            console.error('이미지 재합성 오류:', composeError);
            // 재합성 실패는 전체 프로세스를 중단하지 않음
          }
        }
      }

      // 성공 처리
      alert(`상품이 성공적으로 ${isEditMode ? '수정' : '등록'}되었습니다!`);
      handleClose();
      
      // 이미지 파일이 완전히 저장될 때까지 약간의 지연
      setTimeout(() => {
        onSuccess?.();
      }, 500);
      
    } catch (error) {
      console.error(`상품 ${isEditMode ? '수정' : '등록'} 실패:`, error);
      alert(`상품 ${isEditMode ? '수정' : '등록'}에 실패했습니다. 다시 시도해주세요.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedImages([]);
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setImagePreviewUrls([]);
    setIsUploading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? '상품 수정' : '새 상품 등록'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting || isUploading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상품명 *
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="상품명을 입력하세요"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                가격 *
              </label>
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                min="0"
                step="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 *
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">카테고리 선택</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사이즈
              </label>
              <input
                {...register('size')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: S, M, L"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                색상
              </label>
              <input
                {...register('color')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 블랙, 화이트"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상품 설명
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="상품에 대한 설명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              마켓 링크
            </label>
            <input
              {...register('marketUrl')}
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/product/123"
            />
            {errors.marketUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.marketUrl.message}</p>
            )}
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상품 이미지 (최대 6개)
            </label>
            
            {/* 이미지 선택 버튼 */}
            <div className="mb-4">
              <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                이미지 선택
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={selectedImages.length >= 6}
                />
              </label>
              <p className="mt-1 text-sm text-gray-500">
                JPG, PNG, GIF 파일을 선택하세요. (최대 6개)
              </p>
            </div>

            {/* 이미지 미리보기 */}
            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`미리보기 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        console.error(`이미지 로드 실패 [${index}]:`, url);
                        e.currentTarget.style.border = '2px solid red';
                      }}
                      onLoad={() => {
                        console.log(`이미지 로드 성공 [${index}]:`, url);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={isSubmitting || isUploading}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {(isSubmitting || isUploading) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isUploading 
                ? '업로드 중...' 
                : isSubmitting 
                ? `${isEditMode ? '수정' : '등록'} 중...` 
                : `상품 ${isEditMode ? '수정' : '등록'}`
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};