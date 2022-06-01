//@ts-nocheck
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, NavLink } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getUser } from "~/utils/user.server";
import { useState } from "react";
import { requireUserId } from "~/utils/auth.server";
import moment from "moment";

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUserId(request);
  const user = await getUser(params.employee as string);
  console.log("user parametros:" + user);
  return json({ user });
};
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
export default function Employee() {
  const { user } = useLoaderData();
  const [mes, SetMes] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [ano, SetAno] = useState(String(new Date().getFullYear()));

  let filterMesAno = user?.timeSheet.filter((t: { in: string | string[] }) =>
    t.in.includes(ano + "-" + mes)
  );

  filterMesAno.map((t) => [
    t.in,
    t.outLunch,
    t.inLunch,
    t.out,
    (t.h = diffData(t.in, t.outLunch, t.inLunch, t.out)),
  ]);

  const sum = filterMesAno.reduce(
    (acc, time) => acc.add(moment.duration(time.h)),
    moment.duration()
  );
  const sumHour = [Math.floor(sum.asHours()), sum.minutes()].join(":");

  return (
    <>
      <nav className="bg-slate-200">
        <div className="max-w-7xl mx-auto p-2 sm:px-6 lg:px-8 flex items-center justify-between">
          <img className="w-40 lg:w-56" src="../logosvg.svg" alt="logo" />
          <label className="mr-2 font-medium"></label>
          <select
            className="rounded text-blue-600 h-8 print:text-black print:w-32 w-40 pl-5 pr-10 hover:border-gray-400 focus:outline-none appearance-none"
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
          <label className="ml-2 mr-2 font-medium"></label>
          <select
            className="rounded print:text-black text-blue-600 h-8 print:w-32 w-40 pl-5 pr-10 hover:border-gray-400 focus:outline-none appearance-none"
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
              <div className="font-bold text-xl">
                {user?.firstName + " " + user?.lastName}
              </div>
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
      <div className="text-gray-500 font-medium bg-gray-100 p-2 mt-2 flex justify-center gap-10  ">
        <div>Horas Mensais: {sumHour}</div>

        {extraHour(sumHour) > 0 ?? (
          <div>Horas Extras: {extraHour(sumHour)}</div>
        )}
      </div>
      <div className="container mx-auto px-4">
        <table className="w-full table-auto mt-4">
          <thead>
            <tr className=" text-gray-500  text-sm leading-normal bg-gray-100 border-b dark:bg-gray-800 dark:border-gray-700">
              <th className=" text-left">Dia</th>
              <th className="py-2 ">Entrada</th>
              <th className="text-center">Saída Almoço</th>
              <th className="text-center">Entrada Almoço</th>
              <th className=" text-center">Saída</th>
              <th className=" text-center">Total</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm ">
            {filterMesAno.map((days, index) => (
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
                  <div className=" text-center whitespace-nowrap">{days.h}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
