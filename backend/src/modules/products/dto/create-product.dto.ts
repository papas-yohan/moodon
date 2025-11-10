import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUrl, Min, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: '상품명', example: '봄 신상 원피스' })
  @IsString()
  @MaxLength(255, { message: '상품명은 255자를 초과할 수 없습니다.' })
  name: string;

  @ApiProperty({ description: '가격', example: 45000 })
  @IsNumber({}, { message: '가격은 숫자여야 합니다.' })
  @Min(0, { message: '가격은 0 이상이어야 합니다.' })
  @Transform(({ value }) => parseInt(value))
  price: number;

  @ApiProperty({ description: '사이즈', example: 'Free', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  size?: string;

  @ApiProperty({ description: '색상', example: '베이지', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  color?: string;

  @ApiProperty({ 
    description: '신상마켓 상품 링크', 
    example: 'https://example.com/product/123',
    required: false 
  })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsUrl({}, { message: '올바른 URL 형식이어야 합니다.' })
  marketLink?: string;

  @ApiProperty({ description: '상품 설명', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: '카테고리', example: '의류', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiProperty({ description: '마켓 URL', example: 'https://example.com/product/123', required: false })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsUrl({}, { message: '올바른 URL 형식이어야 합니다.' })
  marketUrl?: string;
}