import { connection } from "next/server";
import { Suspense } from "react";
import SetPasswordForm from "./SetPasswordForm";

// This page's entire purpose is to read a one-time token/email from the
// query string on every visit — it must never be statically prerendered.
// `export const dynamic = "force-dynamic"` is the *old* way to force this;
// current Next.js docs (see useSearchParams' "Dynamic Rendering" section)
// say to prefer connection() in a Server Component instead, since it ties
// dynamic rendering explicitly to the incoming request rather than relying
// on route-segment config alone. SetPasswordForm (the actual client
// component reading useSearchParams) lives in its own file so this page can
// stay a Server Component and call connection() before rendering it.
const SetPasswordPage = async () => {
  await connection();

  return (
    <Suspense fallback={null}>
      <SetPasswordForm />
    </Suspense>
  );
};

export default SetPasswordPage;
