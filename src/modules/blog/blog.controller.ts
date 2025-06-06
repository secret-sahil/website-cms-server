import { NextFunction, Request, Response } from 'express';
import { response } from '../utils';
import { blogSchema, blogServices } from '.';
import AppError from '../utils/appError';
import { isUUID, Slugify } from '../utils/functions';

export const createBlogHandler = async (
  req: Request<{}, {}, blogSchema.createBlogInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, description, content, featuredImageId, categoryIds, tags } = req.body;

    await blogServices.createBlog({
      slug: Slugify(title),
      title,
      description,
      content,
      featuredImageId,
      categories: {
        create: categoryIds?.map((categoryId) => ({
          categoryId,
          assignedBy: req.user!.username,
        })),
      },
      tags,
      authorId: req.user!.id,
      createdBy: req.user!.username,
    });

    res.status(200).json(response.successResponse('SUCCESS', 'Created Successfully'));
  } catch (err: any) {
    if (err.code === 'P2002') {
      return next(new AppError(400, 'Duplicate entries are not allowed.'));
    }
    next(err);
  }
};

export const deleteBlogHandler = async (
  req: Request<blogSchema.deleteBlogInput, {}, {}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    await blogServices.updateBlog({ id }, { isDeleted: true });

    res.status(200).json(response.successResponse('SUCCESS', 'Blog Deleted Successfully'));
  } catch (err: any) {
    if (err.code === 'P2003') {
      return next(new AppError(400, "Can't delete data, it's used in other tables."));
    }
    next(err);
  }
};

export const updateBlogHandler = async (
  req: Request<blogSchema.updateBlogInput['params'], {}, blogSchema.updateBlogInput['body']>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { title, description, content, categoryIds, featuredImageId, tags, isPublished } =
      req.body;

    await blogServices.updateBlog(
      {
        id,
      },
      {
        title,
        description,
        content,
        featuredImageId,
        categories: {
          deleteMany: {},
          create: categoryIds?.map((categoryId) => ({
            categoryId,
            assignedBy: req.user!.username,
          })),
        },
        tags,
        isPublished,
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

export const getBlogHandler = async (
  req: Request<{}, {}, {}, blogSchema.getBlogInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { search, page, limit } = req.query;

    const blog = await blogServices.getAllBlog(
      search,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
      req.hasAccess
        ? {}
        : {
            isPublished: true,
          },
      {
        id: true,
        title: true,
        description: true,
        slug: true,
        content: false,
        tags: true,
        featuredImage: {
          select: {
            id: true,
            url: true,
            type: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            photo: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        createdAt: true,
        ...(req.hasAccess
          ? {
              isPublished: true,
              updatedAt: true,
              createdBy: true,
              updatedBy: true,
            }
          : {}),
      },
    );

    res.status(200).json(response.successResponse('SUCCESS', 'Fetched successfully', blog));
  } catch (err: any) {
    next(err);
  }
};

export const getUniqueBlog = async (
  req: Request<blogSchema.getUniqueBlogInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const blogs = await blogServices.getUniqueBlog(
      {
        id: isUUID(id) ? id : undefined,
        slug: !isUUID(id) ? id : undefined,
        ...(req.hasAccess
          ? {}
          : {
              isPublished: true,
            }),
      },
      {
        id: true,
        title: true,
        description: true,
        slug: true,
        content: true,
        tags: true,
        featuredImage: {
          select: {
            id: true,
            url: true,
            type: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            photo: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        createdAt: true,
        ...(req.hasAccess
          ? {
              isPublished: true,
              updatedAt: true,
              createdBy: true,
              updatedBy: true,
              featuredImageId: true,
            }
          : {}),
      },
    );

    res.status(200).json(response.successResponse('SUCCESS', 'Fetched successfully', blogs));
  } catch (err: any) {
    next(err);
  }
};
