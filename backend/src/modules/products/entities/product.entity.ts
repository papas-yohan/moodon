import { ApiProperty } from '@nestjs/swagger';

export class Product {
  @ApiProperty({ description: '상품 ID' })
  id: string;

  @ApiProperty({ description: '상품명' })
  name: string;

  @ApiProperty({ description: '가격' })
  price: number;

  @ApiProperty({ description: '사이즈', required: false })
  size?: string;

  @ApiProperty({ description: '색상', required: false })
  color?: string;

  @ApiProperty({ description: '마켓 링크', required: false })
  marketLink?: string;

  @ApiProperty({ description: '합성된 이미지 URL', required: false })
  composedImageUrl?: string;

  @ApiProperty({ description: '발송 횟수', default: 0 })
  sendCount: number;

  @ApiProperty({ description: '읽음 횟수', default: 0 })
  readCount: number;

  @ApiProperty({ description: '클릭 횟수', default: 0 })
  clickCount: number;

  @ApiProperty({ description: '상품 상태', enum: ['DRAFT', 'COMPOSING', 'READY', 'ARCHIVED'] })
  status: string;

  @ApiProperty({ description: '생성일' })
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  updatedAt: Date;

  @ApiProperty({ description: '상품 이미지 목록', type: 'array', items: { type: 'object' } })
  images?: any[];
}