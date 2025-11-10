import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsIn, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryTrackingEventDto {
  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 20,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: '상품 ID 필터',
    example: 'cm3a8ixqy0000uxqhqhqhqhqh',
    required: false,
  })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({
    description: '연락처 ID 필터',
    example: 'cm3a8ixqy0000uxqhqhqhqhqh',
    required: false,
  })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiProperty({
    description: '이벤트 타입 필터',
    enum: ['CLICK', 'READ', 'DELIVERED'],
    example: 'CLICK',
    required: false,
  })
  @IsOptional()
  @IsIn(['CLICK', 'READ', 'DELIVERED'])
  eventType?: string;

  @ApiProperty({
    description: '시작 날짜',
    example: '2025-11-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: '종료 날짜',
    example: '2025-11-30T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: '정렬 (예: createdAt:desc, eventType:asc)',
    example: 'createdAt:desc',
    required: false,
  })
  @IsOptional()
  @IsString()
  sort?: string = 'createdAt:desc';
}