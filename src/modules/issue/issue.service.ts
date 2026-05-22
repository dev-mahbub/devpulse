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

const getAllIssuesService = async (
  sort: string,
  type: string,
  status: string,
) => {
  // sort query
  let orderBy = "ORDER BY created_at ASC";
  if (sort === "newest") {
    orderBy = "ORDER BY created_at DESC";
  } else if (sort === "oldest") {
    orderBy = "ORDER BY created_at ASC";
  }

  // type query
  let typeQuery = "";
  if (type === "bug") {
    typeQuery = `WHERE type='bug'`;
  } else if (type === "feature_request") {
    typeQuery = `WHERE type='feature_request'`;
  }

  // status query
  let statusQuery = "";
  if (status === "open") {
    statusQuery = `${typeQuery ? "AND" : "WHERE"} status='open'`;
  } else if (status === "in_progress") {
    statusQuery = `${typeQuery ? "AND" : "WHERE"} status='in_progress'`;
  } else if (status === "resolved") {
    statusQuery = `${typeQuery ? "AND" : "WHERE"} status='resolved'`;
  }

  // final query
  const result = await pool.query(`
    SELECT * FROM issues
    ${typeQuery}
    ${statusQuery}
    ${orderBy}
  `);

  // reporter logic
  const reporterIds = [...new Set(result.rows.map((i) => i.reporter_id))];

  const usersResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1)`,
    [reporterIds],
  );

  const userMap = new Map(usersResult.rows.map((u) => [u.id, u]));

  // format response
  const formatted = result.rows.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: userMap.get(issue.reporter_id) || null,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));

  return formatted;
};

export const issueService = {
  createIssueService,
  getAllIssuesService,
};
