import { PrismaClient, Prisma, JobOpening } from '@prisma/client';

const prisma = new PrismaClient();

export const createJobOpening = async (
  input: Prisma.JobOpeningUncheckedCreateInput,
  select?: Prisma.JobOpeningSelect,
) => {
  return (await prisma.jobOpening.create({
    data: input,
    select,
  })) as JobOpening;
};

export const createJobApplication = async (
  input: Prisma.ApplicationUncheckedCreateInput,
  select?: Prisma.ApplicationSelect,
) => {
  return await prisma.application.create({
    data: input,
    select,
  });
};

export const deleteJobOpening = async (where: Prisma.JobOpeningWhereUniqueInput) => {
  return (await prisma.jobOpening.delete({
    where,
  })) as JobOpening;
};

export const updateJobOpening = async (
  where: Prisma.JobOpeningWhereUniqueInput,
  data: Prisma.JobOpeningUncheckedUpdateInput,
  select?: Prisma.JobOpeningSelect,
) => {
  return (await prisma.jobOpening.update({
    data,
    where,
    select,
  })) as JobOpening;
};

export const getUniqueJobOpening = async (
  where: Prisma.JobOpeningWhereUniqueInput,
  include?: Prisma.JobOpeningInclude,
) => {
  return (await prisma.jobOpening.findUnique({
    where,
    include,
  })) as JobOpening;
};

export const getAllJobOpening = async (
  search?: string,
  page: number = 1,
  pageSize?: number,
  where?: Prisma.JobOpeningWhereInput,
  include?: Prisma.JobOpeningInclude,
  orderBy: Prisma.SortOrder = 'desc',
) => {
  const skip = pageSize ? (page - 1) * pageSize : 0;

  const [data, total] = await Promise.all([
    prisma.jobOpening.findMany({
      where: {
        ...where,
        title: {
          contains: search,
          mode: 'insensitive',
        },
      },
      skip,
      take: pageSize,
      include,
      orderBy: {
        createdAt: orderBy,
      },
    }),
    prisma.jobOpening.count({
      where: {
        ...where,
        title: {
          contains: search,
          mode: 'insensitive',
        },
      },
      orderBy: {
        createdAt: orderBy,
      },
    }),
  ]);

  return {
    data,
    total,
    page,
    totalPages: pageSize ? Math.ceil(total / pageSize) : 1,
  };
};
