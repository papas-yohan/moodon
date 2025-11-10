import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Package, 
  Users, 
  Send, 
  BarChart3,
  Settings
} from 'lucide-react'
import { clsx } from 'clsx'

const navigation = [
  { name: '홈', href: '/', icon: Home },
  { name: '상품 관리', href: '/products', icon: Package },
  { name: '주소록', href: '/contacts', icon: Users },
  { name: '메시지 발송', href: '/send', icon: Send },
  { name: '분석', href: '/analytics', icon: BarChart3 },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-xl font-bold text-gray-900">
            신상마켓 홍보
          </h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={clsx(
                          isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon
                          className={clsx(
                            isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <Link
                to="/settings"
                className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-primary-600"
              >
                <Settings
                  className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary-600"
                  aria-hidden="true"
                />
                설정
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}