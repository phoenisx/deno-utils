import { format, EOL } from "../deps.ts";

const SEPERATOR = /,\s*/;
const STRING_START = /["']/;
type ValueOf<T> = T[keyof T];

/**
 * Since CSVs can have string with LF in single column,
 * this function helps properly find rows without eagerly
 * breaking on every LF.
 */
const getRowsFromCSV = (text: string) => {
  const rows: string[] = [];
  let eol = false;
  let insideString: string | null = null;
  let stringBuilder = '';
  let charPointer = 0;
  while (charPointer < text.length) {
    const char = text.charAt(charPointer);
    if (char === EOL.LF && insideString == null) {
      eol = true;
    }
    if (STRING_START.test(char)) {
      if (insideString == null) {
        insideString = char;
      } else if (insideString === char) {
        // End of string, reset parser state.
        insideString = null;
      }
      charPointer += 1;
      continue;
    }

    if (eol) {
      rows.push(stringBuilder);
      stringBuilder = '';
      eol = false
    } else {
      stringBuilder += char;
    }
    charPointer += 1;
  }
  return rows;
}

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
  const rows = getRowsFromCSV(text);

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
