import { Response } from '@/commons/interfaces';
import { PostgresService } from '@/commons/providers/postgres.service';
import { Injectable } from '@nestjs/common';
import { CreateMeassureDto } from './dto/create-meassure.dto';
import { UpdateMeassureDto } from './dto/update-meassure.dto';
import { MeassureUnits } from '../../generated/prisma/client';

@Injectable()
export class MeassuresPostgresService {
    constructor(private readonly db: PostgresService) { }

    async findAll(): Promise<Response<MeassureUnits[]>> {
        let response: Response<MeassureUnits[]> = {
            success: false,
            message: "",
            data: []
        }
        try {
            const docs = await this.db.meassureUnits.findMany()
            response.message = `${docs.length} meassures retrieved successfully`
            if (docs.length === 0) {
                response.message = "No meassures found"
            }
            response.data = docs
            response.success = true
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }

    async findOne(id: string): Promise<Response<MeassureUnits[]>> {
        let response: Response<MeassureUnits[]> = {
            success: false,
            message: "",
            data: []
        }
        try {
            const doc = await this.db.meassureUnits.findUnique({ where: { id: Number.parseInt(id) } })
            response.message = `Meassure with ID ${id} retrieved successfully`
            if (!doc) {
                response.message = "Meassure not found"
            }
            response.success = true
            response.data = doc ? [doc] : []
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

            const doc = await this.db.meassureUnits.create({
                data
            })
            response.data = doc ? [doc] : []
            response.message = `Meassure ${doc.id} created successfully`
            response.success = true
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }

    async update(id: string, updateMeassureDto: UpdateMeassureDto): Promise<Response<MeassureUnits[]>> {
        let response: Response<MeassureUnits[]> = {
            success: false,
            message: "",
            data: []
        }
        try {
            const { description, ...data } = updateMeassureDto

            const doc = await this.db.meassureUnits.update({
                where: { id: Number.parseInt(id) },
                data
            })
            response.data = doc ? [doc] : []
            response.message = `Meassure with ID ${id} updated successfully`
            if (!response.data) {
                response.message = "Meassure not found"
            }
            response.success = true
        }
        catch (error: any) {
            response.message = error.message
        }
        return response
    }

    async remove(id: string): Promise<Response<MeassureUnits[]>> {
        let response: Response<MeassureUnits[]> = {
            success: false,
            message: "",
            data: []
        }
        try {
            const doc = await this.db.meassureUnits.delete({
                where: { id: Number.parseInt(id) }
            })
            response.data = doc ? [doc] : []
            response.message = `Meassure with ID ${id} deleted successfully`
            if (!response.data) {
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
