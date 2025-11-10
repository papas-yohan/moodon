import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadImageDto {
  @ApiProperty({
    description: '이미지 순서',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(10)
  sequence?: number;

  @ApiProperty({
    description: '이미지 리사이즈 너비',
    example: 800,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(100)
  @Max(2000)
  width?: number;

  @ApiProperty({
    description: '이미지 리사이즈 높이',
    example: 800,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(100)
  @Max(2000)
  height?: number;

  @ApiProperty({
    description: '이미지 품질 (1-100)',
    example: 80,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  quality?: number;
}