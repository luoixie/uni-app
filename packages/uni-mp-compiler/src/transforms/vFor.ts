import { extend, isString } from '@vue/shared'
import {
  createCompilerError,
  createSimpleExpression,
  ErrorCodes,
  ExpressionNode,
  getInnerRange,
  SimpleExpressionNode,
  SourceLocation,
  ElementTypes,
  ElementNode,
  NodeTypes,
  isTemplateNode,
  findProp,
  ComponentNode,
} from '@vue/compiler-core'
import { parseExpr, parseParam } from '../ast'
import {
  createStructuralDirectiveTransform,
  NodeTransform,
  TransformContext,
} from '../transform'
import { processExpression } from './transformExpression'
import { genExpr } from '../codegen'
import {
  arrowFunctionExpression,
  blockStatement,
  callExpression,
  cloneNode,
  Expression,
  identifier,
  Identifier,
  isIdentifier,
  objectExpression,
  Pattern,
  RestElement,
  returnStatement,
} from '@babel/types'
import { rewriteExpression } from './utils'
import { CodegenVForScope } from '../options'
import { V_FOR } from '../runtimeHelpers'
import { createVSlotCallExpression, isScopedSlotVFor } from './vSlot'

export type VForOptions = Omit<ForParseResult, 'tagType'> & {
  sourceExpr?: Expression
  sourceAlias: string
  valueCode: string
  valueExpr: Identifier | Pattern | RestElement
  valueAlias: string
  keyCode: string
  keyExpr: Identifier | Pattern | RestElement
  keyAlias: string
  indexCode: string
  indexExpr: Identifier | Pattern | RestElement
  indexAlias: string
}

export type ForElementNode = ElementNode & {
  vFor: VForOptions & { source: ExpressionNode }
}
export function isForElementNode(node: unknown): node is ForElementNode {
  return !!(node as ForElementNode).vFor
}
export const transformFor = createStructuralDirectiveTransform(
  'for',
  (node, dir, context) => {
    if (!dir.exp) {
      context.onError(
        createCompilerError(ErrorCodes.X_V_FOR_NO_EXPRESSION, dir.loc)
      )
      return
    }
    const parseResult = parseForExpression(
      dir.exp as SimpleExpressionNode,
      context as unknown as TransformContext
    )

    if (!parseResult) {
      context.onError(
        createCompilerError(ErrorCodes.X_V_FOR_MALFORMED_EXPRESSION, dir.loc)
      )
      return
    }
    parseResult.tagType = node.tagType
    const { addIdentifiers, removeIdentifiers } = context
    const { source, value, key, index } = parseResult
    if (context.prefixIdentifiers) {
      addIdentifiers(value)
      addIdentifiers(key)
      addIdentifiers(index)
    }
    const { currentScope: parentScope, scopes, popScope } = context
    const sourceExpr = parseExpr(source, context)
    const valueCode = genExpr(value)

    const valueExpr = parseParam(valueCode, context, value)
    const valueAlias = parseAlias(valueExpr, valueCode, 'v' + scopes.vFor)
    const keyCode = genExpr(key)
    const keyExpr = parseParam(keyCode, context, key)
    const keyAlias = parseAlias(keyExpr, keyCode, 'k' + scopes.vFor)
    const indexCode = genExpr(index)
    const indexExpr = parseParam(indexCode, context, index)
    const indexAlias = parseAlias(indexExpr, indexCode, 'i' + scopes.vFor)
    // 先占位vFor，后续更新 cloneSourceExpr 为 CallExpression
    const cloneSourceExpr = cloneNode(sourceExpr!, false)
    const vForData: VForOptions = {
      source,
      sourceExpr,
      sourceAlias: rewriteExpression(
        source,
        context,
        cloneSourceExpr,
        parentScope
      ).content,
      value,
      valueCode,
      valueExpr,
      valueAlias,
      key,
      keyCode,
      keyExpr,
      keyAlias,
      index,
      indexCode,
      indexExpr,
      indexAlias,
    }

    const vForScope = context.addVForScope({
      ...vForData,
      locals: findVForLocals(parseResult),
    })

    const vFor = {
      ...vForData,
    }

    const isScopedSlot = isScopedSlotVFor(vForScope)
    ;(node as ForElementNode).vFor = vFor
    scopes.vFor++

    return () => {
      scopes.vFor--
      if (isTemplateNode(node)) {
        node.children.some((c) => {
          if (c.type === NodeTypes.ELEMENT && !isForElementNode(c)) {
            const key = findProp(c, 'key')
            if (key) {
              context.onError(
                createCompilerError(
                  ErrorCodes.X_V_FOR_TEMPLATE_KEY_PLACEMENT,
                  key.loc
                )
              )
              return true
            }
          }
        })
      }
      if (context.prefixIdentifiers) {
        value && removeIdentifiers(value)
        key && removeIdentifiers(key)
        index && removeIdentifiers(index)
      }
      extend(
        clearExpr(cloneSourceExpr),
        isScopedSlot
          ? createVSlotCallExpression(
              (node as unknown as { slotComponent: ComponentNode })
                .slotComponent,
              vForScope,
              context
            )
          : createVForCallExpression(vForScope, context)
      )
      popScope()
    }
  }
) as unknown as NodeTransform

