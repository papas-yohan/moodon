import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Users,
  MessageSquare
} from 'lucide-react';

interface SendJobProgress {
  jobId: string;
  status: string;
  totalCount: number;
  sentCount: number;
  successCount: number;
  failedCount: number;
  progress: number;
  startedAt: string;
  completedAt?: string;
}

interface SendLog {
  id: string;
  contactName: string;
  phone: string;
  status: string;
  message: string;
  errorMessage?: string;
  sentAt: string;
}

export const SendMonitor: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [progress, setProgress] = useState<SendJobProgress | null>(null);
  const [logs, setLogs] = useState<SendLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 진행률 조회
  const fetchProgress = async () => {
    if (!jobId) return;
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const response = await fetch(`${API_BASE_URL}/messaging/send-jobs/${jobId}/monitor`);
      const data = await response.json();
      setProgress(data);
    } catch (error) {
      console.error('진행률 조회 실패:', error);
    }
  };

  // 로그 조회
  const fetchLogs = async () => {
    if (!jobId) return;
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const response = await fetch(`${API_BASE_URL}/messaging/send-jobs/${jobId}/logs/live?limit=20`);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('로그 조회 실패:', error);
    }
  };

  // 일시정지
  const pauseJob = async () => {
    if (!jobId) return;
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      await fetch(`${API_BASE_URL}/messaging/send-jobs/${jobId}/pause`, { method: 'POST' });
      fetchProgress();
    } catch (error) {
      console.error('일시정지 실패:', error);
    }
  };

  // 재개
  const resumeJob = async () => {
    if (!jobId) return;
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      await fetch(`${API_BASE_URL}/messaging/send-jobs/${jobId}/resume`, { method: 'POST' });
      fetchProgress();
    } catch (error) {
      console.error('재개 실패:', error);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProgress(), fetchLogs()]);
      setLoading(false);
    };
    
    loadData();
  }, [jobId]);

  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchProgress();
      fetchLogs();
    }, 2000); // 2초마다 업데이트

    return () => clearInterval(interval);
  }, [autoRefresh, jobId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'PROCESSING': return 'text-blue-600 bg-blue-100';
      case 'PAUSED': return 'text-yellow-600 bg-yellow-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">발송 상태를 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">발송 작업을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">발송 모니터링</h1>
              <p className="text-sm text-gray-500">실시간 발송 상태 및 로그</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md ${
                  autoRefresh 
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'bg-white text-gray-700'
                } hover:bg-gray-50`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                자동 새로고침
              </button>
              
              {progress.status === 'PROCESSING' && (
                <button
                  onClick={pauseJob}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  일시정지
                </button>
              )}
              
              {progress.status === 'PAUSED' && (
                <button
                  onClick={resumeJob}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  재개
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">발송 진행률</h2>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(progress.status)}`}>
                {progress.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>진행률: {progress.progress}%</span>
                <span>{progress.sentCount} / {progress.totalCount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <div className="text-2xl font-bold text-gray-900">{progress.totalCount}</div>
                <div className="text-sm text-gray-600">총 대상</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-900">{progress.successCount}</div>
                <div className="text-sm text-green-600">성공</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-600" />
                <div className="text-2xl font-bold text-red-900">{progress.failedCount}</div>
                <div className="text-sm text-red-600">실패</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-900">{progress.sentCount}</div>
                <div className="text-sm text-blue-600">발송 완료</div>
              </div>
            </div>
          </div>

          {/* Recent Logs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">최근 발송 로그</h2>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  아직 발송 로그가 없습니다.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(log.status)}
                        <div>
                          <div className="font-medium text-gray-900">{log.contactName}</div>
                          <div className="text-sm text-gray-600">{log.phone}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-900">
                          {new Date(log.sentAt).toLocaleTimeString('ko-KR')}
                        </div>
                        {log.errorMessage && (
                          <div className="text-xs text-red-600 mt-1">
                            {log.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};