import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { PrismaClient, RoleName } from '@prisma/client';

type SeedDoctor = {
  id: string;
  fullName: string;
  specialty: string;
  experienceYears: number;
  price: number;
  imageUrl: string;
  education: string;
  about: string;
  workDays: number[];
  startTime: string;
  endTime: string;
  isActive: boolean;
  featured: boolean;
};

const prisma = new PrismaClient();
const file = fileURLToPath(new URL('./doctors.seed.json', import.meta.url));

async function seedRoles() {
  const permissionsByRole: Record<RoleName, string[]> = {
    SUPER_ADMIN: ['users:manage', 'roles:manage', 'clinics:manage', 'doctors:manage', 'appointments:manage', 'records:manage'],
    ADMIN: ['users:manage', 'clinics:manage', 'doctors:manage', 'appointments:manage'],
    DOCTOR: ['appointments:assigned', 'records:assigned', 'schedule:own'],
    PATIENT: ['appointments:own', 'records:own', 'profile:own'],
    CLINIC_MANAGER: ['clinics:own', 'doctors:clinic', 'appointments:clinic'],
  };

  for (const [name, keys] of Object.entries(permissionsByRole) as [RoleName, string[]][]) {
    for (const key of keys) {
      await prisma.permission.upsert({ where: { key }, update: {}, create: { key } });
    }
    await prisma.role.upsert({
      where: { name },
      update: { permissions: { set: keys.map(key => ({ key })) } },
      create: { name, permissions: { connect: keys.map(key => ({ key })) } },
    });
  }
}

async function seedDoctors() {
  const doctors = JSON.parse(await readFile(file, 'utf8')) as SeedDoctor[];

  for (const doctor of doctors) {
    const specialization = await prisma.specialization.upsert({
      where: { name: doctor.specialty },
      update: {},
      create: { name: doctor.specialty },
    });
    const { specialty: _specialty, ...fields } = doctor;
    await prisma.doctor.upsert({
      where: { id: doctor.id },
      update: { ...fields, specializationId: specialization.id },
      create: { ...fields, specializationId: specialization.id },
    });
  }

  return doctors.length;
}

async function main() {
  await seedRoles();
  const doctorCount = await seedDoctors();
  console.info(`Seeded ${doctorCount} doctors and 5 roles.`);
}

main().finally(() => prisma.$disconnect());
