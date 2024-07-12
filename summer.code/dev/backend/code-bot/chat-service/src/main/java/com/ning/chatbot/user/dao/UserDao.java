package com.ning.chatbot.user.dao;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ning.chatbot.user.domain.entity.User;
import com.ning.chatbot.user.mapper.UserMapper;
import org.springframework.stereotype.Service;

import static com.baomidou.mybatisplus.core.toolkit.Wrappers.lambdaQuery;

@Service
public class UserDao extends ServiceImpl<UserMapper, User> {

    public User getByOpenId(String openId) {
        return lambdaQuery()
                .eq(User::getOpenId, openId)
                .one();
    }
}
