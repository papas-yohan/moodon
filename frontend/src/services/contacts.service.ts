import api from './api';
import { Contact, CreateContactDto, UpdateContactDto, QueryContactDto } from '../types/contact';

export class ContactsService {
  // 연락처 목록 조회
  static async getContacts(params?: QueryContactDto): Promise<{
    data: Contact[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const response = await api.get('/contacts', { params });
    return response.data;
  }

  // 연락처 상세 조회
  static async getContact(id: string): Promise<Contact> {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  }

  // 연락처 생성
  static async createContact(data: CreateContactDto): Promise<Contact> {
    const response = await api.post('/contacts', data);
    return response.data;
  }

  // 연락처 수정
  static async updateContact(id: string, data: UpdateContactDto): Promise<Contact> {
    const response = await api.patch(`/contacts/${id}`, data);
    return response.data;
  }

  // 연락처 삭제
  static async deleteContact(id: string): Promise<void> {
    try {
      await api.delete(`/contacts/${id}`);
    } catch (error) {
      console.error('연락처 삭제 API 오류:', error);
      throw error;
    }
  }

  // 연락처 일괄 생성
  static async bulkCreateContacts(contacts: CreateContactDto[]): Promise<{
    created: Contact[];
    errors: { row: number; error: string }[];
  }> {
    const response = await api.post('/contacts/bulk', { contacts });
    return response.data;
  }

  // 연락처 일괄 삭제
  static async bulkDeleteContacts(ids: string[]): Promise<{ deletedCount: number }> {
    const response = await api.delete('/contacts/bulk', { data: { ids } });
    return response.data;
  }

  // 연락처 그룹별 조회
  static async getContactsByGroup(group: string): Promise<Contact[]> {
    const response = await api.get(`/contacts/group/${group}`);
    return response.data;
  }

  // 연락처 검색
  static async searchContacts(query: string): Promise<Contact[]> {
    const response = await api.get('/contacts/search', { params: { q: query } });
    return response.data;
  }

  // 연락처 통계 조회
  static async getContactStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    totalGroups: number;
  }> {
    const response = await api.get('/contacts/stats');
    return response.data;
  }

  // CSV 내보내기
  static async exportToCSV(): Promise<Blob> {
    const response = await api.get('/contacts/export/csv', {
      responseType: 'blob',
    });
    return response.data;
  }

  // CSV 가져오기
  static async importFromCSV(file: File): Promise<{
    imported: number;
    errors: { row: number; error: string }[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/contacts/import/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}