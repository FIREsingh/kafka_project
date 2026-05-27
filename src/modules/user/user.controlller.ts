import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.ts";
import { userService } from "./user.service.ts";
import type { CreateUserInput, UpdateUserInput } from "./user.validation.ts";

export const userController = {
  
  getUsers: asyncHandler(async (_req: Request, res: Response) => {
    const users = await userService.getUsers();
    res.json({ success: true, data: users });
  }),

  getUserById: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUserById(req.params.id);
    res.json({ success: true, data: user });
  }),

  createUser: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateUserInput;
    const user = await userService.createUser(body);
    res.status(201).json({ success: true, data: user });
  }),

  updateUser: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as UpdateUserInput;
    const user = await userService.updateUser(req.params.id, body);
    res.json({ success: true, data: user });
  }),

  deleteUser: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.deleteUser(req.params.id);
    res.json({ success: true, data: user });
  }),
};
