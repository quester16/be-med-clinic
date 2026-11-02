import { Router } from 'express';
import { doctorListQuery } from './doctors.schema.js';
import { findDoctorById, listDoctors } from './doctors.service.js';

export const doctorRoutes = Router();

doctorRoutes.get('/', async (req, res) => {
  const query = doctorListQuery.parse(req.query);
  const doctors = await listDoctors(query);
  res.json(doctors);
});

doctorRoutes.get('/:id', async (req, res) => {
  const doctor = await findDoctorById(req.params.id);

  if (!doctor) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Shifokor topilmadi.' } });
    return;
  }

  res.json(doctor);
});
