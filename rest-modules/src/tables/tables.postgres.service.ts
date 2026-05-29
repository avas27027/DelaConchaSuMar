import { Response } from '@/commons/interfaces';
import { PostgresService } from '@/commons/providers/postgres.service';
import { Injectable } from '@nestjs/common';
import { UpdateTableDto } from './dto/update-table.dto';
import { CreateTableDto } from './dto/create-table.dto';

@Injectable()
export class TablesPostgresService {
    constructor(private readonly db: PostgresService) { }

    async findAll(): Promise<Response> {
        let response: Response = {
            success: false,
            message: "",
        }
        try {
            response.data = await this.db.tables.findMany()
            response.message = `${response.data.length} tables retrieved successfully`
            if(response.data.length === 0) {
                response.message = "No tables found"
            }
            response.success = true
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }

    async findOne(id: string): Promise<Response> {
        let response: Response = {
            success: false,
            message: "",
        }
        try {
            response.data = await this.db.tables.findUnique({ where: { id: Number.parseInt(id) } })
            response.message = `Table with ID ${id} retrieved successfully`
            if(!response.data) {
                response.message = "Table not found"
            }
            response.success = true
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }

    async create(createTableDto: CreateTableDto): Promise<Response> {
        let response: Response = {
            success: false,
            message: "",
        }
        try {
            response.data = await this.db.tables.create({
                data: createTableDto
            })
            response.message = `Table ${response.data.id} created successfully`
            response.success = true
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }

    async update(id: string, updateTableDto: UpdateTableDto): Promise<Response> {
        let response: Response = {
            success: false,
            message: "",
        }
        try {
            response.data = await this.db.tables.update({
                where: { id: Number.parseInt(id) },
                data: updateTableDto
            })
            response.message = `Table with ID ${id} updated successfully`
            if(!response.data) {
                response.message = "Table not found"
            }
            response.success = true
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }

    async remove(id: string): Promise<Response> {
        let response: Response = {
            success: false,
            message: "",
        }
        try {
            response.data = await this.db.tables.delete({
                where: { id: Number.parseInt(id) }
            })
            response.message = `Table with ID ${id} deleted successfully`
            if(!response.data) {
                response.message = "Table not found"
            }
            response.success = true
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }
}
