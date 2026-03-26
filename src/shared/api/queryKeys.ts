export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  companies: {
    all: ['companies'] as const,
    list: ['companies', 'list'] as const,
  },
  contacts: {
    all: ['contacts'] as const,
    list: ['contacts', 'list'] as const,
  },
  activities: {
    all: ['activities'] as const,
    list: ['activities', 'list'] as const,
  },
  deals: {
    all: ['deals'] as const,
    list: ['deals', 'list'] as const,
  },
};
