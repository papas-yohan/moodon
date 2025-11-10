import { ApiProperty } from '@nestjs/swagger';

export class TrackingEvent {
  @ApiProperty({
    description: '추적 이벤트 ID',
    example: 'cm3a8ixqy0000uxqhqhqhqhqh',
  })
  id: string;

  @ApiProperty({
    description: '상품 ID',
    example: 'cm3a8ixqy0000uxqhqhqhqhqh',
  })
  productId: string;

  @ApiProperty({
    description: '연락처 ID',
    example: 'cm3a8ixqy0000uxqhqhqhqhqh',
    nullable: true,
  })
  contactId: string | null;

  @ApiProperty({
    description: '발송 로그 ID',
    example: 'cm3a8ixqy0000uxqhqhqhqhqh',
    nullable: true,
  })
  sendLogId: string | null;

  @ApiProperty({
    description: '이벤트 타입',
    enum: ['CLICK', 'READ', 'DELIVERED'],
    example: 'CLICK',
  })
  eventType: string;

  @ApiProperty({
    description: '추적 코드',
    example: 'track_abc123def456',
    nullable: true,
  })
  trackingCode: string | null;

  @ApiProperty({
    description: 'IP 주소',
    example: '192.168.1.1',
    nullable: true,
  })
  ipAddress: string | null;

  @ApiProperty({
    description: 'User Agent',
    example: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    nullable: true,
  })
  userAgent: string | null;

  @ApiProperty({
    description: '추가 메타데이터',
    example: '{"referrer": "https://example.com", "device": "mobile"}',
    nullable: true,
  })
  metadata: string | null;

  @ApiProperty({
    description: '생성 시간',
    example: '2025-11-05T10:00:00.000Z',
  })
  createdAt: Date;
}