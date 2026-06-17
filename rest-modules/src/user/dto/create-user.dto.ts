export class CreateUserDto {
    email: string;
    roles: number[];
    state?: boolean;
}
