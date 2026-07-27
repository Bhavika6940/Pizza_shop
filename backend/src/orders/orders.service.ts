import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const { items, ...orderData } = dto;

    return this.prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: items.map((item) => ({
            pizzaName: item.pizzaName,
            size: item.size,
            quantity: item.quantity,
            itemPrice: item.itemPrice,
            ingredients: {
              create: item.ingredients.map((ing) => ({
                ingredientId: ing.ingredientId,
                ingredientName: ing.ingredientName,
                ingredientPrice: ing.ingredientPrice,
                category: ing.category,
              })),
            },
          })),
        },
      },
      include: {
        items: {
          include: {
            ingredients: true,
          },
        },
      },
    });
  }

  async findAll(status?: OrderStatus) {
    const where = status ? { status } : {};
    return this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            ingredients: true,
          },
        },
      },
    });
  }

  async findOne(idOrCode: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [
          { id: idOrCode },
          { orderCode: idOrCode },
        ],
      },
      include: {
        items: {
          include: {
            ingredients: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order not found with ID or code: ${idOrCode}`);
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            ingredients: true,
          },
        },
      },
    });
  }
}
