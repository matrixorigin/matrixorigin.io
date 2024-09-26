package com.ning.codebot.common.user.service.adapter;

import com.ning.codebot.common.user.domain.dto.GithubUserInfo;
import com.ning.codebot.common.user.domain.entity.User;

public class UserAdapter {

    public static User buildAuthorizeUser(GithubUserInfo userInfo) {
        User user =new User();
        user.setName(userInfo.getUserName());
        user.setAvatar(userInfo.getAvatarUrl());
        user.setName(userInfo.getNodeId());
        return user;
    }
}