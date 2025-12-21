# Git Commit Specification

This project follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification to provide a clear structure for commit history, facilitating automated tool processing (such as version releases, changelog generation, etc.).

## Commit Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

## Type

Must be one of the following types:

- **feat**: a new feature
- **fix**: a bug fix
- **docs**: documentation only changes
- **style**: changes that do not affect the meaning of the code (white-space, formatting, missing semi colons, etc)
- **refactor**: a code change that neither fixes a bug nor adds a feature
- **perf**: a code change that improves performance
- **test**: adding missing tests or correcting existing tests
- **build**: changes that affect the build system or external dependencies
- **ci**: changes to CI configuration files and scripts
- **chore**: other changes that don't modify src or test files
- **revert**: reverts a previous commit

## Scope

Optional, used to specify the scope of the change. For example:

```
feat(auth): add login functionality
fix(api): fix user info API
```

## Description

- Concisely describe the commit content
- Use imperative, present tense (e.g., "add" not "added")
- No more than 50 characters
- No capital letter at the beginning
- No period at the end

## Body

Optional, used to describe the commit in more detail.

- Use imperative, present tense
- Each line no more than 72 characters
- Can include motivation, behavior changes before and after, etc.

## Footer

Optional, used to reference issues, breaking changes, etc.

### Referencing Issues

```
fix: fix login failure issue

Fixes the issue where users cannot log in despite entering the correct password.

Closes #123
```

### Breaking Changes

Breaking changes must be marked in the footer and start with `BREAKING CHANGE:`:

```
refactor: refactor user data structure

Refactor user data structure to support multi-role system.

BREAKING CHANGE: The `role` field in user data has changed from string to object, containing `name` and `permissions` attributes.
```

## Examples

### Feature Addition

```
feat(auth): add third-party login support

Added WeChat and Alipay login functionality, users can choose to log in using third-party accounts.

Closes #456
```

### Bug Fix

```
fix(api): fix avatar upload failure

Fixed timeout issue when uploading large avatar files, added file size limit and progress indicator.

Closes #789
```

### Documentation Update

```
docs: update API documentation

Enhanced documentation for user management interface, added parameter examples and return value descriptions.
```

### Code Refactor

```
refactor(utils): refactor date processing functions

Optimized date formatting and parsing logic, improved code readability and performance.
```

### Performance Optimization

```
perf(list): optimize list rendering performance

Used virtual scrolling to reduce DOM node count, improving rendering speed for long lists.
```

## Best Practices

1. Each commit should be as small as possible, containing only one logical change
2. Commit messages should clearly explain "what was done" and "why"
3. Avoid vague descriptions like "fixed some issues" or "updated code"
4. For large changes, split them into multiple smaller commits
5. Either English or Chinese can be used, but the team should remain consistent internally

## Tool Support

The following tools can be used to help follow this specification:

- **commitlint**: validate commit message format
- **husky**: work with commitlint to validate before commit
- **standard-version**: automatically generate changelog and version numbers based on commit history

## Related Links

- [Conventional Commits Official Documentation](https://www.conventionalcommits.org/en/v1.0.0/)
- [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit)
- [Commitizen](https://github.com/commitizen/cz-cli): interactive commit message generation tool