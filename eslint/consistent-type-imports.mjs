import ts from 'typescript';
import tseslint from 'typescript-eslint';

/**
 * `@typescript-eslint/consistent-type-imports`, except that enums are never
 * imported with `type`, even when they are only used as types.
 *
 * Needs type information (`parserOptions.projectService`) to tell enums apart.
 */
const base = tseslint.plugin.rules['consistent-type-imports'];

export default {
  meta: {
    ...base.meta,
    messages: {
      ...base.meta.messages,
      someImportsAreOnlyTypesExceptEnums:
        'Imports {{typeImports}} are only used as types',
    },
  },
  defaultOptions: base.defaultOptions,
  create(context) {
    const services = context.sourceCode.parserServices;
    if (!services?.program)
      throw new Error(
        'tokenizer/consistent-type-imports needs type information (parserOptions.projectService)',
      );
    const checker = services.program.getTypeChecker();

    const isEnum = (specifier) => {
      let symbol = checker.getSymbolAtLocation(
        services.esTreeNodeToTSNodeMap.get(specifier.local),
      );
      if (symbol && symbol.flags & ts.SymbolFlags.Alias)
        symbol = checker.getAliasedSymbol(symbol);
      return Boolean(symbol && symbol.flags & ts.SymbolFlags.Enum);
    };

    // The specifiers the base rule wants to mark as types: all the value ones
    // for `typeOverValue`, the ones it names for `someImportsAreOnlyTypes`.
    const flaggedSpecifiers = ({ node, messageId, data }) => {
      const values = node.specifiers.filter(
        (specifier) =>
          specifier.type === 'ImportSpecifier' &&
          specifier.importKind !== 'type',
      );
      if (messageId === 'typeOverValue') return values;
      const names = [...(data?.typeImports ?? '').matchAll(/"([^"]+)"/g)].map(
        ([, name]) => name,
      );
      return values.filter((specifier) => names.includes(specifier.local.name));
    };

    const report = (descriptor) => {
      const { node, messageId } = descriptor;
      if (
        node?.type !== 'ImportDeclaration' ||
        (messageId !== 'typeOverValue' &&
          messageId !== 'someImportsAreOnlyTypes')
      )
        return context.report(descriptor);

      const flagged = flaggedSpecifiers(descriptor);
      const types = flagged.filter((specifier) => !isEnum(specifier));
      if (types.length === flagged.length) return context.report(descriptor);
      if (types.length === 0) return;

      // Enums stay value imports, so the declaration keeps a value import and
      // the remaining types are marked inline.
      context.report({
        node,
        messageId: 'someImportsAreOnlyTypesExceptEnums',
        data: {
          typeImports: types
            .map((specifier) => `"${specifier.local.name}"`)
            .join(', '),
        },
        fix: (fixer) =>
          types.map((specifier) => fixer.insertTextBefore(specifier, 'type ')),
      });
    };

    return base.create(Object.create(context, { report: { value: report } }));
  },
};
