import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getHit, updateHit } from "~/utils/user.server";
import _ from "lodash";
import { useLoaderData } from "@remix-run/react";
import { makeDomainFunction } from "remix-domains";
import { formAction, Form } from "remix-forms";
import { z } from "zod";
import type { User } from "~/utils/types.server";
import { format } from "date-fns";

const schema = z.object({
  in: z.string(),
  out: z.string(),
  outLunch: z.string(),
  inLunch: z.string(),
  data: z.string(),
  email: z.string(),
  day: z.string(),
});

export const loader: LoaderFunction = async ({ request, params }) => {
  const employee = params.employeeId;
  const ponto = params.ponto;
  const user = await getHit(employee as string, ponto as string);
  return json({ user });
};

const mutation = makeDomainFunction(schema)(async (values) => {
  const entrada = values.data.substring(0, 11) + (values.in) + ":00";
  const saidaAlmoco = values.data.substring(0, 11) + values.outLunch + ":00";
  const entradaAlmoco = values.data.substring(0, 11) + values.inLunch + ":00";
  const saida = values.data.substring(0, 11) + values.out + ":00";
  const email = values.email;
  const day = values.day;
  const obj = { entrada, saidaAlmoco, entradaAlmoco, saida, email, day };
  await updateHit(obj);
});

export const action: ActionFunction = async ({ request }) =>
  formAction({
    request,
    schema,
    mutation,
    successPath: "/admin",
  });
export default function Ponto() {
  const { user } = useLoaderData();

  return (
    <>
      <nav className="bg-slate-200">
        <div className="max-w-7xl mx-auto p-2 sm:px-6 lg:px-8 flex items-center justify-between">
          <img className="w-40 lg:w-56" src="/logosvg.svg" alt="logo" />
          <label className="mr-2 font-medium"></label>

          <div className="flex items-center gap-5 p-4 ">
            {user && (
              <div className="font-bold text-xl">
                {user.map((u: User) => u.firstName) +
                  " " +
                  user.map((u: User) => u.lastName)}
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
      <div>
        {user.map((user: User, index: any) => {
          const entrada = _.values(user.timeSheet?.in).toString()
            ? format(new Date(_.values(user.timeSheet?.in).toString()), "HH:mm")
            : "";

          const saidaAlmoco = _.values(user.timeSheet?.outLunch).toString()
            ? format(
                new Date(_.values(user.timeSheet?.outLunch).toString()),
                "HH:mm"
              )
            : "";

          const entradaAlmoco = _.values(user.timeSheet?.inLunch).toString()
            ? format(
                new Date(_.values(user.timeSheet?.inLunch).toString()),
                "HH:mm"
              )
            : "";

          const saida = _.values(user.timeSheet?.out).toString()
            ? format(
                new Date(_.values(user.timeSheet?.out).toString()),
                "HH:mm"
              )
            : "";

          const dt = _.values(user.timeSheet?.in).toString();
          const day = user.timeSheet?.day;

          return (
            <div key={index}>
              <div className="container mx-auto px-4">
                <div className="font-bold text-2xl text-blue-600">
                  {user?.firstName + " " + user?.lastName}
                </div>
                <div className="font-semibold text-2xl">
                  {user.timeSheet?.day}
                  <div className="mx-auto my-12 w-[600px] rounded-xl border border-gray-100 p-6 shadow-lg">
                    <Form
                      schema={schema}
                      hiddenFields={["data", "email", "day"]}
                      values={{
                        in: entrada,
                        outLunch: saidaAlmoco,
                        inLunch: entradaAlmoco,
                        out: saida,
                        data: dt,
                        email: user.email,
                        day: day,
                      }}
                    >
                      {({ Field, Errors, Button, register }) => {
                        return (
                          <div className="grid grid-cols-2 gap-4">
                            <Field name="data">
                              {() => (
                                <input {...register("data")} type="hidden" />
                              )}
                            </Field>
                            <Field name="day">
                              {() => (
                                <input {...register("day")} type="hidden" />
                              )}
                            </Field>
                            <Field name="email">
                              {() => (
                                <input {...register("email")} type="hidden" />
                              )}
                            </Field>
                            <Field name="in" label="Entrada">
                              {({ Label, Errors }) => (
                                <div className="flex flex-col">
                                  <Label className="text-gray-600" />
                                  <input
                                    {...register("in")}
                                    type="time"
                                    autoComplete="off"
                                    className="border-2 p-1 border-gray-300 shadow rounded-lg "
                                  />
                                  <Errors className="text-red-800" />
                                </div>
                              )}
                            </Field>

                            <Field name="outLunch" label="Saida Almoço">
                              {({ Label, Errors }) => (
                                <div className="flex flex-col">
                                  <Label className="text-gray-600" />
                                  <input
                                    {...register("outLunch")}
                                    type="time"
                                    autoComplete="off"
                                    className="border-2 p-1 border-gray-300 shadow rounded-lg "
                                  />
                                  <Errors className="text-red-800" />
                                </div>
                              )}
                            </Field>
                            <Field name="inLunch" label="Entrada Almoço">
                              {({ Label, Errors }) => (
                                <div className="flex flex-col">
                                  <Label className="text-gray-600" />
                                  <input
                                    {...register("inLunch")}
                                    type="time"
                                    autoComplete="off"
                                    className="border-2 p-1 border-gray-300 shadow rounded-lg "
                                  />
                                  <Errors className="text-red-800" />
                                </div>
                              )}
                            </Field>
                            <Field name="out" label="Saída">
                              {({ Label, Errors }) => (
                                <div className="flex flex-col">
                                  <Label className="text-gray-600" />
                                  <input
                                    {...register("out")}
                                    type="time"
                                    autoComplete="off"
                                    className="border-2 p-1 border-gray-300 shadow rounded-lg "
                                  />
                                  <Errors className="text-red-800" />
                                </div>
                              )}
                            </Field>
                            <Errors />
                            <Button
                              className="rounded-xl mt-2 bg-green-600 py-2 text-white font-semibold transition duration-300 ease-in-out hover:bg-cyan-800 hover:-translate-y-1"
                              type="submit"
                            >
                              Salvar
                            </Button>
                          </div>
                        );
                      }}
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
