package com.ning.codebot.common.websocket.service.impl;

import cn.hutool.core.util.RandomUtil;
import cn.hutool.json.JSONUtil;
import com.ning.codebot.common.user.dao.UserDao;
import com.ning.codebot.common.user.domain.entity.User;
import com.ning.codebot.common.user.service.LoginService;
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
    /**
     * 管理所有用户的连接（登录态/游客）
     */
    private static final ConcurrentHashMap<Channel, WSChannelExtraDTO> ONLINE_WS_MAP = new ConcurrentHashMap<>();

    public static final Duration DURATION = Duration.ofHours(1);
    public static final int MAXIMUM_SIZE = 1000;
    /**
     * 临时保存登录code和channel的映射关系
     */
    private static final Cache<Integer, Channel> WAIT_LOGIN_MAP = Caffeine.newBuilder()
            .maximumSize(MAXIMUM_SIZE)
            .expireAfterWrite(DURATION)
            .build();

    @Override
    public void connect(Channel channel) {

    }

    @SneakyThrows
    @Override
    public void handleLoginReq(Channel channel) {

    }

    @Override
    public void remove(Channel channel) {

    }

    @Override
    public void scanLoginSuccess(Integer code, Long uid) {

    }

    @Override
    public void waitAuthorize(Integer code) {

    }

    @Override
    public void authorize(Channel channel, String token) {

    }

    private void loginSuccess(Channel channel, User user, String token) {

    }

    private void sendMsg(Channel channel, WSBaseResp<?> resp) {

    }

    private Integer generateLoginCode(Channel channel) {
        Integer code;
        do {
            code = RandomUtil.randomInt(Integer.MAX_VALUE);
        } while (Objects.nonNull(WAIT_LOGIN_MAP.asMap().putIfAbsent(code, channel)));
        return code;
    }
}
