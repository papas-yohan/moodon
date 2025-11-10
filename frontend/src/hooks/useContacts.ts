import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ContactsService } from '../services/contacts.service';
import { CreateContactDto, UpdateContactDto, QueryContactDto } from '../types/contact';
import toast from 'react-hot-toast';

// Query Keys
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (params?: QueryContactDto) => [...contactKeys.lists(), params] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
  stats: () => [...contactKeys.all, 'stats'] as const,
  groups: () => [...contactKeys.all, 'groups'] as const,
};

// 연락처 목록 조회
export const useContacts = (params?: QueryContactDto) => {
  return useQuery({
    queryKey: contactKeys.list(params),
    queryFn: () => ContactsService.getContacts(params),
    staleTime: 300000, // 5분
    retry: 3,
    retryDelay: 1000,
  });
};

// 연락처 상세 조회
export const useContact = (id: string) => {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => ContactsService.getContact(id),
    enabled: !!id,
    staleTime: 300000, // 5분
  });
};

// 연락처 통계 조회
export const useContactStats = () => {
  return useQuery({
    queryKey: contactKeys.stats(),
    queryFn: () => ContactsService.getContactStats(),
    staleTime: 300000, // 5분
  });
};

// 그룹 목록 조회
export const useContactGroups = () => {
  return useQuery({
    queryKey: contactKeys.groups(),
    queryFn: async () => {
      const groups = new Set<string>();
      let page = 1;
      let hasMore = true;
      
      // 모든 페이지를 순회하며 그룹 수집
      while (hasMore) {
        const data = await ContactsService.getContacts({ page, limit: 100 });
        data.data.forEach(contact => {
          if (contact.groupName) groups.add(contact.groupName);
        });
        
        hasMore = page < data.meta.totalPages;
        page++;
      }
      
      return Array.from(groups);
    },
    staleTime: 300000, // 5분
  });
};

// 연락처 생성
export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactDto) => ContactsService.createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
      queryClient.invalidateQueries({ queryKey: contactKeys.groups() });
      toast.success('연락처가 생성되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '연락처 생성에 실패했습니다.');
    },
  });
};

// 연락처 수정
export const useUpdateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContactDto }) => 
      ContactsService.updateContact(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
      queryClient.invalidateQueries({ queryKey: contactKeys.groups() });
      toast.success('연락처가 수정되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '연락처 수정에 실패했습니다.');
    },
  });
};

// 연락처 삭제
export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ContactsService.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
      queryClient.invalidateQueries({ queryKey: contactKeys.groups() });
      toast.success('연락처가 삭제되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '연락처 삭제에 실패했습니다.');
    },
  });
};

// 연락처 일괄 생성
export const useBulkCreateContacts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contacts: CreateContactDto[]) => ContactsService.bulkCreateContacts(contacts),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
      queryClient.invalidateQueries({ queryKey: contactKeys.groups() });
      
      if (result.errors.length > 0) {
        toast.error(`${result.created.length}개 생성, ${result.errors.length}개 실패`);
      } else {
        toast.success(`${result.created.length}개 연락처가 생성되었습니다.`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '연락처 일괄 생성에 실패했습니다.');
    },
  });
};

// 연락처 일괄 삭제
export const useBulkDeleteContacts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => ContactsService.bulkDeleteContacts(ids),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
      queryClient.invalidateQueries({ queryKey: contactKeys.groups() });
      toast.success(`${result.deletedCount}개 연락처가 삭제되었습니다.`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '연락처 일괄 삭제에 실패했습니다.');
    },
  });
};

// 연락처 검색
export const useSearchContacts = (query: string) => {
  return useQuery({
    queryKey: [...contactKeys.all, 'search', query],
    queryFn: () => ContactsService.searchContacts(query),
    enabled: query.length > 0,
    staleTime: 60000, // 1분
  });
};

// CSV 내보내기
export const useExportContacts = () => {
  return useMutation({
    mutationFn: () => ContactsService.exportToCSV(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('연락처가 내보내기되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '연락처 내보내기에 실패했습니다.');
    },
  });
};

// CSV 가져오기
export const useImportContacts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => ContactsService.importFromCSV(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
      queryClient.invalidateQueries({ queryKey: contactKeys.groups() });
      
      if (result.errors.length > 0) {
        toast.error(`${result.imported}개 가져오기, ${result.errors.length}개 실패`);
      } else {
        toast.success(`${result.imported}개 연락처를 가져왔습니다.`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '연락처 가져오기에 실패했습니다.');
    },
  });
};