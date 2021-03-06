import { format, EOL } from "../deps.ts";

const SEPERATOR = /,\s*/;
type ValueOf<T> = T[keyof T];

/**
 * Converts a simple CSV file to it's JSON representation.
 *
 * ```ts
 * (async () => {
 *  const json = await CSV2JSON<{id: string}>('filename');
 * })()
 * ```
 *
 * @param {string} filename Resolved path to proper CSV File
 */
export async function CSV2JSON<T = Record<string, string>>(filename: string): Promise<T[]> {
  const text = format(await Deno.readTextFile(filename), EOL.LF);
  const rows = text.split(EOL.LF);

  const titles = rows[0].split(SEPERATOR) as Array<keyof T>;
  const data = rows.slice(1);

  return data.reduce<T[]>((json, item) => {
    const values = item.split(SEPERATOR) as unknown as Array<ValueOf<T>>;
    if (values.length > 1) {
      json.push(titles.reduce((obj, title, index) => {
        obj[title] = values[index];
        return obj;
      }, {} as T))
    }
    return json;
  }, []);
}
