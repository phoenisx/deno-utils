import { createRequire } from "https://deno.land/std@0.91.0/node/module.ts";

const require = createRequire(import.meta.url);
const mdast = require("mdast-util-from-markdown");

export const process = async (filepath: string) => {
  const doc = await Deno.readTextFile(filepath);
  const tree = mdast(doc)
  console.log(tree);
  return tree;
}

const path = Deno.realPathSync("resources/test.md");
console.log(path);
await process(path);
