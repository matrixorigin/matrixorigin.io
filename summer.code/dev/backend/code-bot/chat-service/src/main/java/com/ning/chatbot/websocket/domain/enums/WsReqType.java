package com.ning.chatbot.websocket.domain.enums;

import lombok.AllArgsConstructor;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum WsReqType {
    REGISTER(1, "register"),
    HEARTBEAT(2, "heart break"),
    AUTHORIZE(3, "login auth"),
    ;
    private final Integer type;
    private final String desc;
    private final static Map<Integer, WsReqType> cache;

    static {
        cache = Arrays.stream(WsReqType.values()).collect(Collectors.toMap(WsReqType::getType, Function.identity()));
    }
    public static WsReqType of(Integer type) {
        return cache.get(type);
    }
}
