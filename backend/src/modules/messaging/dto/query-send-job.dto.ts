import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsInt, Min, Max, IsIn } from "class-validator";
import { Transform } from "class-transformer";

export class QuerySendJobDto {
  @ApiProperty({
    description: "페이지 번호",
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: "페이지당 항목 수",
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
    description: "발송 상태 필터",
    enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
    example: "COMPLETED",
    required: false,
  })
  @IsOptional()
  @IsIn(["PENDING", "PROCESSING", "COMPLETED", "FAILED"])
  status?: string;

  @ApiProperty({
    description: "발송 채널 필터",
    enum: ["SMS", "KAKAO", "BOTH"],
    example: "SMS",
    required: false,
  })
  @IsOptional()
  @IsIn(["SMS", "KAKAO", "BOTH"])
  channel?: string;

  @ApiProperty({
    description: "정렬 (예: createdAt:desc, startedAt:asc)",
    example: "createdAt:desc",
    required: false,
  })
  @IsOptional()
  @IsString()
  sort?: string = "createdAt:desc";
}
