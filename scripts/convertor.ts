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

/**
 *
 * CSV outputs work differently for different applications it seems
 * Ref for Xcel sheets: https://stackoverflow.com/questions/10546933/inserting-multiline-text-in-a-csv-field
 *
 * But Since I am developing for Google Sheets, the CSV new lines inside a column is double
 * quoted and any double quotes inside that column value is escaped using double quotes again,
 * making a string like: `"abc"\n'foo'\n"bar"` represented in CSV as:
 * `"""abc""\n'foo'\n""bar"""`
 */
const escapeDoubleQuotes = (value: string) => {
  return value.replaceAll('"', '""');
}

/**
 * Converts a JSON file to it's CSV representation.
 * NOTE: JSON should be an array of objects, where key represents the column name and
 * values form a row in that table.
 *
 * @param filename Resolved path to proper JSON File
 * @returns {string} String in CSV format, comma separated
 */
export async function JSON2CSV<T = string | number | boolean>(filename: string): Promise<string> {
  const json = JSON.parse(await Deno.readTextFile(filename)) as {[key: string]: T}[];

  const columnNames = json.reduce((acc, item) => {
    const keys = Object.keys(item);
    keys.forEach(k => acc.add(k));
    return acc;
  }, new Set<string>());

  const headString = [...columnNames].join(',');
  const rows: string[] = [];

  for (const row of json) {
    let rowString = '';
    for (const columnName of columnNames) {
      if (row[columnName]) {
        const shouldEscapeValue = typeof row[columnName] === "string" ? (row[columnName] as string).includes(EOL.LF) || (row[columnName] as string).includes(",") : false;
        rowString += shouldEscapeValue ? `"${escapeDoubleQuotes(row[columnName] as string)}",` : `${row[columnName]},`;
      } else {
        rowString += ',';
      }
    }
    rowString = rowString.substring(0, rowString.length - 1); // Remove the comma from the end.
    rows.push(rowString);
  }

  return `${headString}\n${rows.join("\n")}\n`;
}
