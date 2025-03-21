import { ILike } from 'typeorm'
import { Rule, RuleAction } from '../entity/rule'
import { authTrx } from '../repository'

export const createRule = async (
  userId: string,
  rule: {
    name: string
    description?: string
    actions: RuleAction[]
    filter: string
  }
): Promise<Rule> => {
  const existingRule = await authTrx((t) =>
    t.getRepository(Rule).findOneBy({
      user: { id: userId },
      name: ILike(rule.name),
    })
  )

  if (existingRule) {
    return existingRule
  }

  return authTrx(
    (t) =>
      t.getRepository(Rule).save({
        ...rule,
        user: { id: userId },
      }),
    undefined,
    userId
  )
}

export const deleteRule = async (id: string, userId: string) => {
  return authTrx(
    async (t) => {
      const repo = t.getRepository(Rule)
      const rule = await repo.findOneByOrFail({ id, user: { id: userId } })
      await repo.delete(id)
      return rule
    },
    undefined,
    userId
  )
}

export const deleteRules = async (userId: string) => {
  return authTrx(
    (t) => t.getRepository(Rule).delete({ user: { id: userId } }),
    undefined,
    userId
  )
}
