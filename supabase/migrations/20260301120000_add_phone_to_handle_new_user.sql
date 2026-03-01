-- Store phone from auth metadata on profile creation

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  is_first_user boolean := false;
  user_role_val public.user_role;
  company_name_val text;
begin
  -- Determine if this is the first user (super_admin)
  if not exists (select 1 from public.profiles where role = 'super_admin' and status = 'approved') then
    is_first_user := true;
    user_role_val := 'super_admin'::public.user_role;
  else
    user_role_val := coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'seller'::public.user_role);
  end if;

  -- Get company name from metadata if provided
  company_name_val := new.raw_user_meta_data ->> 'company_name';

  -- Insert profile
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    role,
    language_preference,
    status
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'phone',
    user_role_val,
    coalesce((new.raw_user_meta_data ->> 'language')::public.language_preference, 'en'::public.language_preference),
    case when is_first_user then 'approved'::public.user_status else 'pending'::public.user_status end
  );

  -- If this is an admin user and company name is provided, create company
  if user_role_val = 'admin'::public.user_role and company_name_val is not null then
    insert into public.companies (name, admin_user_id)
    values (company_name_val, new.id);
  end if;

  return new;
end;
$$;

