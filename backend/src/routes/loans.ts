import { Router } from 'express';
import { prisma } from '../lib/db';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { companyId, amount } = req.body;

    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    if (company.loanTaken) {
      return res.status(400).json({ error: 'Company already has a loan' });
    }

    await prisma.company.update({
      where: { id: companyId },
      data: {
        loanTaken: true,
        loanAmount: amount,
        loanTimestamp: new Date(),
        availableFunds: company.availableFunds + amount
      }
    });

    await prisma.transaction.create({
      data: {
        type: 'loan',
        amount,
        company: { connect: { id: companyId } }
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;