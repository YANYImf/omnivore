import { gql } from 'graphql-request'
import useSWR from 'swr'
import { makeGqlFetcher } from '../networkHelpers'

export type SubscriptionStatus = 'ACTIVE' | 'DELETED' | 'UNSUBSCRIBED'

export enum SubscriptionType {
  RSS = 'RSS',
  NEWSLETTER = 'NEWSLETTER',
}

export type Subscription = {
  id: string
  name: string
  type: SubscriptionType
  newsletterEmail?: string

  url?: string
  description?: string

  status: SubscriptionStatus
  createdAt: string
  updatedAt: string
  lastFetchedAt?: string
  autoAddToLibrary?: boolean
  isPrivate?: boolean
}

type SubscriptionsQueryResponse = {
  error: any
  isLoading: boolean
  isValidating: boolean
  subscriptions: Subscription[]
  revalidate: () => void
}

type SubscriptionsResponseData = {
  subscriptions: SubscriptionsData
}

type SubscriptionsData = {
  subscriptions: unknown
}

export function useGetSubscriptionsQuery(
  type: SubscriptionType | undefined = undefined,
  sortBy = 'UPDATED_TIME'
): SubscriptionsQueryResponse {
  const query = gql`
    query GetSubscriptions($type: SubscriptionType, $sort: SortParams) {
      subscriptions(type: $type, sort: $sort) {
        ... on SubscriptionsSuccess {
          subscriptions {
            id
            name
            type
            newsletterEmail
            url
            description
            status
            unsubscribeMailTo
            unsubscribeHttpUrl
            createdAt
            updatedAt
            lastFetchedAt
            autoAddToLibrary
            isPrivate
          }
        }
        ... on SubscriptionsError {
          errorCodes
        }
      }
    }
  `

  const variables = {
    type,
    sort: {
      by: sortBy,
    },
  }
  const { data, error, mutate, isValidating } = useSWR(
    [query, variables],
    makeGqlFetcher(variables)
  )

  try {
    if (data) {
      const result = data as SubscriptionsResponseData
      const subscriptions = result.subscriptions.subscriptions as Subscription[]
      return {
        error,
        isLoading: !error && !data,
        isValidating,
        subscriptions,
        revalidate: () => {
          mutate()
        },
      }
    }
  } catch (error) {
    console.log('error', error)
  }
  return {
    error,
    isLoading: !error && !data,
    isValidating: true,
    subscriptions: [],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    revalidate: () => {},
  }
}
