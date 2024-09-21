package com.ning.codebot.common.repo.service.adapter;

import com.ning.codebot.common.repo.domain.entity.UserRepo;
import com.ning.codebot.common.user.domain.dto.GithubUserInfo;
import com.ning.codebot.common.user.domain.entity.User;

import java.util.Date;

public class UserRepoAdapter {
    public static UserRepo buildUserRepo(String userName, String repoName) {
            return UserRepo
                .builder()
                .repoName(repoName)
                .userName(userName)
                .status(0)
                .createTime(new Date())
                .build();
    }

}
