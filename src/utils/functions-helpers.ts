export const parsBool = (params: string | null | undefined): boolean => {
	return !(
		params === 'false' ||
		params === 'null' ||
		params === '0' ||
		params === '' ||
		params === 'undefined' ||
		params === null ||
		params === undefined
	);
};
