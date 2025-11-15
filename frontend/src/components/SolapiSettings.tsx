import React, { useState, useEffect } from 'react';
import { Key, Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface SolapiApiKeys {
  solapiApiKey?: string;
  solapiApiSecret?: string;
  solapiSender?: string;
  solapiKakaoPfid?: string;
}

export const SolapiSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [apiKeys, setApiKeys] = useState<SolapiApiKeys>({});
  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
    sender: '',
    kakaoPfid: '',
  });

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = 'https://backend-production-c41fe.up.railway.app/api/v1';
      const response = await fetch(`${API_BASE_URL}/settings/api-keys`);
      const data = await response.json();
      setApiKeys(data);
      
      // 마스킹되지 않은 값만 폼에 표시
      setFormData({
        apiKey: '',
        apiSecret: '',
        sender: data.solapiSender || '',
        kakaoPfid: data.solapiKakaoPfid || '',
      });
    } catch (error) {
      console.error('API 키 로드 실패:', error);
      setMessage({ type: 'error', text: 'API 키를 불러오는데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (type: string, value: string) => {
    if (!value.trim()) {
      setMessage({ type: 'error', text: '값을 입력해주세요.' });
      return;
    }

    try {
      setSaving(true);
      const API_BASE_URL = 'https://backend-production-c41fe.up.railway.app/api/v1';
      const response = await fetch(`${API_BASE_URL}/settings/api-keys/${type}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: value }),
      });

      if (!response.ok) {
        throw new Error('API 키 저장 실패');
      }

      const result = await response.json();
      setMessage({ type: 'success', text: result.message || 'API 키가 저장되었습니다.' });
      
      // 저장 후 다시 로드
      await loadApiKeys();
      
      // 폼 초기화 (보안을 위해)
      if (type === 'SOLAPI_API_KEY') {
        setFormData(prev => ({ ...prev, apiKey: '' }));
      } else if (type === 'SOLAPI_API_SECRET') {
        setFormData(prev => ({ ...prev, apiSecret: '' }));
      }
    } catch (error) {
      console.error('API 키 저장 실패:', error);
      setMessage({ type: 'error', text: 'API 키 저장에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReload = async () => {
    try {
      setSaving(true);
      const API_BASE_URL = 'https://backend-production-c41fe.up.railway.app/api/v1';
      const response = await fetch(`${API_BASE_URL}/settings/reload-api-keys`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('API 키 재로드 실패');
      }

      const result = await response.json();
      setMessage({ type: 'success', text: result.message });
    } catch (error) {
      console.error('API 키 재로드 실패:', error);
      setMessage({ type: 'error', text: 'API 키 재로드에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Key className="w-6 h-6" />
            솔라피 API 설정
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            SMS/MMS/카카오톡 발송을 위한 솔라피 API 키를 설정합니다.
          </p>
        </div>
        <button
          onClick={handleReload}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
          설정 재로드
        </button>
      </div>

      {/* 메시지 */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* API 키 입력 폼 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder={apiKeys.solapiApiKey || '솔라피 API Key를 입력하세요'}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => handleSave('SOLAPI_API_KEY', formData.apiKey)}
              disabled={saving || !formData.apiKey}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              저장
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            현재: {apiKeys.solapiApiKey || '설정되지 않음'}
          </p>
        </div>

        {/* API Secret */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Secret
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={formData.apiSecret}
              onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
              placeholder={apiKeys.solapiApiSecret || '솔라피 API Secret을 입력하세요'}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => handleSave('SOLAPI_API_SECRET', formData.apiSecret)}
              disabled={saving || !formData.apiSecret}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              저장
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            현재: {apiKeys.solapiApiSecret || '설정되지 않음'}
          </p>
        </div>

        {/* 발신번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            발신번호
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.sender}
              onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
              placeholder="01012345678"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => handleSave('SOLAPI_SENDER', formData.sender)}
              disabled={saving || !formData.sender}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              저장
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            하이픈 없이 숫자만 입력 (예: 01012345678)
          </p>
        </div>

        {/* 카카오톡 플러스친구 ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            카카오톡 플러스친구 ID
            <span className="text-gray-400 ml-1">(선택)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.kakaoPfid}
              onChange={(e) => setFormData({ ...formData, kakaoPfid: e.target.value })}
              placeholder="@yourkakaoid"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => handleSave('SOLAPI_KAKAO_PFID', formData.kakaoPfid)}
              disabled={saving || !formData.kakaoPfid}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              저장
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            카카오톡 발송을 사용하려면 플러스친구 ID가 필요합니다.
          </p>
        </div>
      </div>

      {/* 도움말 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📚 설정 가이드</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. <a href="https://solapi.com" target="_blank" rel="noopener noreferrer" className="underline">솔라피 웹사이트</a>에서 회원가입</li>
          <li>2. 콘솔에서 API 키 발급 (API 설정 메뉴)</li>
          <li>3. 발신번호 등록 및 본인인증</li>
          <li>4. 위 폼에 API 키 입력 및 저장</li>
          <li>5. "설정 재로드" 버튼 클릭하여 적용</li>
        </ul>
        <p className="text-xs text-blue-700 mt-2">
          자세한 가이드는 프로젝트 루트의 <code className="bg-blue-100 px-1 rounded">SOLAPI_SETUP_GUIDE.md</code> 파일을 참고하세요.
        </p>
      </div>
    </div>
  );
};
