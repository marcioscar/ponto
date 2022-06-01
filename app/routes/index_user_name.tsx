import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { requireUserId, getUser } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);

  const user = await getUser(request);

  // return null;
  return json({ user });
};

export default function Index() {
  const { user } = useLoaderData();
  return (
    <div className="h-screen bg-slate-700 flex justify-center items-center">
      <h2 className="text-yellow-600 font-extrabold text-5xl">
        {user.profile.firstName} {user.profile.lastName}
      </h2>
    </div>
  );
}
