import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PostgresService } from '@/commons/providers/postgres.service';
import { Response } from '@/commons/interfaces';
import { Prisma } from '../../generated/prisma/client';
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
        where: { state: true },
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
      response.total = await this.db.users.count({
        where: { state: true },
      })
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
        where: { state: true },
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
    // Permite revertir Firebase si falla la creación/reactivación en Postgres.
    let createdFirebaseUserUid: string | null = null;
    try {
      const { username, email, password, roles, state } = createUserDto;
      const uniqueRoles = this.getUniqueRoleIds(roles ?? []);

      if (!password) {
        throw new Error("Password is required for email login");
      }

      await this.validateRoleIds(this.db, uniqueRoles);

      const existingUserByEmail = await this.db.users.findUnique({
        where: { email },
      });

      if (existingUserByEmail?.state) {
        throw new Error("User already registered in Postgres");
      }

      const existingUserByUsername = await this.db.users.findUnique({
        where: { username },
      });

      if (existingUserByUsername && existingUserByUsername.id !== existingUserByEmail?.id) {
        throw new Error("Username already registered in Postgres");
      }

      const existingFirebaseUser = await this.getFirebaseUserByEmail(email);

      if (existingFirebaseUser) {
        const existingUserByUid = await this.db.users.findFirst({
          where: { uid: existingFirebaseUser.uid },
        });

        if (existingUserByUid && existingUserByUid.id !== existingUserByEmail?.id) {
          throw new Error("Firebase user already registered in Postgres");
        }
      }

      const firebaseUser = await this.getOrCreateFirebaseUser(email, password);
      if (firebaseUser.created) {
        createdFirebaseUserUid = firebaseUser.user.uid;
      }

      const doc = await this.db.$transaction(async (tx) => {
        // Si el correo pertenece a un usuario inactivo, reutiliza esa fila
        // porque el email es único en Postgres.
        if (existingUserByEmail) {
          // Reemplaza los roles antiguos por los seleccionados en el formulario.
          await tx.usersRoles.deleteMany({
            where: { user: existingUserByEmail.id },
          });

          if (uniqueRoles.length > 0) {
            await tx.usersRoles.createMany({
              data: uniqueRoles.map((roleId) => ({
                user: existingUserByEmail.id,
                role: roleId,
              })),
            });
          }

          return tx.users.update({
            where: { id: existingUserByEmail.id },
            data: {
              username,
              uid: firebaseUser.user.uid,
              state: state ?? true,
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
        }

        return tx.users.create({
          data: {
            username,
            email,
            uid: firebaseUser.user.uid,
            state: state ?? true,
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
      response.data = [doc];
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
        where: { id, state: true },
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
      const { username, email, password, roles } = updateUserDto;
      const doc = await this.db.$transaction(async (tx) => {
        const user = await tx.users.findUnique({
          where: { id, state: true },
        });

        if (!user) {
          throw new Error("User not found");
        }

        if (username && username !== user.username) {
          const existingUserByUsername = await tx.users.findUnique({
            where: { username },
          });

          if (existingUserByUsername && existingUserByUsername.id !== id) {
            throw new Error("Username already registered in Postgres");
          }
        }

        if (email && email !== user.email) {
          const existingUserByEmail = await tx.users.findUnique({
            where: { email },
          });

          if (existingUserByEmail && existingUserByEmail.id !== id) {
            throw new Error("Email already registered in Postgres");
          }
        }

        if (email || password) {
          await this.auth.updateUser(user.uid, {
            ...(email && { email }),
            ...(password && { password }),
          });
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
            ...(username && { username }),
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
      const { doc, uidToDelete } = await this.db.$transaction(async (tx) => {
        const user = await tx.users.findUnique({
          where: { id, state: true },
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

        // Soft delete: conserva la fila por historial de ventas, marca al usuario
        // como inactivo y libera el UID de Firebase para poder registrarlo otra vez.
        const updatedUser = await tx.users.update({
          where: { id },
          data: {
            state: false,
            uid: this.getDeletedUid(user.id, user.uid),
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

        return {
          doc: updatedUser,
          uidToDelete: user.uid,
        };
      });

      // Firebase se elimina después de que Postgres termina bien para evitar
      // perder el acceso mientras la base de datos aún lo considera activo.
      await this.auth.deleteUser(uidToDelete).catch(() => undefined);

      response.message = "Successful operation"
      response.success = true
      response.data = [doc];
    } catch (error: any) {
      response.message = error.message
    }
    return response
  }

  private getDeletedUid(id: number, uid: string) {
    return `deleted:${id}:${uid}`;
  }

  private getUniqueRoleIds(roles: number[]) {
    return [...new Set(roles.map((role) => Number(role)))];
  }

  private async getOrCreateFirebaseUser(
    email: string,
    password: string,
  ): Promise<{ user: UserRecord; created: boolean }> {
    try {
      const user = await this.auth.createUser({ email, password });
      return { user, created: true };
    } catch (error: any) {
      if (error?.code !== "auth/email-already-exists") {
        throw error;
      }

      const user = await this.auth.getUserByEmail(email);
      await this.auth.updateUser(user.uid, { password });
      return { user, created: false };
    }
  }

  private async getFirebaseUserByEmail(email: string): Promise<UserRecord | null> {
    try {
      return await this.auth.getUserByEmail(email);
    } catch (error: any) {
      if (error?.code === "auth/user-not-found") {
        return null;
      }

      throw error;
    }
  }

  private async validateRoleIds(
    tx: Prisma.TransactionClient | PostgresService,
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
