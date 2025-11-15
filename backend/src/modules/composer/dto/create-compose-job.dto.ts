import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn } from "class-validator";

export class CreateComposeJobDto {
  @ApiProperty({
    description: "상품 ID",
    example: "cm3a8ixqy0000uxqhqhqhqhqh",
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: "합성 템플릿 타입",
    enum: ["grid", "highlight", "simple"],
    example: "grid",
    required: false,
  })
  @IsOptional()
  @IsIn(["grid", "highlight", "simple"])
  templateType?: string = "grid";
}
