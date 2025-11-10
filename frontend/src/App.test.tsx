import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

function renderWithProviders(ui: React.ReactElement) {
  const testQueryClient = createTestQueryClient()
  
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('App', () => {
  it('renders without crashing', () => {
    renderWithProviders(<App />)
    expect(screen.getByText('Moodon')).toBeInTheDocument()
  })

  it('renders navigation', () => {
    renderWithProviders(<App />)
    expect(screen.getAllByText('대시보드').length).toBeGreaterThan(0)
    expect(screen.getAllByText('상품 관리').length).toBeGreaterThan(0)
  })
})