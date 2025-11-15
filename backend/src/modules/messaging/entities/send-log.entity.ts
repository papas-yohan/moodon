import { ApiProperty } from "@nestjs/swagger";

export class SendLog {
  @ApiProperty({
    description: "발송 로그 ID",
    example: "cm3a8ixqy0000uxqhqhqhqhqh",
  })
  id: string;

  @ApiProperty({
    description: "발송 작업 ID",
    example: "cm3a8ixqy0000uxqhqhqhqhqh",
  })
  sendJobId: string;

  @ApiProperty({
    description: "상품 ID",
    example: "cm3a8ixqy0000uxqhqhqhqhqh",
  })
  productId: string;

  @ApiProperty({
    description: "연락처 ID",
    example: "cm3a8ixqy0000uxqhqhqhqhqh",
  })
  contactId: string;

  @ApiProperty({
    description: "발송 채널",
    enum: ["SMS", "KAKAO"],
    example: "SMS",
  })
  channel: string;

  @ApiProperty({
    description: "발송 상태",
    enum: ["PENDING", "SUCCESS", "FAILED"],
    example: "SUCCESS",
  })
  status: string;

  @ApiProperty({
    description: "에러 코드",
    example: null,
    nullable: true,
  })
  errorCode: string | null;

  @ApiProperty({
    description: "에러 메시지",
    example: null,
    nullable: true,
  })
  errorMessage: string | null;

  @ApiProperty({
    description: "외부 메시지 ID (솔라피 등)",
    example: "M4V20180307110044DTYYJBBYLPQZIB1",
    nullable: true,
  })
  externalMessageId: string | null;

  @ApiProperty({
    description: "발송 시간",
    example: "2025-11-05T10:00:00.000Z",
    nullable: true,
  })
  sentAt: Date | null;

  @ApiProperty({
    description: "생성 시간",
    example: "2025-11-05T09:55:00.000Z",
  })
  createdAt: Date;
}
