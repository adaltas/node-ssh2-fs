import * as ssh2fs from "../lib/index.js";
import { connect, tmpdir, scratch, they } from "./test.js";

describe("ssh", function () {
  beforeEach(tmpdir);

  they(
    "call after end",
    connect(({ ssh }) => {
      if (!ssh) return;
      return new Promise((resolve, reject) => {
        ssh.end();
        ssh.on("end", () => {
          ssh2fs
            .readFile(ssh, `${scratch}/a_file`, "utf8")
            .should.be.rejectedWith({
              message: "Closed SSH Connection",
            })
            .then(resolve)
            .catch(reject);
        });
      });
    }),
  );
});
