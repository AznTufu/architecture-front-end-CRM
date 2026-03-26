import { createClient } from '@supabase/supabase-js';
import {
  buildActivities,
  buildCompanies,
  buildContacts,
  buildDeals,
} from './factories/crmFactory.mjs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing env vars. Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const ADMIN_EMAIL = 'admin@admin.fr';
const ADMIN_PASSWORD = 'admin123';

async function getOrCreateAdminUser() {
  const { data: listed, error: listError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    throw listError;
  }

  const existing = listed.users.find(
    (user) => user.email?.toLowerCase() === ADMIN_EMAIL
  );

  if (existing) {
    const { error: updateError } = await adminClient.auth.admin.updateUserById(existing.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: 'Super Admin',
      },
    });

    if (updateError) {
      throw updateError;
    }

    return existing.id;
  }

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: 'Super Admin',
    },
  });

  if (createError || !created.user) {
    throw createError ?? new Error('Failed to create admin user');
  }

  return created.user.id;
}

async function promoteSuperadmin(userId) {
  const { error } = await adminClient
    .from('profiles')
    .update({ role: 'superadmin', full_name: 'Super Admin' })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

async function seedTables(userId) {
  await adminClient.from('activities').delete().eq('user_id', userId);
  await adminClient.from('deals').delete().eq('user_id', userId);
  await adminClient.from('contacts').delete().eq('user_id', userId);
  await adminClient.from('companies').delete().eq('user_id', userId);

  const companies = buildCompanies(userId);
  const { error: companiesError } = await adminClient.from('companies').insert(companies);
  if (companiesError) {
    throw companiesError;
  }

  const contacts = buildContacts(
    userId,
    companies.map((company) => company.id)
  );
  const { error: contactsError } = await adminClient.from('contacts').upsert(contacts, {
    onConflict: 'user_id,email',
  });
  if (contactsError) {
    throw contactsError;
  }

  const deals = buildDeals(
    userId,
    contacts.map((contact) => contact.id)
  );
  const { error: dealsError } = await adminClient.from('deals').insert(deals);
  if (dealsError) {
    throw dealsError;
  }

  const activities = buildActivities(userId, contacts, deals);
  const { error: activitiesError } = await adminClient
    .from('activities')
    .insert(activities);
  if (activitiesError) {
    throw activitiesError;
  }
}

async function main() {
  const userId = await getOrCreateAdminUser();
  await promoteSuperadmin(userId);
  await seedTables(userId);

  console.log('Seed complete');
  console.log(`Login: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
}

main().catch((error) => {
  console.error('Seed failed:', error.message ?? error);
  process.exit(1);
});
