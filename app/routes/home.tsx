/* eslint-disable @typescript-eslint/consistent-type-imports */
//@ts-nocheck
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { getOtherUsers, getUser, hitTimesheet } from "~/utils/user.server";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import moment from "moment";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const users = await getOtherUsers();
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

// export function diffData(i, ol, il ,o) {
//   var ms = moment(ol, "YYYY/MM/DD HH:mm:ss").diff(
//     moment(i, "YYYY/MM/DD HH:mm:ss")
//   );
//   var d = moment.duration(ms);
//   var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");

//   return s;
// }

export function diffData(i, ol, il, o) {
  var ms = moment(ol, "YYYY/MM/DD HH:mm:ss").diff(
    moment(i, "YYYY/MM/DD HH:mm:ss")
  );
  var af = moment(o, "YYYY/MM/DD HH:mm:ss").diff(
    moment(il, "YYYY/MM/DD HH:mm:ss")
  );

  var dm = moment.duration(ms);
  var df = moment.duration(af);

  var dmf = Math.floor(dm.asHours()) + moment.utc(ms).format(":mm:ss");
  var dma = Math.floor(df.asHours()) + moment.utc(af).format(":mm:ss");

  var sum = moment(dmf, "HH:mm:ss").add(dma, "minutes").format("HH:mm:ss");

  return sum;
}

export function extraHour(sHour) {
  const hour = moment.duration(moment.duration(sHour)).subtract("220:00:00");
  return [Math.floor(hour.asHours()), hour.minutes()].join(":");
}

// export function sumHour(i, f) {
//   var ms = moment(i, "HH:mm:ss").add(f, "minutes").format("HH:mm");
//   return ms;
// }

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
  const [mes, SetMes] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );

  const [dia, SetDia] = useState(String(new Date().getDate()).padStart(2, "0"));
  const [ano, SetAno] = useState(String(new Date().getFullYear()));
  const { user, users } = useLoaderData();

  let daysMesAno = user?.timeSheet.filter((t) =>
    t.in.includes(ano + "-" + mes)
  );

  daysMesAno.map((t) => [
    t.in,
    t.outLunch,
    t.inLunch,
    t.out,
    (t.h = diffData(t.in, t.outLunch, t.inLunch, t.out)),
  ]);
  const dayFilter = user?.timeSheet.filter((d) => d.day == dia + "-" + mes);

  console.log(dia + "-" + mes);

  const sum = daysMesAno.reduce(
    (acc, time) => acc.add(moment.duration(time.h)),
    moment.duration()
  );
  const sumHour = [Math.floor(sum.asHours()), sum.minutes()].join(":");
  // console.log(sumHour);

  return (
    <>
      <nav className="bg-slate-200 ">
        <div className="max-w-7xl mx-auto p-2 sm:px-6 lg:px-8 flex items-center justify-between">
          <img className="w-32 lg:w-56" src="logosvg.svg" alt="logo" />
          <label className="mr-2  md:font-medium"></label>
          <select
            className="rounded hidden md:block  text-blue-600 h-8  w-20 md:w-40 print:text-black print:w-32 pl-5 pr-10 hover:border-gray-400 focus:outline-none appearance-none"
            value={mes}
            onChange={(e) => SetMes(e.target.value)}
          >
            <option hidden={true} value="">
              Selecione o Mês:
            </option>
            <option value="01">Janeiro</option>
            <option value="02">Fevereiro</option>
            <option value="03">Março</option>
            <option value="04">Abril</option>
            <option value="05">Maio</option>
            <option value="06">Junho</option>
            <option value="07">Julho</option>
            <option value="08">Agosto</option>
            <option value="09">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>
          <label className="ml-2 mr-2 md:font-medium"></label>
          <select
            className="rounded hidden md:block  print:text-black text-blue-600 h-8 print:w-32 w-24 md:w-40 pl-5 pr-10 hover:border-gray-400 focus:outline-none appearance-none"
            value={ano}
            onChange={(e) => SetAno(e.target.value)}
          >
            <option hidden={true} value="">
              Selecione o Ano:
            </option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
          <div className="flex items-center gap-5 p-4 ">
            {user && (
              <div className="flex gap-4">
                {user?.firstName} {user?.lastName}
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
          <div className="text-gray-500 font-medium bg-gray-100 p-2 mt-2 flex justify-center gap-10  ">
            <div>Horas Mensais: {sumHour}</div>

            {extraHour(sumHour) > 0 ?? (
              <div>Horas Extras: {extraHour(sumHour)}</div>
            )}
          </div>

          <table className="w-full table-auto mt-4">
            <thead>
              <tr className=" text-gray-500  text-sm leading-normal bg-gray-100 border-b dark:bg-gray-800 dark:border-gray-700">
                <th className=" text-left">Dia</th>
                <th className="py-2 ">
                  <button
                    disabled={dayFilter?.map((d) => d.day) != "" ? true : false}
                    type="submit"
                    name="_action"
                    value="entrada"
                    className=" disabled:bg-gray-100 disabled:text-gray-600 disabled:border-0 enabled:shadow-md  rounded-md border border-blue-700  text-blue-600 px-3 py-1 transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white "
                  >
                    Entrada
                  </button>
                </th>
                <th className="text-center">
                  <button
                    disabled={
                      dayFilter?.map((d) => d.outLunch) != "" ? true : false
                    }
                    type="submit"
                    name="_action"
                    value="outLunch"
                    className=" disabled:bg-gray-100 disabled:text-gray-600 disabled:border-0 enabled:shadow-md rounded-md border border-blue-700  text-blue-600 px-3 py-1 transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white "
                  >
                    Saída Almoço
                  </button>
                </th>
                <th className="text-center">
                  <button
                    disabled={
                      dayFilter?.map((d) => d.inLunch) != "" ? true : false
                    }
                    type="submit"
                    name="_action"
                    value="inLunch"
                    className=" disabled:bg-gray-100 disabled:text-gray-600 disabled:border-0 rounded-md enabled:shadow-md border border-blue-700  text-blue-600 px-3 py-1 transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white "
                  >
                    Entrada Almoço
                  </button>
                </th>
                <th className=" text-center">
                  <button
                    disabled={dayFilter?.map((d) => d.out) != "" ? true : false}
                    type="submit"
                    name="_action"
                    value="out"
                    className=" disabled:bg-gray-100 disabled:text-gray-600 disabled:border-0 enabled:shadow-md rounded-md border border-blue-700  text-blue-600 px-3 py-1 transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white "
                  >
                    Saída
                  </button>
                </th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm ">
              {daysMesAno.map((days, index) => (
                <tr
                  key={index}
                  className=" bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <td className="">
                    <div className="flex items-right ">
                      <div className=" p-2 text-right whitespace-nowrap">
                        {days.day}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className=" text-center whitespace-nowrap">
                      {days.in !== null ? hour(days.in) : "---"}
                    </div>
                  </td>
                  <td>
                    <div className=" text-center whitespace-nowrap">
                      {days.outLunch !== null ? hour(days.outLunch) : "---"}
                    </div>
                  </td>
                  <td>
                    <div className=" text-center whitespace-nowrap">
                      {days.inLunch !== null ? hour(days.inLunch) : "---"}
                    </div>
                  </td>
                  <td>
                    <div className=" text-center whitespace-nowrap">
                      {days.out !== null ? hour(days.out) : "---"}
                    </div>
                  </td>
                  <td>
                    <div className=" text-center whitespace-nowrap">
                      {days.h}
                      {/* {diffData(days.in, days.outLunch, days.inLunch, days.out)} */}
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
