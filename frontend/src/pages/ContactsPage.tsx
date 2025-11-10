export function ContactsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">주소록 관리</h1>
        <div className="flex space-x-2">
          <button className="btn-outline">
            엑셀 업로드
          </button>
          <button className="btn-primary">
            연락처 추가
          </button>
        </div>
      </div>
      
      <div className="card">
        <div className="card-content p-8 text-center text-gray-500">
          주소록 관리 기능은 스프린트 3에서 구현됩니다.
        </div>
      </div>
    </div>
  )
}