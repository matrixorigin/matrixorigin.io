package com.ning.codebot.common.repo.dao;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ning.codebot.common.chat.domain.entity.Message;
import com.ning.codebot.common.chat.mapper.MessageMapper;
import com.ning.codebot.common.repo.domain.entity.UserRepo;
import com.ning.codebot.common.repo.mapper.RepoMapper;
import com.ning.codebot.common.user.domain.entity.User;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class RepoDao extends ServiceImpl<RepoMapper, UserRepo> {
    public List<UserRepo> getRepos(String userName) {
        return lambdaQuery()
                .eq(UserRepo::getUserName, userName)
                .list();
    }

    public Boolean hasRepo(String userName, String repoName) {
        Integer count = lambdaQuery()
                        .eq(UserRepo::getUserName, userName)
                        .eq(UserRepo::getRepoName, repoName)
                        .count();
        if (count == 0) return Boolean.FALSE;
        return Boolean.TRUE;
    }
}
