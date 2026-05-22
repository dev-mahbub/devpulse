import bcrypt from "bcryptjs";
import { pool } from "../../db";
import type { IUser } from "./auth.interface";

const signUpUserService = async (payload: IUser) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users(name, email, password, role)
     VALUES($1, $2, $3, COALESCE($4, 'contributor')) RETURNING *`,
    [name, email, hashPassword, role],
  );
  delete result.rows[0].password;
  return result;
};

const loginUserService = async (payload: IUser) => {
  console.log("first");
};

export const authService = {
  signUpUserService,
};
