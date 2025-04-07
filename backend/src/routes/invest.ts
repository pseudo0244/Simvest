import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  try {
    const { investorId, companyId, amount } = req.body;

    if (!investorId || !companyId || !amount) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const investment = await prisma.investment.create({
      data: {
        investorId,
        companyId,
        amount,
      },
    });

    res.json(investment);
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
