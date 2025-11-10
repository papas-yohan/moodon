import { ApiProperty } from '@nestjs/swagger';

export class Contact {
  @ApiProperty({
    description: '연락처 ID',
    example: 'cm3a8ixqy0000uxqhqhqhqhqh',
  })
  id: string;

  @ApiProperty({
    description: '연락처 이름',
    example: '홍길동',
    nullable: true,
  })
  name: string | null;

  @ApiProperty({
    description: '전화번호',
    example: '01012345678',
  })
  phone: string;

  @ApiProperty({
    description: '카카오톡 ID',
    example: 'kakao_user_123',
    nullable: true,
  })
  kakaoId: string | null;

  @ApiProperty({
    description: '그룹명',
    example: 'VIP고객',
    nullable: true,
  })
  groupName: string | null;

  @ApiProperty({
    description: '태그',
    example: '신규고객,20대,여성',
    nullable: true,
  })
  tags: string | null;

  @ApiProperty({
    description: '활성 상태',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: '생성 시간',
    example: '2025-11-05T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정 시간',
    example: '2025-11-05T10:00:00.000Z',
  })
  updatedAt: Date;
}