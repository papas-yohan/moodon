import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Contact, CreateContactDto, UpdateContactDto } from '../../types/contact';
import { useCreateContact, useUpdateContact } from '../../hooks/useContacts';
import { X, User, Phone, Mail, Users, Tag } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  phone: z.string().min(10, '올바른 전화번호를 입력해주세요'),
  kakaoId: z.string().optional(),
  groupName: z.string().optional(),
  tags: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  contact,
}) => {
  const isEdit = !!contact;
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      phone: '',
      kakaoId: '',
      groupName: '',
      tags: '',
    },
  });

  // contact가 변경될 때마다 폼 데이터 업데이트
  useEffect(() => {
    if (contact) {
      reset({
        name: contact.name,
        phone: contact.phone,
        kakaoId: contact.kakaoId || '',
        groupName: contact.groupName || '',
        tags: contact.tags || '',
      });
    } else {
      reset({
        name: '',
        phone: '',
        kakaoId: '',
        groupName: '',
        tags: '',
      });
    }
  }, [contact, reset]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      const contactData = {
        ...data,
        kakaoId: data.kakaoId || undefined,
        groupName: data.groupName || undefined,
        tags: data.tags || undefined,
      };

      if (isEdit && contact) {
        await updateMutation.mutateAsync({
          id: contact.id,
          data: contactData as UpdateContactDto,
        });
      } else {
        await createMutation.mutateAsync(contactData as CreateContactDto);
      }

      reset();
      onClose();
    } catch (error) {
      // 에러는 hook에서 처리됨
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {isEdit ? '연락처 수정' : '새 연락처 추가'}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  이름 *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="홍길동"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* 전화번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  전화번호 *
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="01012345678"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {/* 카카오 ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  카카오 ID
                </label>
                <input
                  type="text"
                  {...register('kakaoId')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="kakao_id"
                />
                {errors.kakaoId && (
                  <p className="mt-1 text-sm text-red-600">{errors.kakaoId.message}</p>
                )}
              </div>

              {/* 그룹 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="w-4 h-4 inline mr-1" />
                  그룹
                </label>
                <input
                  type="text"
                  {...register('groupName')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="VIP고객, 신규고객 등"
                />
              </div>

              {/* 태그 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Tag className="w-4 h-4 inline mr-1" />
                  태그
                </label>
                <input
                  type="text"
                  {...register('tags')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="태그1, 태그2, 태그3"
                />
                <p className="mt-1 text-xs text-gray-500">
                  여러 태그는 쉼표(,)로 구분해주세요
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? '저장 중...'
                    : isEdit
                    ? '수정'
                    : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};