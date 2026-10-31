import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { readPatternRegistry } from "./pattern-contract-lib.mjs";

export const blueprintDigest = (blueprint) => crypto.createHash("sha256").update(JSON.stringify(blueprint)).digest("hex");

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);
const requireIds = (items, label, errors) => {
  if (!Array.isArray(items) || items.length === 0) { errors.push(`${label} must be a non-empty array`); return; }
  const ids = new Set();
  for (const [index, item] of items.entries()) {
    if (!isObject(item) || typeof item.id !== "string" || !item.id.trim()) errors.push(`${label}[${index}].id is required`);
    else if (ids.has(item.id)) errors.push(`${label} contains duplicate id '${item.id}'`);
    else ids.add(item.id);
  }
};

export const validatePageBlueprint = (blueprint, { patternId } = {}) => {
  const errors = [];
  if (!isObject(blueprint)) return ["pageBlueprint must be an object"];
  if (blueprint.schemaVersion !== 1) errors.push("pageBlueprint.schemaVersion must equal 1");
  for (const key of ["id", "task", "user", "workObject", "primaryJob", "designRationale"]) if (typeof blueprint[key] !== "string" || !blueprint[key].trim()) errors.push(`pageBlueprint.${key} is required`);
  if (patternId && blueprint.pattern?.id !== patternId) errors.push(`pageBlueprint.pattern.id must equal ${patternId}`);
  if (!isObject(blueprint.pattern) || typeof blueprint.pattern.id !== "string") errors.push("pageBlueprint.pattern.id is required");
  requireIds(blueprint.regions, "pageBlueprint.regions", errors);
  requireIds(blueprint.contentGroups, "pageBlueprint.contentGroups", errors);
  requireIds(blueprint.dataEntities, "pageBlueprint.dataEntities", errors);
  requireIds(blueprint.interactions, "pageBlueprint.interactions", errors);
  requireIds(blueprint.states, "pageBlueprint.states", errors);
  const regionIds = new Set((blueprint.regions ?? []).map((item) => item.id));
  const canonicalPattern = readPatternRegistry().patterns.find((pattern) => pattern.id === blueprint.pattern?.id);
  if (canonicalPattern && JSON.stringify([...regionIds]) !== JSON.stringify(canonicalPattern.paneOrder)) errors.push(`pageBlueprint.regions must exactly match ${canonicalPattern.id} paneOrder`);
  for (const [index, item] of (blueprint.contentGroups ?? []).entries()) {
    if (!regionIds.has(item.region)) errors.push(`pageBlueprint.contentGroups[${index}].region '${item.region}' is not declared`);
    if (!Array.isArray(item.purpose) && typeof item.purpose !== "string") errors.push(`pageBlueprint.contentGroups[${index}].purpose is required`);
  }
  const entityIds = new Set((blueprint.dataEntities ?? []).map((item) => item.id));
  for (const [index, item] of (blueprint.contentGroups ?? []).entries()) for (const entity of item.dataEntities ?? []) if (!entityIds.has(entity)) errors.push(`pageBlueprint.contentGroups[${index}] references unknown data entity '${entity}'`);
  const groupIds = new Set((blueprint.contentGroups ?? []).map((item) => item.id));
  for (const [index, item] of (blueprint.interactions ?? []).entries()) {
    if (!item.taskOutcome) errors.push(`pageBlueprint.interactions[${index}].taskOutcome is required`);
    if (item.sourceGroup && !groupIds.has(item.sourceGroup)) errors.push(`pageBlueprint.interactions[${index}].sourceGroup '${item.sourceGroup}' is not declared`);
    if (item.targetGroup && !groupIds.has(item.targetGroup)) errors.push(`pageBlueprint.interactions[${index}].targetGroup '${item.targetGroup}' is not declared`);
  }
  if (!Array.isArray(blueprint.successCriteria) || blueprint.successCriteria.length === 0) errors.push("pageBlueprint.successCriteria must be a non-empty array");
  if (!Array.isArray(blueprint.recoveryPaths) || blueprint.recoveryPaths.length === 0) errors.push("pageBlueprint.recoveryPaths must be a non-empty array");
  return errors;
};

export const readPageBlueprint = (file, options) => {
  const resolved = path.resolve(file);
  const blueprint = JSON.parse(fs.readFileSync(resolved, "utf8"));
  const errors = validatePageBlueprint(blueprint, options);
  if (errors.length) throw new Error(`Page blueprint validation failed:\n${errors.join("\n")}`);
  return blueprint;
};
