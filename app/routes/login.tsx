import { useState } from "react";
import { Layout } from "~/components/layout";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { login, register, getUser } from "~/utils/auth.server";
import { useActionData } from "@remix-run/react";
export const loader: LoaderFunction = async ({ request }) => {
  // If there's already a user in the session, redirect to the home page
  return (await getUser(request)) ? redirect("/") : null;

  //todo colocar redirect to ./admin
};

type ActionData = {
  formError?: string;
  fieldErrors?: {
    email: string | undefined;
    password: string | undefined;
  };
  fields?: {
    email: string;
    password: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();

  const action = form.get("_action");
  const email = form.get("email") as string;
  const password = form.get("password") as string;
  let firstName = form.get("firstName");
  let lastName = form.get("lastName");
  const fields = { email, password };

  switch (action) {
    case "login": {
      // return await login({ email, password });
      const user = await login({ email, password });
      if (!user) {
        console.log(fields);
        return badRequest({
          fields,
          formError: `Usuário ou senha inválidos`,
        });
      }

      return user;
    }
    case "register": {
      firstName = firstName as string;
      lastName = lastName as string;
      return await register({ email, password, firstName, lastName });
    }
    // default:
    //   return json({ error: `Dados Inválidos` }, { status: 401 });
  }
};

export default function Login() {
  const [action, setAction] = useState("login");
  const actionData = useActionData<ActionData>();

  // const [formData, setFormData] = useState({
  //   email: "",
  //   password: "",
  //   firstName: "",
  //   lastName: "",
  // });

  // // Updates the form data when an input changes
  // const handleInputChange = (
  //   event: React.ChangeEvent<HTMLInputElement>,
  //   field: string
  // ) => {
  //   setFormData((form) => ({ ...form, [field]: event.target.value }));
  // };

  return (
    <Layout>
      <div className="h-full justify-center items-center flex flex-col gap-y-4">
        <button
          onClick={() => setAction(action == "login" ? "register" : "login")}
          className="absolute top-8 right-8 rounded-xl bg-cyan-600 font-semibold text-white px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
        >
          {action === "login" ? "Registrar" : "Entrar"}
        </button>
        <img className="w-40 lg:w-56" src="logosvg.svg" alt="logo" />

        <p className="font-semibold text-slate-600">
          {action === "login"
            ? "Entre para registrar o ponto"
            : "Cadastre-se para Entrar"}
        </p>

        <form method="POST" className="rounded-2xl bg-gray-200 p-6 w-96">
          <label htmlFor="email" className="text-blue-600 ">
            Email
          </label>
          <input
            className="w-full p-2 rounded-xl my-2"
            type="text"
            name="email"
            defaultValue={actionData?.fields?.email}
          />

          <label htmlFor="password" className="text-blue-600 ">
            Senha
          </label>
          <input
            className="w-full p-2 rounded-xl my-2"
            type="password"
            name="password"
          />

          {action === "register" && (
            <>
              <label htmlFor="firstName" className="text-blue-600 ">
                Nome
              </label>
              <input
                className="w-full p-2 rounded-xl my-2"
                type="text"
                name="firstName"
                required
              />

              <label htmlFor="lastName" className="text-blue-600 ">
                Sobrenome
              </label>
              <input
                className="w-full p-2 rounded-xl my-2"
                type="text"
                name="lastName"
                required
              />
            </>
          )}
          <div className="w-full text-center">
            <button
              type="submit"
              name="_action"
              value={action}
              className="rounded-xl mt-2 bg-cyan-600 px-3 py-2 text-white font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
            >
              {action === "login" ? "Entrar" : "Cadastrar"}
            </button>
          </div>
          <div className="flex items-center justify-center ">
            {actionData?.formError ? (
              <p className="text-red-600 mt-2  p-2 bg-yellow-200 rounded-xl ">
                {actionData.formError}
              </p>
            ) : null}
          </div>
        </form>
      </div>
    </Layout>
  );
}
