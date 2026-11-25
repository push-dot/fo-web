import { z } from 'zod'
import type { A2uiProtocol } from './protocol'

export const pushSchemas = ({ bindingKey }: Pick<A2uiProtocol, 'bindingKey'>) => {
  const binding = z.object({ [bindingKey]: z.string() }).strict()
  const bound = <T extends z.ZodTypeAny>(value: T) => z.union([value, binding])
  const props = <T extends z.ZodRawShape>(shape: T) =>
    z.object({ weight: z.number().optional(), ...shape })

  const choice = z
    .object({
      id: z.string(),
      label: z.string(),
      desc: z.string().optional(),
      recommended: z.boolean().optional(),
      change: z.boolean().optional(),
    })
  const question = z
    .object({
      id: z.string(),
      title: z.string().optional(),
      detail: z.string().optional(),
      multiple: z.boolean().optional(),
      answerable: z.boolean().optional(),
      choices: z.array(choice).min(1),
    })

  return {
    PushChoice: props({
      form: z.enum(['list', 'buttons']).optional(),
      questions: z.array(question).min(1),
      answer: z.enum(['pick', 'submit']),
      submit: z
        .object({ label: z.string(), labels: z.record(z.string()).optional() })
        .optional(),
      secondary: z.object({ id: z.string(), label: z.string() }).optional(),
      open: bound(z.boolean()),
      picked: bound(z.array(z.string())),
      selected: bound(z.record(z.array(z.string()))).optional(),
    }),
    PushTodo: props({
      items: bound(
        z.array(
          z.object({ text: z.string(), state: z.enum(['done', 'running', 'waiting']) }),
        ),
      ),
    }),
    PushDiff: props({
      caption: z.string().optional(),
      title: z.string(),
      lines: z.array(z.object({ sign: z.enum(['+', '-', '']), text: z.string() })),
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
            }),
        )
        .min(1),
      keywords: z.array(z.string()).optional(),
    }),
    PushFit: props({
      score: z.string(),
      sentence: z.string(),
      summary: z.string().optional(),
      items: z.array(z.object({ label: z.string(), score: z.number() })).optional(),
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
            }),
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
