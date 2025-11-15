import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateProductDto } from "./create-product.dto";
import { IsOptional, IsEnum } from "class-validator";

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({
    description: "상품 상태",
    enum: ["DRAFT", "COMPOSING", "READY", "ARCHIVED"],
    required: false,
  })
  @IsOptional()
  @IsEnum(["DRAFT", "COMPOSING", "READY", "ARCHIVED"], {
    message: "상태는 DRAFT, COMPOSING, READY, ARCHIVED 중 하나여야 합니다.",
  })
  status?: string;
}
