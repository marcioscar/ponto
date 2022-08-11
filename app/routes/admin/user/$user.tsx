//@ts-nocheck
//@ts-nocheck
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, NavLink } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getUser, updateUser, deleteUser } from "~/utils/user.server";
import { requireUserId } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUserId(request);
  const user = await getUser(params.user as string);
  console.log("user parametros:" + user);
  return json({ user });
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const action = form.get("_action");
  const userId = form.get("userId");
  const email = form.get("email") as string;
  const password = form.get("password") as string;
  let firstName = form.get("firstName");
  let lastName = form.get("lastName");
  if (action === "save") {
    return await updateUser({ userId, email, password, firstName, lastName });
  } else {
    return await deleteUser({ userId });
  }
};

export default function User() {
  const { user } = useLoaderData();

  return (
    <>
      <nav className="bg-slate-200">
        <div className="max-w-7xl mx-auto p-2 sm:px-6 lg:px-8 flex items-center justify-between">
          <img className="w-52 lg:w-64" src="../../logosvg.svg" alt="logo" />
          <label className="mr-2  md:font-medium"></label>

          <div className="flex flex-col md:flex-row  items-center gap-4 md:p-4">
            {user && (
              <div className="font-bold md:text-xl">{user?.firstName}</div>
            )}
            <div className="text-center">
              <NavLink
                className=" print:hidden rounded-xl bg-red-500 font-semibold text-white px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
                to="/admin"
                end
              >
                Voltar
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
      <form method="POST" className="rounded-2xl bg-gray-200 p-6 ">
        <div className="container mx-auto mt-3 px-4">
          {user && (
            <div className="font-bold md:text-xl">
              <input
                hidden
                type="text"
                name="userId"
                required
                value={user?.id}
              />
              <label htmlFor="firstName" className="text-blue-600 ">
                Nome
              </label>
              <input
                className="w-full p-2 rounded-xl my-2 "
                type="text"
                name="firstName"
                defaultValue={user?.firstName}
                required
              />

              <label htmlFor="lastName" className="text-blue-600  ">
                Sobrenome
              </label>
              <input
                className="w-full p-2 rounded-xl my-2 "
                type="text"
                name="lastName"
                defaultValue={user?.lastName}
                required
              />
              <label htmlFor="lastName" className="text-blue-600  ">
                Email
              </label>
              <input
                className="w-full p-2 rounded-xl my-2 "
                type="text"
                name="email"
                defaultValue={user?.email}
                required
              />
              <label htmlFor="lastName" className="text-blue-600  ">
                Nova Senha
              </label>
              <input
                className="w-full p-2 rounded-xl my-2 "
                type="password"
                name="password"
                placeholder="Deixar em branco se não for para trocar a senha"
              />
            </div>
          )}
        </div>
        <div className="w-full space-x-4 text-center">
          <button
            type="submit"
            name="_action"
            value="save"
            className="rounded-xl mt-2 bg-cyan-600 px-3 py-2 text-white font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
          >
            Salvar
          </button>
          <button
            type="submit"
            name="_action"
            value="delete"
            className="rounded-xl  mt-2 bg-red-600 px-3 py-2 text-white font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
          >
            Apagar
          </button>
        </div>
      </form>
    </>
  );
}
