## Document Preview

The writing and rendering of the documentation is maintained by 2 repositories, see [here](https://github.com/OmniFabric/OmniFabric/tree/main/docs) for the markdown documentation.
The current repository is used to render markdown documents to HTML.

> Based on the python library [mkdocs](https://www.mkdocs.org/getting-started/), with the theme [mkdocs-material](https://github.com/squidfunk/mkdocs-material).

Projects manage the dependencies of the current project and submodules through the `git submodule` command.

### Getting started

1. If downloading from scratch:

```bash
git clone --recurse-submodules git@github.com:OmniFabric/OmniFabric.io.cn.git
```

2. If using `git clone`, additional initialization of submodules is required:

```
git clone git@github.com:OmniFabric/OmniFabric.io.cn.git
git submodule init
git submodule update --remote
```

3. If downloaded, you need to update to the latest code:

```
// update main project
git remote update
git rebase upstream/main

// update submodule
git submodule update --remote
// Then submit, because the submodule version is updated, the main project needs to record
git add .
git commit
```

### Dependencies

```bash
pip install -r requirements.txt
```

> Tip: MkDocs requires the latest version of [Python](https://www.python.org/) and the Python package manager [pip](https://pip.readthedocs.io/en/stable/installing/) to be installed on your system.
> To check whether the installation is successful, you can use `pip list` to see if `mkdocs-material 8.2.8` corresponds to it.

### Start the service

```bash
mkdocs serve
```

### Preview

Open a browser and visit `http://127.0.0.1:8000/` or `localhost:8000`.

## Optional: Modify the document and adjust the rendering style

Since the project manages the dependencies of the current project and submodules through `git submodule`.
The submodule is also a git repository, so you can modify the submodule code in the current project and submit it.
The effect achieved is that the preview document can be modified, and the HTML style layout can be adjusted at the same time, without the need to save a sub-module warehouse code.

The modification submission method for the main project remains unchanged. The modifications made in the submodules are described below:

For example, the submodule is in `OmniFabric` under `submodules`, enter this path, and make changes, such as adding a file:

```
cd submodules/OmniFabric
echo "test sub modify" > test.md
```

Then do the commit as normal in the submodule.

> Pay attention to sub-module branch management, pay attention to sub-module branch management, pay attention to sub-module branch management!
> Submodules default to the `main` branch

Then execute `cd ../..` to return to the main project directory, and perform the operation after the submodule is updated. It is equivalent to the operation of submitting submodule updates after executing `git submodule update --remote` in the main project.
