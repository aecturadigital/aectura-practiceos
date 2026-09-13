import { VerticalConfig, psychologyVertical } from "./psychology";
import { physiotherapyVertical } from "./physiotherapy";

export * from "./psychology";
export * from "./physiotherapy";

export const VERTICAL_PACKS: Record<string, VerticalConfig> = {
  psychology: psychologyVertical,
  physiotherapy: physiotherapyVertical,
};

export function getVerticalConfig(verticalId: string): VerticalConfig {
  return VERTICAL_PACKS[verticalId] || psychologyVertical;
}
