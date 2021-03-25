import { assertEquals, resolve } from "../../dev_deps.ts";
import { CSV2JSON } from "../../mod.ts";

Deno.test("Convert CSV To JSON", async () => {
  const data = await CSV2JSON(resolve("./resources/test.csv"));
  assertEquals(
    data[0]["email"],
    "foo_bar@gmail.com"
  );
});
