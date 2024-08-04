package com.ning.codebot.common.websocket.service;

import io.netty.channel.Channel;


public interface WebSocketService {
    void connect(Channel channel);

    void handleLoginReq(Channel channel);

    void remove(Channel channel);

    void scanLoginSuccess(Integer state, Long uid);


    void authorize(Channel channel, String token);
}
