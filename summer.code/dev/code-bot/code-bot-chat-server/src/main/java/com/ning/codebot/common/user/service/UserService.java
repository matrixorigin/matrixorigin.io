package com.ning.codebot.common.user.service;

import com.ning.codebot.common.user.domain.entity.User;


public interface UserService {

    Long register(User insert);
}
