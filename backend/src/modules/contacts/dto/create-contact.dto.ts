import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsBoolean,
} from "class-validator";

export class CreateContactDto {
  @ApiProperty({
    description: "연락처 이름",
    example: "홍길동",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: "전화번호",
    example: "01012345678",
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: "카카오톡 ID",
    example: "kakao_user_123",
    required: false,
  })
  @IsOptional()
  @IsString()
  kakaoId?: string;

  @ApiProperty({
    description: "그룹명",
    example: "VIP고객",
    required: false,
  })
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiProperty({
    description: "태그 (쉼표로 구분)",
    example: "신규고객,20대,여성",
    required: false,
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({
    description: "활성 상태",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
