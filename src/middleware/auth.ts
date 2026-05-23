import type { NextFunction, Request, Response } from "express";
import type { ROLES } from "../types";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const auth = (...roles: ROLES[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 1. Check if the  token exists
    // 2.Verify the token
    // 3. Find the user into database
    // 4.If the user is active or not
    // 5.send the user into request
    const token = req.headers.authorization;
    if (!token) {
      res.status(500).json({
        success: false,
        message: "Unauthorize access!",
      });
    }

    const decoded = jwt.verify(
      token as string,
      config.secret as string,
    ) as JwtPayload;

    const { id } = decoded;

    const userData = await pool.query(
      `
        SELECT * FROM users WHERE id=$1
        `,
      [id],
    );

    if (userData.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userData.rows[0];
    // console.log("user", user);

    // if (user.role === "contributor") {
    //   console.log("first");
    // }

    if (roles.length && !roles.includes(user.role)) {
      res.status(401).json({
        success: false,
        message: "Unauthorize access",
      });
    }

    req.user = decoded;
    next();
  };
};

export default auth;
