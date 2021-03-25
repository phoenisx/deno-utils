import { CSV2JSON } from "../../mod.ts";

interface Data {
  email: string;
  firstname: string;
}

const json = await CSV2JSON('file');
