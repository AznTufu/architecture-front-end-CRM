create or replace function public.update_deal_stage(
  p_deal_id uuid,
  p_stage public.deal_stage
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
  set stage = p_stage
  where id = p_deal_id
    and (user_id = auth.uid() or public.current_user_role() = 'superadmin');

  get diagnostics affected_rows = row_count;
  return affected_rows;
end;
$$;

grant execute on function public.update_deal_stage(uuid, public.deal_stage) to authenticated;
grant execute on function public.update_deal_stage(uuid, public.deal_stage) to anon;
