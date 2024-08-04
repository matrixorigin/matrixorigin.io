package com.ning.codebot.common.websocket.service.impl;

import cn.hutool.core.util.RandomUtil;
import cn.hutool.json.JSONUtil;
import com.ning.codebot.common.user.dao.UserDao;
import com.ning.codebot.common.user.domain.entity.User;
import com.ning.codebot.common.user.service.LoginService;
import com.ning.codebot.common.user.service.Outh2Service;
import com.ning.codebot.common.websocket.domain.dto.WSChannelExtraDTO;
import com.ning.codebot.common.websocket.domain.vo.resp.WSBaseResp;
import com.ning.codebot.common.websocket.service.WebSocketService;
import com.ning.codebot.common.websocket.service.adapter.WebSocketAdapter;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.netty.channel.Channel;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import lombok.SneakyThrows;
import me.chanjar.weixin.mp.api.WxMpService;
import me.chanjar.weixin.mp.bean.result.WxMpQrCodeTicket;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;


@Service
public class WebSocketServiceImpl implements WebSocketService {
    @Autowired
    private UserDao userDao;
    @Autowired
    private LoginService loginService;
    private Outh2Service outh2Service;

    // Store all users(login/visitor)
    private static final ConcurrentHashMap<Channel, WSChannelExtraDTO> ONLINE_WS_MAP = new ConcurrentHashMap<>();

    public static final Duration DURATION = Duration.ofHours(1);
    public static final int MAXIMUM_SIZE = 1000;
    /**
     * state <---> wait authorize channel
     * Store all users who need to wait them login through their github account
     */
    private static final Cache<Integer, Channel> WAIT_LOGIN_MAP = Caffeine.newBuilder()
            .maximumSize(MAXIMUM_SIZE)
            .expireAfterWrite(DURATION)
            .build();

    @Override
    // put current channel into map
    public void connect(Channel channel) {
        ONLINE_WS_MAP.put(channel, new WSChannelExtraDTO());
    }

    @SneakyThrows
    @Override
    public void handleLoginReq(Channel channel) {
        Integer state = generateLoginState(channel);
        String url = outh2Service.getRedirectUrl(state);
        sendMsg(channel, WebSocketAdapter.buildResp(url));
    }

    @Override
    public void remove(Channel channel) {

    }

    @Override
    public void scanLoginSuccess(Integer state, Long uid) {
        // check the channel do not expire
        Channel channel = WAIT_LOGIN_MAP.getIfPresent(state);
        if (Objects.isNull(channel)) {
            return;
        }
        //delete the channel in wait cache
        WAIT_LOGIN_MAP.invalidate(state);
        String token = loginService.login(uid);
        User user = userDao.getById(uid);
        loginSuccess(channel,user,token);
    }

    @Override
    public void authorize(Channel channel, String token) {
        Long validUid = loginService.getValidUid(token);
        // If success
        if (Objects.nonNull(validUid)) {
            // get user info from database
            User user = userDao.getById(validUid);
            loginSuccess(channel,user,token);
        // Failure
        } else {
            sendMsg(channel, WebSocketAdapter.buildInvalidTokenResp());
        }
    }

    private void loginSuccess(Channel channel, User user, String token) {
        //保存channel的对应uid
        WSChannelExtraDTO wsChannelExtraDTO = ONLINE_WS_MAP.get(channel);
        wsChannelExtraDTO.setUid(user.getId());
        //推送成功消息
        sendMsg(channel, WebSocketAdapter.buildResp(user, token));
    }

    private void sendMsg(Channel channel, WSBaseResp<?> resp) {
        channel.writeAndFlush(new TextWebSocketFrame(JSONUtil.toJsonStr(resp)));
    }

    private Integer generateLoginState(Channel channel) {
        Integer state;
        do {
            // if exist such code, regenerate a new state
            state = RandomUtil.randomInt(Integer.MAX_VALUE);
        } while (Objects.nonNull(WAIT_LOGIN_MAP.asMap().putIfAbsent(state, channel)));
        return state;
    }
}
