import { prisma } from './db';

const DICE_OUTCOMES = [
  { probability: 1/12, shares: 1, valuationDrop: 0, timeout: 0 },    // 100% shares
  { probability: 2/12, shares: 0.5, valuationDrop: 0, timeout: 0 },  // 50% shares
  { probability: 3/12, shares: 0.35, valuationDrop: 0, timeout: 0 }, // 35% shares
  { probability: 3/12, shares: 0, valuationDrop: 5000, timeout: 10 },   // -$5k, 10min
  { probability: 2/12, shares: 0, valuationDrop: 25000, timeout: 20 },  // -$25k, 20min
  { probability: 1/12, shares: 0, valuationDrop: 50000, timeout: 30 },  // -$50k, 30min
];

export const rollDice = () => {
  const roll = Math.random();
  let cumulative = 0;
  
  for (const outcome of DICE_OUTCOMES) {
    cumulative += outcome.probability;
    if (roll <= cumulative) {
      return outcome;
    }
  }
  
  return DICE_OUTCOMES[0];
};

export const calculateNewValuation = (
  baseValue: number,
  investorCount: number,
  totalShares: number
): number => {
  return baseValue * (1 + investorCount * 0.3) * (1 + totalShares * 0.002);
};

export const updateCompanyRanks = async () => {
  const companies = await prisma.company.findMany({
    orderBy: { value: 'desc' }
  });
  
  for (let i = 0; i < companies.length; i++) {
    await prisma.company.update({
      where: { id: companies[i].id },
      data: { 
        rank: i + 1,
        valueChange: companies[i].value > 0 
          ? ((companies[i].value - companies[i].value/(1 + Math.random() * 0.1)) / companies[i].value) * 100 
          : 0
      }
    });
  }
};