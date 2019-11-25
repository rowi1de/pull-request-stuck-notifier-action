<!-- spell-checker:ignore greenkeeper -->

# Pull Request Stuck Notifier GitHub Action

Automatically label and mention/notify a user about stuck pull requests.

This is primarily useful if you use a dependency update bot such as
[Dependabot][dependabot], [Greenkeeper][greenkeeper], or [Renovate][renovate]
and have configured their pull requests to be merged automatically. This action
will catch unmerged PRs that may be stuck because of a failing GitHub status
check.

This action pairs very well with the [Auto Approve action by Harry Marr][auto-approve].

## Usage instructions

### 1. Create a label in your repo to assign to stuck pull requests

The default label this action uses is "stuck", but you can use any label. The
label must be setup before using this action.

### 2. Create an action workflow

Input properties:

### repo-token

Input for `secrets.GITHUB_TOKEN`.

#### cutoff

The cutoff time period before a pull request is considered stuck. The value
will be passed to the [ms](https://www.npmjs.com/package/ms) package.

Default is "24h".

#### label

Name of the label to assign to stuck pull requests. The supplied label must
already exist, this action will not create a new label.

Default is "stuck".

#### message

The message to post on the pull request to notify a user.

Comments are posted by the `github-actions` app.

Default: _No default, you must provide a value_.

#### search-params

Search parameters to pass to the pull request search.

Default: _No default, you must provide a value_.

## Sample workflow

This sample workflow will find and update [Dependabot][dependabot] pull requests
that have not been automatically merged in 24 hours (default cutoff).

```yaml
name: Stuck PRs
on:
  schedule:
    - cron: '0 * * * *' # Run once per hour
jobs:
  stuck-prs:
    runs-on: ubuntu-latest
    steps:
      - uses: loomble/pull-request-stuck-notifier-action@master
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          message: 'Hey @yourUsername, this PR appears to be stuck.'
          search-params: 'author:app/dependabot-preview author:app/dependabot'
```

## Related
- [Auto Approve action by Harry Marr][auto-approve]

## Sponsors

- [Loomble](https://loomble.com/)

## Maintainers

- [Jay Rylan](https://jayrylan.com/)

## License

[MIT](https://github.com/loomble/pull-request-stuck-notifier-action/blob/master/LICENSE)

[auto-approve]: https://github.com/marketplace/actions/auto-approve
[dependabot]: https://dependabot.com/
[greenkeeper]: https://github.com/marketplace/greenkeeper
[renovate]: https://github.com/marketplace/renovate
