// spell-checker:ignore labelable
import * as core from '@actions/core'

import { Context, PullRequestInfo } from './types'

export const updatePullRequests = async (
  context: Context,
  pullRequests: PullRequestInfo[]
): Promise<void> => {
  const { client, config, labelId } = context

  core.debug('Generating UpdatePRs mutation')

  const mutations = pullRequests.map(
    (pr, i) => `
      labelPr_${i}: addLabelsToLabelable(input:{labelableId:"${pr.id}", labelIds:["${labelId}"]}) {
        labelable {
          __typename
        }
      }
      addComment_${i}: addComment(input:{subjectId: "${pr.id}", body: $body}) {
        subject {
          id
        }
      }
    `
  )

  const query = `mutation UpdatePRs($body: String!) {\n${mutations.join(
    '\n'
  )}\n}`
  core.debug(`Sending UpdatePRs mutation request:\n${query}`)
  core.debug('UpdatePRs mutation sent')

  await client.graphql(query, { body: config.message })
}
