export type RegisterForm = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type LoginForm = {
  email: string;
  password: string;
};

export type User = {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  timeSheet?: {
    day?: string;
    in?: Date;
    outLunch?: Date;
    inLunch?: Date;
    out?: Date;
  };
};
