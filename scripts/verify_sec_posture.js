const path = require("path");

const keyPath = process.env.KVM_SSH_KEY_PATH || path.join(process.env.USERPROFILE || process.env.HOME || "", ".ssh", "id_ed25519");
const privateKey = fs.readFileSync(keyPath, "utf8");
const conn = new Client();

const script = `
echo "=== 1. Checking authorized_keys ==="
cat /root/.ssh/authorized_keys

echo "=== 2. Checking sshd config ==="
cat /etc/ssh/sshd_config.d/01-practiceos-hardening.conf 2>/dev/null || grep -E "PermitRootLogin|PubkeyAuth" /etc/ssh/sshd_config

echo "=== 3. Checking shell users ==="
grep -E '/bin/bash|/bin/sh' /etc/passwd

echo "=== 4. Checking recent auth attempts ==="
last -n 5
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
