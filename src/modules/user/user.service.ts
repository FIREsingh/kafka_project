import { AppError } from "../../utils/AppError.ts";
import { publishUserEvent, USER_EVENTS } from "./user.event.ts";
import { userRepository } from "./user.repository.ts";
import {
  toUserPublic,
  type CreateUserDto,
  type UpdateUserDto,
  type UserPublic,
} from "./user.type.ts";

const hashPassword = async (password: string) =>
  Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 });

const buildEventPayload = (user: UserPublic) => ({
  user,
  timestamp: new Date().toISOString(),
});

export const userService = {
  getUsers: async (): Promise<UserPublic[]> => {
    const users = await userRepository.findMany();
    return users.map(toUserPublic);
  },

  getUserById: async (id: string): Promise<UserPublic> => {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return toUserPublic(user);
  },

  createUser: async (input: CreateUserDto): Promise<UserPublic> => {
    const existing = await userRepository.findByEmail(input.email);

    if (existing) {
      throw new AppError("Email already in use", 409);
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      isActive: input.isActive,
    });

    const publicUser = toUserPublic(user);
    await publishUserEvent(USER_EVENTS.CREATED, buildEventPayload(publicUser));

    return publicUser;
  },

  updateUser: async (
    id: string,
    input: UpdateUserDto,
  ): Promise<UserPublic> => {
    const existing = await userRepository.findById(id);

    if (!existing) {
      throw new AppError("User not found", 404);
    }

    if (input.email && input.email !== existing.email) {
      const emailTaken = await userRepository.findByEmail(input.email);

      if (emailTaken) {
        throw new AppError("Email already in use", 409);
      }
    }

    const { password, ...rest } = input;
    const updateData = {
      ...rest,
      ...(password ? { password: await hashPassword(password) } : {}),
    };

    const user = await userRepository.update(id, updateData);
    const publicUser = toUserPublic(user);
    await publishUserEvent(USER_EVENTS.UPDATED, buildEventPayload(publicUser));

    return publicUser;
  },

  deleteUser: async (id: string): Promise<UserPublic> => {
    const existing = await userRepository.findById(id);

    if (!existing) {
      throw new AppError("User not found", 404);
    }

    const user = await userRepository.delete(id);
    const publicUser = toUserPublic(user);
    await publishUserEvent(USER_EVENTS.DELETED, buildEventPayload(publicUser));

    return publicUser;
  },
};
