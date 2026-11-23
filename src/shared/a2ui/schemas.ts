import { z } from 'zod'
import type { A2uiProtocol } from './protocol'

/**
 * The Push catalog's custom components as Zod schemas, from push-be `packages/contracts/a2ui/push-catalog.v1.json`
 * (`push-catalog.json`, v0.9.1, has the same props with `{path}` bindings). Strict, like the catalog's `additionalProperties: false`,
 * so a prop the backend adds fails the golden fixture test here. `id` and `component` are the envelope, not props.
 */
export const pushSchemas = ({ bindingKey }: Pick<A2uiProtocol, 'bindingKey'>) => {
  // A data binding: the binder resolves it and adds a setter (`setSelected`) for the bound prop.
  const binding = z.object({ [bindingKey]: z.string() }).strict()
  const bound = <T extends z.ZodTypeAny>(value: T) => z.union([value, binding])
  const props = <T extends z.ZodRawShape>(shape: T) =>
    z.object({ weight: z.number().optional(), ...shape }).strict()

  const choice = z
    .object({
      id: z.string(),
      label: z.string(),
      desc: z.string().optional(),
      recommended: z.boolean().optional(),
      change: z.boolean().optional(),
    })
    .strict()
  const question = z
    .object({
      id: z.string(),
      title: z.string().optional(),
      detail: z.string().optional(),
      multiple: z.boolean().optional(),
      answerable: z.boolean().optional(),
      choices: z.array(choice).min(1),
    })
    .strict()

  return {
    PushChoice: props({
      form: z.enum(['list', 'buttons']).optional(),
      questions: z.array(question).min(1),
      answer: z.enum(['pick', 'submit']),
      submit: z
        .object({ label: z.string(), labels: z.record(z.string()).optional() })
        .strict()
        .optional(),
      secondary: z.object({ id: z.string(), label: z.string() }).strict().optional(),
      open: bound(z.boolean()),
      picked: bound(z.array(z.string())),
      selected: bound(z.record(z.array(z.string()))).optional(),
    }),
    PushTodo: props({
      items: bound(
        z.array(
          z.object({ text: z.string(), state: z.enum(['done', 'running', 'waiting']) }).strict(),
        ),
      ),
    }),
    PushDiff: props({
      caption: z.string().optional(),
      title: z.string(),
      lines: z.array(z.object({ sign: z.enum(['+', '-', '']), text: z.string() }).strict()),
      documentId: z.string().optional(),
    }),
    PushPlan: props({
      caption: z.string().optional(),
      title: z.string(),
      rows: z
        .array(
          z
            .object({
              tag: z.string(),
              tone: z.enum(['accent', 'green', 'orange']),
              label: z.string(),
              note: z.string(),
            })
            .strict(),
        )
        .min(1),
      keywords: z.array(z.string()).optional(),
    }),
    PushFit: props({
      score: z.string(),
      sentence: z.string(),
      summary: z.string().optional(),
      items: z.array(z.object({ label: z.string(), score: z.number() }).strict()).optional(),
      missing: z.array(z.string()).optional(),
      rounds: z.array(z.string()).optional(),
      locked: z.boolean().optional(),
    }),
    PushDocument: props({
      status: z.enum(['done', 'writing', 'failed']),
      title: z.string(),
      name: z.string(),
      meta: z.string().optional(),
      lines: z.array(z.string()).optional(),
      documentId: z.string().optional(),
      share: z.boolean().optional(),
      actions: z
        .array(
          z
            .object({
              id: z.string(),
              label: z.string(),
              method: z.string().optional(),
              path: z.string().optional(),
            })
            .strict(),
        )
        .optional(),
    }),
    PushJobCard: props({
      postingId: z.string(),
      company: z.string(),
      title: z.string(),
      meta: z.string().optional(),
      imageUrl: z.string().optional(),
      bookmarked: bound(z.boolean()).optional(),
    }),
  }
}

export type PushSchemas = ReturnType<typeof pushSchemas>
