export interface IUser {
  name: string;
  email: string;
  password: string;
  role?: IRoles;
}

export interface IRoles {
  role: "contributor" | "maintainer";
}
