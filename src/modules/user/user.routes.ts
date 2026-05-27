import { Router } from "express";
import { validate } from "../../middlewares/validate.ts";
import { userController } from "./user.controlller.ts";
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from "./user.validation.ts";

const router = Router();

router.get("/", userController.getUsers);

router.get(
  "/:id",
  validate(userIdParamSchema, "params"),
  userController.getUserById,
);
router.post("/", validate(createUserSchema), userController.createUser);
router.patch(
  "/:id",
  validate(userIdParamSchema, "params"),
  validate(updateUserSchema),
  userController.updateUser,
);
router.delete(
  "/:id",
  validate(userIdParamSchema, "params"),
  userController.deleteUser,
);

export default router;
