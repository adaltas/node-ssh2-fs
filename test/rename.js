import * as ssh2fs from "../lib/index.js";
import { connect, tmpdir, scratch, they } from "./test.js";

beforeEach(tmpdir);

describe("rename", () => {
  they(
    "a file",
    connect(async ({ ssh }) => {
      await ssh2fs.writeFile(ssh, `${scratch}/src_file`, "helloworld", {
        flags: "a",
      });
      await ssh2fs.rename(ssh, `${scratch}/src_file`, `${scratch}/dest_file`);
      await ssh2fs
        .readFile(ssh, `${scratch}/dest_file`, "utf8")
        .then((content) => content.should.eql("helloworld"));
    }),
  );

  they(
    "over an existing file",
    connect(async ({ ssh }) => {
      await ssh2fs.writeFile(ssh, `${scratch}/dest_file`, "overwrite", {
        flags: "a",
      });
      await ssh2fs.writeFile(ssh, `${scratch}/src_file`, "helloworld", {
        flags: "a",
      });
      await ssh2fs.rename(ssh, `${scratch}/src_file`, `${scratch}/dest_file`);
      await ssh2fs
        .readFile(ssh, `${scratch}/dest_file`, "utf8")
        .then((content) => content.should.eql("helloworld"));
    }),
  );
});
