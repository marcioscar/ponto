//@ts-nocheck
import bcrypt from "bcryptjs";
import type { RegisterForm } from "./types.server";
import { prisma } from "./prisma.server";
import { redirect } from "@remix-run/node";

export const createUser = async (user: RegisterForm) => {
  const passwordHash = await bcrypt.hash(user.password, 10);
  const newUser = await prisma.user.create({
    data: {
      email: user.email,
      password: passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
  return { id: newUser.id, email: user.email };
};

export const updateUser = async (user: RegisterForm) => {
  if (user.password) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await prisma.user.update({
      where: {
        id: user.userId,
      },
      data: {
        email: user.email,
        password: passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
    throw redirect("/admin");
  } else {
    await prisma.user.update({
      where: {
        id: user.userId,
      },
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

    throw redirect("/admin");
  }
};
export const deleteUser = async (user: RegisterForm) => {
  await prisma.user.delete({
    where: {
      id: user.userId,
    },
  });
  throw redirect("/admin");
};

export const getOtherUsers = async (userId: string) => {
  return prisma.user.findMany({
    where: {
      id: { not: userId },
    },
    orderBy: {
      firstName: "asc",
    },
  });
};

export const getUser = async (userId: string) => {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
};

export const getHit = async (userId: string, data: Date) => {
  return prisma.user.findUnique({
    where: {
      id: userId,
      timeSheet: {
        day: data,
      },
    },
  });
};

export const hitTimesheet = async (userId, action) => {
  console.log("action: " + action);
  switch (action) {
    case "entrada": {
      return prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          timeSheet: {
            push: {
              day:
                new Date().getDate().toString().padStart(2, "0") +
                "-" +
                (new Date().getMonth() + 1).toString().padStart(2, "0"),
              in: new Date(),
              outLunch: null,
              inLunch: null,
              out: null,
            },
          },
        },
      });
    }
    case "outLunch": {
      // const user = await getUser(userId);
      return prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          timeSheet: {
            updateMany: {
              where: {
                day:
                  new Date().getDate().toString().padStart(2, "0") +
                  "-" +
                  (new Date().getMonth() + 1).toString().padStart(2, "0"),
              },
              data: {
                outLunch: new Date(),
              },
            },
          },
        },
      });
    }
    case "inLunch": {
      return prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          timeSheet: {
            updateMany: {
              where: {
                day:
                  new Date().getDate().toString().padStart(2, "0") +
                  "-" +
                  (new Date().getMonth() + 1).toString().padStart(2, "0"),
              },
              data: {
                inLunch: new Date(),
              },
            },
          },
        },
      });
    }
    case "out": {
      return prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          timeSheet: {
            updateMany: {
              where: {
                day:
                  new Date().getDate().toString().padStart(2, "0") +
                  "-" +
                  (new Date().getMonth() + 1).toString().padStart(2, "0"),
              },
              data: {
                out: new Date(),
              },
            },
          },
        },
      });
    }
  }
};

export const hitTimesheetback = async (
  userId,
  entrada,
  dia,
  update,
  outLunch,
  inLunch,
  out
) => {
  console.log("entrada servidor update " + update);
  if (update === "false") {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        timeSheet: {
          push: {
            day: dia,
            in: new Date(entrada),
            outLunch: null,
            inLunch: null,
            out: null,
          },
        },
      },
    });
  } else {
    const user = await getUser(userId);

    const dayFilter = user.timeSheet.filter(
      (d) => d.day == new Date().getDate()
    );

    if (dayFilter.map((t) => t.inLunch) == "") {
      inLunch = new Date();
      entrada = dayFilter.map((t) => t.in);
      outLunch = dayFilter.map((t) => t.outLunch);
      out = "";
    }

    console.log("usuário filtrado: " + dayFilter.map((t) => t.inLunch));
    // console.log("usuário filtrado: " + dayFilter.map((t) => t.day));
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        timeSheet: {
          updateMany: {
            where: {
              day: dia,
            },
            data: {
              in: new Date(entrada),
              outLunch: new Date(outLunch),
              inLunch: new Date(inLunch),
              out: new Date(out),
            },
          },
        },
      },
    });
  }
};
