const path = require("path");

const keyPath = process.env.KVM_SSH_KEY_PATH || path.join(process.env.USERPROFILE || process.env.HOME || "", ".ssh", "id_ed25519");
const privateKey = fs.readFileSync(keyPath, "utf8");
const conn = new Client();

const script = `
docker inspect aectura-practiceos-staging --format '{{json .State.Health}}'
`;

conn.on("ready", () => {
  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on("close", (code) => {
      conn.end();
    });
    stream.on("data", (data) => {
      process.stdout.write(data);
    });
    stream.stderr.on("data", (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: "72.60.198.37",
  port: 22,
  username: "root",
  privateKey,
});
