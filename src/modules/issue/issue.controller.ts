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

export const issueController = {
  createIssue,
};
