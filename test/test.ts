import { Client } from "ssh2";
import { connect, ConnectConfig } from "ssh2-connect";
import { exec } from "ssh2-exec";
import { configure } from "mocha-they";

export const scratch = "/tmp/ssh2-fs-test";

export const tmpdir = async () => {
  const ssh = null;
  return new Promise<void>((resolve, reject) => {
    exec(ssh, `rm -rf ${scratch}`, (err) => {
      if (err) return reject(err);
      exec(ssh, `mkdir -p ${scratch}`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
};

// Configure and return they
interface Config {
  label: string;
  ssh: ConnectConfig | null;
}
interface ConfigConnected {
  label: string;
  ssh: Client | null;
}
export const they = configure<Config, ConfigConnected>(
  [
    {
      label: "local",
      ssh: null,
    },
    {
      label: "remote",
      ssh: { host: "127.0.0.1", username: process.env.USER },
    },
  ],
  async (config) => {
    if (!config.ssh) return config as ConfigConnected;
    return {
      ...config,
      ssh: await connect(config.ssh),
    };
  },
  (config) => {
    config.ssh?.end();
  },
);
