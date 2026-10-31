import fs from "node:fs";
import path from "node:path";
export const quote = value => "'" + String(value).replaceAll("'", "'\\''") + "'";
export function workflowPolicy(root, id) {
  const source = JSON.parse(fs.readFileSync(path.join(root,"references/routes/index.json")));
  const profile = JSON.parse(fs.readFileSync(path.join(root,"skill-profile.json")));
  const route = source.routes[id];
  if (!route || !profile.workflows.includes(id)) throw new Error("Unknown workflow: " + id);
  if (!Array.isArray(route.stages) || !route.stages.length || route.stages.some(s => !profile.stages.includes(s)) || new Set(route.stages).size !== route.stages.length || !route.stages.includes(route.entryStage)) throw new Error("Invalid workflow stage policy: " + id);
  return {id,...route};
}
export function workflowCard(policy, stage, shared) {
  if (!policy.stages.includes(stage)) throw new Error(`Stage ${stage} is not available for workflow ${policy.id}; allowed: ${policy.stages.join(", ")}`);
  return {...shared, ...policy.stageOverrides?.[stage], next:policy.stages[policy.stages.indexOf(stage)+1] || null};
}
export function workflowCommands(policy, stage, options, packet, card) {
  const tool = file => 'node "<RULES_ROOT>/scripts/' + file + '"';
  const context = options.context ? " --context " + quote(path.resolve(options.context)) : policy.requiresTaskPattern ? ' --context "<context.json>"' : "";
  const carried = [];
  for (const name of ["blueprint","bindings","preservation"]) if(options[name]) carried.push("--"+name+" "+quote(path.resolve(options[name])));
  for (const name of ["component","semantic-context","roles","interaction","max-bytes"]) if(options[name]) carried.push("--"+name+" "+quote(Array.isArray(options[name])?options[name].join(","):options[name]));
  if (!card.next && stage !== "validation") return {finish:policy.completion};
  if (stage !== "validation") return {nextQuery:tool("query-resources.mjs")+" --stage "+card.next+" --workflow "+policy.id+context+" --view api --out-dir \"<next-pack-dir>\""+(carried.length?" "+carried.join(" "):""), prerequisites:policy.requiresTaskPattern && !packet ? ["Resolve Task and Pattern with resolve-context.mjs --workflow-route "+policy.id+" --discover before the design stage"] : []};
  if (policy.id === "skill-maintenance") return {
    rebuild:["build-resource-index.mjs","build-skill-catalog-index.mjs","build-navigation-index.mjs"].map(f=>tool(f)+" --repo \"<RULES_ROOT>\" --skill-root \"<RULES_ROOT>\""),
    checks:["build-resource-index.mjs","build-skill-catalog-index.mjs","build-navigation-index.mjs"].map(f=>tool(f)+" --repo \"<RULES_ROOT>\" --skill-root \"<RULES_ROOT>\" --check"),
    manifest:tool("skill-distribution.mjs")+" manifest",finish:policy.completion};
  const mode = packet?.request.mode || "fast-preview";
  const commands = {validate:tool("validate-page-project.mjs")+" --project \"<PROJECT_DIR>\" --skill-root \"<RULES_ROOT>\" --mode "+mode,stylesCheck:tool("prepare-page-styles.mjs")+" --project \"<PROJECT_DIR>\" --check",handoff:tool("html-handoff.mjs")+" create --project \"<PROJECT_DIR>\" --url \"<preview-url>\" --evidence \"<relative-validation-evidence.json>\"",finish:policy.completion};
  if (policy.id === "micro-revision") {
    commands.apply="Edit only the recorded page inputs or page-owned styles. For managed output, regenerate with the original project entry (normalize-demo or new-page), preserving its source and preservation record; never change generated files directly.";
    return commands;
  }
  const script=policy.entryScript;
  commands.generate='node "<RULES_ROOT>/scripts/'+script+'"'+(policy.id==="normalize-demo"?' --source "<ORIGINAL_PROJECT>"':"")+' --project "<PROJECT_DIR>" --task '+quote(packet?.request.task || "<task>")+' --repo "<RULES_ROOT>" --skill-root "<RULES_ROOT>" --mode '+mode+(policy.id==="new-page"?" --route new-page":"")+' --blueprint "<PROJECT_DIR>/page-blueprint.json" --content-recipes "<PROJECT_DIR>/page-content-recipes.json" --bindings "<PROJECT_DIR>/page-bindings.json" --page-css "<PROJECT_DIR>/styles/page-composition.css"';
  return commands;
}
