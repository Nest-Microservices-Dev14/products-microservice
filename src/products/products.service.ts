import { HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger(ProductsService.name);

  onModuleInit() {
    this.$connect()
    this.logger.log('Database connected');
  }

  async create(createProductDto: CreateProductDto) {
    return await this.product.create({
      data: createProductDto
    });
  }

  async findAll(paginationDto: PaginationDto) {

    const { page, limit } = paginationDto;
    const totalPages = await this.product.count();

    return {
      data: await this.product.findMany({
        where: { available: true },
        skip: (page - 1) * limit,
        take: limit
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: totalPages / limit
      }
    }

  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id, available: true }
    });
    
    if ( !product ) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Product with id ${id} not found`
      });
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;
    await this.findOne( id );

    return await this.product.update({
      data: data,
      where: { id }
    });

  }

  async remove(id: number) {

    await this.findOne(id);

    const product = await this.product.update({
      data: { available: false },
      where: { id }
    });

    return product;
  }
}
