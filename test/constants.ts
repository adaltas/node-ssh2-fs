import should from "should";
import * as fs from "node:fs";
import * as ssh2fs from "../src/index.js";

describe("constants", function () {
  it("match with native constants", function () {
    ssh2fs.constants.S_IFDIR.should.be.a.Number();
    should(fs.constants.S_IFDIR === ssh2fs.constants.S_IFDIR).be.ok();
  });
});
