create or replace function public.update_deal(
  p_deal_id uuid,
  p_title text,
  p_amount numeric,
  p_stage public.deal_stage,
  p_contact_id uuid default null
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  affected_rows integer;
begin
  update public.deals
  set
    title = p_title,
    amount = p_amount,
    stage = p_stage,
    contact_id = p_contact_id
  where id = p_deal_id
    and (user_id = auth.uid() or public.current_user_role() = 'superadmin');

  get diagnostics affected_rows = row_count;
  return affected_rows;
end;
$$;

create or replace function public.delete_deal(
  p_deal_id uuid
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  affected_rows integer;
begin
  delete from public.deals
  where id = p_deal_id
    and (user_id = auth.uid() or public.current_user_role() = 'superadmin');

  get diagnostics affected_rows = row_count;
  return affected_rows;
end;
$$;

grant execute on function public.update_deal(uuid, text, numeric, public.deal_stage, uuid) to authenticated;
grant execute on function public.update_deal(uuid, text, numeric, public.deal_stage, uuid) to anon;
grant execute on function public.delete_deal(uuid) to authenticated;
grant execute on function public.delete_deal(uuid) to anon;
