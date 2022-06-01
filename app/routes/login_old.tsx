import { useState } from "react";
import { Layout } from "~/components/layout";
import { FormField } from "~/components/form-field";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "~/utils/validators.server";
import { login, register, getUser } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  // If there's already a user in the session, redirect to the home page
  return (await getUser(request)) ? redirect("/") : null;
};
export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const action = form.get("_action");
  const email = form.get("email");
  const password = form.get("password");
  let firstName = form.get("firstName");
  let lastName = form.get("lastName");

  if (
    typeof action !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return json({ error: `Dados inválidos`, form: action }, { status: 400 });
  }
  if (
    action === "register" &&
    (typeof firstName !== "string" || typeof lastName !== "string")
  ) {
    return json({ error: `Dados inválidos`, form: action }, { status: 400 });
  }
  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    ...(action === "register"
      ? {
          firstName: validateName((firstName as string) || ""),
          lastName: validateName((lastName as string) || ""),
        }
      : {}),
  };

  if (Object.values(errors).some(Boolean))
    return json(
      {
        errors,
        fields: { email, password, firstName, lastName },
        form: action,
      },
      { status: 400 }
    );
  switch (action) {
    case "login": {
      return await login({ email, password });
    }
    case "register": {
      firstName = firstName as string;
      lastName = lastName as string;
      return await register({ email, password, firstName, lastName });
    }
    default:
      return json({ error: `Dados Inválidos` }, { status: 400 });
  }
};

export default function Login() {
  const [action, setAction] = useState("login");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  // Updates the form data when an input changes
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFormData((form) => ({ ...form, [field]: event.target.value }));
  };

  return (
    <Layout>
      <div className="h-full justify-center items-center flex flex-col gap-y-4">
        <button
          onClick={() => setAction(action == "login" ? "register" : "login")}
          className="absolute top-8 right-8 rounded-xl bg-yellow-300 font-semibold text-blue-600 px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
        >
          {action === "login" ? "Registrar" : "Entrar"}
        </button>
        <h2 className="text-3xl font-extrabold text-red-600">
          Sistema BrasSaco
        </h2>
        <p className="font-semibold text-slate-600">
          {action === "login"
            ? "Entre para registrar o ponto"
            : "Cadastre-se para Entrar"}
        </p>

        <form method="POST" className="rounded-2xl bg-gray-200 p-6 w-96">
          <FormField
            htmlFor="email"
            label="Email"
            value={formData.email}
            onChange={(e) => handleInputChange(e, "email")}
          />
          <FormField
            htmlFor="password"
            type="password"
            label="Senha"
            value={formData.password}
            onChange={(e) => handleInputChange(e, "password")}
          />

          {action === "register" && (
            <>
              <FormField
                htmlFor="firstName"
                label="Nome"
                onChange={(e) => handleInputChange(e, "firstName")}
                value={formData.firstName}
              />
              <FormField
                htmlFor="lastName"
                label="Sobrenome"
                onChange={(e) => handleInputChange(e, "lastName")}
                value={formData.lastName}
              />
            </>
          )}

          <div className="w-full text-center">
            <button
              type="submit"
              name="_action"
              value={action}
              className="rounded-xl mt-2 bg-yellow-300 px-3 py-2 text-blue-600 font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
            >
              {action === "login" ? "Entrar" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
