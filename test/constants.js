import fs from 'node:fs';
import * as ssh2fs from '../lib/index.js';

describe('constants', () => {
  it('match with native constants', () => {
    ssh2fs.constants.S_IFDIR.should.be.a.Number();
    ssh2fs.constants.S_IFDIR === fs.constants.S_IFDIR;
  });
});
