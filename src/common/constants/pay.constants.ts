import {
	BrandStyle,
	ContestType,
	Industry,
	StyleName,
	TypeOfName,
	TypeOfTagline,
} from '@prisma/client';
import {
	LogoCreateContestPayDto,
	NameCreateContestPayDto,
	TaglineCreateContestPayDto,
} from '../dto/payment';
import { Decimal } from '@prisma/client/runtime/library';

export const API_PROPERTY_PAY_EXAMPLE_NAME: NameCreateContestPayDto = {
	contestType: ContestType.name,
	title: 'Company Name example',
	industry: Industry.CreativeAgency,
	focusOfWork: 'What does your company',
	targetCustomer: 'Tell us about your customers',
	typeOfName: TypeOfName.Company,
	styleName: StyleName.Classic,
	price: new Decimal(100),
	haveFile: false,
};
export const API_PROPERTY_PAY_EXAMPLE_TAGLINE: TaglineCreateContestPayDto = {
	contestType: ContestType.tagline,
	title: 'Tagline example',
	industry: Industry.Biotech,
	focusOfWork: 'What does your company',
	targetCustomer: 'Tell us about your customers',
	nameVenture: 'Name venture',
	typeOfTagline: TypeOfTagline.Fun,
	price: new Decimal(100),
	haveFile: false,
};
export const API_PROPERTY_PAY_EXAMPLE_LOGO: LogoCreateContestPayDto = {
	contestType: ContestType.logo,
	title: 'Logo example',
	industry: Industry.Builders,
	focusOfWork: 'What does your company',
	targetCustomer: 'Tell us about your customers',
	nameVenture: 'Name venture',
	brandStyle: BrandStyle.Tech,
	price: new Decimal(100),
	haveFile: false,
};

export const SQUADHELP_BANK_NUMBER = '4564654564564564';
export const SQUADHELP_BANK_EXPIRY = '11/22';
export const SQUADHELP_BANK_CVC = '453';
