import React, { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, SelectionChangedEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useContacts, useDeleteContact } from '../../hooks/useContacts';
import { Contact, QueryContactDto } from '../../types/contact';
import { Edit, Trash2, Mail, Phone, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContactsTableProps {
  filters: QueryContactDto;
  onEditContact: (contact: Contact) => void;
  onViewContact: (contact: Contact) => void;
  onSelectionChange: (contacts: Contact[]) => void;
}

export const ContactsTable: React.FC<ContactsTableProps> = ({
  filters,
  onEditContact,
  onViewContact,
  onSelectionChange,
}) => {
  const [selectedRows, setSelectedRows] = useState<Contact[]>([]);
  const { data: contactsData, isLoading, error } = useContacts(filters);
  const deleteContactMutation = useDeleteContact();

  // 액션 버튼 렌더러
  const ActionCellRenderer = ({ data }: { data: Contact }) => {
    const handleDelete = async () => {
      if (window.confirm('정말로 이 연락처를 삭제하시겠습니까?')) {
        try {
          await deleteContactMutation.mutateAsync(data.id);
        } catch (error) {
          // 에러는 hook에서 처리됨
        }
      }
    };

    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onViewContact(data)}
          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
          title="상세보기"
        >
          <Mail className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onEditContact(data)}
          className="p-1 text-green-600 hover:text-green-800 transition-colors"
          title="수정"
        >
          <Edit className="w-4 h-4" />
        </button>
        
        <a
          href={`tel:${data.phone}`}
          className="p-1 text-purple-600 hover:text-purple-800 transition-colors"
          title="전화걸기"
        >
          <Phone className="w-4 h-4" />
        </a>
        
        <button
          onClick={handleDelete}
          className="p-1 text-red-600 hover:text-red-800 transition-colors"
          title="삭제"
          disabled={deleteContactMutation.isPending}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // 그룹 렌더러
  const GroupCellRenderer = ({ data }: { data: Contact }) => {
    return data.groupName ? (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
        <Users className="w-3 h-3 mr-1" />
        {data.groupName}
      </span>
    ) : (
      <span className="text-gray-400">-</span>
    );
  };

  // 상태 렌더러
  const StatusCellRenderer = ({ data }: { data: Contact }) => {
    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          data.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {data.isActive ? '활성' : '비활성'}
      </span>
    );
  };

  // 태그 렌더러
  const TagsCellRenderer = ({ data }: { data: Contact }) => {
    const tags = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    return tags.length > 0 ? (
      <div className="flex flex-wrap gap-1">
        {tags.slice(0, 2).map((tag, index) => (
          <span
            key={index}
            className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
          >
            {tag}
          </span>
        ))}
        {tags.length > 2 && (
          <span className="text-xs text-gray-500">+{tags.length - 2}</span>
        )}
      </div>
    ) : (
      <span className="text-gray-400">-</span>
    );
  };

  const columnDefs: ColDef[] = [
    {
      headerName: '이름',
      field: 'name',
      flex: 1,
      minWidth: 150,
      cellRenderer: ({ data }: { data: Contact }) => (
        <div>
          <div className="font-medium text-gray-900">{data.name}</div>
          {data.kakaoId && (
            <div className="text-sm text-gray-500">카카오: {data.kakaoId}</div>
          )}
        </div>
      ),
    },
    {
      headerName: '전화번호',
      field: 'phone',
      width: 150,
      cellRenderer: ({ data }: { data: Contact }) => (
        <div className="font-mono text-sm">{data.phone}</div>
      ),
    },
    {
      headerName: '그룹',
      field: 'groupName',
      width: 120,
      cellRenderer: GroupCellRenderer,
    },
    {
      headerName: '태그',
      field: 'tags',
      width: 150,
      cellRenderer: TagsCellRenderer,
      sortable: false,
      filter: false,
    },
    {
      headerName: '상태',
      field: 'isActive',
      width: 80,
      cellRenderer: StatusCellRenderer,
    },
    {
      headerName: '등록일',
      field: 'createdAt',
      width: 120,
      valueFormatter: ({ value }) => new Date(value).toLocaleDateString('ko-KR'),
    },
    {
      headerName: '작업',
      field: 'actions',
      cellRenderer: ActionCellRenderer,
      width: 150,
      sortable: false,
      filter: false,
      pinned: 'right',
    },
  ];

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  };

  const onSelectionChanged = (event: SelectionChangedEvent) => {
    const selected = event.api.getSelectedRows();
    setSelectedRows(selected);
    onSelectionChange(selected);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">데이터 로드 실패</h3>
          <p className="text-red-600 text-sm">
            {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 선택된 항목 정보 */}
      {selectedRows.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedRows.length}개 연락처가 선택됨
            </span>
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                onClick={() => {
                  toast('일괄 작업 기능은 곧 추가될 예정입니다.', { icon: 'ℹ️' });
                }}
              >
                일괄 수정
              </button>
              <button
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                onClick={() => {
                  toast('일괄 삭제 기능은 곧 추가될 예정입니다.', { icon: 'ℹ️' });
                }}
              >
                일괄 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 테이블 */}
      <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          rowData={contactsData?.data || []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onSelectionChanged={onSelectionChanged}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          pagination={true}
          paginationPageSize={20}
          animateRows={true}
          domLayout="normal"
        />
      </div>

      {/* 페이지네이션 정보 */}
      {contactsData?.meta && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              총 {contactsData.meta.total.toLocaleString()}개 중{' '}
              {((contactsData.meta.page - 1) * contactsData.meta.limit + 1).toLocaleString()}-
              {Math.min(
                contactsData.meta.page * contactsData.meta.limit,
                contactsData.meta.total
              ).toLocaleString()}개 표시
            </span>
            <span>
              {contactsData.meta.page} / {contactsData.meta.totalPages} 페이지
            </span>
          </div>
        </div>
      )}
    </div>
  );
};