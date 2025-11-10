import React, { useState } from 'react';
import { ContactsTable } from '../components/contacts/ContactsTable';
import { ContactModal } from '../components/contacts/ContactModal';

import { Contact, QueryContactDto } from '../types/contact';
import { useContactStats, useContactGroups, useExportContacts, useImportContacts } from '../hooks/useContacts';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Users,
  UserPlus,
  FileText
} from 'lucide-react';

export const Contacts: React.FC = () => {
  const [filters, setFilters] = useState<QueryContactDto>({
    page: 1,
    limit: 20,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>();

  const { data: stats } = useContactStats();
  const { data: groups } = useContactGroups();
  const exportMutation = useExportContacts();
  const importMutation = useImportContacts();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  const handleGroupFilter = (group: string) => {
    setSelectedGroup(group);
    setFilters(prev => ({
      ...prev,
      groupName: group || undefined,
      page: 1,
    }));
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleViewContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleAddContact = () => {
    setEditingContact(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(undefined);
  };

  const handleSelectionChange = (contacts: Contact[]) => {
    setSelectedContacts(contacts);
  };

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync();
    } catch (error) {
      // 에러는 hook에서 처리됨
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
    }
    // 파일 입력 초기화
    event.target.value = '';
  };

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">연락처 관리</h1>
              <p className="text-sm text-gray-500">고객 연락처를 관리하고 그룹을 설정하세요</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <label className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                가져오기
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleImport}
                  className="hidden"
                  disabled={importMutation.isPending}
                />
              </label>
              
              <button
                onClick={handleExport}
                disabled={exportMutation.isPending}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="w-4 h-4 mr-2" />
                내보내기
              </button>
              
              <button 
                onClick={handleAddContact}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                새 연락처
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-50 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 연락처</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-50 rounded-full">
                  <UserPlus className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">활성 연락처</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.active.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-50 rounded-full">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">그룹 수</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalGroups}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="이름, 전화번호로 검색..."
                  />
                </div>
              </form>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Filter className="w-4 h-4 mr-2" />
                필터
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Group Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      그룹
                    </label>
                    <select
                      value={selectedGroup}
                      onChange={(e) => handleGroupFilter(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">전체 그룹</option>
                      {groups?.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상태
                    </label>
                    <select
                      value={filters.isActive?.toString() || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFilters(prev => ({
                          ...prev,
                          isActive: value === '' ? undefined : value === 'true',
                          page: 1,
                        }));
                      }}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">전체 상태</option>
                      <option value="true">활성</option>
                      <option value="false">비활성</option>
                    </select>
                  </div>

                  {/* 정렬은 AG Grid에서 처리 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      정렬
                    </label>
                    <div className="text-sm text-gray-500 py-2 px-3 bg-gray-50 rounded-md">
                      테이블 헤더를 클릭하여 정렬하세요
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selected Contacts Info */}
          {selectedContacts.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-blue-800 font-medium">
                    {selectedContacts.length}개 연락처 선택됨
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    메시지 발송
                  </button>
                  <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                    그룹 변경
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contacts Table */}
          <ContactsTable
            filters={filters}
            onEditContact={handleEditContact}
            onViewContact={handleViewContact}
            onSelectionChange={handleSelectionChange}
          />

          {/* Contact Modal */}
          <ContactModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            contact={editingContact}
          />
        </div>
      </div>
    </div>
  );
};