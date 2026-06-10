import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PostgresService } from '@/commons/providers/postgres.service';
import { Response } from '@/commons/interfaces';
import { Prisma, Users } from '../../generated/prisma/client';
import { FirebaseService } from '@/commons/providers/firebase.service';
import { Auth, UserRecord } from 'firebase-admin/auth';


type UsersWithRelations = Prisma.UsersGetPayload<{
  include: {
    usersRoles: {
      include: {
        roles: true
      }
    }
  }
}>;
@Injectable()
export class UserService {

  private readonly auth: Auth;

  constructor(
    private readonly db: PostgresService,
    private readonly firebase: FirebaseService
  ) {
    this.auth = this.firebase.getAuth()
  }

  async getUsers(limit = 10, cursor?: string): Promise<Response> {
    let response: Response = {
      success: false,
      message: "",
    }
    try {
      const parsedLimit = Number.isNaN(limit) || limit < 1 ? 10 : limit
      const users = await this.db.users.findMany({
        take: parsedLimit + 1,
        ...(cursor && {
          cursor: { id: Number.parseInt(cursor) },
          skip: 1,
        }),
        orderBy: { createdAt: 'desc' },
        include: {
          usersRoles: {
            include: {
              roles: true
            }
          }
        },
      })
      const hasMore = users.length > parsedLimit
      const data = users.slice(0, parsedLimit)
      const lastUser = data.at(-1)

      response.data = data
      response.nextCursor = hasMore && lastUser ? String(lastUser.id) : null
      response.hasMore = hasMore
      response.total = await this.db.users.count()
      response.message = "Successful operation"
      response.success = true
    } catch (error: any) {
      response.message = error.message
    }
    return response
  }

  async findAll(): Promise<Response> {
    let response: Response = {
      success: false,
      message: "",
    }
    try {
      const doc = await this.db.users.findMany({
        include: {
          usersRoles: {
            include: {
              roles: true
            }
          }
        }
      })
      response.message = "Successful operation"
      response.success = true
      response.data = doc;
    } catch (error: any) {
      response.message = error.message
    }
    return response
  }

  async findRoles(): Promise<Response> {
    let response: Response = {
      success: false,
      message: "",
    }
    try {
      const doc = await this.db.roles.findMany({
        orderBy: { name: 'asc' },
      })
      response.message = "Successful operation"
      response.success = true
      response.data = doc;
    } catch (error: any) {
      response.message = error.message
    }
    return response
  }

  async create(createUserDto: CreateUserDto): Promise<Response> {
    let response: Response = {
      success: false,
      message: "",
    }
    let createdFirebaseUserUid: string | null = null;
    try {
      const { email, roles } = createUserDto;
      const uniqueRoles = this.getUniqueRoleIds(roles);

      const firebaseUser = await this.getOrCreateFirebaseUser(email);
      if (firebaseUser.created) {
        createdFirebaseUserUid = firebaseUser.user.uid;
      }

      const existingUser = await this.db.users.findUnique({
        where: { uid: firebaseUser.user.uid },
      });

      if (existingUser) {
        throw new Error("User already registered in Postgres");
      }

      const doc = await this.db.$transaction(async (tx) => {
        await this.validateRoleIds(tx, uniqueRoles);

        return tx.users.create({
          data: {
            email,
            uid: firebaseUser.user.uid,
            ...(uniqueRoles.length > 0 && {
              usersRoles: {
                createMany: {
                  data: uniqueRoles.map((roleId) => ({
                    role: roleId,
                  })),
                },
              }
            }),
          },
          include: {
            usersRoles: {
              include: {
                roles: true
              }
            }
          },
        });
      })

      response.message = "Successful operation"
      response.success = true
      response.data = doc;
    } catch (error: any) {
      if (createdFirebaseUserUid) {
        await this.auth.deleteUser(createdFirebaseUserUid).catch(() => undefined);
      }
      response.message = error.message
    }
    return response
  }

  async findOne(id: number): Promise<Response<UsersWithRelations[]>> {
    let response: Response<UsersWithRelations[]> = {
      success: false,
      message: "",
      data: []
    }
    try {
      const doc = await this.db.users.findUnique({
        where: { id },
        include: {
          usersRoles: {
            include: {
              roles: true
            }
          }
        }
      })

      response.message = doc ? "Successful operation" : "User not found"
      response.success = true
      response.data = doc ? [doc] : [];
    } catch (error: any) {
      response.message = error.message
    }
    return response
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<Response> {
    let response: Response = {
      success: false,
      message: "",
    }
    try {
      const { email, roles } = updateUserDto;
      const doc = await this.db.$transaction(async (tx) => {
        const user = await tx.users.findUnique({
          where: { id },
        });

        if (!user) {
          throw new Error("User not found");
        }

        if (roles) {
          const uniqueRoles = this.getUniqueRoleIds(roles);
          await this.validateRoleIds(tx, uniqueRoles);

          await tx.usersRoles.deleteMany({
            where: { user: id },
          });

          if (uniqueRoles.length > 0) {
            await tx.usersRoles.createMany({
              data: uniqueRoles.map((roleId) => ({
                user: id,
                role: roleId,
              })),
            });
          }
        }

        return tx.users.update({
          where: { id },
          data: {
            ...(email && { email }),
            updatedAt: new Date(),
          },
          include: {
            usersRoles: {
              include: {
                roles: true
              }
            }
          },
        });
      });

      response.message = "Successful operation"
      response.success = true
      response.data = doc;
    } catch (error: any) {
      response.message = error.message
    }
    return response
  }

  async remove(id: number): Promise<Response> {
    let response: Response = {
      success: false,
      message: "",
    }
    try {
      const user = await this.findOne(id)
      if (user.data) this.auth.deleteUser(user.data[0].uid)
      const doc = await this.db.$transaction(async (tx) => {
        const user = await tx.users.findUnique({
          where: { id },
          include: {
            usersRoles: {
              include: {
                roles: true
              }
            }
          },
        });

        if (!user) {
          throw new Error("User not found");
        }

        await tx.usersRoles.deleteMany({
          where: { user: id },
        });

        await tx.users.delete({
          where: { id },
        });

        return user;
      });

      response.message = "Successful operation"
      response.success = true
      response.data = doc;
    } catch (error: any) {
      response.message = error.message
    }
    return response
  }

  private getUniqueRoleIds(roles: number[]) {
    return [...new Set(roles.map((role) => Number(role)))];
  }

  private async getOrCreateFirebaseUser(email: string): Promise<{ user: UserRecord; created: boolean }> {
    try {
      const user = await this.auth.createUser({ email });
      return { user, created: true };
    } catch (error: any) {
      if (error?.code !== "auth/email-already-exists") {
        throw error;
      }

      const user = await this.auth.getUserByEmail(email);
      return { user, created: false };
    }
  }

  private async validateRoleIds(
    tx: Prisma.TransactionClient,
    roleIds: number[],
  ) {
    const invalidRoles = roleIds.filter((roleId) => Number.isNaN(roleId));

    if (invalidRoles.length > 0) {
      throw new Error("Role IDs must be valid numbers");
    }

    if (roleIds.length === 0) {
      return;
    }

    const rolesFound = await tx.roles.findMany({
      where: {
        id: {
          in: roleIds,
        },
      },
    });

    const missingRoles = roleIds.filter((roleId) => {
      return !rolesFound.some((roleFound) => roleFound.id === roleId);
    });

    if (missingRoles.length > 0) {
      throw new Error(`Role IDs not found: ${missingRoles.join(", ")}`);
    }
  }
}
