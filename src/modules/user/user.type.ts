import type { User } from "../../generated/prisma/client.ts";
import type {
  CreateUserInput,
  UpdateUserInput,
} from "./user.validation.ts";

export type UserPublic = Omit<User, "password">;

export type CreateUserDto = CreateUserInput;
export type UpdateUserDto = UpdateUserInput;

export const toUserPublic = (user: User): UserPublic => {
  const { password: _password, ...publicUser } = user;
  return publicUser;
};
