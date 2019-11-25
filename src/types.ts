import * as github from '@actions/github'

export interface Config {
  cutoff: string
  label: string
  message: string
  'search-params': string
}

export interface PullRequestInfo {
  id: string
  permalink: string
}

export interface Context {
  client: github.GitHub
  config: Config
  labelId: string
}
