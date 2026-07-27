import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { IngredientCategory } from '@prisma/client';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  findAll(
    @Query('category') category?: IngredientCategory,
    @Query('inStockOnly') inStockOnly?: string,
  ) {
    const filterInStock = inStockOnly === 'true';
    return this.ingredientsService.findAll(category, filterInStock);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingredientsService.findOne(id);
  }

  @Post()
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.update(id, updateIngredientDto);
  }

  @Patch(':id/toggle-stock')
  toggleStock(@Param('id') id: string) {
    return this.ingredientsService.toggleStock(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingredientsService.remove(id);
  }
}
