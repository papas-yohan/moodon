export function SendPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">메시지 발송</h1>
        <button className="btn-primary">
          새 발송 작업
        </button>
      </div>
      
      <div className="card">
        <div className="card-content p-8 text-center text-gray-500">
          메시지 발송 기능은 스프린트 4에서 구현됩니다.
        </div>
      </div>
    </div>
  )
}