> Original package doesn't work due to config mistake 'package.json'. https://github.com/nooqta/git-commit-gpt  
> Tharefore I fix it and republish as a '@laststance/git-gpt-commit'.

<div align="center">
    <h1>Git Commit GPT-4-turbo-preview</h1>
    <p>An AI-powered Git extension that generates commit messages using OpenAI's GPT-3.5-turbo-instruct, streamlining the commit process and improving developer productivity.</p>
    <img src="./assets/preview.gif" />
</div>

Installation
------
There are two ways to install the Git extension: using npm or manual installation.

- **Step1:** run the following command:

```bash
npm install -g @laststance/git-gpt-commit
```

- **Step2:**  move to any languege your project root

```bash
cd my-rust-project
```

- **Step3:**  add `.env` file to `.gitignore`

```bash
echo -e "\n.env" >> .gitignore
```

- **Step4:**  commit .gitignore

```bash
git add .
git commit -m 'add .env to .gitignore'
```

> ❗️Step3 and 4 must be done for prevent leak your OpenAI API key on Github/GitLab.

- **Step5:**  Get your openai API key from [openai](https://platform.openai.com/account/api-keys) and add `.env` file to `OPENAI_API_KEY`.

`.env`
```
OPENAI_API_KEY=your_openai_api_key
```

✅ You've completed all setup!

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
The script will summarize the Git changes since the last commit and generate a commit message using gpt-4-turbo-preview. You will be prompted to confirm whether to use the suggested message or cancel the commit.


Credits
------

Thanks to

- Author of [original package](https://github.com/nooqta/git-commit-gpt)

License
----
This project is licensed under the MIT License.
