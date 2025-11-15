import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn } from "class-validator";

export class CreateTrackingEventDto {
  @ApiProperty({
    description: "상품 ID",
    example: "cm3a8ixqy0000uxqhqhqhqhqh",
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: "연락처 ID",
    example: "cm3a8ixqy0000uxqhqhqhqhqh",
    required: false,
  })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiProperty({
    description: "발송 로그 ID",
    example: "cm3a8ixqy0000uxqhqhqhqhqh",
    required: false,
  })
  @IsOptional()
  @IsString()
  sendLogId?: string;

  @ApiProperty({
    description: "이벤트 타입",
    enum: ["CLICK", "READ", "DELIVERED"],
    example: "CLICK",
  })
  @IsIn(["CLICK", "READ", "DELIVERED"])
  eventType: "CLICK" | "READ" | "DELIVERED";

  @ApiProperty({
    description: "추적 코드",
    example: "track_abc123def456",
    required: false,
  })
  @IsOptional()
  @IsString()
  trackingCode?: string;

  @ApiProperty({
    description: "IP 주소",
    example: "192.168.1.1",
    required: false,
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    description: "User Agent",
    example: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
    required: false,
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({
    description: "추가 메타데이터 (JSON 문자열)",
    example: '{"referrer": "https://example.com", "device": "mobile"}',
    required: false,
  })
  @IsOptional()
  @IsString()
  metadata?: string;
}
