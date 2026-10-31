import fs from "node:fs";
import path from "node:path";

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);
const nonEmptyStrings = (value) => Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string" && item.trim());

export const validatePageContentRecipes = (recipes, { blueprint, bindings, compositionIds } = {}) => {
  const errors = [];
  if (!isObject(recipes)) return ["pageContentRecipes must be an object"];
  if (recipes.schemaVersion !== 1) errors.push("pageContentRecipes.schemaVersion must equal 1");
  if (!recipes.blueprintRef?.id || recipes.blueprintRef.id !== blueprint?.id) errors.push("pageContentRecipes.blueprintRef.id must match pageBlueprint.id");
  if (!Array.isArray(recipes.recipes) || recipes.recipes.length === 0) return [...errors, "pageContentRecipes.recipes must be a non-empty array"];

  const recipeIds = new Set();
  const coveredGroups = new Set();
  const groupById = new Map((blueprint?.contentGroups ?? []).map((group) => [group.id, group]));
  const bindingById = new Map((bindings ?? []).map((binding) => [binding.id, binding]));
  for (const [index, recipe] of recipes.recipes.entries()) {
    const prefix = `pageContentRecipes.recipes[${index}]`;
    if (!isObject(recipe) || !recipe.id) { errors.push(`${prefix}.id is required`); continue; }
    if (recipeIds.has(recipe.id)) errors.push(`pageContentRecipes contains duplicate recipe id '${recipe.id}'`);
    recipeIds.add(recipe.id);
    const group = groupById.get(recipe.contentGroupId);
    if (!group) errors.push(`${prefix}.contentGroupId '${recipe.contentGroupId}' is not declared by pageBlueprint`);
    else {
      if (coveredGroups.has(recipe.contentGroupId)) errors.push(`pageContentRecipes contains more than one recipe for '${recipe.contentGroupId}'`);
      coveredGroups.add(recipe.contentGroupId);
      if (recipe.region !== group.region) errors.push(`${prefix}.region must equal content group region '${group.region}'`);
    }
    if (!recipe.compositionId || (compositionIds && !compositionIds.has(recipe.compositionId))) errors.push(`${prefix}.compositionId must name a rendered composition group`);
    if (!['registered-composition', 'page-composite', 'content-composition'].includes(recipe.kind)) errors.push(`${prefix}.kind must be registered-composition or page-composite`);
    if (recipe.entityId && !blueprint?.dataEntities?.some((entity) => entity.id === recipe.entityId)) errors.push(`${prefix}.entityId '${recipe.entityId}' is not declared by pageBlueprint`);
    if (recipe.bindingIds !== undefined && !nonEmptyStrings(recipe.bindingIds)) errors.push(`${prefix}.bindingIds must be a non-empty string array when supplied`);
    for (const bindingId of recipe.bindingIds ?? []) {
      const binding = bindingById.get(bindingId);
      if (!binding) errors.push(`${prefix}.bindingIds references unknown binding '${bindingId}'`);
      else if (recipe.region && binding.region !== recipe.region) errors.push(`${prefix}.binding '${bindingId}' belongs to '${binding.region}', not '${recipe.region}'`);
    }
    if (recipe.kind === 'registered-composition' && !nonEmptyStrings(recipe.bindingIds)) errors.push(`${prefix} must reference registered bindingIds`);
    if (recipe.kind === 'page-composite') {
      if (!nonEmptyStrings(recipe.fields)) errors.push(`${prefix}.fields must declare the business fields rendered by a page composite`);
      if (!nonEmptyStrings(recipe.states)) errors.push(`${prefix}.states must declare the composite states`);
      if (typeof recipe.missingCapability !== 'string' || !recipe.missingCapability.trim()) errors.push(`${prefix}.missingCapability is required for a page composite`);
      if (!nonEmptyStrings(recipe.registryQueries)) errors.push(`${prefix}.registryQueries is required for a page composite`);
      if (!Array.isArray(recipe.reviewedCandidates) || recipe.reviewedCandidates.some((candidate) => !candidate?.logicalName || !candidate?.rejectionReason)) errors.push(`${prefix}.reviewedCandidates must record every rejected registered candidate`);
      if (!nonEmptyStrings(recipe.tokenRoles)) errors.push(`${prefix}.tokenRoles is required for a page composite`);
      if (!['page-owned', 'promote-to-library'].includes(recipe.disposition)) errors.push(`${prefix}.disposition must be page-owned or promote-to-library`);
    }
  }
  for (const groupId of groupById.keys()) if (!coveredGroups.has(groupId)) errors.push(`pageContentRecipes is missing a recipe for content group '${groupId}'`);
  return errors;
};

export const readPageContentRecipes = (file, options) => {
  const recipes = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  const errors = validatePageContentRecipes(recipes, options);
  if (errors.length) throw new Error(`Page content recipes validation failed:\n${errors.join('\n')}`);
  return recipes;
};
