# Supabase setup

1. Run the SQL files in `migrations/` in filename order in the Supabase SQL Editor.
2. Enable the Email provider in Authentication > Providers.
3. Set the Site URL to `https://cashble.vercel.app`.
4. Add `https://cashble.vercel.app/**` and `http://localhost:3000/**` to Redirect URLs.
5. Configure the frontend with `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`.
6. Configure the backend with `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

## Move the existing `main` state to your account

After creating your user, copy its UUID from Authentication > Users and run:

```sql
insert into public.cashble_state (id, data)
select 'YOUR-AUTH-USER-UUID', data
from public.cashble_state
where id = 'main'
on conflict (id)
do update set data = excluded.data;
```

Confirm that the authenticated account shows the expected data before deleting the old `main` row.
