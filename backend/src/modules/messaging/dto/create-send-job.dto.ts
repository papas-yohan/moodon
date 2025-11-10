import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsOptional, IsIn, IsDateString, ArrayMinSize } from 'class-validator';

export class CreateSendJobDto {
  @ApiProperty({
    description: '발송할 상품 ID 배열',
    example: ['cm3a8ixqy0000uxqhqhqhqhqh', 'cm3a8ixqy0001uxqhqhqhqhqh'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  productIds: string[];

  @ApiProperty({
    description: '발송 대상 연락처 ID 배열',
    example: ['contact1', 'contact2', 'contact3'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  contactIds: string[];

  @ApiProperty({
    description: '발송 채널',
    enum: ['SMS', 'KAKAO', 'BOTH'],
    example: 'BOTH',
  })
  @IsIn(['SMS', 'KAKAO', 'BOTH'])
  channel: 'SMS' | 'KAKAO' | 'BOTH';

  @ApiProperty({
    description: '예약 발송 시간 (선택사항)',
    example: '2025-11-06T10:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({
    description: '사용자 정의 메시지 (선택사항)',
    example: '특별 할인 이벤트! 지금 바로 확인하세요!',
    required: false,
  })
  @IsOptional()
  @IsString()
  customMessage?: string;
}