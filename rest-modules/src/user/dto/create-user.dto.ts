export class CreateUserDto {
    username: string;
    email: string;
    roles: number[];
    password?: string;
    state?: boolean;
}
