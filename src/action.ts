import * as core from '@actions/core'
import * as github from '@actions/github'
import ms from 'ms'

import { PullRequestInfo, Context, Config } from './types'
import { updatePullRequests } from './updatePullRequests'

const timeNum = (num: number) => num.toString().padStart(2, '0')

const generateCutoffDateString = (cutoff: number): string => {
  const d = new Date(Date.now() - cutoff)
  const year = d.getUTCFullYear()
  const month = timeNum(d.getUTCMonth() + 1)
  const day = timeNum(d.getUTCDate())
  const hours = timeNum(d.getUTCHours())
  const mins = timeNum(d.getUTCMinutes())

  return `${year}-${month}-${day}T${hours}:${mins}:00+00:00`
}

const run = async () => {
  try {
    const client = new github.GitHub(
      core.getInput('repo-token', { required: true })
    )
    const { GITHUB_REPOSITORY = '' } = process.env
    const [repoOwner, repoName] = GITHUB_REPOSITORY.split('/')
    const inputCutoff = core.getInput('cutoff')
    const inputLabel = core.getInput('label')
    const config: Config = {
      cutoff: inputCutoff !== '' ? inputCutoff : '24h',
      label: inputLabel !== '' ? inputLabel : 'stuck',
      message: core.getInput('message', { required: true }),
      'search-params': core.getInput('search-params', { required: true })
    }

    const stuckLabel = config.label
    const stuckCutoff = ms(config.cutoff)
    const stuckSearch = config['search-params']
    const createdSince = generateCutoffDateString(stuckCutoff)
    const query = `
      {
        repo: repository(owner:"${repoOwner}", name:"${repoName}") {
          label(name:"${stuckLabel}") {
            id
          }
        }
        stuckPRs: search(query: "repo:${GITHUB_REPOSITORY} is:pr ${stuckSearch} is:open created:<=${createdSince} -label:${stuckLabel}", type: ISSUE, first: 10) {
          totalCount: issueCount
          pullRequests: nodes {
            ... on PullRequest {
              id
              permalink
            }
          }
        }
      }
    `

    core.debug(`Searching for stuck PRs using query:\n${query}`)

    const data: {
      repo: {
        label: {
          id: string
        }
      }
      stuckPRs: {
        totalCount: number
        pullRequests: PullRequestInfo[]
      }
    } = await client.graphql(query)

    if (data.stuckPRs.totalCount === 0) {
      core.debug('There are currently no stuck PRs.')
      return
    }

    const total = data.stuckPRs.totalCount
    core.debug(`Found ${total === 1 ? 'stuck PR' : 'stuck PRs'}.`)

    const context: Context = {
      client,
      config,
      labelId: data.repo.label.id
    }

    await updatePullRequests(context, data.stuckPRs.pullRequests)
  } catch (err) {
    core.setFailed(err)
  }
}

run()
