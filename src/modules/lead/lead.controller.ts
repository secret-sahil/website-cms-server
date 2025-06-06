import { NextFunction, Request, Response } from 'express';
import { response } from '../utils';
import { leadSchema, leadServices } from '.';
import AppError from '../utils/appError';
import Email from '../email/email';
import { encryptData } from '../utils/functions';

export const createLeadHandler = async (
  req: Request<{}, {}, leadSchema.createLeadInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fullName, email, phone, jobTitle, companySize, company, message, budget, source } =
      req.body;

    await leadServices.createLead({
      fullName,
      email: encryptData(email)!,
      phone: encryptData(phone)!,
      jobTitle,
      company: encryptData(company),
      companySize,
      message: encryptData(message),
      budget,
      source,
    });
    new Email({ email, context: { fullName } }).sendLeadFormResponseMail();
    res.status(200).json(response.successResponse('SUCCESS', 'Created Successfully'));
  } catch (err: any) {
    if (err.code === 'P2002') {
      return next(new AppError(400, 'Duplicate entries are not allowed.'));
    }
    next(err);
  }
};

export const updateLeadHandler = async (
  req: Request<leadSchema.updateLeadInput['params'], {}, leadSchema.updateLeadInput['body']>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { isOpened } = req.body;

    await leadServices.updateLead(
      {
        id,
      },
      {
        isOpened: isOpened ? isOpened : undefined,
        updatedBy: req.user!.username,
      },
    );

    res.status(200).json(response.successResponse('SUCCESS', 'Updated Successfully'));
  } catch (err: any) {
    if (err.code === 'P2002') {
      return next(new AppError(400, 'Duplicate entries are not allowed.'));
    }
    next(err);
  }
};

export const getLeadHandler = async (
  req: Request<{}, {}, {}, leadSchema.getLeadInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { search, page, limit } = req.query;

    const lead = await leadServices.getAllLead(
      search,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
    res.status(200).json(response.successResponse('SUCCESS', 'Fetched successfully', lead));
  } catch (err: any) {
    next(err);
  }
};

export const getUniqueLead = async (
  req: Request<leadSchema.getUniqueLeadInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const leads = await leadServices.getUniqueLead({
      id: id,
    });

    res.status(200).json(response.successResponse('SUCCESS', 'Fetched successfully', leads));
  } catch (err: any) {
    next(err);
  }
};
