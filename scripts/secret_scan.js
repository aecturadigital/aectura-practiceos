const { execSync } = require("child_process");

const patterns = [
  { name: "Private Key", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "AWS/R2 Secret", regex: /(?:aws_secret_access_key|r2_secret_access_key)\s*[:=]\s*[A-Za-z0-9\/+=]{40}/i },
  { name: "Cloudflare API Token", regex: /(?:cf_api_token|cloudflare_api_token)\s*[:=]\s*[A-Za-z0-9_-]{40}/i },
  { name: "PostgreSQL Connection with Password Literal", regex: /postgresql:\/\/[^:]+:[^@]+@[^/]+\/[^\s"']+/i },
];

console.log("Scanning git commits on gold-master-integration (main..HEAD)...");
const log = execSync("git log -p e24fe5a..HEAD", { maxBuffer: 20 * 1024 * 1024 }).toString();

let issues = 0;
for (const p of patterns) {
  const matches = log.match(p.regex);
  if (matches) {
    // Check if it's the example file
    const filtered = matches.filter(m => !m.includes("configured@localhost") && !m.includes("user_soulmates:configured"));
    if (filtered.length > 0) {
      console.warn("Potential match for " + p.name + ": " + filtered[0].substring(0, 30) + "...");
      issues++;
    }
  }
}

if (issues === 0) {
  console.log("✓ Secret scan passed: ZERO secrets or credentials detected in branch commits.");
} else {
  console.error("Issues found: " + issues);
  process.exit(1);
}
