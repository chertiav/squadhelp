import {
	ContestStatus,
	ContestType,
	Industry,
	OfferStatus,
	Prisma,
	Role,
} from '@prisma/client';
import {
	QueryCreatorContestDto,
	QueryCustomerContestDto,
	QueryModeratorContestDto,
} from '../dto/contest';
import { ContestConstants } from '../constants';

const parsBool = (params: string | null | undefined): boolean => {
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

export const getContestTypes = (index: string): { in: ContestType[] } => {
	return { in: index.split(',') as ContestType[] };
};
export const createPredicatesAllContests = (
	id: number,
	role: Role,
	query:
		| QueryCustomerContestDto
		| QueryCreatorContestDto
		| QueryModeratorContestDto,
): Prisma.ContestFindManyArgs => {
	const predicates: {
		where: Prisma.ContestWhereInput;
		orderBy: Prisma.ContestOrderByWithRelationInput[];
		select: Prisma.ContestSelect;
	} = {
		where: {},
		orderBy: [],
		select: {},
	};
	const status: ContestStatus[] =
		role === Role.moderator
			? [ContestStatus.active]
			: !(query instanceof QueryModeratorContestDto) &&
			  query.status === ('all' as ContestStatus)
			? [ContestStatus.active, ContestStatus.finished]
			: !(query instanceof QueryModeratorContestDto) && [query.status];
	Object.assign(predicates.where, { status: { in: status } });
	if (role === Role.customer) {
		Object.assign(predicates.where, { userId: id });
		Object.assign(predicates.select, {
			...ContestConstants.OPTIONS_GET_ALL_CONTESTS,
			_count: { ...ContestConstants.OPTIONS_GET_COUNT_ACTIVE_OFFERS },
		});
	} else {
		if (!(query instanceof QueryCustomerContestDto)) {
			Object.assign(predicates.where, {
				id: query.contestId ? +query.contestId : {},
				contestType: getContestTypes(query.typeIndex),
				industry: query.industry === ('all' as Industry) ? {} : query.industry,
			});
			if (
				role === Role.creator &&
				!(query instanceof QueryModeratorContestDto)
			) {
				Object.assign(predicates.where, {
					offers: parsBool(query.ownEntries) ? { some: { userId: id } } : {},
				});
				predicates.orderBy.push({
					price: query.awardSort as Prisma.SortOrder,
				});
				Object.assign(predicates.select, {
					...ContestConstants.OPTIONS_GET_ALL_CONTESTS,
					_count: {
						select: {
							offers: {
								where: {
									status: OfferStatus.active,
									userId: parsBool(query.ownEntries) ? id : {},
								},
							},
						},
					},
				});
			} else {
				Object.assign(predicates.where, {
					offers: { some: { status: OfferStatus.pending } },
				});
				Object.assign(predicates.select, {
					...ContestConstants.OPTIONS_GET_ALL_CONTESTS_MODERATOR,
					_count: { ...ContestConstants.OPTIONS_GET_COUNT_PENDING_OFFERS },
				});
			}
		}
	}
	predicates.orderBy.push({ createdAt: 'desc' }, { id: 'desc' });
	return predicates;
};

export const createPredicatesOneContest = (
	id: number,
	role: Role,
	contestId: number,
): Prisma.ContestFindFirstArgs => {
	switch (role) {
		case Role.customer: {
			return {
				where: { id: contestId, userId: id },
				select: {
					...ContestConstants.OPTIONS_GET_ONE_CONTEST,
					_count: { ...ContestConstants.OPTIONS_GET_COUNT_ACTIVE_OFFERS },
				},
			};
		}
		case Role.creator: {
			return {
				where: {
					id: contestId,
					status: {
						not: ContestStatus.pending,
					},
				},
				select: {
					...ContestConstants.OPTIONS_GET_ONE_CONTEST,
					user: {
						select: {
							firstName: true,
							lastName: true,
							displayName: true,
							avatar: true,
						},
					},
					_count: { ...ContestConstants.OPTIONS_GET_COUNT_ACTIVE_OFFERS },
				},
			};
		}
		case Role.moderator: {
			return {
				where: {
					id: contestId,
					status: ContestStatus.active,
					offers: { some: { status: OfferStatus.pending } },
				},
				select: {
					...ContestConstants.OPTIONS_GET_ONE_CONTEST,
					price: false,
					_count: { ...ContestConstants.OPTIONS_GET_COUNT_PENDING_OFFERS },
				},
			};
		}
	}
};
