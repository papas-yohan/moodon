import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsBoolean } from "class-validator";
import { Transform } from "class-transformer";

export class UploadContactsDto {
  @ApiProperty({
    description: "기본 그룹명 (파일에 그룹명이 없는 경우)",
    example: "업로드그룹",
    required: false,
  })
  @IsOptional()
  @IsString()
  defaultGroupName?: string;

  @ApiProperty({
    description: "중복 연락처 덮어쓰기 여부",
    example: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  overwriteDuplicates?: boolean = false;

  @ApiProperty({
    description: "유효하지 않은 데이터 건너뛰기 여부",
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  skipInvalid?: boolean = true;
}
