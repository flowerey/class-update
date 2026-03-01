# class-update

A CSS class updater for Discord themes.

## Inputs

Add a step like this to your workflow:

```yml
- uses: Metro420yt/class-update@master
  with:
    # Folder that contains your theme files
    # Default: themes
    folder: "src"

    # File extension to target
    # Default: css
    ext: scss

    # URL or relative path to a file containing an old & new pair of class names
    # Default: https://raw.githubusercontent.com/SyndiShanX/Update-Classes/main/Changes.txt
    diff: "./changes.txt"
```

## Outputs

The action provides these outputs:

- `totalChanges`: The total number of classes that were replaced.

> For more info on how to use outputs, see ["Context and expression syntax"](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts).

## Examples

<details>
<summary><h3>Webhook Trigger</h3></summary>

> <a href="[https://github.com/Metro420yt/Discord-comfy/blob/master/.github/workflows/classUpdate.yml](https://github.com/Metro420yt/Discord-comfy/blob/master/.github/workflows/classUpdate.yml)" style="color: #919894">🔗 This is a workflow I use for a fork</a>

```yml
name: Update Classes

on:
  workflow_dispatch: # Manually trigger
  repository_dispatch: # Trigger by webhook (example below)
    types: [update_class] # ID for webhook to target

jobs:
  classUpdate:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v6

      - name: Update Classes
        id: update
        uses: Metro420yt/class-update@master
        with:
          folder: stuff
          ext: scss

      - name: Build SCSS
        uses: gha-utilities/sass-build@v0.6.1 # Compile SCSS files
        if: ${{ steps.update.outputs.totalChanges > 0 }} # Skip if no class changes
        with:
          source: ./app.scss
          destination: ./betterdiscord/main.css
          outputStyle: expanded

      - name: Commit changes
        uses: EndBug/add-and-commit@v9
        if: ${{ steps.update.outputs.totalChanges > 0 }} # Skip if no class changes
        with:
          default_author: github_actions
          message: "chore: update classes"
          fetch: true
```

This example runs when [SyndiShanX's Changes.txt](https://raw.githubusercontent.com/SyndiShanX/Update-Classes/main/Changes.txt) updates, but you can ignore the first step if using a different trigger.

I'm using [make.com](https://www.make.com/en) for demonstration purposes since they have a free tier.

[Make.com blueprint](https://gist.github.com/Metro420yt/a3cc2687adb2313966c2f339bd43d246#file-make-blueprint-json)

> Make sure to set up a schedule; I wouldn't try to make it run more than once per hour to stay under the 1,000 operations/month limit.

- Using an **RSS feed parser**, have it check [this feed](https://github.com/SyndiShanX/Update-Classes/commits/main/Changes.txt.atom) for new items (commits).
- When a new commit is made, send a **POST** request to `https://api.github.com/repos/<YOUR_REPO>/dispatches` with this info ([docs](https://docs.github.com/en/webhooks/webhook-events-and-payloads#repository_dispatch)):
- **Headers**:
- `Accept`: `application/vnd.github+json` (Might not be needed, but recommended)
- `Content-Type`: `application/json`
- `Authorization`: `Bearer <YOUR_TOKEN>` (See [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#about-personal-access-tokens))
- **Body**:
- `{"event_type": "<YOUR_DISPATCH_ID>"}`

</details>

## Credits

- Inspired by [ClassUpdate from Saltssaumure](https://github.com/Saltssaumure/ClassUpdate)
- Changelist maintained by [SyndiShanX](https://github.com/SyndiShanX) ([repo](https://github.com/SyndiShanX/Update-Classes))
- Class name history maintained by [itmesarah](https://github.com/itmesarah) ([repo](hhttps://github.com/itmesarah/DiscordClasses))
- README based on [EndBug/add-and-commit](https://github.com/EndBug/add-and-commit/blob/main/README.md)
