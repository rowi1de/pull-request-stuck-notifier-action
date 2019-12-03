// spell-checker:ignore labelable
import * as core from '@actions/core'

import { Context, PullRequestInfo, InfoQueryResult } from './types'

export const updatePullRequests = async (
  context: Context,
  data: InfoQueryResult
): Promise<void> => {
  const { client, config, labelId } = context
  const { stuckPRs, previouslyStuckPRs } = data

  core.debug('Generating UpdatePRs mutation')

  const mutations = [
    ...stuckPRs.pullRequests.map(
      (pr, i) => `
      labelPr_${i}: addLabelsToLabelable(input:{labelableId:"${pr.id}", labelIds:["${labelId}"]}) {
        labelable {
          __typename
        }
      }
      addComment_${i}: addComment(input:{subjectId: "${pr.id}", body: $commentBody}) {
        subject {
          id
        }
      }
    `
    ),
    ...previouslyStuckPRs.pullRequests.map(
      (pr, i) => `
      removeLabelPr_${i}: removeLabelsFromLabelable(input:{labelableId:"${pr.id}", labelIds:["${labelId}"]}) {
        labelable {
          __typename
        }
      }
    `
    )
  ]

  const query = `mutation UpdatePRs($commentBody: String!) {\n${mutations.join(
    '\n'
  )}\n}`
  core.debug(`Sending UpdatePRs mutation request:\n${query}`)
  core.debug('UpdatePRs mutation sent')

  await client.graphql(query, { commentBody: config.message })
}
