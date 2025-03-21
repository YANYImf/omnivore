import { env } from '../../env'
import {
  ArchiveLinkError,
  ArchiveLinkErrorCode,
  ArchiveLinkSuccess,
  MutationSetLinkArchivedArgs,
} from '../../generated/graphql'
import { updateLibraryItem } from '../../services/library_item'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/helpers'
import { InFilter } from '../../utils/search'

// export const updateLinkShareInfoResolver = authorized<
//   UpdateLinkShareInfoSuccess,
//   UpdateLinkShareInfoError,
//   MutationUpdateLinkShareInfoArgs
// >(async (_obj, args, { models, claims, authTrx, log }) => {
//   const { title, description } = args.input

//   log.info('updateLinkShareInfoResolver', args.input.linkId, title, description)

//   // TEMP: because the old API uses articles instead of Links, we are actually
//   // getting an article ID here and need to map it to a link ID. When the API
//   // is updated to use Links instead of Articles this will be removed.
//   const link = await authTrx((tx) =>
//     models.userArticle.getByArticleId(claims.uid, args.input.linkId, tx)
//   )

//   if (!link?.id) {
//     return {
//       __typename: 'UpdateLinkShareInfoError',
//       errorCodes: [UpdateLinkShareInfoErrorCode.Unauthorized],
//     }
//   }

//   const result = await authTrx((tx) =>
//     createOrUpdateLinkShareInfo(tx, link.id, title, description)
//   )
//   if (!result) {
//     return {
//       __typename: 'UpdateLinkShareInfoError',
//       errorCodes: [UpdateLinkShareInfoErrorCode.BadRequest],
//     }
//   }

//   return {
//     __typename: 'UpdateLinkShareInfoSuccess',
//     message: 'Updated Share Information',
//   }
// })

export const setLinkArchivedResolver = authorized<
  ArchiveLinkSuccess,
  ArchiveLinkError,
  MutationSetLinkArchivedArgs
>(async (_obj, args, { uid }) => {
  analytics.track({
    userId: uid,
    event: args.input.archived ? 'link_archived' : 'link_unarchived',
    properties: {
      env: env.server.apiEnv,
    },
  })

  try {
    await updateLibraryItem(
      args.input.linkId,
      {
        savedAt: new Date(),
        folder: args.input.archived ? InFilter.ARCHIVE : InFilter.INBOX,
      },
      uid
    )
  } catch (e) {
    return {
      message: 'An error occurred',
      errorCodes: [ArchiveLinkErrorCode.BadRequest],
    }
  }

  return {
    linkId: args.input.linkId,
    message: 'Link Archived',
  }
})
