import { ApiProperty } from "@nestjs/swagger";

export class ComposeJob {
  @ApiProperty({
    description: "합성 작업 ID",
    example: "cm3a8ixqy0000uxqhqhqhqhqh",
  })
  id: string;

  @ApiProperty({
    description: "상품 ID",
    example: "cm3a8ixqy0000uxqhqhqhqhqh",
  })
  productId: string;

  @ApiProperty({
    description: "작업 상태",
    enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
    example: "PENDING",
  })
  status: string;

  @ApiProperty({
    description: "템플릿 타입",
    enum: ["grid", "highlight", "simple"],
    example: "grid",
  })
  templateType: string;

  @ApiProperty({
    description: "합성된 이미지 URL",
    example: "http://localhost:3000/uploads/composed/result.jpg",
    nullable: true,
  })
  resultUrl: string | null;

  @ApiProperty({
    description: "에러 메시지",
    example: null,
    nullable: true,
  })
  errorMessage: string | null;

  @ApiProperty({
    description: "재시도 횟수",
    example: 0,
  })
  retryCount: number;

  @ApiProperty({
    description: "작업 시작 시간",
    example: "2025-11-05T10:00:00.000Z",
    nullable: true,
  })
  startedAt: Date | null;

  @ApiProperty({
    description: "작업 완료 시간",
    example: "2025-11-05T10:01:00.000Z",
    nullable: true,
  })
  completedAt: Date | null;

  @ApiProperty({
    description: "생성 시간",
    example: "2025-11-05T10:00:00.000Z",
  })
  createdAt: Date;
}
