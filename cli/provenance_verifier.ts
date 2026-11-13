import * as crypto from "crypto";
import * as fs from "fs";

interface AuditRecord {
  entityId: string;
  actor: string;
  timestamp: string;
  sha256Digest: string;
  regulation: "21-CFR-PART-11" | "EU-ANNEX-11";
}

export class ProvenanceLedger {
  private readonly targetFile: string;

  constructor(targetFile: string) {
    this.targetFile = targetFile;
  }

  public generateDigest(): AuditRecord {
    const rawBuffer = fs.readFileSync(this.targetFile);
    const hash = crypto.createHash("sha256").update(rawBuffer).digest("hex");

    return {
      entityId: `urn:nordicsec:artifact:${pathBase(this.targetFile)}`,
      actor: process.env.GITHUB_ACTOR || "platform-ci-runner",
      timestamp: new Date().toISOString(),
      sha256Digest: hash,
      regulation: "EU-ANNEX-11",
    };
  }
}

function pathBase(filePath: string): string {
  return filePath.split("/").pop() || "unknown";
}

const ledger = new ProvenanceLedger("terraform/eu_compliant_infra.tf");
console.log(JSON.stringify(ledger.generateDigest(), null, 2));
