import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CrudOptions, CrudServiceOpts, PaginationResult } from '../interfaces';
import { parseSort } from '../helpers/query-helper';
import { PaginationDto } from '../dtos/pagination.dto';

@Injectable()
export abstract class BaseCRUDService<T = any> {
  private static prismaClient: PrismaClient = new PrismaClient();
  protected model: string;

  constructor(args: CrudServiceOpts) {
    this.model = args.model;
  }

  protected get repository() {
    return (BaseCRUDService.prismaClient as any)[this.model];
  }

  protected addDeletedAtFilter(where: Record<string, any> = {}, withDeleted: boolean = false) {
    if (!withDeleted) {
      return {
        ...where,
        deletedAt: null,
      };
    }

    return where;
  }

  protected parsePageSize(pageSize: number): number {
    return Number(pageSize) || 10;
  }

  protected parsePageNumber(pageNumber: number): number {
    return Number(pageNumber) || 1;
  }

  public async create(data: Partial<T>, options?: CrudOptions): Promise<T> {
    const created = await this.repository.create({
      data,
      include: options?.include,
      select: options?.select,
    });

    return created;
  }

  public async createMany(data: Partial<T>[], options?: CrudOptions): Promise<{ count: number }> {
    const result = await this.repository.createMany({
      data,
      skipDuplicates: options?.skipDuplicates || false,
    });

    return result;
  }

  public findById(id: number | string, options?: CrudOptions): Promise<T> {
    return this.repository.findUnique({
      where: { id, deleteAt: null },
      include: options?.include,
      select: options?.select,
    });
  }

  public findOne(filter: Record<string, any>, options?: CrudOptions): Promise<T> {
    const filteredWhere = this.addDeletedAtFilter(filter, options?.withDeleted);

    return this.repository.findFirst({
      where: filteredWhere,
      include: options?.include,
      select: options?.select,
    });
  }

  public findAll(filter: Record<string, any>, options?: CrudOptions): Promise<T[]> {
    const filteredWhere = this.addDeletedAtFilter(filter, options?.withDeleted);
    const parsedSort = parseSort(options.orderBy || '-createdAt');

    return this.repository.findMany({
      where: filteredWhere,
      include: options?.include,
      select: options?.select,
      orderBy: parsedSort,
    });
  }

  public async paginated(
    dto: PaginationDto,
    filter?: Record<string, any>,
    options?: CrudOptions,
  ): Promise<PaginationResult<T>> {
    const pageSize = this.parsePageSize(dto.pageSize);
    const pageNumber = this.parsePageNumber(dto.page);

    const filteredWhere = this.addDeletedAtFilter(filter, options?.withDeleted);
    const totalCount = await this.repository.count({ where: filteredWhere });

    if (totalCount === 0) {
      return {
        rows: [],
        total: 0,
        pageCount: 0,
        page: pageNumber,
        pageSize,
      };
    }

    const pageCount = Math.ceil(totalCount / pageSize);
    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;
    const parsedSort = parseSort(dto?.sort || '-createdAt');

    const rows = await this.repository.findMany({
      where: filteredWhere,
      include: options?.include,
      select: options?.select,
      orderBy: parsedSort,
      skip,
      take,
    });

    return {
      rows,
      total: totalCount,
      pageCount,
      page: pageNumber,
      pageSize,
    };
  }

  public count(filter: Record<string, any>, options?: CrudOptions): Promise<number> {
    const filteredWhere = this.addDeletedAtFilter(filter, options?.withDeleted);
    return this.repository.count({ where: filteredWhere });
  }

  public async updateById(id: number | string, data: Partial<T>, options?: CrudOptions): Promise<T> {
    const updated = await this.repository.update({
      where: { id, deletedAt: null },
      data,
      include: options?.include,
      select: options?.select,
    });

    return updated;
  }

  public async updateOne(filter: Record<string, any>, data: Partial<T>, options?: CrudOptions): Promise<T> {
    const filteredWhere = this.addDeletedAtFilter(filter, options?.withDeleted);

    const updated = await this.repository.update({
      where: filteredWhere,
      data,
      include: options?.include,
      select: options?.select,
    });

    return updated;
  }

  public async bulkUpdate(
    filter: Record<string, any>,
    data: Partial<T>,
    options?: CrudOptions,
  ): Promise<{ count: number }> {
    const filteredWhere = this.addDeletedAtFilter(filter, options?.withDeleted);

    const result = await this.repository.updateMany({
      where: filteredWhere,
      data,
    });

    return result;
  }

  public async bulkUpdateByIDs(
    ids: (number | string)[],
    data: Partial<T>,
    options?: CrudOptions,
  ): Promise<{ count: number }> {
    if (!ids?.length) {
      throw new Error('Ids list must not be empty');
    }

    const whereCondition: any = {
      id: { in: ids },
    };

    if (!options?.withDeleted) {
      whereCondition.deletedAt = null;
    }

    const result = await this.repository.updateMany({
      where: whereCondition,
      data,
    });

    return result;
  }

  public async upsert(
    where: Record<string, any>,
    createData: Partial<T>,
    updateData: Partial<T>,
    options?: CrudOptions,
  ): Promise<T> {
    const result = await this.repository.upsert({
      where,
      create: createData,
      update: updateData,
      include: options?.include,
      select: options?.select,
    });

    return result;
  }

  public async deleteById(id: number | string, softDelete: boolean = true): Promise<T> {
    if (softDelete) {
      const deleted = await this.repository.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() } as any,
      });
      return deleted;
    } else {
      const deleted = await this.repository.delete({
        where: { id },
      });
      return deleted;
    }
  }

  public async deleteOne(filter: Record<string, any>, softDelete: boolean = true): Promise<T> {
    const filteredWhere = this.addDeletedAtFilter(filter, !softDelete);

    if (softDelete) {
      const deleted = await this.repository.update({
        where: filteredWhere,
        data: { deletedAt: new Date() } as any,
      });
      return deleted;
    } else {
      const deleted = await this.repository.delete({
        where: filteredWhere,
      });
      return deleted;
    }
  }

  public async deleteMany(filter: Record<string, any>, softDelete: boolean = true): Promise<{ count: number }> {
    const filteredWhere = this.addDeletedAtFilter(filter, !softDelete);

    if (softDelete) {
      const result = await this.repository.updateMany({
        where: filteredWhere,
        data: { deletedAt: new Date() } as any,
      });
      return result;
    } else {
      const result = await this.repository.deleteMany({
        where: filteredWhere,
      });
      return result;
    }
  }

  public async transaction<R>(operations: (tx: PrismaClient) => Promise<R>): Promise<R> {
    return await this.repository.$transaction(operations);
  }
}
