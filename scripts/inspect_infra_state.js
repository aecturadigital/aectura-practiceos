const path = require("path");

const keyPath = process.env.KVM_SSH_KEY_PATH || path.join(process.env.USERPROFILE || process.env.HOME || "", ".ssh", "id_ed25519");
const privateKey = fs.readFileSync(keyPath, "utf8");
const conn = new Client();

const script = `
echo "=== DOCKER CONTAINERS (PracticeOS & Core Infra) ==="
docker ps -a --filter "name=aectura" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Networks}}"

echo "=== DOCKER NETWORKS ==="
docker network ls

echo "=== CONTAINER HEALTH CHECKS ==="
docker inspect --format '{{.Name}}: State={{.State.Status}}, Health={{if .State.Health}}{{.State.Health.Status}}{{else}}N/A{{end}}' aectura-practiceos-postgres aectura-practiceos-pgbouncer aectura-practiceos-redis aectura-practiceos-staging 2>/dev/null

echo "=== UPTIME KUMA STATUS ==="
docker ps --filter "name=kuma" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Networks}}"
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
