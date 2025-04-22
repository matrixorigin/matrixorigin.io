# **Contributing to OmniFabric Documentation**

Contributions to the OmniFabric documentation are welcome from everyone. The OmniFabric community strives to make the contribution process simple and straightforward. To do that, we create this page to walk you through the whole process step by step.

## **Before you start**

Before you contribute, please take a minute to familiarize yourself with basic [Markdown](https://www.markdownguide.org/basic-syntax/) syntax and look at our [Code of Conduct](../Code-Style/code-of-conduct.md) and the [Google Developer Documentation Style Guide](https://developers.google.com/style/) for some guidance on writing accessible, consistent, and inclusive documentation.

## **How is OmniFabric documentation project organized?**

The OmniFabric documentation is managed in 3 repositories:

* The english markdown contents are in the [OmniFabric.io](https://github.com/OmniFabric/OmniFabric.io) repo.

* The chinese markdown contents are in the [OmniFabric.io.cn](https://github.com/OmniFabric/OmniFabric.io.cn) repo.

* The images and unstructured data are located in the [artwork](https://github.com/OmniFabric/artwork) repo.

The images are referred to as web image links from `artwork` repo. The `OmniFabric.io` and `OmniFabric.io.cn` have implemented a CI&CD project, which will be triggered by a new code merge and manual launch. This CI&CD workflow publishes the documentation to [https://docs.OmniFabric.cn/en/](https://docs.OmniFabric.cn/en/).

The documentation project is based on the [mkdocs-material](https://github.com/squidfunk/mkdocs-material). You can find the corresponding syntax and commands with this project.

## **OmniFabric Documentation Structure**

The OmniFabric documentation content is planned with 6 main modules.

* **Overview**: OmniFabric's introduction, features and architecture.

* **Getting Started**: How to quickly deploy and run a standalone OmniFabric.

* **Developing Guide**: How to develop some applications based on OmniFabric using different programming languages.

* **Deploying**: How to quickly deploy and run OmniFabric cluster.

* **Tutorials**: Examples of developing application demos.

* **Maintenance**: How to maintain OmniFabric, including backing up and restoring data.

* **Migrating**: How to migrate data from other databases to OmniFabric.

* **Testing**: How to perform a self-test or OmniFabric performance test using the test tool.

* **Performance Tuning**: How to tune the OmniFabric performance in a stand-alone or distributed environment.

* **Privilege**: Multi-account management, account lifecycle management, and authorization in OmniFabric clusters.

* **Reference**: SQL reference, Configuration parameters.

* **Troubleshooting**: Introduce common errors and debugging tools.

* **FAQs**: Product, Technical Design, SQL, Deployment FAQs.

* **Release Notes**: Release notes of all versions.

* **Contribution Guide**: How to contribute to OmniFabric project.

* **Glossary**: Table of noun definitions.

## **Lift a finger**

If you are correcting a typo or grammatical error, feel free to go ahead and [create a pull request for English docs](https://github.com/OmniFabric/OmniFabric.io/pulls) or [create a pull request for Chinese docs](https://github.com/OmniFabric/OmniFabric.io.cn/pulls).

### **Contribute Workflow**

When you need to change the specific content of the document but do not involve the adjustment of the chapter order and structure organization, you need to modify `OmniFabric.io/tree/main/docs/OmniFabric` or `OmniFabric.io.cn/tree/main/docs/OmniFabric` to operate.

If you need to adjust the chapter order and structure organization, you must modify the `OmniFabric.io/blob/main/mkdocs.yml` or `OmniFabric.io.cn/blob/main/mkdocs.yml`.

The following process shows the case of modifying both, and the actual situation can be simplified according to your needs.

*1*. [File an English doc issue](https://github.com/OmniFabric/OmniFabric.io/issues/new/choose) or [File an Chinese doc issue](https://github.com/OmniFabric/OmniFabric.io.cn/issues/new/choose) and assign it to yourself by commenting `/assign`.

*2*. Fork [OmniFabric.io](https://github.com/OmniFabric/OmniFabric.io) and [OmniFabric.io.cn](https://github.com/OmniFabric/OmniFabric.io.cn) repos.
*3*. Clone the [OmniFabric.io](https://github.com/OmniFabric/OmniFabric.io) and [OmniFabric.io.cn](https://github.com/OmniFabric/OmniFabric.io.cn) repos.

- Clone [OmniFabric.io](https://github.com/OmniFabric/OmniFabric.io):

```
git clone git@github.com:yourusername/OmniFabric.io.git
```

- Clone the [OmniFabric.io.cn](https://github.com/OmniFabric/OmniFabric.io.cn):

```
git clone git@github.com:yourusername/OmniFabric.io.cn.git
```

*4*. Add *OmniFabric.io* and *OmniFabric.io.cn* repos as the remote repository in your local folder with:

- Add `OmniFabric.io` repo as a remote repository in your local OmniFabric.io folder with:

```
git remote add upstream https://github.com/OmniFabric/OmniFabric.io.git
```

- Add `OmniFabric.io.cn` repo as a remote repository in your local OmniFabric.io.cn folder with:

```
git remote add upstream https://github.com/OmniFabric/OmniFabric.io.cn.git
```

*5*. As the local repo has the full documentation project code, you can run `mkdocs serve` under `OmniFabric.io` or `OmniFabric.io.cn` folder, and check `http://localhost:8000` to check if this project runs well.

```
mkdocs serve
```

*6*. Make your modification. If the modification concerns the project settings, update the sitemap with new pages, or update the CI&CD workflow code. You can always check `http://localhost:8000` to see if your modification is effective.

*7*. Push your git commits to your remote Github `OmniFabric.io` and `OmniFabric` repos. We recommend you push to a new branch using the following commands:

```
git push origin main:NEW_BRANCH
```

*8*. Go back to GitHub, and submit a pull request in `NEW_BRANCH` so that we can review your changes.

*9*. Once your code for both repositories is merged, you'll wait for a CI&CD workflow to restart running until the documentation website being updated.

!!! note
    So once your pull requests are merged, the update to the website is not immediate. We'll need to run a manual launch to update it.

*10*. At last, you should update your local and remote repo to help keep committing history clean. Override your local committing repo with:

```
git pull --force upstream main:main
```

Update the `main` branch of your remote repo in Github:

```
git push --force origin main:main
```

!!! note
    Most processes should be implemented in both `OmniFabric.io` and `OmniFabric.io.cn`.

## **Contribute a blog article**

If you would like to write an article for our blog, please [file an issue](https://github.com/OmniFabric/OmniFabric/issues/new/choose) or send it to [dengnan@OmniFabric.io](mailto:dengnan@OmniFabric.io). Feel free to submit either a completed draft or any article ideas. All submissions will be reviewed as quickly as possible. If your article or idea seems like a good fit for the blog, we will reach out to you directly.
