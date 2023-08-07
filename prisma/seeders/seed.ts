import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
//=================================================================
import { seedSelectData, seedBankData, seedUserData } from './data';

const prisma = new PrismaClient();

async function main(): Promise<void> {
	const salt: number | string = await bcrypt.genSalt();
	const hashPassword = async (password: string): Promise<string> =>
		await bcrypt.hash(password, salt);

	await prisma.user.create({
		data: {
			...seedUserData,
			password: await hashPassword(seedUserData.password),
		},
	});

	await prisma.bank.createMany({
		data: seedBankData,
	});

	await prisma.selectBox.createMany({
		data: seedSelectData,
	});
}

main()
	.catch((e): void => {
		console.error(e);
		process.exit(1);
	})
	.finally(async (): Promise<void> => {
		await prisma.$disconnect();
	});
