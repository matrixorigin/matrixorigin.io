#!/bin/bash

set -xe

doc_version=${1}
path=$(cd `dirname $0`;pwd)

cd ..

git fetch --all
git reset --hard origin/main
git pull
git submodule update --init
git submodule update --remote
git commit -m "update submodules" || echo "No changes to commit"
git push
mike deploy --push --update-aliases ${doc_version} latest
git add *
git commit * -m "update site"
git push

docker build . -t OmniFabric/OmniFabric.io:${doc_version}
docker build . -t OmniFabric/OmniFabric.io:latest

docker login ${domain}
if [[ $? == 0 ]]; then
     docker push OmniFabric/OmniFabric.io:${doc_version}
     docker push OmniFabric/OmniFabric.io:latest
else
     echo "Login to docker hub failed"
     exit 1
fi
