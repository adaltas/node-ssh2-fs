import fs from "node:fs";
import * as ssh2fs from "../lib/index.js";
import { connect, tmpdir, scratch, they } from "./test.js";

describe("writeFile", function () {
  beforeEach(tmpdir);

  they(
    "source is buffer",
    connect(async ({ ssh }) => {
      const buf = Buffer.from("helloworld");
      await ssh2fs.writeFile(ssh, `${scratch}/a_file`, buf);
      await ssh2fs
        .readFile(ssh, `${scratch}/a_file`, "utf8")
        .should.resolvedWith("helloworld");
    }),
  );

  they(
    "source is readable stream",
    connect(async ({ ssh }) => {
      await fs.promises.writeFile(`${scratch}/source`, "helloworld");
      const rs = fs.createReadStream(`${scratch}/source`);
      await ssh2fs.writeFile(ssh, `${scratch}/target`, rs);
      await ssh2fs
        .readFile(ssh, `${scratch}/target`, "utf8")
        .should.resolvedWith("helloworld");
    }),
  );

  they(
    "source is invalid readable stream",
    connect(async ({ ssh }) => {
      await ssh2fs
        .writeFile(
          ssh,
          `${scratch}/target`,
          fs.createReadStream(`${scratch}/does_not_exists`),
        )
        .should.be.rejectedWith({
          code: "ENOENT",
        });
    }),
  );

  they(
    "pass append flag",
    connect(async ({ ssh }) => {
      await ssh2fs.writeFile(ssh, `${scratch}/a_file`, "hello", { flags: "a" });
      await ssh2fs.writeFile(ssh, `${scratch}/a_file`, "world", { flags: "a" });
      await ssh2fs
        .readFile(ssh, `${scratch}/a_file`, "utf8")
        .should.resolvedWith("helloworld");
    }),
  );
});
