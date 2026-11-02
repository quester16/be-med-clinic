import type { Prisma } from '@prisma/client';
import { prisma } from '../../db.js';
import type { DoctorListQuery } from './doctors.schema.js';

const doctorFields = {
  id: true,
  fullName: true,
  experienceYears: true,
  price: true,
  imageUrl: true,
  education: true,
  about: true,
  workDays: true,
  startTime: true,
  endTime: true,
  isActive: true,
  featured: true,
  specialization: { select: { name: true } },
} as const;

type SelectedDoctor = Prisma.DoctorGetPayload<{ select: typeof doctorFields }>;

function toDoctorResponse(doctor: SelectedDoctor) {
  const { specialization, ...fields } = doctor;
  return { ...fields, specialty: specialization.name };
}

function doctorFilters(query: DoctorListQuery): Prisma.DoctorWhereInput {
  const filters: Prisma.DoctorWhereInput = { isActive: true };

  if (query.search) filters.fullName = { contains: query.search, mode: 'insensitive' };
  if (query.specialty) filters.specialization = { name: { equals: query.specialty, mode: 'insensitive' } };
  if (query.city) filters.clinics = { some: { clinic: { city: { equals: query.city, mode: 'insensitive' } } } };
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filters.price = { gte: query.minPrice, lte: query.maxPrice };
  }

  return filters;
}

export async function listDoctors(query: DoctorListQuery) {
  const doctors = await prisma.doctor.findMany({
    where: doctorFilters(query),
    select: doctorFields,
    orderBy: [{ featured: 'desc' }, { fullName: 'asc' }],
    skip: (query.page - 1) * query.limit,
    take: query.limit,
  });

  return doctors.map(toDoctorResponse);
}

export async function findDoctorById(id: string) {
  const doctor = await prisma.doctor.findFirst({
    where: { id, isActive: true },
    select: doctorFields,
  });

  return doctor ? toDoctorResponse(doctor) : null;
}