function clearExpr(expr: Expression) {
  Object.keys(expr).forEach((key) => {
    delete (expr as any)[key]
  })
  return expr
}

function parseAlias(
  babelExpr: Identifier | Pattern | RestElement,
  exprCode: string,
  fallback: string
) {
  if (isIdentifier(babelExpr)) {
    return exprCode
  }
  return fallback
}

function findVForLocals({ value, key, index }: ForParseResult) {
  const ids: string[] = []
  if (value) {
    findIds(value, ids)
  }
  if (key) {
    findIds(key, ids)
  }
  if (index) {
    findIds(index, ids)
  }
  return ids
}
function findIds(exp: string | ExpressionNode, ids: string[]) {
  if (isString(exp)) {
    ids.push(exp)
  } else if (exp.identifiers) {
    exp.identifiers.forEach((id) => ids.push(id))
  } else if (exp.type === NodeTypes.SIMPLE_EXPRESSION) {
    ids.push(exp.content)
  }
}

const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/
const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/
const stripParensRE = /^\(|\)$/g

export interface ForParseResult {
  source: ExpressionNode
  value: ExpressionNode
  key: ExpressionNode
  index: ExpressionNode
  tagType: ElementTypes
}

export function parseForExpression(
  input: SimpleExpressionNode,
  context: TransformContext
): ForParseResult | undefined {
  const loc = input.loc
  const exp = input.content
  const inMatch = exp.match(forAliasRE)
  if (!inMatch) return

  const [, LHS, RHS] = inMatch

  const result: ForParseResult = {
    source: createAliasExpression(
      loc,
      RHS.trim(),
      exp.indexOf(RHS, LHS.length)
    ),
    value: createSimpleExpression('v' + context.scopes.vFor),
    key: createSimpleExpression('k' + context.scopes.vFor),
    index: createSimpleExpression('i' + context.scopes.vFor),
    tagType: ElementTypes.ELEMENT,
  }
  if (context.prefixIdentifiers) {
    result.source = processExpression(
      result.source as SimpleExpressionNode,
      context
    )
  }

  let valueContent = LHS.trim().replace(stripParensRE, '').trim()
  const trimmedOffset = LHS.indexOf(valueContent)

  const iteratorMatch = valueContent.match(forIteratorRE)
  if (iteratorMatch) {
    valueContent = valueContent.replace(forIteratorRE, '').trim()

    const keyContent = iteratorMatch[1].trim()
    let keyOffset: number | undefined
    if (keyContent) {
      keyOffset = exp.indexOf(keyContent, trimmedOffset + valueContent.length)
      result.key = createAliasExpression(loc, keyContent, keyOffset)
      if (context.prefixIdentifiers) {
        result.key = processExpression(result.key, context, true)
      }
    }

    if (iteratorMatch[2]) {
      const indexContent = iteratorMatch[2].trim()
      if (indexContent) {
        result.index = createAliasExpression(
          loc,
          indexContent,
          exp.indexOf(
            indexContent,
            result.key
              ? keyOffset! + keyContent.length
              : trimmedOffset + valueContent.length
          )
        )
        if (context.prefixIdentifiers) {
          result.index = processExpression(result.index, context, true)
        }
      }
    }
  }

  if (valueContent) {
    result.value = createAliasExpression(loc, valueContent, trimmedOffset)
    if (context.prefixIdentifiers) {
      result.value = processExpression(result.value, context, true)
    }
  }

  return result
}

function createAliasExpression(
  range: SourceLocation,
  content: string,
  offset: number
): SimpleExpressionNode {
  return createSimpleExpression(
    content,
    false,
    getInnerRange(range, offset, content.length)
  )
}

export function createForLoopParams(
  { value, key, index }: ForParseResult,
  memoArgs: ExpressionNode[] = []
): ExpressionNode[] {
  return createParamsList([value, key, index, ...memoArgs])
}

function createParamsList(
  args: (ExpressionNode | undefined)[]
): ExpressionNode[] {
  let i = args.length
  while (i--) {
    if (args[i]) break
  }
  return args
    .slice(0, i + 1)
    .map((arg, i) => arg || createSimpleExpression(`_`.repeat(i + 1), false))
}

function createVForCallExpression(
  vForScope: CodegenVForScope,
  context: TransformContext
) {
  // let sourceExpr: Expression = vForScope.sourceExpr!
  // if (isNumericLiteral(sourceExpr)) {
  //   sourceExpr = numericLiteralToArrayExpr((sourceExpr as NumericLiteral).value)
  // }
  return callExpression(identifier(context.helperString(V_FOR)), [
    vForScope.sourceExpr!,
    createVForArrowFunctionExpression(vForScope),
  ])
}

type FunctionParam = Identifier | Pattern | RestElement

export function createVForArrowFunctionExpression({
  valueExpr,
  keyExpr,
  indexExpr,
  properties,
}: CodegenVForScope) {
  const params: FunctionParam[] = []
  if (valueExpr) {
    params.push(valueExpr)
  }
  if (keyExpr) {
    params.push(keyExpr)
  }
  if (indexExpr) {
    params.push(indexExpr)
  }
  return arrowFunctionExpression(
    params,
    blockStatement([returnStatement(objectExpression(properties))])
  )
}
