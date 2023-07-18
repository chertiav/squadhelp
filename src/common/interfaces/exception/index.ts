export interface IErrorBody {
	status: number;
	name: string;
	message: string;
}

export interface ILoggerBody {
	status: number;
	timestamp: string;
	message: string;
	stackTrace: string;
}
