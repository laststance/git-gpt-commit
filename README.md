> Original package doesn't work due to config mistake 'package.json'. https://github.com/nooqta/git-commit-gpt  
> Tharefore I fix it and republish as a '@laststance/git-gpt-commit'.

Git Commit GPT-3.5-turbo-instruct
-----------
An AI-powered Git extension that generates commit messages using OpenAI's GPT-3.5-turbo-instruct, streamlining the commit process and improving developer productivity.

![Git GPT-Commit Demo](./assets/git-gpt-commit.gif)

Table of Contents
-----
- [Installation](#Installation)
    - [Using npm](#Using-npm)
- [Usage](#Usage)
- [License](#License)

Installation
------
There are two ways to install the Git extension: using npm or manual installation.

### Using npm

To install the Git extension as an npm package, run the following command:

```
$ npm install -g @laststance/git-gpt-commit
```

This command will install the Git extension globally on your system.

Get your openai API key from [openai](https://platform.openai.com/account/api-keys) and add `.env` file to `OPENAI_API_KEY` at any local project root.  

`.env`
```
OPENAI_API_KEY=our_openai_api_key
```

Usage
-----

After setting up the project, you can use the Git extension in any Git repository:

Stage your changes:
```
git add .
```
Run the Git extension:
```
git gpt commit
```
The script will summarize the Git changes since the last commit and generate a commit message using GPT-3. You will be prompted to confirm whether to use the suggested message or cancel the commit.

License
----
This project is licensed under the MIT License.
