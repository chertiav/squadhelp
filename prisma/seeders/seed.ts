import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
//=================================================================
import {
	seedSelectData,
	seedBankData,
	seedUserData,
	seedContestData,
	seedUserDataCreator,
	seedUserDataCustomer,
	seedOffersData,
	seedUserDataCustomer_2,
} from './data';

const prisma = new PrismaClient();

async function main() {
	const salt: number | string = await bcrypt.genSalt();
	const hashPassword = async (password): Promise<string> =>
		await bcrypt.hash(password, salt);

	await prisma.user.create({
		data: {
			...seedUserData,
			password: await hashPassword(seedUserData.password),
		},
	});

	await prisma.user.create({
		data: {
			...seedUserDataCustomer,
			password: await hashPassword(seedUserDataCustomer.password),
		},
	});

	await prisma.user.create({
		data: {
			...seedUserDataCreator,
			password: await hashPassword(seedUserDataCreator.password),
		},
	});

	await prisma.user.create({
		data: {
			...seedUserDataCustomer_2,
			password: await hashPassword(seedUserDataCustomer_2.password),
		},
	});

	await prisma.bank.createMany({
		data: seedBankData,
	});

	await prisma.selectBox.createMany({
		data: seedSelectData,
	});

	await prisma.contest.createMany({
		data: seedContestData,
	});

	await prisma.offer.createMany({
		data: seedOffersData,
	});
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
