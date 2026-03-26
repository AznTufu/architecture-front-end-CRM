import { randomUUID } from 'node:crypto';

export function buildCompanies(userId) {
  return [
    {
      id: randomUUID(),
      user_id: userId,
      name: 'Acme Paris',
      domain: 'acme-paris.fr',
    },
    {
      id: randomUUID(),
      user_id: userId,
      name: 'Nordic Flow',
      domain: 'nordicflow.io',
    },
    {
      id: randomUUID(),
      user_id: userId,
      name: 'Blue Delta',
      domain: 'bluedelta.co',
    },
    {
      id: randomUUID(),
      user_id: userId,
      name: 'Horizon Labs',
      domain: 'horizonlabs.fr',
    },
    {
      id: randomUUID(),
      user_id: userId,
      name: 'Solaris Group',
      domain: 'solaris-group.com',
    },
    {
      id: randomUUID(),
      user_id: userId,
      name: 'Nexa Retail',
      domain: 'nexa-retail.io',
    },
    {
      id: randomUUID(),
      user_id: userId,
      name: 'Vertex Sante',
      domain: 'vertex-sante.fr',
    },
    {
      id: randomUUID(),
      user_id: userId,
      name: 'Atlas Industrie',
      domain: 'atlas-industrie.eu',
    },
    {
      id: randomUUID(),
      user_id: userId,
      name: 'Opal Finance',
      domain: 'opal-finance.com',
    },
    {
      id: randomUUID(),
      user_id: userId,
      name: 'Nimbus Data',
      domain: 'nimbusdata.ai',
    },
  ];
}

export function buildContacts(userId, companyIds) {
  return [
    {
      id: randomUUID(),
      user_id: userId,
      company_id: companyIds[0] ?? null,
      first_name: 'Alice',
      last_name: 'Martin',
      email: 'alice.martin@acme-paris.fr',
      phone: '+33601010101',
      status: 'lead',
    },
    {
      id: randomUUID(),
      user_id: userId,
      company_id: companyIds[1] ?? null,
      first_name: 'Karim',
      last_name: 'Benali',
      email: 'karim.benali@nordicflow.io',
      phone: '+33602020202',
      status: 'opportunity',
    },
    {
      id: randomUUID(),
      user_id: userId,
      company_id: companyIds[2] ?? null,
      first_name: 'Lea',
      last_name: 'Bernard',
      email: 'lea.bernard@bluedelta.co',
      phone: '+33603030303',
      status: 'customer',
    },
  ];
}

export function buildDeals(userId, contactIds) {
  return [
    {
      id: randomUUID(),
      user_id: userId,
      contact_id: contactIds[0] ?? null,
      title: 'Pack CRM Starter',
      amount: 1200,
      stage: 'prospecting',
    },
    {
      id: randomUUID(),
      user_id: userId,
      contact_id: contactIds[1] ?? null,
      title: 'Migration CRM Pro',
      amount: 5400,
      stage: 'proposal',
    },
    {
      id: randomUUID(),
      user_id: userId,
      contact_id: contactIds[2] ?? null,
      title: 'Contrat annuel Enterprise',
      amount: 13000,
      stage: 'closed_won',
    },
  ];
}

export function buildActivities(userId, contacts, deals) {
  return [
    {
      id: randomUUID(),
      user_id: userId,
      contact_id: contacts[0]?.id ?? null,
      deal_id: deals[0]?.id ?? null,
      type: 'call',
      title: 'Appel de decouverte',
      description: 'Qualification du besoin et budget.',
    },
    {
      id: randomUUID(),
      user_id: userId,
      contact_id: contacts[1]?.id ?? null,
      deal_id: deals[1]?.id ?? null,
      type: 'email',
      title: 'Envoi proposition commerciale',
      description: 'Version v2 avec planning de deploiement.',
    },
    {
      id: randomUUID(),
      user_id: userId,
      contact_id: contacts[2]?.id ?? null,
      deal_id: deals[2]?.id ?? null,
      type: 'meeting',
      title: 'Kick-off projet',
      description: 'Validation du planning de livraison et SLA.',
    },
  ];
}
