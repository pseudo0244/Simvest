import { Router } from 'express';
import { prisma } from '../lib/db';
import { rollDice, calculateNewValuation, updateCompanyRanks } from '../lib/game';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { buyerId, sellerId, amount } = req.body;

    const buyer = await prisma.company.findUnique({
      where: { id: buyerId },
      include: { investmentsAsBuyer: true }
    });
    
    const seller = await prisma.company.findUnique({
      where: { id: sellerId },
      include: { investmentsAsSeller: true }
    });

    if (!buyer || !seller) {
      return res.status(404).json({ error: 'Company not found' });
    }

    if (buyer.availableFunds < amount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    if (buyer.cooldownUntil && buyer.cooldownUntil > new Date()) {
      return res.status(400).json({ error: 'Company is in timeout' });
    }

    const diceOutcome = rollDice();
    const sharesAcquired = Math.floor(amount * diceOutcome.shares);
    
    const investment = await prisma.investment.create({
      data: {
        amount,
        sharesCount: sharesAcquired,
        outcome: diceOutcome.shares > 0 ? (diceOutcome.shares === 1 ? 'full' : 'partial') : 'negative',
        multiplier: diceOutcome.shares,
        buyer: { connect: { id: buyerId } },
        seller: { connect: { id: sellerId } }
      }
    });

    await prisma.transaction.create({
      data: {
        type: 'investment',
        amount,
        outcome: investment.outcome,
        company: { connect: { id: buyerId } }
      }
    });

    await prisma.company.update({
      where: { id: buyerId },
      data: {
        availableFunds: buyer.availableFunds - amount,
        value: buyer.value - diceOutcome.valuationDrop,
        cooldownUntil: diceOutcome.timeout > 0 
          ? new Date(Date.now() + diceOutcome.timeout * 60 * 1000) 
          : null,
        lastTradeTimestamp: new Date()
      }
    });

    await prisma.company.update({
      where: { id: sellerId },
      data: {
        sharesRemaining: seller.sharesRemaining - sharesAcquired,
        value: calculateNewValuation(
          seller.value,
          seller.investmentsAsSeller.length + 1,
          seller.totalShares - seller.sharesRemaining + sharesAcquired
        )
      }
    });

    await updateCompanyRanks();

    res.status(200).json({ investment });
  } catch (error) {
    next(error);
  }
});

export default router;