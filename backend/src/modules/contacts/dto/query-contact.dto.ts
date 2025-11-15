import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsInt, Min, Max } from "class-validator";
import { Transform } from "class-transformer";

export class QueryContactDto {
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
    description: "검색어 (이름, 전화번호)",
    example: "홍길동",
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: "그룹명 필터",
    example: "VIP고객",
    required: false,
  })
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiProperty({
    description: "활성 상태 필터",
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === "true")
  isActive?: boolean;

  @ApiProperty({
    description: "정렬 (예: createdAt:desc, name:asc)",
    example: "createdAt:desc",
    required: false,
  })
  @IsOptional()
  @IsString()
  sort?: string = "createdAt:desc";
}
