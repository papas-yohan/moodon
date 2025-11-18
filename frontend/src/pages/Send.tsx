import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useContacts } from '../hooks/useContacts';
import { useCreateSendJob } from '../hooks/useMessaging';
import { Product } from '../types/product';
import { Contact } from '../types/contact';
import { 
  Send as SendIcon, 
  Package, 
  Users, 
  MessageSquare, 
  Clock,
  CheckCircle,
  AlertCircle,
  Smartphone,
  MessageCircle
} from 'lucide-react';

interface SendJobForm {
  selectedProducts: Product[];
  selectedContacts: Contact[];
  messageType: 'SMS' | 'KAKAO' | 'BOTH';
  scheduledAt?: string;
  message: string;
}

export const Send: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SendJobForm>({
    selectedProducts: [],
    selectedContacts: [],
    messageType: 'SMS',
    message: '',
  });

  const { data: productsData } = useProducts({ limit: 100 });
  const { data: contactsData } = useContacts({ limit: 100 });
  const createSendJobMutation = useCreateSendJob();

  const handleProductSelect = (product: Product) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.find(p => p.id === product.id)
        ? prev.selectedProducts.filter(p => p.id !== product.id)
        : [...prev.selectedProducts, product]
    }));
  };

  const handleContactSelect = (contact: Contact) => {
    setFormData(prev => ({
      ...prev,
      selectedContacts: prev.selectedContacts.find(c => c.id === contact.id)
        ? prev.selectedContacts.filter(c => c.id !== contact.id)
        : [...prev.selectedContacts, contact]
    }));
  };

  const handleSubmit = async () => {
    try {
      const sendJobData = {
        productIds: formData.selectedProducts.map(p => p.id),
        contactIds: formData.selectedContacts.map(c => c.id),
        channel: formData.messageType,
        customMessage: formData.message.trim() || undefined,
        scheduledAt: formData.scheduledAt || undefined,
      };

      const result = await createSendJobMutation.mutateAsync(sendJobData);
      
      // 발송 작업 생성 성공 시 모니터링 페이지로 이동
      navigate(`/send/${result.id}/monitor`);
    } catch (error) {
      console.error('발송 작업 생성 실패:', error);
      // 에러는 이미 toast로 표시됨
    }
  };

  const generateMessage = () => {
    if (formData.selectedProducts.length === 0) return '';
    
    const product = formData.selectedProducts[0];
    return `🎉 ${product.name}

💰 특가: ${product.price.toLocaleString()}원
${product.originalPrice ? `(정가: ${product.originalPrice.toLocaleString()}원)` : ''}

📱 바로주문: [링크]

✨ 지금 주문하시면 무료배송!`;
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((stepNumber) => (
        <React.Fragment key={stepNumber}>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step >= stepNumber
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300 text-gray-400'
            }`}
          >
            {step > stepNumber ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <span className="text-sm font-medium">{stepNumber}</span>
            )}
          </div>
          {stepNumber < 4 && (
            <div
              className={`w-16 h-1 mx-2 ${
                step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">메시지 발송</h1>
              <p className="text-sm text-gray-500">상품 정보를 고객에게 전송하세요</p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <SendIcon className="w-4 h-4" />
              <span>단계별 발송 설정</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StepIndicator />

        {/* Step 1: 상품 선택 */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Package className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">1단계: 상품 선택</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {productsData?.products?.map((product: any) => {
                // 합성 이미지가 있으면 우선 표시, 없으면 원본 이미지 표시
                const thumbnailUrl = product.composedImageUrl || product.imageUrl;
                
                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.selectedProducts.find(p => p.id === product.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {thumbnailUrl && (
                      <div className="relative mb-3">
                        <img
                          src={thumbnailUrl}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded"
                        />
                        {product.composedImageUrl && (
                          <span className="absolute top-2 right-2 px-2 py-1 text-xs bg-green-500 text-white rounded-full">
                            합성완료
                          </span>
                        )}
                      </div>
                    )}
                    <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        ₩{product.price.toLocaleString()}
                      </span>
                      {formData.selectedProducts.find(p => p.id === product.id) && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between">
              <div className="text-sm text-gray-600">
                {formData.selectedProducts.length}개 상품 선택됨
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={formData.selectedProducts.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                다음 단계
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 연락처 선택 */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">2단계: 연락처 선택</h2>
            </div>

            <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
              {contactsData?.data.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleContactSelect(contact)}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.selectedContacts.find(c => c.id === contact.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-600">{contact.phone}</div>
                      {contact.groupName && (
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded mt-1">
                          {contact.groupName}
                        </span>
                      )}
                    </div>
                  </div>
                  {formData.selectedContacts.find(c => c.id === contact.id) && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                이전 단계
              </button>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {formData.selectedContacts.length}개 연락처 선택됨
                </div>
                <button
                  onClick={() => setStep(3)}
                  disabled={formData.selectedContacts.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  다음 단계
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 메시지 작성 */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <MessageSquare className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">3단계: 메시지 작성</h2>
            </div>

            {/* 메시지 타입 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                발송 채널
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, messageType: 'SMS' }))}
                  className={`flex items-center justify-center p-4 border-2 rounded-lg ${
                    formData.messageType === 'SMS'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className="w-6 h-6 mr-2" />
                  <span className="font-medium">SMS</span>
                </button>
                
                <button
                  onClick={() => setFormData(prev => ({ ...prev, messageType: 'KAKAO' }))}
                  className={`flex items-center justify-center p-4 border-2 rounded-lg ${
                    formData.messageType === 'KAKAO'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MessageCircle className="w-6 h-6 mr-2" />
                  <span className="font-medium">카카오톡</span>
                </button>
                
                <button
                  onClick={() => setFormData(prev => ({ ...prev, messageType: 'BOTH' }))}
                  className={`flex items-center justify-center p-4 border-2 rounded-lg ${
                    formData.messageType === 'BOTH'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Smartphone className="w-5 h-5 mr-1" />
                    <MessageCircle className="w-5 h-5 mr-2" />
                  </div>
                  <span className="font-medium">둘 다</span>
                </button>
              </div>
            </div>

            {/* 메시지 내용 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  메시지 내용
                </label>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, message: generateMessage() }))}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  자동 생성
                </button>
              </div>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={8}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="메시지 내용을 입력하세요..."
              />
              <div className="mt-2 text-sm text-gray-500">
                {formData.message.length}/1000자
              </div>
            </div>

            {/* 예약 발송 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                발송 시간 (선택사항)
              </label>
              <div className="flex items-center space-x-4">
                <Clock className="w-5 h-5 text-gray-400" />
                <input
                  type="datetime-local"
                  value={formData.scheduledAt || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-sm text-gray-500">
                  비워두면 즉시 발송됩니다
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                이전 단계
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!formData.message.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                다음 단계
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 발송 확인 */}
        {step === 4 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <AlertCircle className="w-6 h-6 text-orange-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">4단계: 발송 확인</h2>
            </div>

            {/* 발송 요약 */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-medium text-gray-900 mb-4">발송 요약</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">선택된 상품</h4>
                  <div className="space-y-2">
                    {formData.selectedProducts.map((product) => (
                      <div key={product.id} className="text-sm text-gray-600">
                        • {product.name} (₩{product.price.toLocaleString()})
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">발송 정보</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>• 연락처: {formData.selectedContacts.length}명</div>
                    <div>• 채널: {formData.messageType}</div>
                    <div>• 발송 시간: {formData.scheduledAt ? new Date(formData.scheduledAt).toLocaleString('ko-KR') : '즉시 발송'}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">메시지 미리보기</h4>
                <div className="bg-white border rounded-lg p-3 text-sm whitespace-pre-wrap">
                  {formData.message}
                </div>
              </div>
            </div>

            {/* 예상 비용 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">예상 발송 비용</h4>
              <div className="text-sm text-blue-800">
                SMS: {formData.selectedContacts.length}건 × 8원 = {(formData.selectedContacts.length * 8).toLocaleString()}원
                {formData.messageType === 'BOTH' && (
                  <div>카카오톡: {formData.selectedContacts.length}건 × 15원 = {(formData.selectedContacts.length * 15).toLocaleString()}원</div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                이전 단계
              </button>
              <button
                onClick={handleSubmit}
                disabled={createSendJobMutation.isPending}
                className="px-8 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {createSendJobMutation.isPending && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {createSendJobMutation.isPending ? '발송 중...' : '발송 시작'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};