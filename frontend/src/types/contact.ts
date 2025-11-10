export interface Contact {
  id: string;
  name: string;
  phone: string;
  kakaoId?: string;
  groupName?: string;
  tags?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactDto {
  name: string;
  phone: string;
  kakaoId?: string;
  groupName?: string;
  tags?: string;
}

export interface UpdateContactDto {
  name?: string;
  phone?: string;
  kakaoId?: string;
  groupName?: string;
  tags?: string;
  isActive?: boolean;
}

export interface QueryContactDto {
  page?: number;
  limit?: number;
  groupName?: string;
  isActive?: boolean;
  search?: string;
}