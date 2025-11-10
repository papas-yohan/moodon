import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  Bell,
  MessageSquare,
  Settings2,
  Save,
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
} from 'lucide-react';
import { SolapiSettings } from '../components/SolapiSettings';

interface ApiKeySettings {
  smsApiKey?: string;
  kakaoApiKey?: string;
  emailApiKey?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  webhookUrl?: string;
}

interface MessageTemplate {
  id?: string;
  name: string;
  type: 'SMS' | 'KAKAO' | 'EMAIL';
  subject?: string;
  content: string;
  variables: string[];
  isDefault: boolean;
}

interface SystemSettings {
  maxSendPerDay: number;
  maxSendPerHour: number;
  defaultSendDelay: number;
  enableTracking: boolean;
  enableAnalytics: boolean;
  dataRetentionDays: number;
}

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('solapi');
  const [loading, setLoading] = useState(false);
  
  // API 키 설정
  const [apiKeys, setApiKeys] = useState<ApiKeySettings>({});
  const [newApiKey, setNewApiKey] = useState('');
  const [editingKeyType, setEditingKeyType] = useState<string | null>(null);
  
  // 알림 설정
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    webhookUrl: '',
  });
  
  // 메시지 템플릿
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string>('');
  
  // 시스템 설정
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maxSendPerDay: 1000,
    maxSendPerHour: 100,
    defaultSendDelay: 1000,
    enableTracking: true,
    enableAnalytics: true,
    dataRetentionDays: 90,
  });

  // 초기 데이터 로드
  useEffect(() => {
    loadApiKeys();
    loadNotifications();
    loadTemplates();
    loadSystemSettings();
  }, []);

  const loadApiKeys = async () => {
    try {
      setApiKeys({
        smsApiKey: '****1234',
        kakaoApiKey: '****5678',
        emailApiKey: undefined,
      });
    } catch (error) {
      console.error('API 키 로드 실패:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      setNotifications({
        emailNotifications: true,
        smsNotifications: false,
        webhookUrl: 'https://example.com/webhook',
      });
    } catch (error) {
      console.error('알림 설정 로드 실패:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const mockTemplates: MessageTemplate[] = [
        {
          id: '1',
          name: '신상품 알림',
          type: 'SMS',
          content: '안녕하세요 고객님! 새로운 상품이 출시되었습니다.',
          variables: ['customerName', 'productName'],
          isDefault: true,
        },
        {
          id: '2',
          name: '할인 이벤트',
          type: 'KAKAO',
          content: '특별 할인! 상품을 할인가에 만나보세요.',
          variables: ['productName', 'discountRate'],
          isDefault: false,
        },
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
    }
  };

  const loadSystemSettings = async () => {
    try {
      // 현재 설정 유지
    } catch (error) {
      console.error('시스템 설정 로드 실패:', error);
    }
  };

  // API 키 업데이트
  const updateApiKey = async (type: string) => {
    if (!newApiKey.trim()) return;
    
    setLoading(true);
    try {
      console.log(`API 키 업데이트: ${type} = ${newApiKey}`);
      setApiKeys(prev => ({
        ...prev,
        [`${type}ApiKey`]: '****' + newApiKey.slice(-4),
      }));
      setNewApiKey('');
      setEditingKeyType(null);
    } catch (error) {
      console.error('API 키 업데이트 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 알림 설정 저장
  const saveNotifications = async () => {
    setLoading(true);
    try {
      console.log('알림 설정 저장:', notifications);
    } catch (error) {
      console.error('알림 설정 저장 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 템플릿 저장
  const saveTemplate = async () => {
    if (!editingTemplate) return;
    
    setLoading(true);
    try {
      if (editingTemplate.id) {
        setTemplates(prev => 
          prev.map(t => t.id === editingTemplate.id ? editingTemplate : t)
        );
      } else {
        const newTemplate = { ...editingTemplate, id: Date.now().toString() };
        setTemplates(prev => [...prev, newTemplate]);
      }
      setShowTemplateModal(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('템플릿 저장 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 템플릿 삭제
  const deleteTemplate = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('템플릿 삭제 실패:', error);
    }
  };

  // 템플릿 미리보기
  const generatePreview = (template: MessageTemplate) => {
    let preview = template.content;
    template.variables.forEach(variable => {
      preview = preview.replace(
        new RegExp(`\\{\\{${variable}\\}\\}`, 'g'),
        `[${variable}]`
      );
    });
    return preview;
  };

  // 시스템 설정 저장
  const saveSystemSettings = async () => {
    setLoading(true);
    try {
      console.log('시스템 설정 저장:', systemSettings);
    } catch (error) {
      console.error('시스템 설정 저장 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'solapi', name: '솔라피 API', icon: Send },
    { id: 'api-keys', name: 'API 키', icon: Key },
    { id: 'notifications', name: '알림', icon: Bell },
    { id: 'templates', name: '템플릿', icon: MessageSquare },
    { id: 'system', name: '시스템', icon: Settings2 },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <SettingsIcon className="w-6 h-6 text-gray-400 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">설정</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* 사이드바 */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1">
            {/* 솔라피 API 설정 */}
            {activeTab === 'solapi' && (
              <SolapiSettings />
            )}

            {/* API 키 설정 */}
            {activeTab === 'api-keys' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">API 키 관리</h3>
                  <p className="text-sm text-gray-500 mt-1">외부 서비스 연동을 위한 API 키를 관리합니다.</p>
                </div>
                <div className="p-6 space-y-6">
                  {[
                    { key: 'sms', name: 'SMS API 키', value: apiKeys.smsApiKey },
                    { key: 'kakao', name: '카카오톡 API 키', value: apiKeys.kakaoApiKey },
                    { key: 'email', name: '이메일 API 키', value: apiKeys.emailApiKey },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          {item.value ? `설정됨 (${item.value})` : '설정되지 않음'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {editingKeyType === item.key ? (
                          <>
                            <input
                              type="password"
                              value={newApiKey}
                              onChange={(e) => setNewApiKey(e.target.value)}
                              placeholder="새 API 키 입력"
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              onClick={() => updateApiKey(item.key)}
                              disabled={loading}
                              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingKeyType(null);
                                setNewApiKey('');
                              }}
                              className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setEditingKeyType(item.key)}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 알림 설정 */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">알림 설정</h3>
                  <p className="text-sm text-gray-500 mt-1">시스템 알림 및 웹훅 설정을 관리합니다.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">이메일 알림</h4>
                        <p className="text-sm text-gray-500">중요한 이벤트를 이메일로 알림받습니다.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.emailNotifications}
                          onChange={(e) => setNotifications(prev => ({
                            ...prev,
                            emailNotifications: e.target.checked
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">SMS 알림</h4>
                        <p className="text-sm text-gray-500">긴급한 이벤트를 SMS로 알림받습니다.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.smsNotifications}
                          onChange={(e) => setNotifications(prev => ({
                            ...prev,
                            smsNotifications: e.target.checked
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        웹훅 URL
                      </label>
                      <input
                        type="url"
                        value={notifications.webhookUrl || ''}
                        onChange={(e) => setNotifications(prev => ({
                          ...prev,
                          webhookUrl: e.target.value
                        }))}
                        placeholder="https://example.com/webhook"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        이벤트 발생 시 POST 요청을 받을 URL을 입력하세요.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={saveNotifications}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? '저장 중...' : '설정 저장'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 메시지 템플릿 */}
            {activeTab === 'templates' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">메시지 템플릿</h3>
                    <p className="text-sm text-gray-500 mt-1">발송에 사용할 메시지 템플릿을 관리합니다.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingTemplate({
                        name: '',
                        type: 'SMS',
                        content: '',
                        variables: [],
                        isDefault: false,
                      });
                      setShowTemplateModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    새 템플릿
                  </button>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {templates.map((template) => (
                      <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium text-gray-900">{template.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              template.type === 'SMS' ? 'bg-blue-100 text-blue-800' :
                              template.type === 'KAKAO' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {template.type}
                            </span>
                            {template.isDefault && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                기본
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setPreviewTemplate(generatePreview(template))}
                              className="p-2 text-gray-400 hover:text-gray-600"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingTemplate(template);
                                setShowTemplateModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-gray-600"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {!template.isDefault && (
                              <button
                                onClick={() => deleteTemplate(template.id!)}
                                className="p-2 text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{template.content}</p>
                        {template.variables.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {template.variables.map((variable) => (
                              <span
                                key={variable}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                              >
                                {variable}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 시스템 설정 */}
            {activeTab === 'system' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">시스템 설정</h3>
                  <p className="text-sm text-gray-500 mt-1">시스템 동작 및 제한 설정을 관리합니다.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        일일 최대 발송량
                      </label>
                      <input
                        type="number"
                        value={systemSettings.maxSendPerDay}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          maxSendPerDay: parseInt(e.target.value) || 0
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        시간당 최대 발송량
                      </label>
                      <input
                        type="number"
                        value={systemSettings.maxSendPerHour}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          maxSendPerHour: parseInt(e.target.value) || 0
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        발송 간격 (ms)
                      </label>
                      <input
                        type="number"
                        value={systemSettings.defaultSendDelay}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          defaultSendDelay: parseInt(e.target.value) || 0
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        데이터 보관 기간 (일)
                      </label>
                      <input
                        type="number"
                        value={systemSettings.dataRetentionDays}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          dataRetentionDays: parseInt(e.target.value) || 0
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">추적 기능 활성화</h4>
                        <p className="text-sm text-gray-500">클릭 및 읽음 추적을 활성화합니다.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.enableTracking}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            enableTracking: e.target.checked
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">분석 기능 활성화</h4>
                        <p className="text-sm text-gray-500">상세 분석 및 리포트 기능을 활성화합니다.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.enableAnalytics}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            enableAnalytics: e.target.checked
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={saveSystemSettings}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? '저장 중...' : '설정 저장'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 템플릿 미리보기 모달 */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">템플릿 미리보기</h3>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <p className="text-sm">{previewTemplate}</p>
            </div>
            <button
              onClick={() => setPreviewTemplate('')}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 템플릿 편집 모달 */}
      {showTemplateModal && editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingTemplate.id ? '템플릿 편집' : '새 템플릿 생성'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  템플릿 이름
                </label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate(prev => prev ? {
                    ...prev,
                    name: e.target.value
                  } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메시지 타입
                </label>
                <select
                  value={editingTemplate.type}
                  onChange={(e) => setEditingTemplate(prev => prev ? {
                    ...prev,
                    type: e.target.value as 'SMS' | 'KAKAO' | 'EMAIL'
                  } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="SMS">SMS</option>
                  <option value="KAKAO">카카오톡</option>
                  <option value="EMAIL">이메일</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메시지 내용
                </label>
                <textarea
                  value={editingTemplate.content}
                  onChange={(e) => setEditingTemplate(prev => prev ? {
                    ...prev,
                    content: e.target.value
                  } : null)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="메시지 내용을 입력하세요"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={editingTemplate.isDefault}
                  onChange={(e) => setEditingTemplate(prev => prev ? {
                    ...prev,
                    isDefault: e.target.checked
                  } : null)}
                  className="mr-2"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  기본 템플릿으로 설정
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setEditingTemplate(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                취소
              </button>
              <button
                onClick={saveTemplate}
                disabled={loading || !editingTemplate.name || !editingTemplate.content}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};