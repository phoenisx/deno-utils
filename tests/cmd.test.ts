import { assertEquals } from "../dev_deps.ts";
import { process } from "../cmd/mod.ts";

Deno.test("Get Parsed String", async () => {
  const data = await process("resources/test.md");
  assertEquals(!!data.children, true);
  assertEquals(data.children.length, 5);
});
