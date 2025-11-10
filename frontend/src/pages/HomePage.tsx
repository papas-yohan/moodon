import { Link } from 'react-router-dom'
import { Package, Users, Send, BarChart3 } from 'lucide-react'

export function HomePage() {
  const features = [
    {
      icon: Package,
      title: '상품 관리',
      description: '상품 등록 및 AI 이미지 합성',
      href: '/products',
      color: 'bg-blue-500',
    },
    {
      icon: Users,
      title: '주소록 관리',
      description: '고객 정보 및 그룹 관리',
      href: '/contacts',
      color: 'bg-green-500',
    },
    {
      icon: Send,
      title: '메시지 발송',
      description: 'SMS/카카오톡 일괄 전송',
      href: '/send',
      color: 'bg-purple-500',
    },
    {
      icon: BarChart3,
      title: '분석 대시보드',
      description: '마케팅 효과 측정 및 분석',
      href: '/analytics',
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          신상마켓 상품 홍보 시스템
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI 이미지 합성 기반 상품 마케팅 자동화 플랫폼
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/products" className="btn-primary">
            상품 등록하기
          </Link>
          <Link to="/analytics" className="btn-outline">
            분석 보기
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.href}
              to={feature.href}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
              <div className="card-content p-6">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">0</div>
            <div className="text-sm text-gray-600">등록된 상품</div>
          </div>
        </div>
        <div className="card">
          <div className="card-content p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">0</div>
            <div className="text-sm text-gray-600">주소록 연락처</div>
          </div>
        </div>
        <div className="card">
          <div className="card-content p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">0</div>
            <div className="text-sm text-gray-600">발송된 메시지</div>
          </div>
        </div>
        <div className="card">
          <div className="card-content p-6 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">0%</div>
            <div className="text-sm text-gray-600">평균 클릭률</div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">시작하기</h2>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h3 className="font-medium">상품 등록</h3>
                <p className="text-sm text-gray-600">
                  상품 정보와 이미지(5~6장)를 업로드하고 AI로 마케팅 이미지를 생성하세요.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h3 className="font-medium">주소록 관리</h3>
                <p className="text-sm text-gray-600">
                  엑셀 파일로 고객 연락처를 일괄 업로드하거나 개별 등록하세요.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h3 className="font-medium">메시지 발송</h3>
                <p className="text-sm text-gray-600">
                  상품을 선택하고 대상 고객에게 SMS/카카오톡으로 일괄 발송하세요.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div>
                <h3 className="font-medium">효과 분석</h3>
                <p className="text-sm text-gray-600">
                  발송, 읽음, 클릭 데이터를 분석하여 마케팅 효과를 측정하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}