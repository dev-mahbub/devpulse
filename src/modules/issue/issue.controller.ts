import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import sendResponse from "../../utility/sendResponse";

const createIssue = async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(500).json({
      success: false,
      message: "Unauthorize access!",
    });
  }
  try {
    const result = await issueService.createIssueService(
      req.body,
      token as string,
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  const sort = req.query.sort as string;
  const type = req.query.type as string;
  const status = req.query.status as string;
  try {
    const result = await issueService.getAllIssuesService(sort, type, status);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error,
    });
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssue(id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error,
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access!",
    });
  }

  const { id } = req.params;

  try {
    const result = await issueService.updateIssueService(
      req.body,
      id as string,
      token,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// const updateIssue = async (req: Request, res: Response) => {
//   const token = req.headers.authorization;
//   if (!token) {
//     return res.status(500).json({
//       success: false,
//       message: "Unauthorize access!",
//     });
//   }
//   const { id } = req.params;
//   try {
//     const result = await issueService.updateIssueService(
//       req.body,
//       id as string,
//       token as string,
//     );

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Issue updated successfully",
//       data: result.rows[0],
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       message: error.message,
//       error: error,
//     });
//   }
// };

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
};
