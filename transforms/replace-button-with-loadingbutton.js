/**
 * jscodeshift transform:
 * - Replaces <button ...> with <LoadingButton ... loading={false} />
 * - Adds an import for the component using a relative path to /components/LoadingButton
 *
 * Run from project root:
 *   npx jscodeshift -t transforms/replace-button-with-loadingbutton.js -d -p --extensions=tsx,jsx,js .
 *
 * -d (dry) will print changes; remove -d to apply.
 */

const path = require("path");

module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  const filePath = fileInfo.path;
  const projectRoot = process.cwd();
  const compAbsPath = path.join(projectRoot, "components", "LoadingButton.tsx");
  let rel = path.relative(path.dirname(filePath), compAbsPath).replace(/\\/g, "/").replace(/\.tsx?$/, "");
  if (!rel.startsWith(".")) rel = "./" + rel;

  // Add import if not present
  const hasImport = root.find(j.ImportDeclaration, {
    source: { value: (v) => v === rel }
  }).size() > 0;

  if (!hasImport) {
    const firstImport = root.find(j.ImportDeclaration).at(0);
    const importDecl = j.importDeclaration(
      [j.importDefaultSpecifier(j.identifier("LoadingButton"))],
      j.literal(rel)
    );

    if (firstImport.size()) {
      firstImport.insertBefore(importDecl);
    } else {
      root.get().node.program.body.unshift(importDecl);
    }
  }

  // Replace JSX <button> with <LoadingButton loading={false}>
  root.find(j.JSXElement, {
    openingElement: { name: { type: "JSXIdentifier", name: "button" } }
  }).forEach(pathNode => {
    const { node } = pathNode;
    // rename element
    node.openingElement.name.name = "LoadingButton";
    if (node.closingElement) node.closingElement.name.name = "LoadingButton";

    // add loading prop (default false)
    const hasLoadingProp = node.openingElement.attributes.some(attr =>
      attr.type === "JSXAttribute" && attr.name && attr.name.name === "loading"
    );
    if (!hasLoadingProp) {
      node.openingElement.attributes.push(
        j.jsxAttribute(
          j.jsxIdentifier("loading"),
          j.jsxExpressionContainer(j.literal(false))
        )
      );
    }
  });

  return root.toSource({ quote: "double" });
};