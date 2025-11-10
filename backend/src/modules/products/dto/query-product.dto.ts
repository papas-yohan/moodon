import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryProductDto {
  @ApiProperty({ description: '페이지 번호', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '페이지는 숫자여야 합니다.' })
  @Min(1, { message: '페이지는 1 이상이어야 합니다.' })
  page?: number = 1;

  @ApiProperty({ description: '페이지당 항목 수', example: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '제한 수는 숫자여야 합니다.' })
  @Min(1, { message: '제한 수는 1 이상이어야 합니다.' })
  @Max(100, { message: '제한 수는 100 이하여야 합니다.' })
  limit?: number = 20;

  @ApiProperty({ description: '검색어 (상품명)', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    description: '상품 상태 필터', 
    enum: ['DRAFT', 'COMPOSING', 'READY', 'ARCHIVED'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'COMPOSING', 'READY', 'ARCHIVED'])
  status?: string;

  @ApiProperty({ 
    description: '정렬 기준', 
    example: 'createdAt:desc',
    required: false 
  })
  @IsOptional()
  @IsString()
  sort?: string = 'createdAt:desc';
}