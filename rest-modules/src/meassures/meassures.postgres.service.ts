import { Response } from '@/commons/interfaces';
import { PostgresService } from '@/commons/providers/postgres.service';
import { Injectable } from '@nestjs/common';
import { CreateMeassureDto } from './dto/create-meassure.dto';
import { UpdateMeassureDto } from './dto/update-meassure.dto';

@Injectable()
export class MeassuresPostgresService {
    constructor(private readonly db: PostgresService) { }

    async findAll(): Promise<Response> {
        let response: Response = {
            success: false,
            message: "",
        }
        try {
            response.data = await this.db.meassureUnits.findMany()
            response.message = `${response.data.length} meassures retrieved successfully`
            if(response.data.length === 0) {
                response.message = "No meassures found"
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
            response.data = await this.db.meassureUnits.findUnique({ where: { id: Number.parseInt(id) } })
            response.message = `Meassure with ID ${id} retrieved successfully`
            if(!response.data) {
                response.message = "Meassure not found"
            }
            response.success = true
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }

    async create(createMeassureDto: CreateMeassureDto): Promise<Response> {
        let response: Response = {
            success: false,
            message: "",
        }
        try {
            const { description, ...data } = createMeassureDto

            response.data = await this.db.meassureUnits.create({
                data
            })
            response.message = `Meassure ${response.data.id} created successfully`
            response.success = true
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }

    async update(id: string, updateMeassureDto: UpdateMeassureDto): Promise<Response> {
        let response: Response = {
            success: false,
            message: "",
        }
        try {
            const { description, ...data } = updateMeassureDto

            response.data = await this.db.meassureUnits.update({
                where: { id: Number.parseInt(id) },
                data
            })
            response.message = `Meassure with ID ${id} updated successfully`
            if(!response.data) {
                response.message = "Meassure not found"
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
            response.data = await this.db.meassureUnits.delete({
                where: { id: Number.parseInt(id) }
            })
            response.message = `Meassure with ID ${id} deleted successfully`
            if(!response.data) {
                response.message = "Meassure not found"
            }
            response.success = true
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }
}
