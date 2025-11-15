import { ApiProperty } from "@nestjs/swagger";

export class SendJob {
  @ApiProperty({
    description: "발송 작업 ID",
    example: "cm3a8ixqy0000uxqhqhqhqhqh",
  })
  id: string;

  @ApiProperty({
    description: "발송할 상품 ID 배열 (JSON 문자열)",
    example: '["product1", "product2"]',
  })
  productIds: string;

  @ApiProperty({
    description: "발송 채널",
    enum: ["SMS", "KAKAO", "BOTH"],
    example: "BOTH",
  })
  channel: string;

  @ApiProperty({
    description: "발송 대상 수",
    example: 100,
  })
  recipientCount: number;

  @ApiProperty({
    description: "발송 성공 수",
    example: 95,
  })
  successCount: number;

  @ApiProperty({
    description: "발송 실패 수",
    example: 5,
  })
  failCount: number;

  @ApiProperty({
    description: "발송 상태",
    enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
    example: "COMPLETED",
  })
  status: string;

  @ApiProperty({
    description: "예약 발송 시간",
    example: "2025-11-06T10:00:00.000Z",
    nullable: true,
  })
  scheduledAt: Date | null;

  @ApiProperty({
    description: "발송 시작 시간",
    example: "2025-11-05T10:00:00.000Z",
    nullable: true,
  })
  startedAt: Date | null;

  @ApiProperty({
    description: "발송 완료 시간",
    example: "2025-11-05T10:05:00.000Z",
    nullable: true,
  })
  completedAt: Date | null;

  @ApiProperty({
    description: "생성 시간",
    example: "2025-11-05T09:55:00.000Z",
  })
  createdAt: Date;
}
