package com.ning.codebot.common.user.service.impl;

import com.ning.codebot.common.common.utils.JsonUtils;
import com.ning.codebot.common.common.utils.RedisUtils;
import com.ning.codebot.common.user.config.Oauth2Properties;
import com.ning.codebot.common.user.dao.UserDao;
import com.ning.codebot.common.user.domain.dto.GithubUserInfo;
import com.ning.codebot.common.user.domain.entity.User;
import com.ning.codebot.common.user.service.Outh2Service;
import com.ning.codebot.common.user.service.UserService;
import com.ning.codebot.common.user.service.adapter.UserAdapter;
import com.ning.codebot.common.websocket.service.WebSocketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.Objects;

@Slf4j
@Service
public class Outh2ServiceImpl implements Outh2Service {
    @Autowired
    private UserDao userDao;
    @Autowired
    private WebSocketService webSocketService;
    @Autowired
    UserService userService;

    private final Oauth2Properties oauth2Properties;
    public Outh2ServiceImpl(Oauth2Properties oauth2Properties) {
        this.oauth2Properties = oauth2Properties;
    }

    // return the redirect url
    @Override
    public String getRedirectUrl(Integer state) {
        String url = oauth2Properties.getAuthorizeUrl() +
                "?client_id=" + oauth2Properties.getClientId() +
                "&redirect_uri=" + oauth2Properties.getRedirectUrl() + state;
        log.info("Auth url:{}", url);
        return "redirect:" + url;
    }

    // Store user info
    @Override
    public void storeUserInfo(GithubUserInfo userInfo){
        User user = userDao.getByNodeId(userInfo.getNodeId());
        boolean registered = Objects.nonNull(user);
        Long id = -1L;
        // get user id
        if (registered) {
            id = user.getId();
        }else{
            User insert = UserAdapter.buildAuthorizeUser(userInfo);
            id = userService.register(insert);
        }
        // update channel
        // webSocketService.scanLoginSuccess(state,id);
    }

    @Override
    public void storeValidCode(String code, String userName){
        RedisUtils.set(code, userName, 1000);
        return;
    }

    @Override
    public String validCode(String code){
        if (!RedisUtils.hasKey(code)){
            return null;
        }else{
            return RedisUtils.getStr(code);
        }
    }

}
