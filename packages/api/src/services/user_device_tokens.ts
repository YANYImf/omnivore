import { FindOptionsWhere } from 'typeorm'
import { UserDeviceToken } from '../entity/user_device_tokens'
import { env } from '../env'
import { authTrx } from '../repository'
import { analytics } from '../utils/analytics'

export const findDeviceTokenById = async (
  id: string,
  userId: string
): Promise<UserDeviceToken | null> => {
  return authTrx(
    (t) =>
      t.getRepository(UserDeviceToken).findOneBy({ id, user: { id: userId } }),
    undefined,
    userId
  )
}

export const findDeviceTokenByToken = async (
  token: string,
  userId: string
): Promise<UserDeviceToken | null> => {
  return authTrx(
    (t) =>
      t
        .getRepository(UserDeviceToken)
        .findOneBy({ token, user: { id: userId } }),
    undefined,
    userId
  )
}

export const findDeviceTokensByUserId = async (
  userId: string
): Promise<UserDeviceToken[]> => {
  return authTrx(
    (t) =>
      t.getRepository(UserDeviceToken).findBy({
        user: { id: userId },
      }),
    undefined,
    userId
  )
}

export const createDeviceToken = async (
  userId: string,
  token: string
): Promise<UserDeviceToken> => {
  analytics.track({
    userId: userId,
    event: 'device_token_created',
    properties: {
      env: env.server.apiEnv,
    },
  })

  return authTrx(
    (t) =>
      t.getRepository(UserDeviceToken).save({
        token,
        user: { id: userId },
      }),
    undefined,
    userId
  )
}

export const deleteDeviceToken = async (
  id: string,
  userId: string
): Promise<boolean> => {
  analytics.track({
    userId: userId,
    event: 'device_token_deleted',
    properties: {
      env: env.server.apiEnv,
    },
  })

  return authTrx(async (t) => {
    const result = await t
      .getRepository(UserDeviceToken)
      .delete({ id, user: { id: userId } })

    return !!result.affected
  })
}

export const deleteDeviceTokens = async (
  userId: string,
  criteria: string[] | FindOptionsWhere<UserDeviceToken>
) => {
  return authTrx(
    async (t) => {
      await t.getRepository(UserDeviceToken).delete(criteria)
    },
    undefined,
    userId
  )
}
