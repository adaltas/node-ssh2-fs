import fs from "node:fs";
import * as ssh2fs from "../dist/esm/index.js";

describe("constants", function () {
  it("match with native constants", function () {
    ssh2fs.constants.S_IFDIR.should.be.a.Number();
    ssh2fs.constants.S_IFDIR === fs.constants.S_IFDIR;
  });
});
