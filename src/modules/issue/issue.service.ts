import config from "../../config";
import { pool } from "../../db";
import type { IIssue } from "./issue.interface";
import jwt, { type JwtPayload } from "jsonwebtoken";

//create issue
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

//get all issue
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

//get single issue
const getSingleIssue = async (id: string) => {
  const result = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id],
  );

  // reporter logic
  const reporterId = result.rows[0].id;

  const usersResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id= $1`,
    [reporterId],
  );

  // format response
  const formatted = result.rows.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: usersResult.rows[0] || null,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));

  return formatted;
};

const updateIssueService = async (
  payload: IIssue,
  issueId: string,
  token: string,
) => {
  const { title, description, type } = payload;

  const decoded = jwt.verify(token, config.secret as string) as JwtPayload;

  const userId = decoded.id;

  // 1. get user
  const userResult = await pool.query(`SELECT * FROM users WHERE id=$1`, [
    userId,
  ]);

  const user = userResult.rows[0];

  // 2. get issue
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id=$1`, [
    issueId,
  ]);

  const issue = issueResult.rows[0];

  if (!issue) {
    throw new Error("Issue not found");
  }

  // 3. AUTH RULES
  if (user.role === "contributor") {
    if (issue.reporter_id !== userId) {
      throw new Error("You can only update your own issues");
    }

    if (issue.status !== "open") {
      throw new Error("You can only update open issues");
    }
  }

  // 4. UPDATE
  const result = await pool.query(
    `
    UPDATE issues
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      type = COALESCE($3, type),
      updated_at = NOW()
    WHERE id = $4
    RETURNING *
    `,
    [title, description, type, issueId],
  );

  return result.rows[0];
};

const deleteIssue = async (id: string) => {
  const result = await pool.query(
    `
    DELETE FROM user WHERE id=$1
    `,
    [id],
  );
  return result;
};

export const issueService = {
  createIssueService,
  getAllIssuesService,
  getSingleIssue,
  updateIssueService,
  deleteIssue,
};
