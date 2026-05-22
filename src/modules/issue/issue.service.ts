import config from "../../config";
import { pool } from "../../db";
import type { IIssue } from "./issue.interface";
import jwt, { type JwtPayload } from "jsonwebtoken";

const createIssueService = async (payload: IIssue, token: string) => {
  const { title, description, type, status } = payload;
  const decoded = jwt.verify(token, config.secret as string) as JwtPayload;
  const { id } = decoded;
  const user = await pool.query(`SELECT * FROM users WHERE id=$1`, [id]);
  const userId = user.rows[0].id;
  const result = await pool.query(
    `
        INSERT INTO issues(title, description, type, status, reporter_id)
         VALUES($1, $2, $3, COALESCE($4, 'open'), $5) RETURNING *
        `,
    [title, description, type, status, userId],
  );
  return result;
};

export const issueService = {
  createIssueService,
};
