import { CashOutDto, PayDto } from '../../src/common/dto/payment';
import { PayConstants } from '../../src/common/constants';

export const paymentPayMockData: PayDto = {
	number: PayConstants.CUSTOMER_CREDIT_CARD_NUMBER,
	expiry: PayConstants.CUSTOMER_CREDIT_CARD_EXPIRY,
	cvc: PayConstants.CUSTOMER_CREDIT_CARD_CVC,
	sum: 300,
	contests: [
		PayConstants.API_PROPERTY_PAY_EXAMPLE_NAME,
		PayConstants.API_PROPERTY_PAY_EXAMPLE_TAGLINE,
		PayConstants.API_PROPERTY_PAY_EXAMPLE_LOGO,
	],
};

export const paymentCashoutMockData: CashOutDto = {
	number: PayConstants.CUSTOMER_CREDIT_CARD_NUMBER,
	expiry: PayConstants.CUSTOMER_CREDIT_CARD_EXPIRY,
	cvc: PayConstants.CUSTOMER_CREDIT_CARD_CVC,
	sum: 300,
};
