import { prisma } from "../../config/database.ts";
import type { CreateUserDto, UpdateUserDto } from "./user.type.ts";

export const userRepository = {
  findMany: () =>
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    }),

  findById: (id: string) =>
    prisma.user.findUnique({
      where: { id },
    }),

  findByEmail: (email: string) =>
    prisma.user.findUnique({
      where: { email },
    }),

  create: (data: CreateUserDto & { password: string }) =>
    prisma.user.create({ data }),

  update: (id: string, data: UpdateUserDto & { password?: string }) =>
    prisma.user.update({
      where: { id },
      data,
    }),

  delete: (id: string) =>
    prisma.user.delete({
      where: { id },
    }),
};
