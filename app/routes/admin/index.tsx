/* eslint-disable @typescript-eslint/consistent-type-imports */
//@ts-nocheck
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { requireUserId, requireAdm } from "~/utils/auth.server";
import { getOtherUsers, getUser, hitTimesheet } from "~/utils/user.server";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
  // const userId = await requireUserId(request);
  const userId = await requireAdm(request);
  const users = await getOtherUsers(userId);
  const user = await getUser(userId);

  return json({ user, users });
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();

  const userId = form.get("userId");
  const action = form.get("_action");

  await hitTimesheet(userId, action);

  return redirect(`.`);
};

export function date(date: Date): string {
  const config = {
    weekday: "short",
    // year: "numeric",
    month: "numeric",
    day: "numeric",
    // hour: "numeric",
    // minute: "numeric",
    // second: "numeric",
    hour12: false,
  };
  return new Intl.DateTimeFormat("pt-br", config).format(new Date(date));
}

export function hour(date: Date): string {
  const config = {
    //weekday: "short",
    // year: "numeric",
    //month: "numeric",
    //day: "numeric",
    hour: "numeric",
    minute: "numeric",
    // second: "numeric",
    hour12: false,
  };
  return new Intl.DateTimeFormat("pt-br", config).format(new Date(date));
}
const now = new Date();

export default function Home() {
  const { user, users } = useLoaderData();

  return (
    <>
      <nav className="bg-slate-200">
        <div className="max-w-7xl mx-auto p-2 sm:px-6 lg:px-8 flex items-center justify-between">
          <img className="w-40 lg:w-56" src="logosvg.svg" alt="logo" />
          <label className="mr-2 font-medium"></label>

          <div className="flex items-center gap-5 p-4 ">
            {user && (
              <div className="font-bold text-xl">
                {user?.firstName + " " + user?.lastName}
              </div>
            )}
            <div className="text-center">
              <form action="/logout" method="post">
                <button
                  type="submit"
                  className=" print:hidden rounded-xl bg-red-500 font-semibold text-white px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <div className="container mx-auto px-4">
        <form method="post">
          <input
            hidden
            type="text"
            name="userId"
            required
            defaultValue={user?.id}
          />

          <table className="w-full table-auto mt-4">
            <thead>
              <tr className=" text-gray-500  text-sm leading-normal bg-gray-100 border-b dark:bg-gray-800 dark:border-gray-700">
                <th className="py-2 text-left ">Nome</th>
                {/* <th className=" py-2 ">Id</th> */}
                <th className="py-2 ">Ações</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm ">
              {users.map((user, id) => (
                <tr
                  key={id}
                  className=" bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <td>
                    <div className=" text-left  text-lg whitespace-nowrap">
                      {user.firstName} {user.lastName}
                    </div>
                  </td>
                  {/* <td className="">
                    <div className=" p-2 text-center whitespace-nowrap">
                      {user.id}
                    </div>
                  </td> */}

                  <td>
                    <div className="text-center items-center  whitespace-nowrap">
                      <Link
                        to={user.id}
                        className=" text-white bg-slate-400/75 hover:bg-[#1da1f2]/80 focus:ring-4 focus:outline-none focus:ring-[#1da1f2]/50 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center dark:focus:ring-[#1da1f2]/55 mr-2 m-2"
                      >
                        <svg
                          className="mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M11 6v8h7v-2h-5v-6h-2zm10.854 7.683l1.998.159c-.132.854-.351 1.676-.652 2.46l-1.8-.905c.2-.551.353-1.123.454-1.714zm-2.548 7.826l-1.413-1.443c-.486.356-1.006.668-1.555.933l.669 1.899c.821-.377 1.591-.844 2.299-1.389zm1.226-4.309c-.335.546-.719 1.057-1.149 1.528l1.404 1.433c.583-.627 1.099-1.316 1.539-2.058l-1.794-.903zm-20.532-5.2c0 6.627 5.375 12 12.004 12 1.081 0 2.124-.156 3.12-.424l-.665-1.894c-.787.2-1.607.318-2.455.318-5.516 0-10.003-4.486-10.003-10s4.487-10 10.003-10c2.235 0 4.293.744 5.959 1.989l-2.05 2.049 7.015 1.354-1.355-7.013-2.184 2.183c-2.036-1.598-4.595-2.562-7.385-2.562-6.629 0-12.004 5.373-12.004 12zm23.773-2.359h-2.076c.163.661.261 1.344.288 2.047l2.015.161c-.01-.755-.085-1.494-.227-2.208z"
                          />
                        </svg>
                        PONTO
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </form>
      </div>
    </>
  );
}
