
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, UUID, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_company_id(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_company_member(UUID, UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
