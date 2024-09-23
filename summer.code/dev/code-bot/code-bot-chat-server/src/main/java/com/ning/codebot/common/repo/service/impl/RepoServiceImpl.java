package com.ning.codebot.common.repo.service.impl;

import com.ning.codebot.common.repo.dao.RepoDao;
import com.ning.codebot.common.repo.service.RepoService;
import com.ning.codebot.common.repo.service.adapter.UserRepoAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RepoServiceImpl implements RepoService {

    @Autowired
    RepoDao repoDao;

    @Override
    public void storeRepo(String userName, String repoName) {
        if(repoDao.hasRepo(userName, repoName)) return ;
        repoDao.save(UserRepoAdapter.buildUserRepo(userName, repoName));
    }
}
