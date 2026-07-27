import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { IngredientCategory } from '@prisma/client';

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: IngredientCategory, inStockOnly?: boolean) {
    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (inStockOnly) {
      where.inStock = true;
    }

    return this.prisma.ingredient.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { price: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
    });
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }
    return ingredient;
  }

  async create(dto: CreateIngredientDto) {
    return this.prisma.ingredient.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateIngredientDto) {
    await this.findOne(id);
    return this.prisma.ingredient.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.ingredient.delete({
      where: { id },
    });
  }

  async toggleStock(id: string) {
    const ingredient = await this.findOne(id);
    return this.prisma.ingredient.update({
      where: { id },
      data: { inStock: !ingredient.inStock },
    });
  }
}
