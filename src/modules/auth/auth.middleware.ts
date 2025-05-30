import { NextFunction, Request, Response } from 'express';
// import { omit } from 'lodash';
// import { excludedFields, findUniqueUser } from '../services/user.service';
import AppError from '../utils/appError';
import redisClient from '../utils/connectRedis';
import { verifyJwt } from '../utils/jwt';
import { User } from '@prisma/client';

export const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let access_token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      access_token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.access_token) {
      access_token = req.cookies.access_token;
    }

    if (!access_token) {
      return next(new AppError(401, 'You are not logged in'));
    }

    // Validate the access token
    const decoded = verifyJwt<{ sub: string }>(access_token, 'accessTokenPublicKey');

    if (!decoded) {
      return next(new AppError(401, `Invalid token or user doesn't exist`));
    }

    // Check if the user has a valid session
    const session = await redisClient.get(`${decoded.sub}`);
    if (!session) {
      return next(new AppError(401, `Invalid token or session has expired`));
    }

    // Check if the user still exist
    // const user = await findUniqueUser({ id: JSON.parse(session).id });

    // if (!user) {
    //   return next(new AppError(401, `Invalid token or session has expired`));
    // }

    // Add user to res
    req.user = JSON.parse(session); //omit(user, excludedFields);

    next();
  } catch (err: any) {
    next(err);
  }
};

export const deserializeUserIfAvaliable = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let access_token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      access_token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.access_token) {
      access_token = req.cookies.access_token;
    }

    if (!access_token) {
      return next();
    }

    // Validate the access token
    const decoded = verifyJwt<{ sub: string }>(access_token, 'accessTokenPublicKey');

    if (!decoded) {
      return next();
    }

    // Check if the user has a valid session
    const session = await redisClient.get(decoded.sub);

    if (!session) {
      return next();
    }

    // Check if the user still exist
    // const user = await findUniqueUser({ id: JSON.parse(session).id });

    // if (!user) {
    //   return next(new AppError(401, `Invalid token or session has expired`));
    // }

    // Add user to res
    req.user = JSON.parse(session); //omit(user, excludedFields);

    next();
  } catch (err: any) {
    next(err);
  }
};

export const requireUser =
  (roles: Array<User['role']>) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return next(new AppError(400, `Session has expired or user doesn't exist`));
      }

      if (roles.includes(user.role)) {
        req.hasAccess = true;
        return next();
      } else {
        return next(new AppError(401, `Unauthorized Access`));
      }
    } catch (err: any) {
      next(err);
    }
  };

export const requireUserIfAvaliable =
  (roles: Array<User['role']>) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return next();
      }

      if (roles.includes(user.role)) {
        req.hasAccess = true;
        return next();
      } else {
        return next();
      }
    } catch (err: any) {
      next(err);
    }
  };
