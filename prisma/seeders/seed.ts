import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
//=================================================================
import { seedSelectData, seedBankData, seedUserData } from './data';

const prisma = new PrismaClient();

async function main() {
	const salt: number | string = await bcrypt.genSalt();
	const hashPassword: string = await bcrypt.hash(seedUserData.password, salt);

	await prisma.user.create({
		data: {
			...seedUserData,
			password: hashPassword,
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
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
