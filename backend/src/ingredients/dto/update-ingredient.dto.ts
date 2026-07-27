import { IsEnum, IsNumber, IsOptional, IsString, Min, IsBoolean } from 'class-validator';
import { IngredientCategory } from '@prisma/client';

export class UpdateIngredientDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(IngredientCategory)
  @IsOptional()
  category?: IngredientCategory;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
