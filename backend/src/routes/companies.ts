import { Router } from 'express';
import { prisma } from '../lib/db';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        investmentsAsBuyer: true,
        investmentsAsSeller: true,
        transactions: true
      },
      orderBy: {
        value: 'desc'
      }
    });
    res.json(companies);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: {
        investmentsAsBuyer: true,
        investmentsAsSeller: true,
        transactions: true
      }
    });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    next(error);
  }
});

export default router;