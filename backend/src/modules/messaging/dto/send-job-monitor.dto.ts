import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
} from "class-validator";

export enum SendJobStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum SendLogStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  FAILED = "FAILED",
  RETRY = "RETRY",
}

export class SendJobProgressDto {
  @ApiProperty({ description: "작업 ID" })
  jobId: string;

  @ApiProperty({ enum: SendJobStatus, description: "작업 상태" })
  status: SendJobStatus;

  @ApiProperty({ description: "전체 발송 대상 수" })
  totalCount: number;

  @ApiProperty({ description: "발송 완료 수" })
  sentCount: number;

  @ApiProperty({ description: "발송 성공 수" })
  successCount: number;

  @ApiProperty({ description: "발송 실패 수" })
  failedCount: number;

  @ApiProperty({ description: "진행률 (0-100)" })
  progress: number;

  @ApiProperty({ description: "예상 완료 시간", required: false })
  estimatedCompletion?: string;

  @ApiProperty({ description: "시작 시간" })
  startedAt: string;

  @ApiProperty({ description: "완료 시간", required: false })
  completedAt?: string;
}

export class SendLogDto {
  @ApiProperty({ description: "로그 ID" })
  id: string;

  @ApiProperty({ description: "발송 작업 ID" })
  sendJobId: string;

  @ApiProperty({ description: "연락처 ID" })
  contactId: string;

  @ApiProperty({ description: "연락처 이름" })
  contactName: string;

  @ApiProperty({ description: "전화번호" })
  phone: string;

  @ApiProperty({ enum: SendLogStatus, description: "발송 상태" })
  status: SendLogStatus;

  @ApiProperty({ description: "메시지 내용" })
  message: string;

  @ApiProperty({ description: "에러 메시지", required: false })
  errorMessage?: string;

  @ApiProperty({ description: "재시도 횟수" })
  retryCount: number;

  @ApiProperty({ description: "발송 시간" })
  sentAt: string;

  @ApiProperty({ description: "생성 시간" })
  createdAt: string;
}

export class PauseSendJobDto {
  @ApiProperty({ description: "일시정지 사유", required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ResumeSendJobDto {
  @ApiProperty({ description: "재개 사유", required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
