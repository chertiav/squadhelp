import {
	OfferStatus,
	StyleName,
	TypeOfName,
	TypeOfTagline,
} from '@prisma/client';

//auth
export interface IAuthCookiesOptions {
	httpOnly: boolean;
	secure: boolean;
	maxAge: number;
}
//user
export interface ISelectPublicUserOptions {
	id: boolean;
	displayName: boolean;
	role: boolean;
	avatar: boolean;
}
export interface ISelectUserFields extends ISelectPublicUserOptions {
	firstName: boolean;
	lastName: boolean;
	email: boolean;
}

// data for contest
export interface IDataForContest {
	industry: string[];
	typeOfName?: TypeOfName[];
	nameStyle?: StyleName[];
	brandStyle?: string[];
	typeOfTagline?: TypeOfTagline[];
}

//common
export interface ILogFile {
	PATH: string;
	NAME: string;
	CURRENT_PATH: string;
}

//contents

export interface IOptionsGetAllContestsModerator {
	id: boolean;
	title: boolean;
	contestType: boolean;
	typeOfName: boolean;
	brandStyle: boolean;
	typeOfTagline: boolean;
}

export interface IOptionsGetAllContests
	extends IOptionsGetAllContestsModerator {
	createdAt: boolean;
	price: boolean;
}

export interface IOptionsGetOneContest extends IOptionsGetAllContests {
	fileName: boolean;
	originalFileName: boolean;
	focusOfWork: boolean;
	industry: boolean;
	nameVenture: boolean;
	styleName: boolean;
	targetCustomer: boolean;
}

export interface IOptionsGetCountActiveOffers {
	select: {
		offers: {
			where: {
				status: OfferStatus;
			};
		};
	};
}
export type IOptionsGetCountPendingOffers = IOptionsGetCountActiveOffers;
