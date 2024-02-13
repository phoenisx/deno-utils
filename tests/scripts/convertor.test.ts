import { assertEquals, assertStringIncludes, resolve } from "../../dev_deps.ts";
import { CSV2JSON, JSON2CSV } from "../../mod.ts";

Deno.test("Convert CSV To JSON", async () => {
  const data = await CSV2JSON(resolve("./resources/test.csv"));
  assertEquals(
    data[0]["email"],
    "foo_bar@gmail.com"
  );
});

Deno.test("Convert JSON To CSV", async () => {
  const csvString = await JSON2CSV(resolve("./resources/test.json"));
  const headString = `KEY,COL 1,COL 2,USAGES,COL 3,COL 4\n`;
  const row1String = `__KEY_002__,foo.com/002,example.com,"""path/to/some""'/script-002.js',\npath/to/some/script-002_01.js",,\n`;
  const row2String = `__KEY_003__,"foo.com/003\nfoo.com/003_01",twitter.com,,"path/to/some/script-003.js\npath/to/some/script-003_01.js",\n`;
  assertStringIncludes(csvString, headString, "Header does not match");
  assertStringIncludes(csvString, row1String, "__KEY_002__ does not match");
  assertStringIncludes(csvString, row2String, "__KEY_003__ does not match");
});
