import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsBoolean } from 'class-validator';
import { IngredientCategory } from '@prisma/client';

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(IngredientCategory)
  @IsNotEmpty()
  category: IngredientCategory;

  @IsNumber()
  @Min(0)
  price: number;

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
