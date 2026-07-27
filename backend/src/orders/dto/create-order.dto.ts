import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType, PaymentMethod, IngredientCategory } from '@prisma/client';

export class OrderItemIngredientDto {
  @IsString()
  @IsOptional()
  ingredientId?: string;

  @IsString()
  @IsNotEmpty()
  ingredientName: string;

  @IsNumber()
  @Min(0)
  ingredientPrice: number;

  @IsEnum(IngredientCategory)
  @IsOptional()
  category?: IngredientCategory;
}

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  pizzaName: string;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  itemPrice: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemIngredientDto)
  ingredients: OrderItemIngredientDto[];
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @IsEnum(OrderType)
  @IsOptional()
  orderType?: OrderType;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  specialInstructions?: string;

  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
