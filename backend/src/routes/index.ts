import { Router } from 'express';
import companiesRouter from './companies';
import investmentsRouter from './investments';
import loansRouter from './loans';

const router = Router();

router.use('/companies', companiesRouter);
router.use('/investments', investmentsRouter);
router.use('/loans', loansRouter);

export { router };